import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Edit, CheckCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import FormModal from '@/components/shared/FormModal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import ActionTooltip from '@/components/shared/ActionTooltip';


const wishFields = [
  { key: 'title', label: 'Requirement', required: true },
  { key: 'description', label: 'Description', type: 'textarea' },
  { key: 'category', label: 'Category', type: 'select', options: ['Medical', 'Education', 'Food', 'Clothing', 'Infrastructure', 'Equipment', 'Other'], required: true },
  { key: 'priority', label: 'Priority', type: 'select', options: ['Low', 'Medium', 'High', 'Urgent'], required: true },
  { key: 'quantity', label: 'Quantity Needed', type: 'number', required: true },
  { key: 'fulfilled_count', label: 'Fulfilled Count', type: 'number' },
  { key: 'estimated_cost', label: 'Estimated Cost (₹)', type: 'number' },
  { key: 'requested_by', label: 'Requested By' },
  { key: 'target_date', label: 'Target Date', type: 'date' },
  { key: 'status', label: 'Status', type: 'select', options: ['Open', 'In Progress', 'Fulfilled', 'Closed'], required: true },
];

export default function WishWallManagement() {
  const [wishes, setWishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.WishWall.list('-created_date', 100);
    setWishes(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm({ status: 'Open', priority: 'Medium', quantity: 1, fulfilled_count: 0 }); setModalOpen(true); };
  const openEdit = (row) => { setEditing(row); setForm({ ...row }); setModalOpen(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) {
        await base44.entities.WishWall.update(editing.id, form);
        toast({ title: 'Wish updated' });
      } else {
        await base44.entities.WishWall.create(form);
        toast({ title: 'Wish added to wall' });
      }
      setModalOpen(false);
      load();
    } catch (e) {
      toast({
        title: 'Save failed',
        description: e.message || 'Could not save wish details.',
        variant: 'destructive'
      });
    }
    setSaving(false);
  };

  const markFulfilled = async (row) => {
    await base44.entities.WishWall.update(row.id, { ...row, status: 'Fulfilled', fulfilled_count: row.quantity });
    toast({ title: 'Wish marked as fulfilled!' });
    load();
  };

  const handleDelete = async () => {
    await base44.entities.WishWall.delete(deleteTarget.id);
    setDeleteTarget(null);
    toast({ title: 'Wish removed' });
    load();
  };

  const columns = [
    { key: 'title', label: 'Requirement Name', render: val => <span className="font-semibold text-sm">{val}</span> },
    { key: 'description', label: 'Description', render: val => <span className="text-xs text-muted-foreground">{val || '—'}</span> },
    { key: 'priority', label: 'Priority', render: val => <StatusBadge status={val} /> },
    { key: 'quantity', label: 'Quantity', render: val => val || 1 },
    { key: 'fulfilled_count', label: 'Fulfilled Count', render: val => val || 0 },
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
          {row.status !== 'Fulfilled' && row.status !== 'Closed' && (
            <ActionTooltip content="Mark Fulfilled">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => { e.stopPropagation(); markFulfilled(row); }}>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
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

  const openCount = wishes.filter(w => w.status === 'Open' || w.status === 'In Progress').length;

  return (
    <div>
      <PageHeader title="Smart Wish Wall" subtitle={`${openCount} active wishes · ${wishes.length} total`} actions={
        <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Add Wish</Button>
      } />
      <DataTable
        columns={columns}
        data={wishes}
        searchKey={['title', 'requested_by']}
        filters={[
          { key: 'priority', label: 'Priority', options: ['Low', 'Medium', 'High', 'Urgent'] },
          { key: 'status', label: 'Status', options: ['Open', 'In Progress', 'Fulfilled', 'Closed'] },
          { key: 'category', label: 'Category', options: ['Medical', 'Education', 'Food', 'Clothing', 'Infrastructure', 'Equipment', 'Other'] },
        ]}
      />
      <FormModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Wish' : 'Add Wish'} fields={wishFields} values={form} onChange={setForm} onSubmit={handleSave} loading={saving} />
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Wish?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently remove "{deleteTarget?.title}".</AlertDialogDescription>
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