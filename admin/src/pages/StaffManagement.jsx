import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Edit, Trash2, Ban, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import FormModal from '@/components/shared/FormModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import ActionTooltip from '@/components/shared/ActionTooltip';
import moment from 'moment';

const staffFields = [
  { key: 'employee_id', label: 'Employee ID (Auto Generated if empty)', placeholder: 'e.g. EMP-001' },
  { key: 'photo', label: 'Photo', type: 'file' },
  { key: 'full_name', label: 'Full Name', required: true },
  { key: 'mobile', label: 'Mobile Number', required: true },
  { key: 'address', label: 'Address', type: 'textarea', required: true },
  { key: 'email', label: 'Email', type: 'email', required: true },
  { key: 'role', label: 'Role', type: 'select', options: ['Super Admin', 'Admin', 'Manager', 'Accountant', 'Volunteer Coordinator', 'Event Coordinator', 'Staff'], required: true },
  { key: 'joining_date', label: 'Joining Date', type: 'date', required: true },
  { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive', 'On Leave'], required: true },
];

export default function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.Staff.list('-created_date', 100);
    setStaff(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm({ status: 'Active', role: 'Staff' }); setModalOpen(true); };
  const openEdit = (row) => { setEditing(row); setForm({ ...row }); setModalOpen(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) {
        await base44.entities.Staff.update(editing.id, form);
        toast({ title: 'Staff updated' });
      } else {
        await base44.entities.Staff.create(form);
        toast({ title: 'Staff added' });
      }
      setModalOpen(false);
      load();
    } catch (e) {
      toast({
        title: 'Save failed',
        description: e.message || 'Could not save staff details.',
        variant: 'destructive'
      });
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    await base44.entities.Staff.delete(deleteTarget.id);
    setDeleteTarget(null);
    toast({ title: 'Staff deleted' });
    load();
  };

  const toggleStatus = async (row) => {
    const newStatus = row.status === 'Active' ? 'Inactive' : 'Active';
    await base44.entities.Staff.update(row.id, { ...row, status: newStatus });
    toast({ title: `Staff status updated to ${newStatus}` });
    load();
  };

  const columns = [
    {
      key: 'full_name', label: 'Employee',
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            {row.photo && <AvatarImage src={row.photo} />}
            <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-semibold">
              {(val || '?').split(' ').map(n => n[0]).join('').slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">{val}</p>
            <p className="text-xs text-muted-foreground">{row.employee_id || '—'}</p>
          </div>
        </div>
      )
    },
    { key: 'role', label: 'Role' },
    { key: 'mobile', label: 'Mobile' },
    { key: 'email', label: 'Email', render: val => <span className="text-xs">{val || '—'}</span> },
    { key: 'joining_date', label: 'Joined', render: val => val ? moment(val).format('MMM DD, YYYY') : '—' },
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
          <ActionTooltip content={row.status === 'Active' ? "Deactivate" : "Activate"}>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => { e.stopPropagation(); toggleStatus(row); }}>
              {row.status === 'Active' ? <Ban className="w-3.5 h-3.5 text-amber-500" /> : <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
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

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <PageHeader title="Staff Management" subtitle={`${staff.length} team members`} actions={
        <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Add Staff</Button>
      } />
      <DataTable
        columns={columns}
        data={staff}
        searchKey={['full_name', 'email', 'employee_id']}
        filters={[
          { key: 'role', label: 'Role', options: ['Super Admin', 'Admin', 'Manager', 'Accountant', 'Volunteer Coordinator', 'Event Coordinator', 'Staff'] },
          { key: 'status', label: 'Status', options: ['Active', 'Inactive', 'On Leave'] },
        ]}
      />
      <FormModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Staff' : 'Add Staff'} fields={staffFields} values={form} onChange={setForm} onSubmit={handleSave} loading={saving} />
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Staff Member?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. This will permanently remove {deleteTarget?.full_name}.</AlertDialogDescription>
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