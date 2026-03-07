import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';
import { useLanguage } from '@/contexts/LanguageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Facilities = () => {
  const { t, language } = useLanguage();

  const rulesData = {
    'boys-hostel': [
      { en: 'Students must maintain discipline and decorum at all times.', hi: 'छात्रों को हर समय अनुशासन और शिष्टाचार बनाए रखना चाहिए।' },
      { en: 'Entry time is 9:00 PM on weekdays and 10:00 PM on weekends.', hi: 'सप्ताह के दिनों में प्रवेश का समय रात 9:00 बजे और सप्ताहांत पर रात 10:00 बजे है।' },
      { en: 'Consumption of alcohol, tobacco, or any intoxicants is strictly prohibited.', hi: 'शराब, तंबाकू या किसी भी नशीले पदार्थ का सेवन सख्त वर्जित है।' },
      { en: 'Visitors must register at the reception and are allowed only in common areas.', hi: 'आगंतुकों को स्वागत कक्ष में पंजीकरण करना होगा और केवल सामान्य क्षेत्रों में अनुमति है।' },
      { en: 'Students are responsible for maintaining cleanliness in their rooms.', hi: 'छात्र अपने कमरों में स्वच्छता बनाए रखने के लिए जिम्मेदार हैं।' },
      { en: 'Electrical appliances other than permitted items are not allowed.', hi: 'अनुमत वस्तुओं के अलावा बिजली के उपकरणों की अनुमति नहीं है।' },
      { en: 'Attendance in morning prayer/assembly is mandatory.', hi: 'सुबह की प्रार्थना/सभा में उपस्थिति अनिवार्य है।' },
      { en: 'Damage to hostel property will be charged to the student.', hi: 'छात्रावास संपत्ति को नुकसान छात्र से वसूला जाएगा।' },
    ],
    'girls-hostel': [
      { en: 'Entry time is 8:00 PM strictly. Late entries require prior permission.', hi: 'प्रवेश का समय सख्ती से रात 8:00 बजे है। देर से प्रवेश के लिए पूर्व अनुमति आवश्यक है।' },
      { en: 'Male visitors are not permitted beyond the reception area.', hi: 'स्वागत क्षेत्र से आगे पुरुष आगंतुकों की अनुमति नहीं है।' },
      { en: 'Overnight stays outside the ashram require written parent/guardian consent.', hi: 'आश्रम के बाहर रात्रि प्रवास के लिए माता-पिता/अभिभावक की लिखित सहमति आवश्यक है।' },
      { en: 'Students must inform warden before leaving the premises.', hi: 'छात्रों को परिसर छोड़ने से पहले वार्डन को सूचित करना होगा।' },
      { en: 'Traditional dress code is expected during religious occasions.', hi: 'धार्मिक अवसरों पर पारंपरिक ड्रेस कोड अपेक्षित है।' },
      { en: 'Use of mobile phones is restricted during study hours.', hi: 'अध्ययन के घंटों के दौरान मोबाइल फोन का उपयोग प्रतिबंधित है।' },
      { en: 'Participation in ashram activities is encouraged.', hi: 'आश्रम गतिविधियों में भागीदारी को प्रोत्साहित किया जाता है।' },
    ],
    'dharamshala': [
      { en: 'Check-in time is 12:00 PM and check-out time is 11:00 AM.', hi: 'चेक-इन समय दोपहर 12:00 बजे और चेक-आउट समय सुबह 11:00 बजे है।' },
      { en: 'Valid government ID proof is mandatory for all guests.', hi: 'सभी मेहमानों के लिए वैध सरकारी आईडी प्रमाण अनिवार्य है।' },
      { en: 'Maximum stay is limited to 7 days (extendable based on availability).', hi: 'अधिकतम प्रवास 7 दिनों तक सीमित है (उपलब्धता के आधार पर विस्तारित)।' },
      { en: 'Non-vegetarian food is strictly prohibited in the premises.', hi: 'परिसर में मांसाहारी भोजन सख्त वर्जित है।' },
      { en: 'Guests are expected to maintain silence during prayer times.', hi: 'मेहमानों से प्रार्थना के समय मौन रखने की अपेक्षा की जाती है।' },
      { en: 'Booking cancellation must be done 24 hours in advance.', hi: 'बुकिंग रद्द करना 24 घंटे पहले किया जाना चाहिए।' },
      { en: 'Parking is available on first-come-first-serve basis.', hi: 'पार्किंग पहले आओ पहले पाओ के आधार पर उपलब्ध है।' },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <PageHero
          title={t('Facilities & Rules', 'सुविधाएं और नियम')}
          subtitle={t('Guidelines for a harmonious stay at our institutions', 'हमारी संस्थाओं में सामंजस्यपूर्ण प्रवास के लिए दिशानिर्देश')}
        />

        {/* Rules */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="boys-hostel" className="max-w-3xl mx-auto">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="boys-hostel">{t("Boys' Hostel", 'बालक छात्रावास')}</TabsTrigger>
                <TabsTrigger value="girls-hostel">{t("Girls' Hostel", 'बालिका छात्रावास')}</TabsTrigger>
                <TabsTrigger value="dharamshala">{t('Dharamshala', 'धर्मशाला')}</TabsTrigger>
              </TabsList>

              {Object.entries(rulesData).map(([key, rules]) => (
                <TabsContent key={key} value={key}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="font-heading">
                        {t('Rules & Regulations', 'नियम और विनियम')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ol className="space-y-3">
                        {rules.map((rule, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium shrink-0">
                              {index + 1}
                            </span>
                            <span className="text-muted-foreground">{rule[language]}</span>
                          </li>
                        ))}
                      </ol>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Facilities;
