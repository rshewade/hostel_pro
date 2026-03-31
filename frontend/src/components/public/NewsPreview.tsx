"use client";

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/card';
import { Button } from '@/components/shadcn/button';
import { Badge } from '@/components/shadcn/badge';
import { ArrowRight, Calendar } from 'lucide-react';

const NewsPreview = () => {
  const { t } = useLanguage();

  const news = [
    {
      title: t('Admissions Open for 2025-26', 'प्रवेश खुला 2025-26'),
      description: t(
        'Applications are now being accepted for the Boys\' and Girls\' Hostels for the academic year 2025-26.',
        'शैक्षणिक वर्ष 2025-26 के लिए बालक और बालिका छात्रावास में आवेदन स्वीकार किए जा रहे हैं।'
      ),
      date: '15 Dec 2024',
      category: t('Admissions', 'प्रवेश'),
      categoryColor: 'bg-blue-100 text-blue-800',
    },
    {
      title: t('Annual Paryushan Celebration', 'वार्षिक पर्युषण उत्सव'),
      description: t(
        'Join us for the sacred Paryushan Parva celebrations at Hirabaug Dharamshala.',
        'हीराबाग धर्मशाला में पवित्र पर्युषण पर्व समारोह में हमारे साथ जुड़ें।'
      ),
      date: '08 Sep 2024',
      category: t('Events', 'कार्यक्रम'),
      categoryColor: 'bg-amber-100 text-amber-800',
    },
    {
      title: t('Alumni Meet 2024', 'पूर्व छात्र मिलन 2024'),
      description: t(
        'Reconnect with former hostel residents at our annual alumni gathering.',
        'हमारी वार्षिक पूर्व छात्र सभा में पूर्व छात्रावासियों से पुनः मिलें।'
      ),
      date: '20 Nov 2024',
      category: t('Alumni', 'पूर्व छात्र'),
      categoryColor: 'bg-rose-100 text-rose-800',
    },
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12">
          <div>
            <p className="text-primary font-medium mb-2">
              {t('Latest Updates', 'ताजा अपडेट')}
            </p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
              {t('News & Announcements', 'समाचार और घोषणाएं')}
            </h2>
          </div>
          <Link href="/news" className="mt-4 md:mt-0">
            <Button variant="outline" className="gap-2">
              {t('View All News', 'सभी समाचार देखें')}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item, index) => (
            <Card
              key={index}
              className="group hover:shadow-elegant transition-all duration-300 border border-border/50"
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className={item.categoryColor}>
                    {item.category}
                  </Badge>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {item.date}
                  </span>
                </div>
                <CardTitle className="font-heading text-lg group-hover:text-primary transition-colors">
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="leading-relaxed">
                  {item.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsPreview;
