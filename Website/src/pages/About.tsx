import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';
import { useLanguage } from '@/contexts/LanguageContext';
import { BookOpen, Heart, Shield, MapPin, Users, Building2, Home } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import hostelBuilding from '@/assets/hostel-building.png';
import hostelRoom from '@/assets/hostel-room.png';
import hostelTemple from '@/assets/hostel-temple.png';

const About = () => {
  const { t } = useLanguage();

  const timeline = [
    { year: '1852', event: t('Birth of Seth Manikchand Hirachand Javeri, prominent pearl merchant and social reformer', 'सेठ मनिकचंद हीराचंद जावेरी का जन्म, प्रमुख मोती व्यापारी और समाज सुधारक') },
    { year: '1900', event: t('Boarding house established in memory of Seth Hirachand Gumanji', 'सेठ हीराचंद गुमानजी की स्मृति में बोर्डिंग हाउस की स्थापना') },
    { year: '1914', event: t('Seth Manikchand passes away, leaving legacy of 27 charitable institutions', 'सेठ मनिकचंद का निधन, 27 धर्मार्थ संस्थाओं की विरासत छोड़कर') },
    { year: '1940', event: t('Trust formally established', 'ट्रस्ट की औपचारिक स्थापना') },
    { year: '1972', event: t('R.R. Shravika Ashram founded for women education', 'महिला शिक्षा के लिए आर.आर. श्राविका आश्रम की स्थापना') },
    { year: 'Present', event: t('Continuing 125+ years of service to Jain community', 'जैन समुदाय को 125+ वर्षों की सेवा जारी') },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <PageHero
          title={t('Seth Hirachand Gumanji Jain Trust, Mumbai', 'सेठ हीराचंद गुमानजी जैन ट्रस्ट, मुंबई')}
          subtitle={t('Preserving Heritage, Empowering Future Generations', 'विरासत को संरक्षित करना, भावी पीढ़ियों को सशक्त बनाना')}
        >
          <p className="text-accent font-medium mb-4">अहिंसा परमो धर्मः</p>
        </PageHero>

        {/* Mission Statement */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-heading font-bold text-foreground mb-6">
                  {t('Our Mission', 'हमारा मिशन')}
                </h2>
                <blockquote className="text-xl text-muted-foreground leading-relaxed italic border-l-4 border-primary pl-6 text-left">
                  {t(
                    '"To provide a nurturing environment for the Jain community by fostering academic excellence through affordable housing, preserving Digambar Jain values through spiritual infrastructure, and serving humanity with compassion and integrity."',
                    '"सस्ते आवास के माध्यम से शैक्षणिक उत्कृष्टता को बढ़ावा देकर, आध्यात्मिक बुनियादी ढांचे के माध्यम से दिगंबर जैन मूल्यों को संरक्षित करके, और करुणा और सत्यनिष्ठा के साथ मानवता की सेवा करके जैन समुदाय के लिए एक पोषण वातावरण प्रदान करना।"'
                  )}
                </blockquote>
              </div>

              {/* Core Objectives */}
              <div className="grid md:grid-cols-3 gap-6 mb-16">
                {[
                  { 
                    icon: BookOpen, 
                    title: t('Empowerment', 'सशक्तिकरण'), 
                    desc: t('To remove financial barriers for Jain students seeking higher education in Mumbai.', 'मुंबई में उच्च शिक्षा प्राप्त करने वाले जैन छात्रों के लिए वित्तीय बाधाओं को दूर करना।') 
                  },
                  { 
                    icon: Shield, 
                    title: t('Spiritual Integrity', 'आध्यात्मिक सत्यनिष्ठा'), 
                    desc: t('To provide living spaces that facilitate Sada-Vichar (Right Thought) and Shuddha Achar (Right Conduct).', 'ऐसे आवास प्रदान करना जो सदा-विचार (सही विचार) और शुद्ध आचार (सही आचरण) को सुगम बनाएं।') 
                  },
                  { 
                    icon: Heart, 
                    title: t('Service', 'सेवा'), 
                    desc: t("To offer a 'home away from home' for pilgrims and those in need of medical transit.", "तीर्थयात्रियों और चिकित्सा यात्रा की आवश्यकता वालों के लिए 'घर से दूर घर' प्रदान करना।") 
                  },
                ].map((value, index) => (
                  <div key={index} className="text-center p-6 rounded-xl bg-muted/50">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <value.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="font-heading font-semibold text-lg mb-2">{value.title}</h3>
                    <p className="text-muted-foreground text-sm">{value.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* About Us */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-heading font-bold text-foreground text-center mb-8">
                {t('About Us', 'हमारे बारे में')}
              </h2>
              <div className="prose prose-lg max-w-none text-muted-foreground">
                <p className="leading-relaxed mb-6">
                  {t(
                    'The Seth Hirachand Gumanji Jain Trust is a landmark philanthropic institution in Mumbai, dedicated to the socio-educational upliftment of the Jain community. Established by the visionary Javeri family, the Trust serves as a vital pillar for the Digambar Jain sect.',
                    'सेठ हीराचंद गुमानजी जैन ट्रस्ट मुंबई में एक ऐतिहासिक परोपकारी संस्था है, जो जैन समुदाय के सामाजिक-शैक्षणिक उत्थान के लिए समर्पित है। दूरदर्शी जावेरी परिवार द्वारा स्थापित, यह ट्रस्ट दिगंबर जैन संप्रदाय के लिए एक महत्वपूर्ण स्तंभ के रूप में कार्य करता है।'
                  )}
                </p>
                <p className="leading-relaxed">
                  {t(
                    'We operate on the belief that education is the greatest form of charity (Vidya Daan). By managing historical hostels and comfortable Dharamshalas, we bridge the gap between rural talent and urban opportunity, ensuring that every student and traveler feels supported by their community.',
                    'हम इस विश्वास पर काम करते हैं कि शिक्षा दान का सबसे बड़ा रूप है (विद्या दान)। ऐतिहासिक छात्रावासों और आरामदायक धर्मशालाओं का प्रबंधन करके, हम ग्रामीण प्रतिभा और शहरी अवसर के बीच की खाई को पाटते हैं, यह सुनिश्चित करते हुए कि प्रत्येक छात्र और यात्री अपने समुदाय द्वारा समर्थित महसूस करे।'
                  )}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* History */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-heading font-bold text-foreground text-center mb-8">
                {t('History of the Trust', 'ट्रस्ट का इतिहास')}
              </h2>

              <div className="prose prose-lg max-w-none text-muted-foreground mb-12">
                <p className="leading-relaxed mb-6">
                  {t(
                    'The legacy of the Trust dates back to the late 19th and early 20th centuries, rooted in the benevolence of Seth Manikchand Hirachand Javeri (1852–1914), a prominent pearl merchant and social reformer.',
                    'ट्रस्ट की विरासत 19वीं शताब्दी के अंत और 20वीं शताब्दी की शुरुआत की है, जो सेठ मनिकचंद हीराचंद जावेरी (1852-1914) की उदारता में निहित है, जो एक प्रमुख मोती व्यापारी और समाज सुधारक थे।'
                  )}
                </p>
                <div className="bg-muted/50 rounded-xl p-6 mb-6">
                  <h4 className="font-heading font-semibold text-foreground mb-2">{t('Foundation', 'स्थापना')}</h4>
                  <p className="text-sm">
                    {t(
                      'In 1900, Seth Manikchand established the boarding house in Mumbai in memory of his father, Seth Hirachand Gumanji, to support students who lacked the means to stay in the city for studies.',
                      '1900 में, सेठ मनिकचंद ने अपने पिता सेठ हीराचंद गुमानजी की स्मृति में मुंबई में बोर्डिंग हाउस की स्थापना की, उन छात्रों की सहायता के लिए जिनके पास शहर में रहकर पढ़ाई करने के साधन नहीं थे।'
                    )}
                  </p>
                </div>
                <div className="bg-muted/50 rounded-xl p-6 mb-6">
                  <h4 className="font-heading font-semibold text-foreground mb-2">{t('A National Impact', 'राष्ट्रीय प्रभाव')}</h4>
                  <p className="text-sm">
                    {t(
                      'The Javeri family (originally from Bhindar, Rajasthan) became one of Mumbai\'s most respected business houses. They established 27 charitable institutions across India, including the famous Hirabaug in Mumbai, which served as a central hub for Jain cultural and religious revival.',
                      'जावेरी परिवार (मूल रूप से भींदर, राजस्थान से) मुंबई के सबसे सम्मानित व्यापारिक घरानों में से एक बन गया। उन्होंने पूरे भारत में 27 धर्मार्थ संस्थान स्थापित किए, जिसमें मुंबई का प्रसिद्ध हीराबाग भी शामिल है, जो जैन सांस्कृतिक और धार्मिक पुनरुत्थान का केंद्र था।'
                    )}
                  </p>
                </div>
                <div className="bg-muted/50 rounded-xl p-6">
                  <h4 className="font-heading font-semibold text-foreground mb-2">{t("Women's Education", 'महिला शिक्षा')}</h4>
                  <p className="text-sm">
                    {t(
                      "Recognizing early on that women's education was the backbone of a strong society, the family established dedicated institutions for girls, including the R. R. Shravika Ashram.",
                      'यह जल्दी पहचानते हुए कि महिला शिक्षा एक मजबूत समाज की रीढ़ है, परिवार ने लड़कियों के लिए समर्पित संस्थान स्थापित किए, जिसमें आर. आर. श्राविका आश्रम भी शामिल है।'
                    )}
                  </p>
                </div>
              </div>

              {/* Timeline */}
              <div className="relative">
                <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-border" />
                <div className="space-y-8">
                  {timeline.map((item, index) => (
                    <div
                      key={index}
                      className={`relative flex items-center ${
                        index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                      }`}
                    >
                      <div className={`w-full md:w-1/2 ${index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'} pl-12 md:pl-0`}>
                        <div className="bg-card p-4 rounded-lg shadow-card">
                          <span className="text-primary font-bold text-lg">{item.year}</span>
                          <p className="text-foreground mt-1 text-sm">{item.event}</p>
                        </div>
                      </div>
                      <div className="absolute left-4 md:left-1/2 w-3 h-3 bg-primary rounded-full transform -translate-x-1/2" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Institutions & Facilities */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-heading font-bold text-foreground text-center mb-12">
                {t('Institutions & Facilities', 'संस्थाएं और सुविधाएं')}
              </h2>

              <div className="space-y-8">
                {/* Boys Hostel */}
                <Card className="overflow-hidden">
                  <div className="grid md:grid-cols-3 gap-0">
                    <div className="aspect-video md:aspect-auto">
                      <img src={hostelBuilding} alt="Boys Hostel" className="w-full h-full object-cover" />
                    </div>
                    <div className="md:col-span-2 p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{t("Seth Hirachand Gumanji Boys' Hostel", "सेठ हीराचंद गुमानजी बालक छात्रावास")}</CardTitle>
                        </div>
                      </div>
                      <p className="text-muted-foreground text-sm mb-4">
                        {t(
                          'Our flagship educational facility provides a disciplined and supportive environment for young Jain men.',
                          'हमारी प्रमुख शैक्षणिक सुविधा युवा जैन पुरुषों के लिए एक अनुशासित और सहायक वातावरण प्रदान करती है।'
                        )}
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">148, Lamington Road (Dadasaheb Bhadkamkar Marg), Grant Road, Mumbai - 400007</span>
                        </div>
                        <p className="text-muted-foreground">
                          <strong>{t('Target Group:', 'लक्षित समूह:')}</strong> {t('Digambar Jain male students (Secondary and Higher Education)', 'दिगंबर जैन पुरुष छात्र (माध्यमिक और उच्च शिक्षा)')}
                        </p>
                        <p className="text-muted-foreground">
                          <strong>{t('Facilities:', 'सुविधाएं:')}</strong> {t('Affordable residency, study rooms, and Jain Bhojanalaya providing pure vegetarian meals', 'किफायती आवास, अध्ययन कक्ष, और शुद्ध शाकाहारी भोजन प्रदान करने वाला जैन भोजनालय')}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Girls Hostel */}
                <Card className="overflow-hidden">
                  <div className="grid md:grid-cols-3 gap-0">
                    <div className="aspect-video md:aspect-auto">
                      <img src={hostelRoom} alt="R.R. Shravika Ashram" className="w-full h-full object-cover" />
                    </div>
                    <div className="md:col-span-2 p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                          <Users className="h-5 w-5 text-rose-600" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{t('R. R. Shravika Ashram (Ladies Hostel)', 'आर. आर. श्राविका आश्रम (महिला छात्रावास)')}</CardTitle>
                        </div>
                      </div>
                      <p className="text-muted-foreground text-sm mb-4">
                        {t(
                          'Founded to provide a safe haven for Jain girls and women pursuing higher education and careers in Mumbai.',
                          'मुंबई में उच्च शिक्षा और करियर के लिए जैन लड़कियों और महिलाओं को सुरक्षित आश्रय प्रदान करने के लिए स्थापित।'
                        )}
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">Jubilee Baug, Dadaji Road, Opposite Navjeevan Society, Lamington Road, Mumbai - 400004</span>
                        </div>
                        <p className="text-muted-foreground">
                          <strong>{t('Legacy:', 'विरासत:')}</strong> {t('Named in honor of the Ratanchand Hirachand branch, pioneer in women residential education for decades.', 'रतनचंद हीराचंद शाखा के सम्मान में नामित, दशकों से महिला आवासीय शिक्षा में अग्रणी।')}
                        </p>
                        <p className="text-muted-foreground">
                          <strong>{t('Target Group:', 'लक्षित समूह:')}</strong> {t('Jain girls (post-10th grade) and working professionals', 'जैन लड़कियां (10वीं के बाद) और कामकाजी पेशेवर')}
                        </p>
                        <p className="text-muted-foreground">
                          <strong>{t('Facilities:', 'सुविधाएं:')}</strong> {t('Secure warden-monitored environment, disciplined atmosphere aligned with Jain ethics, proximity to major colleges (HR, KC, Wilson, St. Xavier\'s)', 'सुरक्षित वार्डन-निगरानी वातावरण, जैन नैतिकता के अनुरूप अनुशासित माहौल, प्रमुख कॉलेजों के निकट')}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Dharamshala */}
                <Card className="overflow-hidden">
                  <div className="grid md:grid-cols-3 gap-0">
                    <div className="aspect-video md:aspect-auto">
                      <img src={hostelTemple} alt="Hirabaug Dharamshala" className="w-full h-full object-cover" />
                    </div>
                    <div className="md:col-span-2 p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                          <Home className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{t('Seth Hirachand Gumanji Dharamshala (Hirabaug)', 'सेठ हीराचंद गुमानजी धर्मशाला (हीराबाग)')}</CardTitle>
                        </div>
                      </div>
                      <p className="text-muted-foreground text-sm mb-4">
                        {t(
                          'A renowned guest house offering comfort and convenience to pilgrims and families.',
                          'तीर्थयात्रियों और परिवारों को आराम और सुविधा प्रदान करने वाला एक प्रसिद्ध गेस्ट हाउस।'
                        )}
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">Hirabaug, C.P. Tank, Girgaon, Mumbai - 400004</span>
                        </div>
                        <p className="text-muted-foreground">
                          <strong>{t('Medical Transit:', 'चिकित्सा यात्रा:')}</strong> {t('Close to major South Mumbai hospitals for families of patients.', 'मरीजों के परिवारों के लिए दक्षिण मुंबई के प्रमुख अस्पतालों के निकट।')}
                        </p>
                        <p className="text-muted-foreground">
                          <strong>{t('Religious Hub:', 'धार्मिक केंद्र:')}</strong> {t('Features a magnificent Digambar Jain Temple on the premises.', 'परिसर में एक भव्य दिगंबर जैन मंदिर है।')}
                        </p>
                        <p className="text-muted-foreground">
                          <strong>{t('Community Space:', 'सामुदायिक स्थान:')}</strong> {t('Includes halls for religious ceremonies and community gatherings.', 'धार्मिक समारोहों और सामुदायिक समारोहों के लिए हॉल शामिल हैं।')}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
