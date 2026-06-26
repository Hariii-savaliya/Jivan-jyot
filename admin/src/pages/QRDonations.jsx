import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Edit, Trash2, QrCode, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import PageHeader from '@/components/shared/PageHeader';
import FormModal from '@/components/shared/FormModal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import ActionTooltip from '@/components/shared/ActionTooltip';
import { Switch } from '@/components/ui/switch';

const qrFields = [
  { key: 'bank_name', label: 'Bank Name', required: true },
  { key: 'account_holder', label: 'Account Holder' },
  { key: 'account_number', label: 'Account Number' },
  { key: 'ifsc_code', label: 'IFSC Code' },
  { key: 'upi_id', label: 'UPI ID' },
  { key: 'total_received', label: 'Total Received (₹)', type: 'number' },
];

export default function QRDonations() {
  const [qrCodes, setQrCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.QRDonation.list('-created_date', 50);
    setQrCodes(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm({ is_active: true }); setModalOpen(true); };
  const openEdit = (item) => { setEditing(item); setForm({ ...item }); setModalOpen(true); };

  const handleSave = async () => {
    if (form.account_number) {
      if (!/^\d{8,17}$/.test(form.account_number)) {
        toast({
          title: 'Validation Error',
          description: 'Account Number must be between 8 and 17 digits and contain numbers only.',
          variant: 'destructive'
        });
        return;
      }
    }

    if (form.ifsc_code) {
      const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/i;
      if (!ifscRegex.test(form.ifsc_code)) {
        toast({
          title: 'Validation Error',
          description: 'IFSC Code must be exactly 11 characters in a valid format (e.g. SBIN0001234).',
          variant: 'destructive'
        });
        return;
      }
    }

    setSaving(true);
    try {
      if (editing) {
        await base44.entities.QRDonation.update(editing.id, form);
        toast({ title: 'QR details updated' });
      } else {
        await base44.entities.QRDonation.create(form);
        toast({ title: 'QR donation account added' });
      }
      setModalOpen(false);
      load();
    } catch (e) {
      toast({
        title: 'Save failed',
        description: e.message || 'Make sure details are valid.',
        variant: 'destructive'
      });
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    await base44.entities.QRDonation.delete(deleteTarget.id);
    setDeleteTarget(null);
    toast({ title: 'QR account removed' });
    load();
  };

  const toggleActive = async (item) => {
    await base44.entities.QRDonation.update(item.id, { ...item, is_active: !item.is_active });
    toast({ title: item.is_active ? 'Account deactivated' : 'Account activated' });
    load();
  };

  const uploadQR = async (item, file) => {
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.QRDonation.update(item.id, { ...item, qr_image: file_url });
    toast({ title: 'QR code uploaded' });
    load();
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  const totalReceived = qrCodes.reduce((s, q) => s + (q.total_received || 0), 0);

  return (
    <div>
      <PageHeader title="QR Donation Management" subtitle={`${qrCodes.length} accounts · ₹${totalReceived.toLocaleString()} total received`} actions={
        <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Add Account</Button>
      } />

      {qrCodes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <QrCode className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">No QR donation accounts yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {qrCodes.map(qr => (
            <div key={qr.id} className="bg-card rounded-xl border border-border p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-sm">{qr.bank_name}</h3>
                  <p className="text-xs text-muted-foreground">{qr.account_holder || '—'}</p>
                </div>
                <Switch checked={qr.is_active} onCheckedChange={() => toggleActive(qr)} />
              </div>

              {qr.qr_image ? (
                <img src={qr.qr_image} alt="QR Code" className="w-40 h-40 mx-auto rounded-lg border border-border object-contain" />
              ) : (
                <label className="flex flex-col items-center justify-center w-40 h-40 mx-auto border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                  <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">Upload QR</span>
                  <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files[0] && uploadQR(qr, e.target.files[0])} />
                </label>
              )}

              <div className="space-y-1.5 text-sm">
                {qr.account_number && <DetailRow label="Account" value={qr.account_number} />}
                {qr.ifsc_code && <DetailRow label="IFSC" value={qr.ifsc_code} />}
                {qr.upi_id && <DetailRow label="UPI" value={qr.upi_id} />}
                <DetailRow label="Received" value={`₹${(qr.total_received || 0).toLocaleString()}`} />
              </div>

              <div className="flex gap-2 pt-2 border-t border-border">
                <ActionTooltip content="Edit Record">
                  <Button variant="outline" size="sm" className="flex-1 text-xs h-8" onClick={() => openEdit(qr)}>
                    <Edit className="w-3 h-3 mr-1" />Edit
                  </Button>
                </ActionTooltip>
                <ActionTooltip content="Delete Record">
                  <Button variant="outline" size="sm" className="text-xs h-8 text-destructive" onClick={() => setDeleteTarget(qr)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </ActionTooltip>
              </div>
            </div>
          ))}
        </div>
      )}

      <FormModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Account' : 'Add Account'} fields={qrFields} values={form} onChange={setForm} onSubmit={handleSave} loading={saving} />
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Account?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently remove {deleteTarget?.bank_name}.</AlertDialogDescription>
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
    <div className="flex justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-medium">{value}</span>
    </div>
  );
}