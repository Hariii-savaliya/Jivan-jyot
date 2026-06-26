import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Edit, Trash2 } from 'lucide-react';
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

const residentFields = [
  { key: 'resident_id', label: 'Resident ID (Auto Generated if empty)', placeholder: 'e.g. RES-001' },
  { key: 'photo', label: 'Resident Photo', type: 'file' },
  { key: 'admission_date', label: 'Admission Date', type: 'date', required: true },
  { key: 'admission_time', label: 'Admission Time', placeholder: 'e.g. 10:30 AM' },
  { key: 'name', label: 'Full Name', required: true },
  { key: 'age', label: 'Age', type: 'number', required: true },
  { key: 'father_husband_name', label: 'Father / Husband Name' },
  { key: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'], required: true },
  { key: 'address', label: 'Address', type: 'textarea' },
  { key: 'identification_mark', label: 'Identification Mark' },
  { key: 'physical_condition', label: 'Physical Condition', type: 'textarea', placeholder: 'e.g. Weak, Mentally Challenged' },
  { key: 'health_condition', label: 'Health Condition', type: 'textarea' },
  { key: 'brought_from', label: 'Brought From (Location)' },
  { key: 'institution_name', label: 'Institution Name' },
  { key: 'informer_name', label: 'Informer Name' },
  { key: 'informer_address', label: 'Informer Address' },
  { key: 'informer_mobile', label: 'Informer Mobile' },
  { key: 'guardian_name', label: 'Guardian Name' },
  { key: 'guardian_address', label: 'Guardian Address' },
  { key: 'guardian_mobile', label: 'Guardian Mobile' },
  { key: 'remarks', label: 'Additional Remarks / Admission Notes', type: 'textarea' },
  { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Discharged', 'Deceased'], required: true },
];

export default function ResidentManagement() {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.Resident.list('-created_date', 100);
    setResidents(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm({ status: 'Active', gender: 'Male' }); setModalOpen(true); };
  const openEdit = (row) => { setEditing(row); setForm({ ...row }); setModalOpen(true); };

  const handleSave = async () => {
    if (form.informer_mobile && !/^\d{10}$/.test(form.informer_mobile.trim())) {
      toast({
        title: 'Validation Error',
        description: 'Informer Mobile number must be exactly 10 digits.',
        variant: 'destructive'
      });
      return;
    }

    if (form.guardian_mobile && !/^\d{10}$/.test(form.guardian_mobile.trim())) {
      toast({
        title: 'Validation Error',
        description: 'Guardian Mobile number must be exactly 10 digits.',
        variant: 'destructive'
      });
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await base44.entities.Resident.update(editing.id, form);
        toast({ title: 'Resident updated' });
      } else {
        await base44.entities.Resident.create(form);
        toast({ title: 'Resident added' });
      }
      setModalOpen(false);
      load();
    } catch (e) {
      toast({
        title: 'Save failed',
        description: e.message || 'Could not save resident details.',
        variant: 'destructive'
      });
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    await base44.entities.Resident.delete(deleteTarget.id);
    setDeleteTarget(null);
    toast({ title: 'Resident removed' });
    load();
  };

  const columns = [
    {
      key: 'name', label: 'Resident',
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            {row.photo && <AvatarImage src={row.photo} />}
            <AvatarFallback className="text-[10px] bg-blue-500/10 text-blue-600 font-semibold">
              {(val || '?').split(' ').map(n => n[0]).join('').slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">{val}</p>
            <p className="text-xs text-muted-foreground">{row.resident_id || '—'}</p>
          </div>
        </div>
      )
    },
    { key: 'age', label: 'Age' },
    { key: 'gender', label: 'Gender' },
    { key: 'blood_group', label: 'Blood Group', render: val => val || '—' },
    { key: 'guardian_name', label: 'Guardian', render: val => val || '—' },
    { key: 'admission_date', label: 'Admitted', render: val => val ? moment(val).format('MMM DD, YYYY') : '—' },
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
      <PageHeader title="Resident Management" subtitle={`${residents.length} residents`} actions={
        <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Add Resident</Button>
      } />
      <DataTable
        columns={columns}
        data={residents}
        searchKey={['name', 'resident_id']}
        filters={[
          { key: 'gender', label: 'Gender', options: ['Male', 'Female', 'Other'] },
          { key: 'status', label: 'Status', options: ['Active', 'Discharged', 'Deceased'] },
        ]}
      />
      <FormModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Resident' : 'Add Resident'} fields={residentFields} values={form} onChange={setForm} onSubmit={handleSave} loading={saving} />
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Resident?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently remove {deleteTarget?.name} from the system.</AlertDialogDescription>
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