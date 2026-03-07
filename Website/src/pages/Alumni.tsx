import { useParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, ExternalLink, Image, Calendar, Heart, UserPlus } from 'lucide-react';

const alumniData = {
  'boys-hostel': {
    title: { en: "Boys' Hostel Alumni", hi: 'बालक छात्रावास पूर्व छात्र' },
    subtitle: { en: 'Seth Hirachand Gumanji Jain Hostel', hi: 'सेठ हीराचंद गुमानजी जैन छात्रावास' },
    icon: Building2,
    color: 'blue',
  },
  'girls-hostel': {
    title: { en: "Girls' Hostel Alumni", hi: 'बालिका छात्रावास पूर्व छात्र' },
    subtitle: { en: 'R. R. Shravika Ashram', hi: 'आर. आर. श्राविका आश्रम' },
    icon: Users,
    color: 'rose',
  },
};

const Alumni = () => {
  const { id } = useParams<{ id: string }>();
  const { t, language } = useLanguage();
  
  const alumni = alumniData[id as keyof typeof alumniData];
  
  if (!alumni) {
    return <div>Page not found</div>;
  }

  const Icon = alumni.icon;

  const notableAlumni = [
    { name: { en: 'Dr. Rajesh Jain', hi: 'डॉ. राजेश जैन' }, batch: '1985', profession: { en: 'Renowned Physician', hi: 'प्रसिद्ध चिकित्सक' } },
    { name: { en: 'CA Suresh Shah', hi: 'सीए सुरेश शाह' }, batch: '1990', profession: { en: 'Chartered Accountant', hi: 'चार्टर्ड अकाउंटेंट' } },
    { name: { en: 'Adv. Priya Mehta', hi: 'अधि. प्रिया मेहता' }, batch: '1995', profession: { en: 'High Court Advocate', hi: 'उच्च न्यायालय अधिवक्ता' } },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <PageHero
          title={alumni.title[language]}
          subtitle={alumni.subtitle[language]}
        >
          <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
            <Icon className="h-8 w-8 text-accent" />
          </div>
        </PageHero>

        {/* Content */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              {/* Quick Actions */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                {[
                  { icon: ExternalLink, label: t('Alumni Login', 'पूर्व छात्र लॉगिन'), action: 'login' },
                  { icon: UserPlus, label: t('Register', 'पंजीकरण करें'), action: 'register' },
                  { icon: Image, label: t('Photo Gallery', 'फोटो गैलरी'), action: 'gallery' },
                  { icon: Heart, label: t('Donate', 'दान करें'), action: 'donate' },
                ].map((item, index) => (
                  <Card key={index} className="cursor-pointer hover:shadow-elegant transition-shadow">
                    <CardContent className="flex items-center gap-3 p-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <span className="font-medium">{item.label}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Notable Alumni */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-heading">{t('Notable Alumni', 'उल्लेखनीय पूर्व छात्र')}</CardTitle>
                    <CardDescription>
                      {t('Our distinguished former residents', 'हमारे प्रतिष्ठित पूर्व निवासी')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {notableAlumni.map((person, index) => (
                        <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-primary font-bold">{person.name[language].charAt(0)}</span>
                          </div>
                          <div>
                            <p className="font-medium">{person.name[language]}</p>
                            <p className="text-sm text-muted-foreground">
                              {person.profession[language]} • {t('Batch', 'बैच')} {person.batch}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Upcoming Events */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-heading flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      {t('Upcoming Events', 'आगामी कार्यक्रम')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg border border-border">
                        <p className="text-sm text-primary font-medium">{t('January 2025', 'जनवरी 2025')}</p>
                        <p className="font-heading font-semibold mt-1">{t('Annual Alumni Meet', 'वार्षिक पूर्व छात्र मिलन')}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {t('Reconnect with batch mates at our annual gathering', 'हमारी वार्षिक सभा में बैचमेट्स से फिर से मिलें')}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg border border-border">
                        <p className="text-sm text-primary font-medium">{t('March 2025', 'मार्च 2025')}</p>
                        <p className="font-heading font-semibold mt-1">{t('Career Guidance Session', 'करियर मार्गदर्शन सत्र')}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {t('Share your experience with current hostel students', 'वर्तमान छात्रावास छात्रों के साथ अपना अनुभव साझा करें')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Registration CTA */}
              <Card className="mt-8 bg-muted/50">
                <CardContent className="p-8 text-center">
                  <h3 className="text-xl font-heading font-bold mb-2">
                    {t('Join Our Alumni Network', 'हमारे पूर्व छात्र नेटवर्क से जुड़ें')}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {t(
                      'Register to stay connected with your alma mater and fellow alumni',
                      'अपने मातृ संस्थान और साथी पूर्व छात्रों से जुड़े रहने के लिए पंजीकरण करें'
                    )}
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button size="lg" className="gap-2">
                      <ExternalLink className="h-4 w-4" />
                      {t('Alumni Login', 'पूर्व छात्र लॉगिन')}
                    </Button>
                    <Button size="lg" variant="outline" className="gap-2">
                      <UserPlus className="h-4 w-4" />
                      {t('Register Now', 'अभी पंजीकरण करें')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Alumni;
