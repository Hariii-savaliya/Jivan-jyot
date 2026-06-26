import React, { useState, useEffect } from 'react';
import { useLang } from '@/lib/i18n.jsx';
import { base44 } from '@/api/base44Client';
import ScrollReveal from '@/components/shared/ScrollReveal';
import SectionHeader from '@/components/shared/SectionHeader';
import { Calendar, MapPin, Clock, ImageIcon } from 'lucide-react';
import moment from 'moment';

import EVENTS_IMG from '@/assets/ashram1.jpg';

export default function Events() {
  const { t } = useLang();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    base44.entities.Event.list('-date')
      .then(setEvents)
      .finally(() => setLoading(false));
  }, []);

  const getField = (item, field) => {
    if (field === 'title') return item.title || item.eventName || '';
    if (field === 'description') return item.description || '';
    if (field === 'location') return item.location || '';
    return item[field] || '';
  };

  const filtered = events.filter(e => {
    const status = (e.status || '').toLowerCase();
    if (activeTab === 'all') return true;
    return status === activeTab;
  });

  return (
    <div>
      <section className="bg-muted/30 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title={t('events_title')} />
        </div>
      </section>

      {/* Gallery Banner */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
          <div className="rounded-3xl overflow-hidden">
            <img src={EVENTS_IMG} alt="Children doing art activities in a community center" className="w-full h-48 sm:h-64 lg:h-80 object-cover" />
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-10">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors min-h-[44px] ${activeTab === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
            >
              {t('status_all')}
            </button>
            <button
              onClick={() => setActiveTab('ongoing')}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors min-h-[44px] ${activeTab === 'ongoing' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
            >
              {t('status_ongoing')}
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors min-h-[44px] ${activeTab === 'upcoming' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
            >
              {t('status_upcoming')}
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors min-h-[44px] ${activeTab === 'completed' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
            >
              {t('status_completed')}
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Calendar className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
              <p className="text-muted-foreground">{t('no_data')}</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((event, i) => (
                <ScrollReveal key={event.id} delay={i * 0.05}>
                  <div className="bg-card rounded-2xl border border-border overflow-hidden hover:border-secondary/30 transition-colors h-full flex flex-col">
                    <div className="relative">
                      {event.image_url || event.image ? (
                        <img src={event.image_url || event.image} alt={getField(event, 'title')} className="w-full h-48 object-cover" />
                      ) : (
                        <div className="w-full h-48 bg-muted/50 flex items-center justify-center">
                          <ImageIcon className="w-10 h-10 text-muted-foreground/30" />
                        </div>
                      )}
                      <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${
                        event.status?.toLowerCase() === 'ongoing' ? 'bg-emerald-500 text-white' :
                        event.status?.toLowerCase() === 'upcoming' ? 'bg-blue-500 text-white' :
                        event.status?.toLowerCase() === 'completed' ? 'bg-zinc-500 text-white' :
                        'bg-red-500 text-white'
                      }`}>
                        {t('status_' + event.status?.toLowerCase()) || event.status}
                      </span>
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="font-heading font-semibold text-foreground text-lg mb-3">{getField(event, 'title')}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">{getField(event, 'description')}</p>
                      <div className="space-y-2 mt-auto">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4 text-primary shrink-0" />
                          <span>
                            {event.startDate || event.date ? moment(event.startDate || event.date).format('DD MMM YYYY') : '—'}
                            {event.endDate && event.endDate !== event.startDate && ` - ${moment(event.endDate).format('DD MMM YYYY')}`}
                          </span>
                        </div>
                        {getField(event, 'location') && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4 text-primary shrink-0" />
                            <span>{getField(event, 'location')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          )}

          {/* Gallery Section */}
          {filtered.some(e => e.gallery_urls?.length > 0) && (
            <div className="mt-16">
              <h3 className="font-heading font-semibold text-foreground text-xl mb-6">{t('event_gallery')}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {filtered.flatMap(e => (e.gallery_urls || []).map((url, idx) => (
                  <div key={`${e.id}-${idx}`} className="rounded-2xl overflow-hidden aspect-square">
                    <img src={url} alt={`Gallery image ${idx + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                  </div>
                )))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}