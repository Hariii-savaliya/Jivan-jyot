import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { FileText, Download, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/shared/PageHeader';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import moment from 'moment';

const COLORS = ['hsl(234,85%,55%)', 'hsl(160,60%,45%)', 'hsl(36,95%,52%)', 'hsl(280,65%,60%)', 'hsl(340,75%,55%)'];

export default function Reports() {
  const [donations, setDonations] = useState([]);
  const [events, setEvents] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');

  useEffect(() => {
    const load = async () => {
      const [d, e, v, r] = await Promise.all([
        base44.entities.Donation.list('-created_date', 200),
        base44.entities.Event.list('-created_date', 100),
        base44.entities.Volunteer.list('-created_date', 100),
        base44.entities.Resident.list('-created_date', 100),
      ]);
      setDonations(d);
      setEvents(e);
      setVolunteers(v);
      setResidents(r);
      setLoading(false);
    };
    load();
  }, []);

  const totalDonations = donations.reduce((s, d) => s + (d.amount || 0), 0);
  const approvedDonations = donations.filter(d => d.verification_status === 'Approved');
  const activeVolunteers = volunteers.filter(v => v.status === 'Active');
  const completedEvents = events.filter(e => e.status === 'Completed');

  const donationByMethod = donations.reduce((acc, d) => {
    const m = d.payment_method || 'Other';
    acc[m] = (acc[m] || 0) + (d.amount || 0);
    return acc;
  }, {});
  const methodData = Object.entries(donationByMethod).map(([name, value]) => ({ name, value }));

  const eventByCategory = events.reduce((acc, e) => {
    const c = e.category || 'Other';
    acc[c] = (acc[c] || 0) + 1;
    return acc;
  }, {});
  const categoryData = Object.entries(eventByCategory).map(([name, value]) => ({ name, value }));

  const exportReport = () => {
    const reportData = [
      'JIVAN JYOT ASHRAM — REPORT',
      `Generated: ${moment().format('MMMM DD, YYYY')}`,
      `Period: ${period}`,
      '',
      `Total Donations: ₹${totalDonations.toLocaleString()}`,
      `Approved Donations: ${approvedDonations.length}`,
      `Active Volunteers: ${activeVolunteers.length}`,
      `Completed Events: ${completedEvents.length}`,
      `Active Residents: ${residents.filter(r => r.status === 'Active').length}`,
    ].join('\n');
    const blob = new Blob([reportData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_${period}_${moment().format('YYYY-MM-DD')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Generate and export organizational reports"
        actions={
          <div className="flex gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-36 h-9 text-sm">
                <Calendar className="w-3 h-3 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" onClick={exportReport}>
              <Download className="w-4 h-4 mr-1" />Export
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryCard label="Total Revenue" value={`₹${totalDonations.toLocaleString()}`} icon={FileText} color="bg-primary/10 text-primary" />
        <SummaryCard label="Approved Donations" value={approvedDonations.length} icon={FileText} color="bg-emerald-500/10 text-emerald-600" />
        <SummaryCard label="Active Volunteers" value={activeVolunteers.length} icon={FileText} color="bg-blue-500/10 text-blue-600" />
        <SummaryCard label="Completed Events" value={completedEvents.length} icon={FileText} color="bg-amber-500/10 text-amber-600" />
      </div>

      <Tabs defaultValue="donations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="donations">Donations</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="volunteers">Volunteers</TabsTrigger>
        </TabsList>

        <TabsContent value="donations">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-semibold text-sm mb-4">Donations by Payment Method</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={methodData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {methodData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-semibold text-sm mb-4">Donation Status</h3>
              <div className="space-y-3">
                {['Pending', 'Verified', 'Approved', 'Rejected'].map(s => {
                  const count = donations.filter(d => d.verification_status === s).length;
                  const pct = donations.length ? Math.round((count / donations.length) * 100) : 0;
                  return (
                    <div key={s} className="flex items-center justify-between">
                      <span className="text-sm">{s}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-sm font-medium w-8 text-right">{count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="events">
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-semibold text-sm mb-4">Events by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        <TabsContent value="volunteers">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-semibold text-sm mb-4">Volunteer Status</h3>
              <div className="space-y-4">
                {['Active', 'Inactive', 'On Leave'].map(s => {
                  const count = volunteers.filter(v => v.status === s).length;
                  return (
                    <div key={s} className="flex items-center justify-between">
                      <span className="text-sm">{s}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-chart-2 rounded-full" style={{ width: `${volunteers.length ? (count / volunteers.length) * 100 : 0}%` }} />
                        </div>
                        <span className="text-sm font-medium w-8 text-right">{count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-semibold text-sm mb-4">Total Hours Contributed</h3>
              <p className="text-4xl font-bold text-primary">{volunteers.reduce((s, v) => s + (v.total_hours || 0), 0)}</p>
              <p className="text-sm text-muted-foreground mt-1">Total volunteer hours across all volunteers</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SummaryCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}