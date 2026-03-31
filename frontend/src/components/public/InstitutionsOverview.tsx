"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/card';
import { Button } from '@/components/shadcn/button';
import { ArrowRight } from 'lucide-react';

const InstitutionsOverview = () => {
  const { t } = useLanguage();

  const institutions = [
    {
      image: '/hostel-building.png',
      title: t("Boys' Hostel", 'बालक छात्रावास'),
      subtitle: t('Seth Hirachand Gumanji Jain Hostel', 'सेठ हीराचंद गुमानजी जैन छात्रावास'),
      description: t(
        'Providing safe, disciplined accommodation for Jain boys pursuing higher education in Mumbai with modern facilities and a conducive learning environment.',
        'मुंबई में उच्च शिक्षा प्राप्त कर रहे जैन बालकों के लिए आधुनिक सुविधाओं और अनुकूल शिक्षण वातावरण के साथ सुरक्षित, अनुशासित आवास प्रदान करना।'
      ),
      link: '/institutions/boys-hostel',
    },
    {
      image: '/hostel-room.png',
      title: t("Girls' Hostel", 'बालिका छात्रावास'),
      subtitle: t('R. R. Shravika Ashram', 'आर. आर. श्राविका आश्रम'),
      description: t(
        'Empowering Jain women through education with secure, comfortable accommodation designed specifically for female students in a nurturing environment.',
        'पोषण वातावरण में महिला छात्रों के लिए विशेष रूप से डिज़ाइन किए गए सुरक्षित, आरामदायक आवास के साथ शिक्षा के माध्यम से जैन महिलाओं को सशक्त बनाना।'
      ),
      link: '/institutions/girls-hostel',
    },
    {
      image: '/hostel-temple.png',
      title: t('Dharamshala', 'धर्मशाला'),
      subtitle: t('Hirabaug', 'हीराबाग'),
      description: t(
        'A sacred rest house for pilgrims and travelers, offering peaceful accommodation near major hospitals for families in medical transit.',
        'तीर्थयात्रियों और यात्रियों के लिए एक पवित्र विश्राम गृह, चिकित्सा यात्रा में परिवारों के लिए प्रमुख अस्पतालों के पास शांतिपूर्ण आवास प्रदान करता है।'
      ),
      link: '/institutions/dharamshala',
    },
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-primary font-medium mb-2">
            {t('Our Institutions', 'हमारी संस्थाएं')}
          </p>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
            {t('Three Pillars of Service', 'सेवा के तीन स्तंभ')}
          </h2>
          <p className="text-muted-foreground">
            {t(
              'Serving the Jain community through education, shelter, and spiritual welfare.',
              'शिक्षा, आश्रय और आध्यात्मिक कल्याण के माध्यम से जैन समुदाय की सेवा।'
            )}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {institutions.map((institution, index) => (
            <Card
              key={index}
              className="group hover:shadow-elegant transition-all duration-300 overflow-hidden"
            >
              <div className="aspect-[4/3] overflow-hidden relative">
                <Image
                  src={institution.image}
                  alt={institution.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="font-heading text-xl">{institution.title}</CardTitle>
                <CardDescription className="font-medium text-foreground/70">
                  {institution.subtitle}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 leading-relaxed text-sm">
                  {institution.description}
                </p>
                <Link href={institution.link}>
                  <Button variant="ghost" className="gap-2 p-0 h-auto font-medium group-hover:text-primary">
                    {t('Learn More', 'और जानें')}
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InstitutionsOverview;
