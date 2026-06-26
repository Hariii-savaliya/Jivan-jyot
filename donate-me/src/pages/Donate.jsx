import React, { useState, useRef, useEffect } from 'react';
import { useLang } from '@/lib/i18n.jsx';
import { base44 } from '@/api/base44Client';
import ScrollReveal from '@/components/shared/ScrollReveal';
import SectionHeader from '@/components/shared/SectionHeader';
import { useToast } from '@/components/ui/use-toast';
import { Copy, Check, Upload, Shield, CheckCircle2 } from 'lucide-react';

const BANK_INFO = {
  bank_name_value: 'State Bank of India',
  account_no_value: '12345678901234',
  ifsc_value: 'SBIN0001234',
  upi_value: 'jivanjyotashram@upi',
};

export default function Donate() {
  const { t } = useLang();
  const { toast } = useToast();
  const fileRef = useRef(null);
  const [copied, setCopied] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileObj, setFileObj] = useState(null);
  const [qrConfig, setQrConfig] = useState(null);
  const [form, setForm] = useState({
    donor_name: '', mobile: '', amount: '', transaction_id: '', message: '',
  });

  useEffect(() => {
    base44.entities.QRDonation.list()
      .then(res => {
        if (res && res.length > 0) {
          setQrConfig(res[0]);
        }
      })
      .catch(err => console.error('Failed to load QR Config:', err));
  }, []);

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFileObj(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setFileName(file.name);
      setFileObj(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.donor_name.trim()) {
      toast({ description: "Please enter donor name.", variant: "destructive" });
      return;
    }

    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(form.mobile.trim())) {
      toast({ description: "Mobile number must be exactly 10 digits.", variant: "destructive" });
      return;
    }

    const amt = parseFloat(form.amount);
    if (isNaN(amt) || amt <= 0) {
      toast({ description: "Donation amount must be greater than zero.", variant: "destructive" });
      return;
    }

    if (!form.transaction_id.trim()) {
      toast({ description: "Please enter the Transaction reference ID.", variant: "destructive" });
      return;
    }

    if (!fileObj) {
      toast({ description: "Please upload transaction receipt screenshot.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      let screenshot_url = '';
      if (fileObj) {
        const uploaded = await base44.integrations.Core.UploadFile({ file: fileObj });
        screenshot_url = uploaded.file_url;
      }
      await base44.entities.DonationSubmission.create({
        ...form,
        amount: amt,
        screenshot_url,
      });
      setSubmitted(true);
      toast({ description: t('success_msg') });
    } catch (error) {
      console.error(error);
      toast({
        description: error.message || "Failed to submit donation. Please check your inputs.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const bankRows = [
    { label: t('bank_name'), value: qrConfig?.bank_name || BANK_INFO.bank_name_value, key: 'bank' },
    { label: t('account_no'), value: qrConfig?.account_number || BANK_INFO.account_no_value, key: 'acc' },
    { label: t('ifsc_code'), value: qrConfig?.ifsc_code || BANK_INFO.ifsc_value, key: 'ifsc' },
    { label: t('upi_id'), value: qrConfig?.upi_id || BANK_INFO.upi_value, key: 'upi' },
  ];

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-secondary" />
          </div>
          <h2 className="font-heading text-2xl font-bold text-foreground mb-3">{t('success_msg')}</h2>
          <p className="text-muted-foreground">{t('donation_desc')}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <section className="bg-muted/30 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title={t('donation_title')} description={t('donation_desc')} />
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Bank Details */}
            <ScrollReveal>
              <div className="rounded-2xl border-2 border-primary/10 bg-primary/[0.02] p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-heading font-semibold text-foreground text-lg">{t('bank_details')}</h3>
                </div>
                <div className="space-y-4">
                  {bankRows.map(row => (
                    <div key={row.key} className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
                      <div>
                        <div className="text-xs text-muted-foreground mb-0.5">{row.label}</div>
                        <div className="font-mono text-sm font-semibold text-foreground">{row.value}</div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(row.value, row.key)}
                        className="p-2 rounded-lg hover:bg-muted transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
                        aria-label={t('copy')}
                      >
                        {copied === row.key ? <Check className="w-4 h-4 text-secondary" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 rounded-xl bg-secondary/5 border border-secondary/10 text-center">
                  <p className="text-xs text-muted-foreground mb-2">{t('qr_code')}</p>
                  {qrConfig ? (
                    <div className="space-y-2">
                      <img src={qrConfig.qr_image || qrConfig.qr_code_url} alt="UPI QR Code" className="w-36 h-36 mx-auto rounded-xl border border-border bg-white p-1" />
                      <div className="text-xs font-semibold text-foreground">{qrConfig.upiName || qrConfig.account_holder || qrConfig.title || 'Jivan Jyot Ashram'}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{qrConfig.purpose || t('donation_title')}</div>
                    </div>
                  ) : (
                    <div className="w-32 h-32 bg-muted rounded-xl mx-auto flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">QR Code</span>
                    </div>
                  )}
                </div>
              </div>
            </ScrollReveal>

            {/* Submission Form */}
            <ScrollReveal delay={0.1}>
              <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
                <h3 className="font-heading font-semibold text-foreground text-lg mb-6">{t('donation_form_title')}</h3>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">{t('field_name')} *</label>
                    <input
                      type="text"
                      required
                      value={form.donor_name}
                      onChange={e => setForm({ ...form, donor_name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50 text-sm"
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">{t('field_mobile')} *</label>
                      <input
                        type="tel"
                        required
                        value={form.mobile}
                        onChange={e => setForm({ ...form, mobile: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">{t('field_amount')} *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={form.amount}
                        onChange={e => setForm({ ...form, amount: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">{t('field_transaction_id')} *</label>
                    <input
                      type="text"
                      required
                      value={form.transaction_id}
                      onChange={e => setForm({ ...form, transaction_id: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">{t('field_message')}</label>
                    <textarea
                      rows={3}
                      value={form.message}
                      onChange={e => setForm({ ...form, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50 text-sm resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">{t('field_screenshot')}</label>
                    {fileObj ? (
                      <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-muted/20">
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-border bg-muted flex items-center justify-center">
                          <img
                            src={URL.createObjectURL(fileObj)}
                            alt="Screenshot Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={() => fileRef.current?.click()}
                            className="px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-semibold text-foreground hover:bg-muted transition-colors min-h-[32px]"
                          >
                            Replace Image
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setFileObj(null);
                              setFileName('');
                              if (fileRef.current) fileRef.current.value = '';
                            }}
                            className="px-3 py-1.5 rounded-lg bg-destructive text-destructive-foreground text-xs font-semibold hover:bg-destructive/90 transition-colors min-h-[32px]"
                          >
                            Remove Image
                          </button>
                        </div>
                        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                      </div>
                    ) : (
                      <div
                        onDragOver={e => e.preventDefault()}
                        onDrop={handleDrop}
                        onClick={() => fileRef.current?.click()}
                        className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-secondary/40 transition-colors"
                      >
                        <Upload className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          {fileName || t('drag_drop')}
                        </p>
                        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                      </div>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-60 min-h-[48px]"
                  >
                    {submitting ? t('loading') : t('submit')}
                  </button>
                </form>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </div>
  );
}