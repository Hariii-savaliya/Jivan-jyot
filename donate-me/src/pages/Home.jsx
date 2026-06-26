import React from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/lib/i18n.jsx';
import { motion } from 'framer-motion';
import { Heart, Users, Calendar, HandHeart, ArrowRight, Quote } from 'lucide-react';
import ScrollReveal from '@/components/shared/ScrollReveal';
import SectionHeader from '@/components/shared/SectionHeader';
import StatCounter from '@/components/shared/StatCounter';

import HERO_IMG from '@/assets/ashram3.jpg';
import ABOUT_IMG from '@/assets/ashram2.jpg';

const objectives = {
  gu: [
    "મંદબુદ્ધિ બાળકોને ગુણવત્તાયુક્ત શિક્ષણ પ્રદાન કરવું",
    "સ્વાસ્થ્ય અને પુનર્વસન સેવાઓ",
    "કૌટુંબિક સહાય અને કાઉન્સેલિંગ",
    "સમુદાય જાગૃતિ અને સમાવેશ",
    "સ્વયંસેવકોનું નેટવર્ક મજબૂત બનાવવું",
  ],
  en: [
    "Provide quality education to intellectually challenged children",
    "Health and rehabilitation services",
    "Family support and counseling",
    "Community awareness and inclusion",
    "Strengthen volunteer networks",
  ],
  hi: [
    "मंदबुद्धि बच्चों को गुणवत्तापूर्ण शिक्षा प्रदान करना",
    "स्वास्थ्य और पुनर्वास सेवाएं",
    "पारिवारिक सहायता और परामर्श",
    "समुदाय जागरूकता और समावेश",
    "स्वयंसेवक नेटवर्क मजबूत बनाना",
  ],
};

const successStories = {
  gu: [
    { name: "રાહુલ", story: "રાહુલ ૮ વર્ષનો હતો જ્યારે તે અમારા આશ્રમમાં આવ્યો. આજે તે ચિત્રકળામાં રાજ્ય સ્તરની સ્પર્ધામાં ભાગ લે છે." },
    { name: "મીના", story: "મીનાએ કમ્પ્યુટર તાલીમ દ્વારા ડેટા એન્ટ્રીનું કામ શીખ્યું અને હવે તે સ્વતંત્ર રીતે કમાય છે." },
  ],
  en: [
    { name: "Rahul", story: "Rahul was 8 years old when he came to our ashram. Today he participates in state-level art competitions." },
    { name: "Meena", story: "Meena learned data entry through computer training and now earns independently." },
  ],
  hi: [
    { name: "राहुल", story: "राहुल 8 साल का था जब वह हमारे आश्रम में आया। आज वह राज्य स्तरीय कला प्रतियोगिताओं में भाग लेता है।" },
    { name: "मीना", story: "मीना ने कंप्यूटर प्रशिक्षण से डेटा एंट्री सीखी और अब स्वतंत्र रूप से कमाती है।" },
  ],
};

const testimonials = {
  gu: [
    { name: "શ્રી અમિત જોશી", role: "દાતા", text: "જીવન જ્યોત આશ્રમની પારદર્શકતાએ મને નિયમિત દાતા બનાવ્યો. દરેક રૂપિયાનો ઉપયોગ દેખાય છે." },
    { name: "સુશ્રી નેહા પટેલ", role: "સ્વયંસેવક", text: "અહીં સ્વયંસેવક તરીકે કામ કરવું મારા જીવનનો શ્રેષ્ઠ અનુભવ છે. બાળકોના ચહેરા પરનું સ્મિત બધું કહે છે." },
  ],
  en: [
    { name: "Shri Amit Joshi", role: "Donor", text: "Jivan Jyot Ashram's transparency made me a regular donor. Every rupee's usage is visible." },
    { name: "Ms. Neha Patel", role: "Volunteer", text: "Working here as a volunteer is the best experience of my life. The smiles on children's faces say it all." },
  ],
  hi: [
    { name: "श्री अमित जोशी", role: "दाता", text: "जीवन ज्योत आश्रम की पारदर्शिता ने मुझे नियमित दाता बनाया। हर रुपये का उपयोग दिखता है।" },
    { name: "सुश्री नेहा पटेल", role: "स्वयंसेवक", text: "यहाँ स्वयंसेवक के रूप में काम करना मेरे जीवन का सबसे अच्छा अनुभव है। बच्चों के चेहरे की मुस्कान सब कुछ कह देती है।" },
  ],
};

