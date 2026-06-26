import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import ActionTooltip from '@/components/shared/ActionTooltip';
import moment from 'moment';

export default function MessagesManagement() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [detailMessage, setDetailMessage] = useState(null);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.ContactMessage.list('-created_date', 100);
      setMessages(data);
    } catch (e) {
      console.error(e);
      toast({
        title: 'Error',
        description: 'Failed to fetch contact messages.',
        variant: 'destructive'
      });
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async () => {
    try {
      await base44.entities.ContactMessage.delete(deleteTarget._id || deleteTarget.id);
      setDeleteTarget(null);
      toast({ title: 'Message removed successfully' });
      load();
    } catch (e) {
      toast({
        title: 'Delete failed',
        description: e.message || 'Could not delete message.',
        variant: 'destructive'
      });
    }
  };

  const columns = [
    { key: 'name', label: 'Sender Name', render: val => <span className="font-medium">{val}</span> },
    { key: 'mobile', label: 'Mobile' },
    { key: 'email', label: 'Email', render: val => <span className="text-xs font-mono">{val || '—'}</span> },
    { key: 'subject', label: 'Subject', render: val => <span className="truncate max-w-[200px] block">{val}</span> },
    { key: 'createdAt', label: 'Received Date', render: val => val ? moment(val).format('MMM DD, YYYY hh:mm A') : '—' },
    {
      key: 'actions', label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-1" onClick={e => e.stopPropagation()}>
          <ActionTooltip content="View Details">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => { e.stopPropagation(); setDetailMessage(row); }}>
              <Eye className="w-3.5 h-3.5" />
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

  return (
    <div>
      <PageHeader title="Contact Form Messages" subtitle={`${messages.length} messages received`} />
      <DataTable
        columns={columns}
        data={messages}
        searchKey={['name', 'email', 'mobile', 'subject']}
        onRowClick={row => setDetailMessage(row)}
      />

      <Dialog open={!!detailMessage} onOpenChange={() => setDetailMessage(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Message Details</DialogTitle>
          </DialogHeader>
          {detailMessage && (
            <div className="space-y-4 text-sm mt-2">
              <div className="grid grid-cols-2 gap-2 pb-3 border-b border-border">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase">From</p>
                  <p className="font-semibold text-foreground">{detailMessage.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase">Received At</p>
                  <p className="text-foreground">{detailMessage.createdAt ? moment(detailMessage.createdAt).format('MMM DD, YYYY hh:mm A') : '—'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 pb-3 border-b border-border">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase">Mobile</p>
                  <p className="text-foreground">{detailMessage.mobile || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase">Email</p>
                  <p className="text-foreground font-mono text-xs">{detailMessage.email || '—'}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase">Subject</p>
                <p className="text-foreground font-semibold mt-1">{detailMessage.subject}</p>
              </div>
              <div className="bg-muted p-4 rounded-xl">
                <p className="text-xs text-muted-foreground font-semibold uppercase mb-1.5">Message Body</p>
                <p className="text-foreground whitespace-pre-wrap leading-relaxed">{detailMessage.message}</p>
              </div>
              <div className="flex justify-end pt-2">
                <Button variant="outline" size="sm" onClick={() => setDetailMessage(null)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Message?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently remove the message from {deleteTarget?.name}.</AlertDialogDescription>
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
