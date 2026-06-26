import React from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/lib/i18n.jsx';
import { Heart, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  const { t } = useLang();

  const quickLinks = [
    { key: 'nav_about', path: '/about' },
    { key: 'nav_wish_wall', path: '/wish-wall' },
    { key: 'nav_events', path: '/events' },
    { key: 'nav_volunteer', path: '/volunteer' },
    { key: 'nav_donate', path: '/donate' },
    { key: 'nav_impact', path: '/impact' },
  ];

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="Jivan Jyot Ashram Logo" className="w-10 h-10 object-contain rounded-lg bg-white p-0.5" />
              <span className="font-heading font-bold text-lg">Jivan Jyot Ashram</span>
            </div>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              {t('footer_desc')}
            </p>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-sm uppercase tracking-wider mb-4 text-primary-foreground/90">
              {t('footer_quick_links')}
            </h4>
            <ul className="space-y-2.5">
              {quickLinks.map(link => (
                <li key={link.path}>
                  <Link to={link.path} className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-sm uppercase tracking-wider mb-4 text-primary-foreground/90">
              {t('footer_connect')}
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-primary-foreground/60" />
                <a href="https://maps.app.goo.gl/queDbEy1EmvL1eMGA?g_st=aw" target="_blank" rel="noopener noreferrer" className="text-sm text-primary-foreground/70 hover:text-primary-foreground hover:underline transition-colors">
                  Sardar Chowk, Jivan Jyot Ashram Road, Navagam, Surat - 394185
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 shrink-0 text-primary-foreground/60" />
                <div className="flex flex-col">
                  <a href="tel:+919924616768" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                    +91 99246 16768
                  </a>
                  <a href="tel:+919879001943" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                    +91 98790 01943
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 shrink-0 text-primary-foreground/60" />
                <a href="mailto:manavsevasamaj.surat@gmail.com" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  manavsevasamaj.surat@gmail.com
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-sm uppercase tracking-wider mb-4 text-primary-foreground/90">
              {t('contact_hours')}
            </h4>
            <p className="text-sm text-primary-foreground/70">{t('contact_hours_value')}</p>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-primary-foreground/50">{t('footer_rights')}</p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-primary-foreground/50 cursor-pointer hover:text-primary-foreground/70 transition-colors">{t('footer_privacy')}</span>
            <span className="text-xs text-primary-foreground/50 cursor-pointer hover:text-primary-foreground/70 transition-colors">{t('footer_terms')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}