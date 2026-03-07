import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Building, Heart, GraduationCap } from 'lucide-react';

const Trustees = () => {
  const { t, language } = useLanguage();

  const keyMembers = [
    {
      name: { en: 'Seema Javeri (Jhaveri)', hi: 'सीमा जावेरी (झावेरी)' },
      role: { en: 'Executive Director', hi: 'कार्यकारी निदेशक' },
      description: { 
        en: 'A key figure in the family\'s professional and philanthropic engagements. She has been involved in managing family interests including Sadhana Nitro Chem Limited.', 
        hi: 'परिवार की पेशेवर और परोपकारी गतिविधियों में एक प्रमुख व्यक्ति। वह साधना नाइट्रो केम लिमिटेड सहित पारिवारिक हितों के प्रबंधन में शामिल रही हैं।' 
      },
    },
    {
      name: { en: 'Asit Jhaveri', hi: 'असित झावेरी' },
      role: { en: 'Trustee', hi: 'न्यासी' },
      description: { 
        en: 'Frequently cited alongside Seema Jhaveri in leadership roles within family-related corporate and charitable structures.', 
        hi: 'परिवार से संबंधित कॉर्पोरेट और धर्मार्थ संरचनाओं में नेतृत्व भूमिकाओं में सीमा झावेरी के साथ अक्सर उल्लेखित।' 
      },
    },
  ];

  const heritageTimeline = [
    { 
      icon: Building,
      title: { en: 'Origins in Bhindar', hi: 'भींदर में उत्पत्ति' },
      description: { 
        en: 'The family\'s philanthropic journey began in the 19th century. The lineage originates from Bhindar, Rajasthan, eventually migrating to Mumbai via Surat in 1851.', 
        hi: 'परिवार की परोपकारी यात्रा 19वीं शताब्दी में शुरू हुई। वंश का उद्गम भींदर, राजस्थान से हुआ, अंततः 1851 में सूरत के रास्ते मुंबई पहुंचे।' 
      }
    },
    { 
      icon: Users,
      title: { en: 'Founding Figures', hi: 'संस्थापक व्यक्ति' },
      description: { 
        en: 'The family\'s charitable reputation was established by Seth Panachand and Seth Manikchand JP. Starting as threaders of pearl necklaces, they grew a jewelry empire—"Manikchand Panachand Zaveri"—that expanded to international markets.', 
        hi: 'परिवार की धर्मार्थ प्रतिष्ठा सेठ पनाचंद और सेठ मनिकचंद जेपी द्वारा स्थापित की गई। मोती की मालाओं के धागा पिरोने वालों के रूप में शुरू करके, उन्होंने एक आभूषण साम्राज्य बनाया - "मनिकचंद पनाचंद जावेरी" - जो अंतर्राष्ट्रीय बाजारों तक फैला।' 
      }
    },
    { 
      icon: Heart,
      title: { en: 'The Trust\'s Namesake', hi: 'ट्रस्ट का नाम' },
      description: { 
        en: 'The trust is named after their father, Hirachand Gumanji, in whose memory several institutions were built.', 
        hi: 'ट्रस्ट का नाम उनके पिता हीराचंद गुमानजी के नाम पर रखा गया है, जिनकी स्मृति में कई संस्थाएं बनाई गईं।' 
      }
    },
    { 
      icon: GraduationCap,
      title: { en: 'Generational Leadership', hi: 'पीढ़ीगत नेतृत्व' },
      description: { 
        en: 'Today, the fifth generation of the family continues to manage these activities, maintaining a traditionally low profile while focusing on education and healthcare.', 
        hi: 'आज, परिवार की पांचवीं पीढ़ी इन गतिविधियों का प्रबंधन जारी रखती है, शिक्षा और स्वास्थ्य सेवा पर ध्यान केंद्रित करते हुए पारंपरिक रूप से कम प्रोफ़ाइल बनाए रखती है।' 
      }
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <PageHero
          title={t('Board of Trustees', 'न्यासी मंडल')}
          subtitle={t(
            'Dedicated individuals guiding the trust with wisdom and commitment',
            'बुद्धिमत्ता और प्रतिबद्धता के साथ ट्रस्ट का मार्गदर्शन करने वाले समर्पित व्यक्ति'
          )}
        />

        {/* Jhaveri Family Heritage */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-heading font-bold text-foreground mb-4">
                  {t('The Jhaveri Family Heritage', 'झावेरी परिवार की विरासत')}
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  {t(
                    'A legacy of philanthropy spanning over 150 years, rooted in Jain values of service and compassion.',
                    '150 से अधिक वर्षों में फैली परोपकार की विरासत, सेवा और करुणा के जैन मूल्यों में निहित।'
                  )}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {heritageTimeline.map((item, index) => (
                  <Card key={index} className="hover:shadow-elegant transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <item.icon className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="font-heading text-lg">{item.title[language]}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">{item.description[language]}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Key Management & Members */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-heading font-bold text-foreground mb-4">
                  {t('Key Management & Members', 'प्रमुख प्रबंधन और सदस्य')}
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  {t(
                    'While the family is known for its privacy, certain members have been associated with the trust\'s activities and broader social initiatives.',
                    'जबकि परिवार अपनी गोपनीयता के लिए जाना जाता है, कुछ सदस्य ट्रस्ट की गतिविधियों और व्यापक सामाजिक पहलों से जुड़े रहे हैं।'
                  )}
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
                {keyMembers.map((member, index) => (
                  <Card key={index} className="hover:shadow-elegant transition-shadow">
                    <CardHeader className="text-center">
                      <Avatar className="w-20 h-20 mx-auto mb-4">
                        <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                          {member.name[language].split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <CardTitle className="font-heading">{member.name[language]}</CardTitle>
                      <p className="text-primary font-medium">{member.role[language]}</p>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-sm text-muted-foreground leading-relaxed">{member.description[language]}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Note about family-run trust */}
              <div className="mt-8 p-6 bg-muted/50 rounded-xl text-center max-w-2xl mx-auto">
                <p className="text-muted-foreground text-sm">
                  {t(
                    'Note: Traditionally, the trust is family-run, meaning direct descendants of the founders typically hold trustee positions.',
                    'नोट: पारंपरिक रूप से, ट्रस्ट परिवार द्वारा संचालित है, जिसका अर्थ है कि संस्थापकों के प्रत्यक्ष वंशज आमतौर पर न्यासी पदों पर होते हैं।'
                  )}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Legacy Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                {t('Continuing a Noble Legacy', 'एक महान विरासत को जारी रखना')}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t(
                  'Our trustees carry forward the vision of the founding Javeri family, ensuring that the trust continues to serve the Jain community with the same dedication and values that have guided us for over 125 years. Each trustee brings unique expertise and unwavering commitment to our mission of Vidya Daan and Jain Seva.',
                  'हमारे न्यासी संस्थापक जावेरी परिवार की दृष्टि को आगे बढ़ाते हैं, यह सुनिश्चित करते हुए कि ट्रस्ट उसी समर्पण और मूल्यों के साथ जैन समुदाय की सेवा करता रहे जो 125 से अधिक वर्षों से हमारा मार्गदर्शन करते रहे हैं। प्रत्येक न्यासी विद्या दान और जैन सेवा के हमारे मिशन में अद्वितीय विशेषज्ञता और अटूट प्रतिबद्धता लाता है।'
                )}
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Trustees;
