import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Heart, UserCheck, Calendar, Home } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import moment from 'moment';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

export default function Analytics() {
  const [donations, setDonations] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [events, setEvents] = useState([]);
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [d, v, e, r] = await Promise.all([
        base44.entities.Donation.list('-created_date', 200),
        base44.entities.Volunteer.list('-created_date', 100),
        base44.entities.Event.list('-created_date', 100),
        base44.entities.Resident.list('-created_date', 100),
      ]);
      setDonations(d); setVolunteers(v); setEvents(e); setResidents(r);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  const totalDonated = donations.reduce((s, d) => s + (d.amount || 0), 0);
  const avgDonation = donations.length ? Math.round(totalDonated / donations.length) : 0;
  const totalHours = volunteers.reduce((s, v) => s + (v.total_hours || 0), 0);
  const totalAttendees = events.reduce((s, e) => s + (e.attendees || 0), 0);

  // Monthly donation trend
  const monthlyDonations = donations.reduce((acc, d) => {
    const m = moment(d.created_date).format('MMM');
    acc[m] = (acc[m] || 0) + (d.amount || 0);
    return acc;
  }, {});
  const donationTrend = Object.entries(monthlyDonations).map(([month, amount]) => ({ month, amount })).slice(-12);

  // Donation by purpose
  const byPurpose = donations.reduce((acc, d) => {
    const p = d.purpose || 'General';
    acc[p] = (acc[p] || 0) + (d.amount || 0);
    return acc;
  }, {});
  const purposeData = Object.entries(byPurpose).map(([name, value]) => ({ name, value }));

  // Volunteer availability
  const volAvailability = volunteers.reduce((acc, v) => {
    const a = v.availability || 'Flexible';
    acc[a] = (acc[a] || 0) + 1;
    return acc;
  }, {});
  const availabilityData = Object.entries(volAvailability).map(([name, value]) => ({ name, value }));

  // Events by status
  const eventStatus = events.reduce((acc, e) => {
    acc[e.status] = (acc[e.status] || 0) + 1;
    return acc;
  }, {});
  const eventStatusData = Object.entries(eventStatus).map(([name, value]) => ({ name, value }));

  // Resident demographics
  const genderData = residents.reduce((acc, r) => {
    acc[r.gender] = (acc[r.gender] || 0) + 1;
    return acc;
  }, {});
  const genderChartData = Object.entries(genderData).map(([name, value]) => ({ name, value }));

  // Age groups
  const ageGroups = { '0-18': 0, '19-35': 0, '36-55': 0, '56+': 0 };
  residents.forEach(r => {
    if (r.age <= 18) ageGroups['0-18']++;
    else if (r.age <= 35) ageGroups['19-35']++;
    else if (r.age <= 55) ageGroups['36-55']++;
    else ageGroups['56+']++;
  });
  const ageData = Object.entries(ageGroups).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" subtitle="Comprehensive organizational insights" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Avg Donation" value={`₹${avgDonation.toLocaleString()}`} icon={Heart} color="destructive" />
        <StatCard title="Volunteer Hours" value={totalHours} icon={UserCheck} color="success" />
        <StatCard title="Event Attendees" value={totalAttendees} icon={Calendar} color="warning" />
        <StatCard title="Active Residents" value={residents.filter(r => r.status === 'Active').length} icon={Home} color="blue" />
      </div>

      <Tabs defaultValue="donations" className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="donations">Donations</TabsTrigger>
          <TabsTrigger value="volunteers">Volunteers</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="beneficiaries">Beneficiaries</TabsTrigger>
        </TabsList>

        <TabsContent value="donations">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="Donation Trend">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={donationTrend}>
                  <defs>
                    <linearGradient id="donGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="amount" stroke="#4f46e5" fill="url(#donGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Donations by Purpose">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={purposeData} cx="50%" cy="50%" innerRadius={50} outerRadius={100} dataKey="value" label={({ name }) => name}>
                    {purposeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </TabsContent>

        <TabsContent value="volunteers">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="Volunteer Availability">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={availabilityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Top Volunteers by Hours">
              <div className="space-y-3 max-h-[260px] overflow-y-auto">
                {[...volunteers].sort((a, b) => (b.total_hours || 0) - (a.total_hours || 0)).slice(0, 8).map((v, i) => (
                  <div key={v.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-muted-foreground w-5">#{i + 1}</span>
                      <span className="text-sm font-medium">{v.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${totalHours ? ((v.total_hours || 0) / totalHours) * 100 : 0}%` }} />
                      </div>
                      <span className="text-xs font-semibold w-10 text-right">{v.total_hours || 0}h</span>
                    </div>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>
        </TabsContent>

        <TabsContent value="events">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="Events by Status">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={eventStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={100} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                    {eventStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Event Budget Overview">
              <div className="space-y-3 max-h-[260px] overflow-y-auto">
                {events.filter(e => e.budget).slice(0, 8).map(e => (
                  <div key={e.id} className="flex items-center justify-between">
                    <span className="text-sm truncate max-w-[180px]">{e.title}</span>
                    <div className="text-right">
                      <p className="text-xs font-semibold">₹{(e.budget || 0).toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground">Spent: ₹{(e.spent || 0).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
                {events.filter(e => e.budget).length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No events with budget data</p>}
              </div>
            </ChartCard>
          </div>
        </TabsContent>

        <TabsContent value="beneficiaries">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="Gender Distribution">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={genderChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={100} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                    {genderChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Age Distribution">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={ageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="font-semibold text-sm mb-4">{title}</h3>
      {children}
    </div>
  );
}