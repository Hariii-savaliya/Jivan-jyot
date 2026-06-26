import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLang, LANGUAGES } from '@/lib/i18n.jsx';
import { Menu, X, Globe, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { key: 'nav_home', path: '/' },
  { key: 'nav_about', path: '/about' },
  { key: 'nav_wish_wall', path: '/wish-wall' },
  { key: 'nav_events', path: '/events' },
  { key: 'nav_volunteer', path: '/volunteer' },
  { key: 'nav_donate', path: '/donate' },
  { key: 'nav_impact', path: '/impact' },
  { key: 'nav_contact', path: '/contact' },
];

export default function Navbar() {
  const { t, lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  const currentLabel = LANGUAGES.find(l => l.code === lang)?.label;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-background/95 backdrop-blur-sm shadow-sm' : 'bg-background/80 backdrop-blur-sm'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src="/logo.png" alt="Jivan Jyot Ashram Logo" className="w-10 h-10 object-contain rounded-lg" />
            <span className="font-heading font-bold text-base text-foreground hidden sm:block leading-tight">Jivan Jyot Ashram</span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === link.path ? 'text-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
              >
                {t(link.key)}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
                aria-label="Language switcher"
              >
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">{currentLabel}</span>
              </button>
              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute right-0 top-full mt-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden min-w-[140px]"
                  >
                    {LANGUAGES.map(l => (
                      <button
                        key={l.code}
                        onClick={() => { setLang(l.code); setLangOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${lang === l.code ? 'bg-primary/5 text-primary font-semibold' : 'text-foreground hover:bg-muted'}`}
                        aria-live="polite"
                      >
                        {l.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden p-2 rounded-lg text-foreground hover:bg-muted transition-colors"
              aria-label="Menu"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-border bg-background overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${location.pathname === link.path ? 'text-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                >
                  {t(link.key)}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}