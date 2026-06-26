import React, { useState, useEffect } from 'react';
import { useLang } from '@/lib/i18n.jsx';
import { base44 } from '@/api/base44Client';
import ScrollReveal from '@/components/shared/ScrollReveal';
import SectionHeader from '@/components/shared/SectionHeader';
import { Search, BookOpen, Stethoscope, UtensilsCrossed, Package, HandHeart } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

const CATEGORY_ICONS = {
  education: BookOpen,
  health: Stethoscope,
  food: UtensilsCrossed,
  supplies: Package,
};

const PRIORITY_STYLES = {
  high: 'bg-red-50 text-red-600 border-red-200',
  medium: 'bg-amber-50 text-amber-600 border-amber-200',
  low: 'bg-green-50 text-green-600 border-green-200',
};

export default function WishWall() {
  const { t, lang } = useLang();
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Contribution Form states
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [contribForm, setContribForm] = useState({ name: '', mobile: '', quantity: 1, message: '' });
  const [contribSubmitting, setContribSubmitting] = useState(false);

  useEffect(() => {
    base44.entities.WishItem.list()
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  const handleContributeSubmit = async (e) => {
    e.preventDefault();
    if (!contribForm.name.trim()) {
      toast({ description: "Please enter your name.", variant: "destructive" });
      return;
    }
    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(contribForm.mobile.trim())) {
      toast({ description: "Mobile number must be exactly 10 digits.", variant: "destructive" });
      return;
    }
    const qty = parseInt(contribForm.quantity);
    const maxQty = selectedItem.quantity_needed - (selectedItem.quantity_fulfilled || 0);
    if (isNaN(qty) || qty <= 0 || qty > maxQty) {
      toast({ description: `Quantity must be between 1 and ${maxQty}.`, variant: "destructive" });
      return;
    }

    setContribSubmitting(true);
    try {
      await base44.entities.RequirementContribution.create({
        name: contribForm.name,
        mobile: contribForm.mobile,
        requirementId: selectedItem.id,
        quantity: qty,
        message: contribForm.message
      });

      toast({ description: "Thank you for your contribution! Fulfilled count updated." });
      setModalOpen(false);
      setContribForm({ name: '', mobile: '', quantity: 1, message: '' });

      // Refresh list to show new fulfilled count
      setLoading(true);
      base44.entities.WishItem.list()
        .then(setItems)
        .finally(() => setLoading(false));
    } catch (error) {
      console.error(error);
      toast({
        description: error.message || "Failed to submit contribution. Please try again.",
        variant: "destructive"
      });
    } finally {
      setContribSubmitting(false);
    }
  };

  const filters = [
    { key: 'all', label: t('filter_all') },
    { key: 'education', label: t('filter_education') },
    { key: 'health', label: t('filter_health') },
    { key: 'food', label: t('filter_food') },
    { key: 'supplies', label: t('filter_supplies') },
  ];

  const priorityLabel = (p) => {
    const map = { high: t('priority_high'), medium: t('priority_medium'), low: t('priority_low') };
    return map[p] || p;
  };

  const getTitle = (item) => {
    const key = `title_${lang}`;
    return item[key] || item.title_en || '';
  };

  const getDesc = (item) => {
    const key = `description_${lang}`;
    return item[key] || item.description_en || '';
  };

  const filtered = items.filter(item => {
    if (activeFilter !== 'all' && item.category !== activeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return getTitle(item).toLowerCase().includes(q) || getDesc(item).toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div>
      <section className="bg-muted/30 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title={t('wish_wall_title')} description={t('wish_wall_desc')} />
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-10">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={t('search')}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50 text-sm"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.map(f => (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors min-h-[40px] ${activeFilter === f.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Package className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
              <p className="text-muted-foreground">{t('no_data')}</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((item, i) => {
                const Icon = CATEGORY_ICONS[item.category] || Package;
                const pct = item.quantity_needed > 0 ? Math.round((item.quantity_fulfilled || 0) / item.quantity_needed * 100) : 0;
                return (
                  <ScrollReveal key={item.id} delay={i * 0.05}>
                    <div className="bg-card rounded-2xl border border-border p-6 hover:border-secondary/30 transition-colors h-full flex flex-col">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${PRIORITY_STYLES[item.priority] || PRIORITY_STYLES.low}`}>
                          {priorityLabel(item.priority)}
                        </span>
                      </div>
                      <h3 className="font-heading font-semibold text-foreground text-lg mb-2">{getTitle(item)}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">{getDesc(item)}</p>
                      <div className="mt-auto">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                          <span>{t('fulfilled_qty')}: {item.quantity_fulfilled || 0}</span>
                          <span>{t('needed_qty')}: {item.quantity_needed}</span>
                        </div>
                        <Progress value={pct} className="h-2" />
                        {item.quantity_fulfilled >= item.quantity_needed ? (
                          <button
                            disabled
                            className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-muted text-muted-foreground font-medium text-sm cursor-not-allowed min-h-[44px]"
                          >
                            <HandHeart className="w-4 h-4" />
                            Fulfilled
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedItem(item);
                              setContribForm({ name: '', mobile: '', quantity: 1, message: '' });
                              setModalOpen(true);
                            }}
                            className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary/5 text-primary font-medium text-sm hover:bg-primary/10 transition-colors min-h-[44px]"
                          >
                            <HandHeart className="w-4 h-4" />
                            {t('contribute')}
                          </button>
                        )}
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {selectedItem && (
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-md bg-card text-foreground border border-border rounded-2xl p-6">
            <DialogHeader>
              <DialogTitle className="font-heading text-lg font-bold">Contribute to {getTitle(selectedItem)}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleContributeSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">{t('field_name')} *</label>
                <input
                  type="text"
                  required
                  value={contribForm.name}
                  onChange={e => setContribForm({ ...contribForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">{t('field_mobile')} *</label>
                <input
                  type="tel"
                  required
                  value={contribForm.mobile}
                  onChange={e => setContribForm({ ...contribForm, mobile: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Quantity to Contribute (Max: {selectedItem.quantity_needed - (selectedItem.quantity_fulfilled || 0)}) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max={selectedItem.quantity_needed - (selectedItem.quantity_fulfilled || 0)}
                  value={contribForm.quantity}
                  onChange={e => {
                    const rawVal = e.target.value;
                    const val = rawVal === '' ? '' : Math.max(1, Math.min(selectedItem.quantity_needed - (selectedItem.quantity_fulfilled || 0), Number(rawVal)));
                    setContribForm({ ...contribForm, quantity: val });
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Message (Optional)</label>
                <textarea
                  rows={2}
                  value={contribForm.message}
                  onChange={e => setContribForm({ ...contribForm, message: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50 text-sm resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border bg-card text-xs font-medium hover:bg-muted transition-colors min-h-[36px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={contribSubmitting}
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 min-h-[36px]"
                >
                  {contribSubmitting ? 'Submitting...' : 'Submit Contribution'}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}