const Event = require('../models/Event');
const Volunteer = require('../models/Volunteer');
const { uploadToCloudinary } = require('../services/cloudinaryService');

const refreshEventStatus = async (event) => {
  if (!event) return event;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(event.startDate || event.date);
  start.setHours(0, 0, 0, 0);

  const end = event.endDate ? new Date(event.endDate) : new Date(start);
  end.setHours(23, 59, 59, 999);

  let calcStatus = 'Upcoming';
  if (today < start) {
    calcStatus = 'Upcoming';
  } else if (today >= start && today <= end) {
    calcStatus = 'Ongoing';
  } else {
    calcStatus = 'Completed';
  }

  if (event.status !== calcStatus) {
    event.status = calcStatus;
    await event.save();
  }
  return event;
};

const getEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate('volunteers', 'fullName email mobile volunteerId')
      .sort({ startDate: -1, date: -1 });

    // Automatically refresh status for each event
    const refreshedEvents = await Promise.all(events.map(e => refreshEventStatus(e)));

    res.status(200).json({ success: true, count: refreshedEvents.length, data: refreshedEvents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getEventById = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id)
      .populate('volunteers', 'fullName email mobile volunteerId');
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    event = await refreshEventStatus(event);
    res.status(200).json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      startDate,
      endDate,
      location,
      category,
      coordinator,
      budget,
      spent,
      volunteers_assigned,
      attendees,
      volunteers
    } = req.body;

    let imageUrl = req.body.image || req.body.image_url || '';
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.path, 'events');
    }

    const startVal = startDate || date || new Date().toISOString();
    const endVal = endDate || startVal;

    const newEvent = await Event.create({
      title,
      description: description || '',
      date: startVal,
      startDate: startVal,
      endDate: endVal,
      location,
      volunteers: volunteers || [],
      gallery: imageUrl ? [imageUrl] : [],
      image: imageUrl,
      category: category || 'Other',
      coordinator: coordinator || '',
      budget: Number(budget) || 0,
      spent: Number(spent) || 0,
      volunteers_assigned: Number(volunteers_assigned) || 0,
      attendees: Number(attendees) || 0
    });

    await refreshEventStatus(newEvent);

    req.logAction = `Created event: ${newEvent.title}`;
    req.logDetails = { eventId: newEvent._id };

    res.status(201).json({ success: true, data: newEvent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const {
      title,
      description,
      date,
      startDate,
      endDate,
      location,
      category,
      coordinator,
      budget,
      spent,
      volunteers_assigned,
      attendees,
      volunteers,
      status
    } = req.body;

    let imageUrl = req.body.image || req.body.image_url || event.image;
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.path, 'events');
    }

    const startVal = startDate || date || event.startDate || event.date;
    const endVal = endDate || event.endDate || startVal;

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      {
        title: title || event.title,
        description: description !== undefined ? description : event.description,
        date: startVal,
        startDate: startVal,
        endDate: endVal,
        location: location || event.location,
        volunteers: volunteers || event.volunteers,
        gallery: imageUrl ? [imageUrl] : event.gallery,
        image: imageUrl,
        category: category || event.category,
        coordinator: coordinator || event.coordinator,
        budget: budget !== undefined ? Number(budget) : event.budget,
        spent: spent !== undefined ? Number(spent) : event.spent,
        volunteers_assigned: volunteers_assigned !== undefined ? Number(volunteers_assigned) : event.volunteers_assigned,
        attendees: attendees !== undefined ? Number(attendees) : event.attendees,
        status: status || event.status
      },
      { new: true, runValidators: true }
    ).populate('volunteers', 'fullName email mobile');

    await refreshEventStatus(updatedEvent);

    req.logAction = `Updated event: ${updatedEvent.title}`;
    req.logDetails = { eventId: updatedEvent._id };

    res.status(200).json({ success: true, data: updatedEvent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    await Event.findByIdAndDelete(req.params.id);

    req.logAction = `Deleted event: ${event.title}`;
    req.logDetails = { eventId: event._id };

    res.status(200).json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/events/:id/volunteers (register volunteer to event)
const registerVolunteerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const { volunteerId } = req.body; // MongoDB ObjectId of volunteer
    if (!volunteerId) {
      return res.status(400).json({ success: false, message: 'Volunteer ID is required' });
    }

    const volunteer = await Volunteer.findById(volunteerId);
    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Volunteer not found' });
    }

    // Check if volunteer is already registered
    if (event.volunteers.includes(volunteerId)) {
      return res.status(400).json({
        success: false,
        message: 'Volunteer already registered for this event'
      });
    }

    event.volunteers.push(volunteerId);
    await event.save();

    req.logAction = `Registered volunteer ${volunteer.fullName} to event: ${event.title}`;
    req.logDetails = { eventId: event._id, volunteerId };

    const populatedEvent = await event.populate('volunteers', 'fullName email mobile');

    res.status(200).json({ success: true, data: populatedEvent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/events/:id/gallery (upload photo to event gallery)
const uploadToEventGallery = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image file is required' });
    }

    const photoUrl = await uploadToCloudinary(req.file.path, 'events');
    event.gallery.push(photoUrl);
    await event.save();

    req.logAction = `Uploaded image to event gallery: ${event.title}`;
    req.logDetails = { eventId: event._id, photoUrl };

    res.status(200).json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerVolunteerForEvent,
  uploadToEventGallery
};