export default function Home() {
  const { t, lang } = useLang();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-6">
                <Heart className="w-4 h-4" fill="currentColor" />
                <span>NGO & Mandbuddhi Ashram</span>
              </div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight mb-4">
                {t('hero_title')}
              </h1>
              <p className="text-lg text-primary font-medium mb-4">{t('hero_subtitle')}</p>
              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-8 max-w-lg">
                {t('hero_desc')}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/donate" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors min-h-[48px]">
                  {t('hero_donate')}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/volunteer" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-primary text-primary font-semibold text-sm hover:bg-primary/5 transition-colors min-h-[48px]">
                  {t('hero_volunteer')}
                </Link>
                <Link to="/wish-wall" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-secondary/10 text-secondary font-semibold text-sm hover:bg-secondary/20 transition-colors min-h-[48px]">
                  {t('hero_explore')}
                </Link>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <div className="rounded-3xl overflow-hidden shadow-xl">
                <img src={HERO_IMG} alt="Volunteers teaching differently-abled children in a bright community hall" className="w-full h-auto object-cover" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-16 sm:py-20 border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCounter value={520} label={t('stat_children')} icon={Heart} />
            <StatCounter value={150} label={t('stat_volunteers')} icon={Users} />
            <StatCounter value={85} label={t('stat_events')} icon={Calendar} />
            <StatCounter value={1200} label={t('stat_donations')} icon={HandHeart} />
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <ScrollReveal>
              <div className="rounded-3xl overflow-hidden">
                <img src={ABOUT_IMG} alt="Hands holding a child's hand over a book, symbolizing care and education" className="w-full h-auto object-cover" />
              </div>
            </ScrollReveal>
            <div>
              <SectionHeader title={t('about_title')} description={t('about_desc')} align="left" />
              <div className="grid sm:grid-cols-2 gap-6 mt-8">
                <ScrollReveal delay={0.1}>
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10">
                    <h3 className="font-heading font-semibold text-primary mb-2">{t('mission_title')}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{t('mission_desc')}</p>
                  </div>
                </ScrollReveal>
                <ScrollReveal delay={0.2}>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10">
                    <h3 className="font-heading font-semibold text-secondary mb-2">{t('vision_title')}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{t('vision_desc')}</p>
                  </div>
                </ScrollReveal>
              </div>
              <ScrollReveal delay={0.3}>
                <div className="mt-8">
                  <h3 className="font-heading font-semibold text-foreground mb-3">{t('objectives_title')}</h3>
                  <ul className="space-y-2">
                    {(objectives[lang] || objectives.en).map((obj, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 shrink-0" />
                        {obj}
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20 sm:py-28 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title={t('success_title')} />
          <div className="grid md:grid-cols-2 gap-8 mt-4">
            {(successStories[lang] || successStories.en).map((story, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="bg-card rounded-2xl p-8 border border-border hover:border-secondary/30 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <span className="font-heading font-bold text-primary text-lg">{story.name.charAt(0)}</span>
                  </div>
                  <h3 className="font-heading font-semibold text-foreground text-lg mb-2">{story.name}</h3>
                  <p className="text-muted-foreground leading-relaxed">{story.story}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title={t('testimonials_title')} />
          <div className="grid md:grid-cols-2 gap-8 mt-4">
            {(testimonials[lang] || testimonials.en).map((item, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="bg-card rounded-2xl p-8 border border-border">
                  <Quote className="w-8 h-8 text-secondary/40 mb-4" />
                  <p className="text-muted-foreground leading-relaxed mb-6 italic">&ldquo;{item.text}&rdquo;</p>
                  <div>
                    <div className="font-heading font-semibold text-foreground">{item.name}</div>
                    <div className="text-sm text-secondary">{item.role}</div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28 bg-primary">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">{t('cta_title')}</h2>
            <p className="text-primary-foreground/70 text-lg leading-relaxed mb-8">{t('cta_desc')}</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/volunteer" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary-foreground text-primary font-semibold hover:bg-primary-foreground/90 transition-colors min-h-[48px]">
                {t('cta_join')}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/donate" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border-2 border-primary-foreground text-primary-foreground font-semibold hover:bg-primary-foreground/10 transition-colors min-h-[48px]">
                {t('hero_donate')}
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}   