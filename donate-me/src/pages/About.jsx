import React from 'react';
import { useLang } from '@/lib/i18n.jsx';
import ScrollReveal from '@/components/shared/ScrollReveal';
import SectionHeader from '@/components/shared/SectionHeader';
import { Target, Eye, Award, Users } from 'lucide-react';

import ABOUT_IMG from '@/assets/ashram2.jpg';

const objectives = {
  gu: [
    "મંદબુદ્ધિ બાળકોને ગુણવત્તાયુક્ત શિક્ષણ અને તાલીમ",
    "સ્વાસ્થ્ય તપાસ અને પુનર્વસન સેવાઓ",
    "કૌટુંબિક સહાય અને કાઉન્સેલિંગ",
    "સમુદાય જાગૃતિ કાર્યક્રમો",
    "સ્વયંસેવક નેટવર્ક નિર્માણ",
    "પારદર્શક દાન વ્યવસ્થાપન",
  ],
  en: [
    "Quality education and training for intellectually challenged children",
    "Health checkups and rehabilitation services",
    "Family support and counseling",
    "Community awareness programs",
    "Volunteer network building",
    "Transparent donation management",
  ],
  hi: [
    "मंदबुद्धि बच्चों को गुणवत्तापूर्ण शिक्षा और प्रशिक्षण",
    "स्वास्थ्य जांच और पुनर्वास सेवाएं",
    "पारिवारिक सहायता और परामर्श",
    "समुदाय जागरूकता कार्यक्रम",
    "स्वयंसेवक नेटवर्क निर्माण",
    "पारदर्शी दान प्रबंधन",
  ],
};

export default function About() {
  const { t, lang } = useLang();

  const trustees = [
    { name: t('trustee_1_name'), role: t('trustee_1_role'), icon: Award },
    { name: t('trustee_2_name'), role: t('trustee_2_role'), icon: Users },
  ];

  return (
    <div>
      {/* Header */}
      <section className="bg-muted/30 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title={t('about_page_title')} description={t('about_intro')} />
        </div>
      </section>

      {/* Introduction with image */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <ScrollReveal>
              <div className="rounded-3xl overflow-hidden">
                <img src={ABOUT_IMG} alt="Hands holding a child's hand over a book" className="w-full h-auto object-cover" />
              </div>
            </ScrollReveal>
            <div>
              <ScrollReveal>
                <p className="text-muted-foreground leading-relaxed text-lg mb-8">{t('about_desc')}</p>
              </ScrollReveal>
              <div className="grid sm:grid-cols-2 gap-6">
                <ScrollReveal delay={0.1}>
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10">
                    <Target className="w-8 h-8 text-primary mb-3" />
                    <h3 className="font-heading font-semibold text-primary mb-2">{t('mission_title')}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{t('mission_desc')}</p>
                  </div>
                </ScrollReveal>
                <ScrollReveal delay={0.2}>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10">
                    <Eye className="w-8 h-8 text-secondary mb-3" />
                    <h3 className="font-heading font-semibold text-secondary mb-2">{t('vision_title')}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{t('vision_desc')}</p>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Objectives */}
      <section className="py-20 sm:py-28 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title={t('objectives_title')} />
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            {(objectives[lang] || objectives.en).map((obj, i) => (
              <ScrollReveal key={i} delay={i * 0.05}>
                <div className="flex items-start gap-3 p-5 rounded-2xl bg-card border border-border hover:border-secondary/30 transition-colors">
                  <span className="w-7 h-7 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary font-bold text-sm shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-foreground text-sm">{obj}</span>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Trustees */}
      <section className="py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title={t('trustees_title')} />
          <div className="grid sm:grid-cols-3 gap-8 mt-4">
            {trustees.map((trustee, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="text-center p-8 rounded-2xl bg-card border border-border hover:border-primary/20 transition-colors">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <trustee.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-heading font-semibold text-foreground text-lg">{trustee.name}</h3>
                  <p className="text-sm text-secondary mt-1">{trustee.role}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}