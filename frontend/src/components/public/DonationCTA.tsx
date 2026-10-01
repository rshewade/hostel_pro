"use client";

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/shadcn/button';
import { Heart, GraduationCap, Home, Stethoscope } from 'lucide-react';

const DonationCTA = () => {
  const { t } = useLanguage();

  const donationPurposes = [
    {
      icon: Home,
      label: t('Student Accommodation', 'छात्र आवास'),
      detail: t(
        'To provide accommodation for Jain students studying for graduation, C.A. or equivalent courses',
        'स्नातक, सी.ए. या समकक्ष पाठ्यक्रमों की पढ़ाई करने वाले जैन छात्रों को आवास प्रदान करना'
      ),
    },
    {
      icon: GraduationCap,
      label: t('Scholarships', 'छात्रवृत्ति'),
      detail: t(
        'To provide scholarships for graduation or equivalent courses',
        'स्नातक या समकक्ष पाठ्यक्रमों के लिए छात्रवृत्ति प्रदान करना'
      ),
    },
    {
      icon: Stethoscope,
      label: t('Medical & Hospitalisation Aid', 'चिकित्सा एवं अस्पताल सहायता'),
      detail: t(
        'To support medical bills and hospitalisation expenses',
        'चिकित्सा बिलों और अस्पताल में भर्ती के खर्चों में सहायता करना'
      ),
    },
  ];

  return (
    <section className="py-16 bg-gradient-cta relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-32 h-32 border border-accent/20 rounded-full" />
      <div className="absolute bottom-10 right-10 w-24 h-24 bg-accent/10 rounded-full" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center text-primary-foreground">
          <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6">
            <Heart className="h-8 w-8 text-accent" />
          </div>

          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            {t('Support Vidya Daan & Jain Seva', 'विद्या दान और जैन सेवा का समर्थन करें')}
          </h2>

          <p className="text-lg text-primary-foreground/80 mb-8 leading-relaxed">
            {t(
              'Your generous contributions help us continue our mission of providing quality education and shelter to deserving students from the Jain community.',
              'आपका उदार योगदान हमें जैन समुदाय के योग्य छात्रों को गुणवत्तापूर्ण शिक्षा और आश्रय प्रदान करने के अपने मिशन को जारी रखने में मदद करता है।'
            )}
          </p>

          <div className="grid sm:grid-cols-3 gap-4 mb-8 text-left">
            {donationPurposes.map((purpose, index) => (
              <div
                key={index}
                className="bg-primary-foreground/10 rounded-xl p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <purpose.icon className="h-4 w-4 text-accent shrink-0" />
                  <span className="text-sm font-semibold">{purpose.label}</span>
                </div>
                <p className="text-sm text-primary-foreground/80 leading-relaxed">{purpose.detail}</p>
              </div>
            ))}
          </div>

          <Link href="/donations">
            <Button size="lg" variant="accent" className="gap-2 min-w-[200px]">
              <Heart className="h-5 w-5" />
              {t('Donate Now', 'अभी दान करें')}
            </Button>
          </Link>

          <p className="text-sm text-primary-foreground/60 mt-6">
            {t(
              'All donations are eligible for tax benefits under Section 80G.',
              'सभी दान धारा 80जी के तहत कर लाभ के लिए पात्र हैं।'
            )}
          </p>
        </div>
      </div>
    </section>
  );
};

export default DonationCTA;
