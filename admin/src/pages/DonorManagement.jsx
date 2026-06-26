import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
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

const donorFields = [
  { key: 'name', label: 'Name', required: true },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'phone', label: 'Phone' },
  { key: 'address', label: 'Address', type: 'textarea' },
  { key: 'donor_type', label: 'Donor Type', type: 'select', options: ['Individual', 'Corporate', 'Trust', 'Government', 'Anonymous'], required: true },
  { key: 'pan_number', label: 'PAN Number' },
  { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
];

export default function DonorManagement() {
  const [donors, setDonors] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [detailDonor, setDetailDonor] = useState(null);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const [d, don] = await Promise.all([
      base44.entities.Donor.list('-created_date', 100),
      base44.entities.Donation.list('-created_date', 200),
    ]);
    setDonors(d);
    setDonations(don);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm({ donor_type: 'Individual', status: 'Active' }); setModalOpen(true); };
  const openEdit = (row) => { setEditing(row); setForm({ ...row }); setModalOpen(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) {
        await base44.entities.Donor.update(editing.id, form);
        toast({ title: 'Donor updated' });
      } else {
        await base44.entities.Donor.create(form);
        toast({ title: 'Donor added' });
      }
      setModalOpen(false);
      load();
    } catch (e) {
      toast({
        title: 'Save failed',
        description: e.message || 'Could not save donor details.',
        variant: 'destructive'
      });
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    await base44.entities.Donor.delete(deleteTarget.id);
    setDeleteTarget(null);
    toast({ title: 'Donor removed' });
    load();
  };

  const getDonorDonations = (donorName) => donations.filter(d => d.donor_name === donorName);

  const columns = [
    { key: 'name', label: 'Donor Name', render: val => <span className="font-medium">{val}</span> },
    { key: 'donor_type', label: 'Type' },
    { key: 'email', label: 'Email', render: val => <span className="text-xs">{val || '—'}</span> },
    { key: 'phone', label: 'Phone', render: val => val || '—' },
    { key: 'total_donated', label: 'Total Donated', render: val => <span className="font-semibold">₹{(val || 0).toLocaleString()}</span> },
    { key: 'donation_count', label: 'Donations', render: val => val || 0 },
    { key: 'status', label: 'Status', render: val => <StatusBadge status={val || 'Active'} /> },
    {
      key: 'actions', label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-1" onClick={e => e.stopPropagation()}>
          <ActionTooltip content="View Details">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => { e.stopPropagation(); setDetailDonor(row); }}>
              <Eye className="w-3.5 h-3.5" />
            </Button>
          </ActionTooltip>
          <ActionTooltip content="Edit Record">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => { e.stopPropagation(); openEdit(row); }}>
              <Edit className="w-3.5 h-3.5" />
            </Button>
          </ActionTooltip>
          <ActionTooltip content="Delete Record">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={e => { e.stopPropagation(); setDeleteTarget(row); }}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </ActionTooltip>
        </div>
      )
    },
  ];

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  const donorHistory = detailDonor ? getDonorDonations(detailDonor.name) : [];

  return (
    <div>
      <PageHeader title="Donor Management" subtitle={`${donors.length} registered donors`} actions={
        <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Add Donor</Button>
      } />
      <DataTable
        columns={columns}
        data={donors}
        searchKey={['name', 'email', 'phone']}
        filters={[
          { key: 'donor_type', label: 'Type', options: ['Individual', 'Corporate', 'Trust', 'Government', 'Anonymous'] },
          { key: 'status', label: 'Status', options: ['Active', 'Inactive'] },
        ]}
      />
      <FormModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Donor' : 'Add Donor'} fields={donorFields} values={form} onChange={setForm} onSubmit={handleSave} loading={saving} />

      <Dialog open={!!detailDonor} onOpenChange={() => setDetailDonor(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Donor History — {detailDonor?.name}</DialogTitle></DialogHeader>
          {detailDonor && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-muted rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">Total Donated</p>
                  <p className="text-lg font-bold">₹{(detailDonor.total_donated || 0).toLocaleString()}</p>
                </div>
                <div className="bg-muted rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">Donations</p>
                  <p className="text-lg font-bold">{donorHistory.length}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Donation History</p>
                {donorHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No donations found</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {donorHistory.map(d => (
                      <div key={d.id} className="flex items-center justify-between p-2 border border-border rounded-lg text-sm">
                        <div>
                          <p className="font-medium">₹{(d.amount || 0).toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">{d.donation_date ? moment(d.donation_date).format('MMM DD, YYYY') : '—'}</p>
                        </div>
                        <StatusBadge status={d.verification_status} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Donor?</AlertDialogTitle>
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