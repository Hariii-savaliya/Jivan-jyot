import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Edit, Trash2, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import FormModal from '@/components/shared/FormModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import ActionTooltip from '@/components/shared/ActionTooltip';

const volunteerFields = [
  { key: 'photo', label: 'Volunteer Photo', type: 'file' },
  { key: 'name', label: 'Name', required: true },
  { key: 'mobile', label: 'Mobile Number', required: true },
  { key: 'email', label: 'Email', type: 'email', required: true },
  { key: 'address', label: 'Address', type: 'textarea' },
  { key: 'skills', label: 'Skills', type: 'textarea', placeholder: 'e.g. Teaching, First Aid, Event Management' },
  { key: 'interests', label: 'Interests', placeholder: 'e.g. Art, Sports' },
  { key: 'total_hours', label: 'Total Hours', type: 'number' },
  { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive', 'On Leave'], required: true },
];

export default function VolunteerManagement() {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.Volunteer.list('-created_date', 100);
    setVolunteers(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm({ status: 'Active', availability: 'Flexible' }); setModalOpen(true); };
  const openEdit = (row) => { setEditing(row); setForm({ ...row }); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.mobile || !/^\d{10}$/.test(form.mobile)) {
      toast({
        title: 'Validation Error',
        description: 'Mobile number must be exactly 10 digits.',
        variant: 'destructive'
      });
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await base44.entities.Volunteer.update(editing.id, form);
        toast({ title: 'Volunteer updated' });
      } else {
        await base44.entities.Volunteer.create(form);
        toast({ title: 'Volunteer added' });
      }
      setModalOpen(false);
      load();
    } catch (e) {
      toast({
        title: 'Save failed',
        description: e.message || 'Make sure email is unique and mobile is 10 digits.',
        variant: 'destructive'
      });
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    await base44.entities.Volunteer.delete(deleteTarget.id);
    setDeleteTarget(null);
    toast({ title: 'Volunteer removed' });
    load();
  };

  const issueCertificate = async (row) => {
    await base44.entities.Volunteer.update(row.id, { ...row, certificate_issued: true });
    toast({ title: 'Certificate marked as issued' });
    load();
  };

  const columns = [
    {
      key: 'name', label: 'Volunteer',
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            {row.photo && <AvatarImage src={row.photo} />}
            <AvatarFallback className="text-[10px] bg-emerald-500/10 text-emerald-600 font-semibold">
              {(val || '?').split(' ').map(n => n[0]).join('').slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">{val}</p>
            <p className="text-xs text-muted-foreground">{row.email || '—'}</p>
          </div>
        </div>
      )
    },
    { key: 'skills', label: 'Skills', render: val => <span className="text-xs max-w-[150px] truncate block">{val || '—'}</span> },
    { key: 'availability', label: 'Availability' },
    { key: 'total_hours', label: 'Hours', render: val => <span className="font-semibold">{val || 0}h</span> },
    { key: 'events_participated', label: 'Events', render: val => val || 0 },
    { key: 'status', label: 'Status', render: val => <StatusBadge status={val} /> },
    {
      key: 'actions', label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-1">
          <ActionTooltip content="Edit Record">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => { e.stopPropagation(); openEdit(row); }}>
              <Edit className="w-3.5 h-3.5" />
            </Button>
          </ActionTooltip>
          {!row.certificate_issued && (
            <ActionTooltip content="Issue Certificate">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => { e.stopPropagation(); issueCertificate(row); }}>
                <Award className="w-3.5 h-3.5 text-amber-500" />
              </Button>
            </ActionTooltip>
          )}
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
      <PageHeader title="Volunteer Management" subtitle={`${volunteers.length} volunteers`} actions={
        <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Add Volunteer</Button>
      } />
      <DataTable
        columns={columns}
        data={volunteers}
        searchKey={['name', 'email', 'skills']}
        filters={[
          { key: 'status', label: 'Status', options: ['Active', 'Inactive', 'On Leave'] },
          { key: 'availability', label: 'Availability', options: ['Weekdays', 'Weekends', 'Both', 'Flexible'] },
        ]}
      />
      <FormModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Volunteer' : 'Add Volunteer'} fields={volunteerFields} values={form} onChange={setForm} onSubmit={handleSave} loading={saving} />
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Volunteer?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently remove {deleteTarget?.name}.</AlertDialogDescription>
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