import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';

const News = () => {
  const { t, language } = useLanguage();

  const newsItems = [
    {
      title: { en: 'Admissions Open for 2025-26 Academic Year', hi: 'शैक्षणिक वर्ष 2025-26 के लिए प्रवेश खुला' },
      description: { en: 'Applications are now being accepted for both Boys\' and Girls\' Hostels. Apply before March 31, 2025.', hi: 'बालक और बालिका छात्रावास दोनों के लिए आवेदन स्वीकार किए जा रहे हैं। 31 मार्च 2025 से पहले आवेदन करें।' },
      date: '15 Dec 2024',
      category: { en: 'Admissions', hi: 'प्रवेश' },
      categoryColor: 'bg-blue-100 text-blue-800',
    },
    {
      title: { en: 'Annual Paryushan Mahaparva Celebration', hi: 'वार्षिक पर्युषण महापर्व उत्सव' },
      description: { en: 'Join us for the sacred Paryushan Parva celebrations at Hirabaug Dharamshala. Special prayers and pravachans scheduled.', hi: 'हीराबाग धर्मशाला में पवित्र पर्युषण पर्व समारोह में हमारे साथ जुड़ें। विशेष प्रार्थना और प्रवचन निर्धारित।' },
      date: '08 Sep 2024',
      category: { en: 'Religious', hi: 'धार्मिक' },
      categoryColor: 'bg-amber-100 text-amber-800',
    },
    {
      title: { en: 'Alumni Meet 2024 - A Grand Success', hi: 'पूर्व छात्र मिलन 2024 - एक भव्य सफलता' },
      description: { en: 'Over 200 alumni attended the annual gathering, reconnecting with old friends and mentoring current students.', hi: '200 से अधिक पूर्व छात्रों ने वार्षिक सभा में भाग लिया, पुराने दोस्तों से पुनः मिले और वर्तमान छात्रों का मार्गदर्शन किया।' },
      date: '20 Nov 2024',
      category: { en: 'Alumni', hi: 'पूर्व छात्र' },
      categoryColor: 'bg-rose-100 text-rose-800',
    },
    {
      title: { en: 'New Library Wing Inaugurated', hi: 'नई पुस्तकालय शाखा का उद्घाटन' },
      description: { en: 'A state-of-the-art library with digital resources has been added to the Boys\' Hostel facilities.', hi: 'बालक छात्रावास सुविधाओं में डिजिटल संसाधनों के साथ एक अत्याधुनिक पुस्तकालय जोड़ा गया है।' },
      date: '05 Oct 2024',
      category: { en: 'Infrastructure', hi: 'बुनियादी ढांचा' },
      categoryColor: 'bg-green-100 text-green-800',
    },
    {
      title: { en: 'Scholarship Program Expanded', hi: 'छात्रवृत्ति कार्यक्रम का विस्तार' },
      description: { en: 'The trust has increased scholarship funding to support more deserving students from economically weaker sections.', hi: 'ट्रस्ट ने आर्थिक रूप से कमजोर वर्गों के अधिक योग्य छात्रों का समर्थन करने के लिए छात्रवृत्ति वित्तपोषण बढ़ाया है।' },
      date: '15 Aug 2024',
      category: { en: 'Education', hi: 'शिक्षा' },
      categoryColor: 'bg-purple-100 text-purple-800',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <PageHero
          title={t('News & Announcements', 'समाचार और घोषणाएं')}
          subtitle={t('Stay updated with the latest from our trust', 'हमारे ट्रस्ट से नवीनतम जानकारी से अपडेट रहें')}
        />

        {/* News List */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto space-y-6">
              {newsItems.map((item, index) => (
                <Card key={index} className="hover:shadow-elegant transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className={item.categoryColor}>
                        {item.category[language]}
                      </Badge>
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {item.date}
                      </span>
                    </div>
                    <CardTitle className="font-heading text-xl">{item.title[language]}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
                      {item.description[language]}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default News;
