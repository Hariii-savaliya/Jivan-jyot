import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, CheckCircle, XCircle, Shield, Eye, Trash2 } from 'lucide-react';
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

const donationFields = [
  { key: 'donor_name', label: 'Donor Name', required: true },
  { key: 'mobile', label: 'Mobile Number (10 Digits)', required: true },
  { key: 'amount', label: 'Donation Amount (₹)', type: 'number', required: true },
  { key: 'transaction_id', label: 'Transaction ID', required: true },
  { key: 'screenshot', label: 'Transaction Screenshot', type: 'file' },
  { key: 'donation_date', label: 'Donation Date', type: 'date', required: true },
  { key: 'notes', label: 'Remarks / Notes', type: 'textarea' },
  { key: 'verification_status', label: 'Verification Status', type: 'select', options: ['Pending', 'Verified', 'Rejected', 'Approved'], required: true },
];

export default function DonationManagement() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [detailItem, setDetailItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.Donation.list('-created_date', 100);
    setDonations(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async () => {
    try {
      await base44.entities.Donation.delete(deleteTarget.id || deleteTarget._id);
      setDeleteTarget(null);
      toast({ title: 'Donation deleted successfully' });
      load();
    } catch (e) {
      toast({
        title: 'Delete failed',
        description: e.message || 'Could not delete donation.',
        variant: 'destructive'
      });
    }
  };

  const openAdd = () => { setEditing(null); setForm({ verification_status: 'Pending', payment_method: 'UPI' }); setModalOpen(true); };
  const openEdit = (row) => { setEditing(row); setForm({ ...row }); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.donor_name || !form.donor_name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Donor Name is required.',
        variant: 'destructive'
      });
      return;
    }

    if (!form.mobile || !/^\d{10}$/.test(form.mobile)) {
      toast({
        title: 'Validation Error',
        description: 'Mobile number must be exactly 10 digits.',
        variant: 'destructive'
      });
      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Donation amount must be a positive number.',
        variant: 'destructive'
      });
      return;
    }

    if (!form.transaction_id || !form.transaction_id.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Transaction ID is required.',
        variant: 'destructive'
      });
      return;
    }

    if (!form.donation_date) {
      toast({
        title: 'Validation Error',
        description: 'Donation Date is required.',
        variant: 'destructive'
      });
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await base44.entities.Donation.update(editing.id, form);
        toast({ title: 'Donation updated' });
      } else {
        await base44.entities.Donation.create(form);
        toast({ title: 'Donation recorded' });
      }
      setModalOpen(false);
      load();
    } catch (e) {
      toast({
        title: 'Save failed',
        description: e.message || 'Make sure transaction screenshot is uploaded.',
        variant: 'destructive'
      });
    }
    setSaving(false);
  };

  const updateStatus = async (row, status) => {
    await base44.entities.Donation.update(row.id, { ...row, verification_status: status });
    toast({ title: `Donation ${status.toLowerCase()}` });
    load();
  };

  const totalAmount = donations.reduce((s, d) => s + (d.amount || 0), 0);
  const pendingCount = donations.filter(d => d.verification_status === 'Pending').length;

  const columns = [
    { key: 'donor_name', label: 'Donor', render: val => <span className="font-medium">{val}</span> },
    { key: 'amount', label: 'Amount', render: val => <span className="font-semibold">₹{(val || 0).toLocaleString()}</span> },
    { key: 'transaction_id', label: 'Transaction ID', render: val => <span className="text-xs font-mono">{val || '—'}</span> },
    { key: 'payment_method', label: 'Method', render: val => val || '—' },
    { key: 'donation_date', label: 'Date', render: val => val ? moment(val).format('MMM DD, YYYY') : moment().format('MMM DD, YYYY') },
    { key: 'verification_status', label: 'Status', render: val => <StatusBadge status={val} /> },
    {
      key: 'actions', label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-1" onClick={e => e.stopPropagation()}>
          <ActionTooltip content="View Details">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => { e.stopPropagation(); setDetailItem(row); }}>
              <Eye className="w-3.5 h-3.5" />
            </Button>
          </ActionTooltip>
          {row.verification_status === 'Pending' && (
            <>
              <ActionTooltip content="Mark Verified">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => { e.stopPropagation(); updateStatus(row, 'Verified'); }}>
                  <Shield className="w-3.5 h-3.5 text-blue-500" />
                </Button>
              </ActionTooltip>
              <ActionTooltip content="Mark Approved">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => { e.stopPropagation(); updateStatus(row, 'Approved'); }}>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                </Button>
              </ActionTooltip>
              <ActionTooltip content="Mark Rejected">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => { e.stopPropagation(); updateStatus(row, 'Rejected'); }}>
                  <XCircle className="w-3.5 h-3.5 text-red-500" />
                </Button>
              </ActionTooltip>
            </>
          )}
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

  return (
    <div>
      <PageHeader title="Donation Management" subtitle={`Total: ₹${totalAmount.toLocaleString()} · ${pendingCount} pending verification`} actions={
        <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Record Donation</Button>
      } />
      <DataTable
        columns={columns}
        data={donations}
        searchKey={['donor_name', 'transaction_id']}
        filters={[
          { key: 'verification_status', label: 'Status', options: ['Pending', 'Verified', 'Rejected', 'Approved'] },
          { key: 'payment_method', label: 'Method', options: ['Cash', 'Bank Transfer', 'UPI', 'Credit Card', 'Cheque', 'Online', 'Other'] },
        ]}
      />
      <FormModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Donation' : 'Record Donation'} fields={donationFields} values={form} onChange={setForm} onSubmit={handleSave} loading={saving} />

      <Dialog open={!!detailItem} onOpenChange={() => setDetailItem(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Donation Details</DialogTitle></DialogHeader>
          {detailItem && (
            <div className="space-y-3 text-sm">
              <DetailRow label="Donor" value={detailItem.donor_name} />
              <DetailRow label="Amount" value={`₹${(detailItem.amount || 0).toLocaleString()}`} />
              <DetailRow label="Transaction ID" value={detailItem.transaction_id} />
              <DetailRow label="Date" value={detailItem.donation_date ? moment(detailItem.donation_date).format('MMMM DD, YYYY') : '—'} />
              <DetailRow label="Payment Method" value={detailItem.payment_method} />
              <DetailRow label="Purpose" value={detailItem.purpose} />
              <DetailRow label="Notes" value={detailItem.notes} />
              <div className="flex items-center justify-between py-2">
                <span className="text-muted-foreground">Status</span>
                <StatusBadge status={detailItem.verification_status} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Donation Record?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently remove the donation record from {deleteTarget?.donor_name}.</AlertDialogDescription>
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

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value || '—'}</span>
    </div>
  );
}