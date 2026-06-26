import React, { useState, useEffect } from 'react';
import { useLang } from '@/lib/i18n.jsx';
import ScrollReveal from '@/components/shared/ScrollReveal';
import SectionHeader from '@/components/shared/SectionHeader';
import StatCounter from '@/components/shared/StatCounter';
import { Heart, Users, IndianRupee, Calendar } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const COLORS = ['#1A535C', '#4ECDC4', '#FF6B6B', '#FFE66D'];

export default function Impact() {
  const { t } = useLang();
  const [stats, setStats] = useState({
    totalResidents: 0,
    totalVolunteers: 0,
    totalDonations: 0,
    totalEvents: 0
  });

  useEffect(() => {
    const host = window.location.hostname;
    const isLocal = host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.') || host.startsWith('10.');
    const apiHost = isLocal ? `http://${host}:5000` : 'https://donate-me-j4ha.onrender.com';
    fetch(`${apiHost}/api/dashboard/public-stats`)
      .then(res => res.json())
      .then(resData => {
        if (resData && resData.success && resData.data) {
          setStats({
            totalResidents: resData.data.totalResidents || 0,
            totalVolunteers: resData.data.totalVolunteers || 0,
            totalDonations: resData.data.totalDonations || 0,
            totalEvents: resData.data.totalEvents || 0
          });
        }
      })
      .catch(err => console.error('Failed to load public stats:', err));
  }, []);

  const pieData = [
    { name: t('cat_food'), value: 35 },
    { name: t('cat_health'), value: 25 },
    { name: t('cat_education'), value: 30 },
    { name: t('cat_infrastructure'), value: 10 },
  ];

  const monthlyData = [
    { month: 'Jan', beneficiaries: 42, volunteers: 12, events: 3 },
    { month: 'Feb', beneficiaries: 48, volunteers: 15, events: 2 },
    { month: 'Mar', beneficiaries: 55, volunteers: 18, events: 4 },
    { month: 'Apr', beneficiaries: 60, volunteers: 20, events: 3 },
    { month: 'May', beneficiaries: 65, volunteers: 22, events: 5 },
    { month: 'Jun', beneficiaries: 72, volunteers: 25, events: 4 },
  ];

  return (
    <div>
      <section className="bg-muted/30 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title={t('impact_title')} description={t('impact_desc')} />
        </div>
      </section>

      {/* Key Stats */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCounter value={stats.totalResidents} label={t('impact_beneficiaries')} icon={Heart} />
            <StatCounter value={stats.totalVolunteers} label={t('impact_volunteers')} icon={Users} />
            <StatCounter value={stats.totalDonations} label={t('impact_donations')} icon={IndianRupee} suffix="" />
            <StatCounter value={stats.totalEvents} label={t('impact_events_conducted')} icon={Calendar} />
          </div>
        </div>
      </section>

      {/* Charts */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Pie Chart */}
            <ScrollReveal>
              <div className="bg-card rounded-2xl border border-border p-6 sm:p-8">
                <h3 className="font-heading font-semibold text-foreground text-lg mb-6">{t('chart_utilization')}</h3>
                <div className="h-64 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '13px' }}
                        formatter={(value) => [`${value}%`, '']}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </ScrollReveal>

            {/* Bar Chart */}
            <ScrollReveal delay={0.1}>
              <div className="bg-card rounded-2xl border border-border p-6 sm:p-8">
                <h3 className="font-heading font-semibold text-foreground text-lg mb-6">{t('chart_monthly')}</h3>
                <div className="h-64 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} />
                      <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '13px' }}
                      />
                      <Legend
                        iconType="circle"
                        formatter={(value) => <span className="text-sm text-foreground capitalize">{value}</span>}
                      />
                      <Bar dataKey="beneficiaries" fill="#1A535C" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="volunteers" fill="#4ECDC4" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="events" fill="#FFE66D" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </div>
  );
}