import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Edit, Trash2, Eye, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import FormModal from '@/components/shared/FormModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import ActionTooltip from '@/components/shared/ActionTooltip';
import moment from 'moment';

const eventFields = [
  { key: 'title', label: 'Event Name', required: true },
  { key: 'description', label: 'Event Description', type: 'textarea' },
  { key: 'image', label: 'Event Image', type: 'file' },
  { key: 'event_date', label: 'Start Date', type: 'date', required: true },
  { key: 'end_date', label: 'End Date', type: 'date', required: true },
  { key: 'location', label: 'Location', required: true },
  { key: 'volunteers_assigned', label: 'Volunteers Count', type: 'number' },
];

export default function EventManagement() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [detailEvent, setDetailEvent] = useState(null);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.Event.list('-created_date', 100);
    setEvents(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm({ status: 'Upcoming' }); setModalOpen(true); };
  const openEdit = (row) => { setEditing(row); setForm({ ...row }); setModalOpen(true); };

  const handleSave = async () => {
    if (form.end_date && form.event_date && new Date(form.end_date) < new Date(form.event_date)) {
      toast({
        title: "Validation Error",
        description: "End Date cannot be before Start Date",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await base44.entities.Event.update(editing.id, form);
        toast({ title: 'Event updated' });
      } else {
        await base44.entities.Event.create(form);
        toast({ title: 'Event created' });
      }
      setModalOpen(false);
      load();
    } catch (e) {
      toast({
        title: 'Save failed',
        description: e.message || 'Could not save event details.',
        variant: 'destructive'
      });
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    await base44.entities.Event.delete(deleteTarget.id);
    setDeleteTarget(null);
    toast({ title: 'Event deleted' });
    load();
  };

  const columns = [
    { key: 'title', label: 'Event', render: (val, row) => (
      <div>
        <p className="font-medium text-sm">{val}</p>
        {row.category && <p className="text-xs text-muted-foreground">{row.category}</p>}
      </div>
    )},
    { key: 'event_date', label: 'Date', render: val => val ? moment(val).format('MMM DD, YYYY') : '—' },
    { key: 'location', label: 'Location', render: val => val || '—' },
    { key: 'coordinator', label: 'Coordinator', render: val => val || '—' },
    { key: 'volunteers_assigned', label: 'Volunteers', render: val => val || 0 },
    { key: 'attendees', label: 'Attendees', render: val => val || 0 },
    { key: 'budget', label: 'Budget', render: val => val ? `₹${val.toLocaleString()}` : '—' },
    { key: 'status', label: 'Status', render: val => <StatusBadge status={val} /> },
    {
      key: 'actions', label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-1">
          <ActionTooltip content="View Details">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => { e.stopPropagation(); setDetailEvent(row); }}>
              <Eye className="w-3.5 h-3.5" />
            </Button>
          </ActionTooltip>
          <ActionTooltip content="Edit Record">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => { e.stopPropagation(); openEdit(row); }}>
              <Edit className="w-3.5 h-3.5" />
            </Button>
          </ActionTooltip>
          <ActionTooltip content="Delete Record">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => { e.stopPropagation(); setDeleteTarget(row); }}>
              <Trash2 className="w-3.5 h-3.5 text-destructive" />
            </Button>
          </ActionTooltip>
        </div>
      )
    },
  ];

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div>
      <PageHeader title="Event Management" subtitle={`${events.length} events`} actions={
        <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Create Event</Button>
      } />
      <DataTable
        columns={columns}
        data={events}
        searchKey={['title', 'coordinator', 'location']}
        filters={[
          { key: 'status', label: 'Status', options: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'] }
        ]}
      />
      <FormModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Event' : 'Create Event'} fields={eventFields} values={form} onChange={setForm} onSubmit={handleSave} loading={saving} />

      <Dialog open={!!detailEvent} onOpenChange={() => setDetailEvent(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{detailEvent?.title}</DialogTitle></DialogHeader>
          {detailEvent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <InfoCard label="Date" value={detailEvent.event_date ? moment(detailEvent.event_date).format('MMM DD, YYYY') : '—'} />
                <InfoCard label="Location" value={detailEvent.location || '—'} />
                <InfoCard label="Budget" value={detailEvent.budget ? `₹${detailEvent.budget.toLocaleString()}` : '—'} />
                <InfoCard label="Spent" value={detailEvent.spent ? `₹${detailEvent.spent.toLocaleString()}` : '₹0'} />
              </div>
              {detailEvent.description && <p className="text-sm text-muted-foreground">{detailEvent.description}</p>}
              <div className="flex gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-primary" />
                  <span>{detailEvent.volunteers_assigned || 0} volunteers</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-emerald-500" />
                  <span>{detailEvent.attendees || 0} attendees</span>
                </div>
              </div>
              {detailEvent.gallery_images?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Gallery</p>
                  <div className="grid grid-cols-3 gap-2">
                    {detailEvent.gallery_images.map((img, i) => (
                      <img key={i} src={img} alt="" className="rounded-lg w-full h-20 object-cover" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently remove {deleteTarget?.title}.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="bg-muted rounded-lg p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold mt-0.5">{value}</p>
    </div>
  );
}