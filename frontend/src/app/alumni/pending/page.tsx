"use client";

import Link from 'next/link';
import { Clock, Shield, UserCheck, Mail } from 'lucide-react';
import PublicLayout from '@/components/public/PublicLayout';
import { Button } from '@/components/shadcn/button';
import { Card, CardContent } from '@/components/shadcn/card';
import { useLanguage } from '@/contexts/LanguageContext';

const AlumniPending = () => {
  const { t } = useLanguage();

  const infoCards = [
    {
      icon: UserCheck,
      title: t('Manual Verification', 'मैन्युअल सत्यापन'),
      description: t('Each application is reviewed by our administrators to ensure authenticity.', 'प्रत्येक आवेदन की हमारे प्रशासकों द्वारा समीक्षा की जाती है।'),
    },
    {
      icon: Shield,
      title: t('Data Safety', 'डेटा सुरक्षा'),
      description: t('Your information is securely stored and never shared publicly.', 'आपकी जानकारी सुरक्षित रूप से संग्रहीत है और कभी भी सार्वजनिक रूप से साझा नहीं की जाती।'),
    },
    {
      icon: Clock,
      title: t('Typical Approval Time', 'सामान्य अनुमोदन समय'),
      description: t('Most applications are reviewed within 2-3 business days.', 'अधिकांश आवेदनों की 2-3 कार्य दिवसों में समीक्षा की जाती है।'),
    },
  ];

  return (
    <PublicLayout>
      <main className="flex-1 flex items-center justify-center py-16 bg-muted/20">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          {/* Illustration */}
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-secondary/20 flex items-center justify-center">
            <Clock className="h-12 w-12 text-secondary" />
          </div>

          {/* Main Message */}
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
            {t('Application Under Review', 'आवेदन समीक्षाधीन है')}
          </h1>

          <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
            {t('Your application is being reviewed. You will gain access once approved by the administrator.', 'आपके आवेदन की समीक्षा की जा रही है। व्यवस्थापक द्वारा अनुमोदित होने के बाद आपको पहुंच मिलेगी।')}
          </p>

          {/* Email Notification */}
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-sm mb-8">
            <Mail className="h-4 w-4 text-primary" />
            <span>{t('You will receive an email once approved', 'अनुमोदित होने पर आपको एक ईमेल प्राप्त होगी')}</span>
          </div>

          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {infoCards.map((card, index) => (
              <Card key={index} className="border-border/50">
                <CardContent className="pt-6">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mx-auto mb-3">
                    <card.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium text-sm mb-1">{card.title}</h3>
                  <p className="text-xs text-muted-foreground">{card.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Back to Home */}
          <Button asChild variant="outline">
            <Link href="/">{t('Back to Home', 'होम पर वापस जाएं')}</Link>
          </Button>
        </div>
      </main>
    </PublicLayout>
  );
};

export default AlumniPending;
