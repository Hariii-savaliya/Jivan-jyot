import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Heart, UserCheck, Calendar, Users, Home, HandCoins, ArrowRight } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import moment from 'moment';

const monthlyDonations = [
  { month: 'Jan', amount: 45000 }, { month: 'Feb', amount: 52000 }, { month: 'Mar', amount: 48000 },
  { month: 'Apr', amount: 61000 }, { month: 'May', amount: 55000 }, { month: 'Jun', amount: 67000 },
  { month: 'Jul', amount: 72000 }, { month: 'Aug', amount: 58000 }, { month: 'Sep', amount: 81000 },
  { month: 'Oct', amount: 76000 }, { month: 'Nov', amount: 89000 }, { month: 'Dec', amount: 95000 },
];

const volunteerGrowth = [
  { month: 'Jan', count: 12 }, { month: 'Feb', count: 15 }, { month: 'Mar', count: 18 },
  { month: 'Apr', count: 22 }, { month: 'May', count: 28 }, { month: 'Jun', count: 35 },
  { month: 'Jul', count: 31 }, { month: 'Aug', count: 38 }, { month: 'Sep', count: 42 },
  { month: 'Oct', count: 45 }, { month: 'Nov', count: 50 }, { month: 'Dec', count: 56 },
];

const eventAnalytics = [
  { month: 'Jan', events: 3, attendees: 120 }, { month: 'Feb', events: 5, attendees: 210 },
  { month: 'Mar', events: 4, attendees: 180 }, { month: 'Apr', events: 6, attendees: 340 },
  { month: 'May', events: 7, attendees: 420 }, { month: 'Jun', events: 5, attendees: 280 },
];

export default function Dashboard() {
  const [stats, setStats] = useState({ donations: 0, donors: 0, volunteers: 0, events: 0, staff: 0, residents: 0 });
  const [recentDonations, setRecentDonations] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [chartDonations, setChartDonations] = useState([]);
  const [chartVolunteers, setChartVolunteers] = useState([]);
  const [chartEvents, setChartEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [donations, donors, volunteers, events, staff, residents] = await Promise.all([
          base44.entities.Donation.list('-created_date', 300),
          base44.entities.Donor.list('-created_date', 300),
          base44.entities.Volunteer.list('-created_date', 300),
          base44.entities.Event.list('-created_date', 300),
          base44.entities.Staff.list('-created_date', 300),
          base44.entities.Resident.list('-created_date', 300),
        ]);
        
        // Sum verified donations
        const totalDonated = donations
          .filter(d => d.verification_status === 'Verified')
          .reduce((s, d) => s + (d.amount || 0), 0);
          
        setStats({
          donations: totalDonated,
          donors: donors.length,
          volunteers: volunteers.length,
          events: events.length,
          staff: staff.filter(s => s.status === 'Active').length,
          residents: residents.filter(r => r.status === 'Active').length,
        });
        setRecentDonations(donations.slice(0, 5));
        setRecentEvents(events.slice(0, 5));

        // Generate live monthly charts data
        const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        const donationChart = monthsShort.map((m, idx) => {
          const total = donations
            .filter(d => {
              const date = new Date(d.donation_date || d.created_date);
              return date.getMonth() === idx && d.verification_status === 'Verified';
            })
            .reduce((sum, d) => sum + (d.amount || 0), 0);
          return { month: m, amount: total };
        });
        setChartDonations(donationChart);

        let vRunningCount = 0;
        const volunteerChart = monthsShort.map((m, idx) => {
          const joinedThisMonth = volunteers.filter(v => {
            const date = new Date(v.created_date || v.join_date);
            return date.getMonth() === idx;
          }).length;
          vRunningCount += joinedThisMonth;
          return { month: m, count: vRunningCount };
        });
        setChartVolunteers(volunteerChart);

        const eventChart = monthsShort.map((m, idx) => {
          const monthEvents = events.filter(e => {
            const date = new Date(e.startDate || e.date);
            return date.getMonth() === idx;
          });
          const totalAttendees = monthEvents.reduce((sum, e) => sum + (e.attendees || 0), 0);
          return {
            month: m,
            events: monthEvents.length,
            attendees: totalAttendees
          };
        });
        setChartEvents(eventChart);

      } catch (e) {
        console.error('Dashboard load failed:', e);
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold font-heading">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Welcome back! Here's your organization overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Total Donations" value={`₹${stats.donations.toLocaleString()}`} icon={Heart} color="destructive" trend="up" trendValue="+12.5%" />
        <StatCard title="Total Donors" value={stats.donors} icon={HandCoins} color="primary" trend="up" trendValue="+8.3%" />
        <StatCard title="Active Volunteers" value={stats.volunteers} icon={UserCheck} color="success" trend="up" trendValue="+15%" />
        <StatCard title="Events" value={stats.events} icon={Calendar} color="warning" trend="up" trendValue="+5.2%" />
        <StatCard title="Staff Members" value={stats.staff} icon={Users} color="purple" />
        <StatCard title="Beneficiaries" value={stats.residents} icon={Home} color="blue" trend="up" trendValue="+3.1%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        <ChartCard title="Monthly Donations" subtitle="Revenue trend this year">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartDonations}>
              <defs>
                <linearGradient id="donationGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="amount" stroke="hsl(var(--primary))" fill="url(#donationGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Volunteer Growth" subtitle="Monthly new volunteers">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartVolunteers}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="count" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ fill: 'hsl(var(--chart-2))', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Event Analytics" subtitle="Events & attendees">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartEvents}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="events" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="attendees" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold font-heading text-sm">Recent Donations</h3>
            <Link to="/donations" className="p-1 rounded-md hover:bg-muted transition-colors" title="View all donations">
              <ArrowRight className="w-4 h-4 text-muted-foreground hover:text-foreground" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentDonations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No donations yet</p>
            ) : recentDonations.map(d => (
              <div key={d.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium">{d.donor_name}</p>
                  <p className="text-xs text-muted-foreground">{moment(d.created_date).fromNow()}</p>
                </div>
                <div className="text-right flex items-center gap-3">
                  <span className="text-sm font-semibold">₹{(d.amount || 0).toLocaleString()}</span>
                  <StatusBadge status={d.verification_status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold font-heading text-sm">Upcoming Events</h3>
            <Link to="/events" className="p-1 rounded-md hover:bg-muted transition-colors" title="View all events">
              <ArrowRight className="w-4 h-4 text-muted-foreground hover:text-foreground" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No events yet</p>
            ) : recentEvents.map(e => (
              <div key={e.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{e.title}</p>
                    <p className="text-xs text-muted-foreground">{e.event_date ? moment(e.event_date).format('MMM DD, YYYY') : '—'}</p>
                  </div>
                </div>
                <StatusBadge status={e.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="mb-4">
        <h3 className="font-semibold font-heading text-sm">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}