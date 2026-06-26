import React from 'react';
import { Badge } from '@/components/ui/badge';

const statusStyles = {
  Active: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  Inactive: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
  Suspended: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
  Pending: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
  Verified: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  Approved: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  Rejected: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
  Upcoming: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  Ongoing: 'bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20',
  Completed: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  Cancelled: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
  Open: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  'In Progress': 'bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20',
  Fulfilled: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  Closed: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
  Discharged: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
  Transferred: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  Low: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
  Medium: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
  High: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20',
  Urgent: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
  'On Leave': 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
};

export default function StatusBadge({ status }) {
  return (
    <Badge variant="outline" className={`text-[11px] font-medium ${statusStyles[status] || 'bg-muted text-muted-foreground'}`}>
      {status}
    </Badge>
  );
}