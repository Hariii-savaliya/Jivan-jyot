import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Printer, Edit, Trash2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import FormModal from '@/components/shared/FormModal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import ActionTooltip from '@/components/shared/ActionTooltip';
import moment from 'moment';

export default function DischargeManagement() {
  const [discharges, setDischarges] = useState([]);
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
    try {
      const [dischargeData, residentData] = await Promise.all([
        base44.entities.Discharge.list('-created_date', 100),
        base44.entities.Resident.list('-created_date', 200)
      ]);
      setDischarges(dischargeData);
      setResidents(residentData);
    } catch (e) {
      toast({ title: 'Error loading records', description: e.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  // Auto-populate resident details when selected in dropdown
  useEffect(() => {
    if (form.resident_id && !editing) {
      const selected = residents.find(r => r.id === form.resident_id);
      if (selected) {
        setForm(prev => ({
          ...prev,
          resident_name: selected.name,
          address: selected.address || '',
          mobile: selected.guardian_phone || ''
        }));
      }
    }
  }, [form.resident_id, residents, editing]);

  const openAdd = () => {
    setEditing(null);
    setForm({ date: new Date().toISOString().split('T')[0] });
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      ...row,
      date: row.date ? new Date(row.date).toISOString().split('T')[0] : ''
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    // 10 digit mobile check
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
        await base44.entities.Discharge.update(editing.id, form);
        toast({ title: 'Discharge record updated' });
      } else {
        await base44.entities.Discharge.create(form);
        toast({ title: 'Resident successfully discharged' });
      }
      setModalOpen(false);
      load();
    } catch (e) {
      toast({
        title: 'Save failed',
        description: e.message || 'Verification failed. Make sure all required fields are filled.',
        variant: 'destructive'
      });
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    try {
      await base44.entities.Discharge.delete(deleteTarget.id);
      setDeleteTarget(null);
      toast({ title: 'Discharge record removed', description: 'Resident status reverted to Active.' });
      load();
    } catch (e) {
      toast({ title: 'Delete failed', description: e.message, variant: 'destructive' });
    }
  };

  const handlePrint = (row) => {
    const token = localStorage.getItem('mock_access_token') || localStorage.getItem('token');
    const host = window.location.hostname;
    const isLocal = host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.') || host.startsWith('10.');
    const apiHost = isLocal ? `http://${host}:5000` : 'https://donate-me-j4ha.onrender.com';
    const url = `${apiHost}/api/discharge/${row.id}/receipt?token=${token}`;
    
    // Create temporary download anchor link
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `discharge-${row.resident_name}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get active residents list to populate dropdown
  const activeResidents = residents.filter(r => r.status === 'Active');
  const residentOptions = activeResidents.map(r => ({
    value: r.id,
    label: `${r.name} (${r.resident_id || 'No ID'})`
  }));

  const fields = [
    ...(editing ? [] : [{
      key: 'resident_id',
      label: 'Select Resident to Discharge',
      type: 'select',
      options: residentOptions,
      required: true
    }]),
    { key: 'resident_name', label: 'Resident Name', required: true },
    { key: 'address', label: 'Resident Address', type: 'textarea', required: true },
    { key: 'village', label: 'Village', required: true },
    { key: 'taluka', label: 'Taluka', required: true },
    { key: 'mobile', label: 'Mobile Number (10 Digits)', required: true },
    { key: 'date', label: 'Discharge Date', type: 'date', required: true },
    { key: 'taking_responsibility_person', label: 'Taking Responsibility Person', required: true },
    { key: 'relationship', label: 'Relationship to Resident', required: true },
    { key: 'responsibility_address', label: 'Responsibility Person Address', type: 'textarea', required: true },
    { key: 'signature', label: 'Signature / Name Confirmation', placeholder: 'e.g. John Doe' }
  ];

  const columns = [
    { key: 'resident_name', label: 'Resident Name', render: val => <span className="font-semibold">{val}</span> },
    { key: 'date', label: 'Discharge Date', render: val => val ? moment(val).format('MMM DD, YYYY') : '—' },
    { key: 'taking_responsibility_person', label: 'Responsibility Taker', render: (val, row) => (
      <div>
        <p className="font-medium text-sm">{val}</p>
        <p className="text-xs text-muted-foreground">{row.relationship}</p>
      </div>
    )},
    { key: 'mobile', label: 'Mobile' },
    { key: 'village', label: 'Location', render: (_, row) => `${row.village}, ${row.taluka}` },
    {
      key: 'actions', label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-1">
          <ActionTooltip content="Print Form">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => { e.stopPropagation(); handlePrint(row); }}>
              <Printer className="w-3.5 h-3.5 text-primary" />
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
    }
  ];

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div>
      <PageHeader title="Discharge Management" subtitle={`${discharges.length} discharged residents history`} actions={
        <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Discharge Resident</Button>
      } />

      <DataTable
        columns={columns}
        data={discharges}
        searchKey={['resident_name', 'taking_responsibility_person', 'village']}
        filters={[]}
      />

      <FormModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Discharge Record' : 'Resident Discharge Form'} fields={fields} values={form} onChange={setForm} onSubmit={handleSave} loading={saving} />

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <ShieldAlert className="w-5 h-5" />
              Revert Discharge?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove the discharge record for {deleteTarget?.resident_name}? 
              This will automatically set their status back to <strong>Active</strong> in Resident Management.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Revert</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
