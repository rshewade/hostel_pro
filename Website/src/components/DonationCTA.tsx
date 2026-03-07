import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Heart, GraduationCap, Home, Utensils } from 'lucide-react';

const DonationCTA = () => {
  const { t } = useLanguage();

  const donationPurposes = [
    {
      icon: GraduationCap,
      label: t('Education Support', 'शिक्षा सहायता'),
    },
    {
      icon: Home,
      label: t('Infrastructure', 'बुनियादी ढांचा'),
    },
    {
      icon: Utensils,
      label: t('Food Programs', 'भोजन कार्यक्रम'),
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

          <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
            {donationPurposes.map((purpose, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-primary-foreground/10 px-4 py-2 rounded-full"
              >
                <purpose.icon className="h-4 w-4 text-accent" />
                <span className="text-sm">{purpose.label}</span>
              </div>
            ))}
          </div>

          <Link to="/donations">
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
