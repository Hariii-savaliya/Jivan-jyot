const Donation = require('../models/Donation');
const Resident = require('../models/Resident');
const Volunteer = require('../models/Volunteer');
const Event = require('../models/Event');
const Requirement = require('../models/Requirement');
const { generateMonthlyReportBuffer } = require('../services/pdfService');

// Helper to get month names
const getMonthName = (monthIndex) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthIndex];
};

// GET /api/analytics/monthly (Monthly Trends)
const getMonthlyAnalytics = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();

    // Aggregated monthly donations for current year
    const monthlyDonations = await Donation.aggregate([
      {
        $match: {
          donationDate: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`)
          },
          verificationStatus: 'Verified'
        }
      },
      {
        $group: {
          _id: { $month: '$donationDate' },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Aggregated monthly resident admissions for current year
    const monthlyAdmissions = await Resident.aggregate([
      {
        $match: {
          admissionDate: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$admissionDate' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Format results to include all 12 months (even empty ones)
    const formattedDonations = Array.from({ length: 12 }, (_, i) => {
      const match = monthlyDonations.find(d => d._id === i + 1);
      return {
        month: getMonthName(i),
        totalAmount: match ? match.totalAmount : 0,
        count: match ? match.count : 0
      };
    });

    const formattedAdmissions = Array.from({ length: 12 }, (_, i) => {
      const match = monthlyAdmissions.find(a => a._id === i + 1);
      return {
        month: getMonthName(i),
        count: match ? match.count : 0
      };
    });

    res.status(200).json({
      success: true,
      year: currentYear,
      donations: formattedDonations,
      admissions: formattedAdmissions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/analytics/donation
const getDonationAnalytics = async (req, res) => {
  try {
    // 1. Verification status breakdown
    const statusBreakdown = await Donation.aggregate([
      {
        $group: {
          _id: '$verificationStatus',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // 2. Top Donors (sum amount)
    const topDonors = await Donation.aggregate([
      { $match: { verificationStatus: 'Verified' } },
      {
        $group: {
          _id: '$donorId',
          totalDonated: { $sum: '$amount' },
          donationsCount: { $sum: 1 }
        }
      },
      { $sort: { totalDonated: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'donors',
          localField: '_id',
          foreignField: '_id',
          as: 'donorDetails'
        }
      },
      { $unwind: '$donorDetails' },
      {
        $project: {
          _id: 1,
          totalDonated: 1,
          donationsCount: 1,
          name: '$donorDetails.name',
          email: '$donorDetails.email',
          mobile: '$donorDetails.mobile'
        }
      }
    ]);

    res.status(200).json({
      success: true,
      statusBreakdown,
      topDonors
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/analytics/volunteer
const getVolunteerAnalytics = async (req, res) => {
  try {
    const totalVolunteers = await Volunteer.countDocuments();

    // 1. Volunteer hours metrics
    const stats = await Volunteer.aggregate([
      {
        $group: {
          _id: null,
          totalHoursContributed: { $sum: '$totalHours' },
          averageHours: { $avg: '$totalHours' }
        }
      }
    ]);

    // 2. Skills breakdown
    const skillsPopularity = await Volunteer.aggregate([
      { $unwind: '$skills' },
      {
        $group: {
          _id: '$skills',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      totalVolunteers,
      totalHours: stats[0] ? stats[0].totalHoursContributed : 0,
      averageHours: stats[0] ? Math.round(stats[0].averageHours * 10) / 10 : 0,
      skillsPopularity
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/analytics/event
const getEventAnalytics = async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();

    // 1. Average volunteer participation
    const stats = await Event.aggregate([
      {
        $project: {
          volunteersCount: { $size: '$volunteers' }
        }
      },
      {
        $group: {
          _id: null,
          avgVolunteers: { $avg: '$volunteersCount' },
          maxVolunteers: { $max: '$volunteersCount' }
        }
      }
    ]);

    // 2. Upcoming vs Completed events
    const today = new Date();
    const upcomingEvents = await Event.countDocuments({ date: { $gte: today } });
    const completedEvents = await Event.countDocuments({ date: { $lt: today } });

    res.status(200).json({
      success: true,
      totalEvents,
      upcomingEvents,
      completedEvents,
      averageVolunteersPerEvent: stats[0] ? Math.round(stats[0].avgVolunteers * 10) / 10 : 0,
      maxVolunteersInSingleEvent: stats[0] ? stats[0].maxVolunteers : 0
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/analytics/monthly-report
// Query parameters: month (e.g., 'June'), year (e.g., 2026)
const getMonthlyReportPdf = async (req, res) => {
  try {
    const month = req.query.month || getMonthName(new Date().getMonth());
    const year = Number(req.query.year) || new Date().getFullYear();

    const monthIndex = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'
    ].indexOf(month.toLowerCase());

    if (monthIndex === -1) {
      return res.status(400).json({ success: false, message: 'Invalid month parameter' });
    }

    const startDate = new Date(year, monthIndex, 1);
    const endDate = new Date(year, monthIndex + 1, 0, 23, 59, 59);

    // Collect stats for this month
    // 1. Financial stats
    const donationsThisMonth = await Donation.find({
      donationDate: { $gte: startDate, $lte: endDate }
    });
    
    let totalDonationsAmount = 0;
    let totalDonationsCount = 0;
    let verifiedDonationsAmount = 0;
    let pendingDonationsAmount = 0;

    donationsThisMonth.forEach(d => {
      totalDonationsCount++;
      totalDonationsAmount += d.amount;
      if (d.verificationStatus === 'Verified') {
        verifiedDonationsAmount += d.amount;
      } else if (d.verificationStatus === 'Pending') {
        pendingDonationsAmount += d.amount;
      }
    });

    // 2. Residents stats
    const totalActiveResidents = await Resident.countDocuments({ status: 'Active' });
    const newResidentsCount = await Resident.countDocuments({
      admissionDate: { $gte: startDate, $lte: endDate }
    });
    const dischargedResidentsCount = await Resident.countDocuments({
      admissionDate: { $gte: startDate, $lte: endDate },
      status: 'Discharged'
    });

    // 3. Community stats
    const eventsCount = await Event.countDocuments({
      date: { $gte: startDate, $lte: endDate }
    });
    const newVolunteersCount = await Volunteer.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });
    const activeVolunteersCount = await Volunteer.countDocuments();
    
    // Sum totalHours completed during this month? Since totalHours is an accumulated value, 
    // we can sum total hours of all registered volunteers as general service stat.
    const volunteers = await Volunteer.find();
    const totalVolunteerHours = volunteers.reduce((acc, curr) => acc + curr.totalHours, 0);

    // 4. Requirements status
    const pendingRequirementsCount = await Requirement.countDocuments({
      status: { $in: ['Pending', 'Partially Fulfilled'] }
    });
    const fulfilledRequirementsCount = await Requirement.countDocuments({
      status: 'Fulfilled',
      updatedAt: { $gte: startDate, $lte: endDate }
    });
    const urgentRequirementsCount = await Requirement.countDocuments({
      priority: 'Urgent',
      status: { $in: ['Pending', 'Partially Fulfilled'] }
    });

    const reportData = {
      month,
      year,
      stats: {
        totalDonationsAmount,
        totalDonationsCount,
        verifiedDonationsAmount,
        pendingDonationsAmount,
        totalActiveResidents,
        newResidentsCount,
        dischargedResidentsCount,
        eventsCount,
        newVolunteersCount,
        activeVolunteersCount,
        totalVolunteerHours,
        pendingRequirementsCount,
        fulfilledRequirementsCount,
        urgentRequirementsCount
      }
    };

    const pdfBuffer = await generateMonthlyReportBuffer(reportData);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=monthly-report-${month.toLowerCase()}-${year}.pdf`,
      'Content-Length': pdfBuffer.length
    });

    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getMonthlyAnalytics,
  getDonationAnalytics,
  getVolunteerAnalytics,
  getEventAnalytics,
  getMonthlyReportPdf
};
