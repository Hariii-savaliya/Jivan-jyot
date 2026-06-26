import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Award, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PageHeader from '@/components/shared/PageHeader';
import moment from 'moment';

export default function Certificates() {
  const [volunteers, setVolunteers] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);
  const certRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      const data = await base44.entities.Volunteer.list('-created_date', 100);
      setVolunteers(data);
      setLoading(false);
    };
    load();
  }, []);

  const selected = volunteers.find(v => v.id === selectedId);

  const handlePrint = () => {
    const content = certRef.current;
    if (!content) return;
    const w = window.open('', '_blank');
    w.document.write(`
      <html><head><title>Certificate</title>
      <style>
        body{margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f5f5f5;font-family:'Georgia',serif}
        .cert{width:800px;padding:60px;background:white;border:3px double #1a365d;position:relative;text-align:center}
        .cert::before{content:'';position:absolute;inset:8px;border:1px solid #d4a843;pointer-events:none}
        h1{font-size:36px;color:#1a365d;margin:0 0 4px}
        h2{font-size:14px;letter-spacing:4px;color:#666;margin:0 0 30px;text-transform:uppercase}
        .name{font-size:28px;color:#1a365d;border-bottom:2px solid #d4a843;padding-bottom:8px;display:inline-block;margin:20px 0}
        .body{font-size:15px;color:#444;line-height:1.8;max-width:600px;margin:0 auto 30px}
        .details{display:flex;justify-content:center;gap:40px;margin:20px 0;font-size:13px;color:#666}
        .signature{margin-top:40px;display:flex;justify-content:space-around}
        .sig-line{border-top:1px solid #999;width:180px;padding-top:8px;font-size:12px;color:#666}
        .date{font-size:12px;color:#888;margin-top:20px}
        @media print{body{background:white}.cert{border:3px double #1a365d}}
      </style></head><body>
      ${content.innerHTML}
      <script>window.print();window.close();</script>
      </body></html>
    `);
    w.document.close();
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div>
      <PageHeader title="Certificate Generator" subtitle="Generate volunteer appreciation certificates" />

      <div className="bg-card rounded-xl border border-border p-5 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Select Volunteer</label>
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Choose a volunteer..." />
              </SelectTrigger>
              <SelectContent>
                {volunteers.map(v => (
                  <SelectItem key={v.id} value={v.id}>{v.name} — {v.total_hours || 0}h</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selected && (
            <Button size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-1" />Print / Download PDF
            </Button>
          )}
        </div>
      </div>

      {selected && (
        <div className="flex justify-center">
          <div ref={certRef} className="bg-white text-black border-[3px] border-double border-[#1a365d] p-12 max-w-[800px] w-full relative">
            <div className="absolute inset-2 border border-[#d4a843] pointer-events-none" />
            <div className="text-center relative z-10">
              <div className="flex justify-center mb-4">
                <Award className="w-12 h-12 text-[#d4a843]" />
              </div>
              <h1 className="text-3xl font-serif font-bold text-[#1a365d] mb-1">Certificate of Appreciation</h1>
              <p className="text-xs tracking-[4px] uppercase text-gray-500 mb-8">Jivan Jyot Ashram</p>

              <p className="text-sm text-gray-500 mb-2">This certificate is proudly presented to</p>
              <p className="text-2xl font-serif font-bold text-[#1a365d] border-b-2 border-[#d4a843] inline-block pb-2 mb-6">{selected.name}</p>

              <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed mb-6">
                In recognition of outstanding voluntary service and dedication to the community.
                Your selfless contribution of <strong>{selected.total_hours || 0} hours</strong> across{' '}
                <strong>{selected.events_participated || 0} events</strong> has made a meaningful impact.
              </p>

              <div className="flex justify-center gap-10 text-xs text-gray-500 mb-8">
                <span>Skills: {selected.skills || 'General'}</span>
                <span>Joined: {selected.join_date ? moment(selected.join_date).format('MMM YYYY') : '—'}</span>
              </div>

              <div className="flex justify-around mt-10">
                <div className="text-center">
                  <div className="w-40 border-t border-gray-400 pt-2 text-xs text-gray-500">Coordinator</div>
                </div>
                <div className="text-center">
                  <div className="w-40 border-t border-gray-400 pt-2 text-xs text-gray-500">Director</div>
                </div>
              </div>

              <p className="text-[10px] text-gray-400 mt-6">{moment().format('MMMM DD, YYYY')}</p>
            </div>
          </div>
        </div>
      )}

      {!selected && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Award className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">Select a volunteer to generate their certificate</p>
        </div>
      )}
    </div>
  );
}