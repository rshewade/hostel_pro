"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/shadcn/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card";
import { Heart, GraduationCap, Home, Utensils, Gift, Building } from "lucide-react";
import PublicLayout from "@/components/public/PublicLayout";
import PageHero from "@/components/public/PageHero";

export default function DonationsPage() {
  const { t } = useLanguage();

  const donationPurposes = [
    {
      icon: GraduationCap,
      title: t('Education Fund', 'शिक्षा कोष'),
      description: t('Support deserving students with scholarships and hostel fees', 'छात्रवृत्ति और छात्रावास शुल्क के साथ योग्य छात्रों का समर्थन करें'),
    },
    {
      icon: Building,
      title: t('Infrastructure Development', 'बुनियादी ढांचा विकास'),
      description: t('Help us maintain and upgrade our facilities', 'हमारी सुविधाओं को बनाए रखने और उन्नत करने में मदद करें'),
    },
    {
      icon: Utensils,
      title: t('Bhojanshala', 'भोजनशाला'),
      description: t('Contribute to daily meals for students and pilgrims', 'छात्रों और तीर्थयात्रियों के दैनिक भोजन में योगदान करें'),
    },
    {
      icon: Heart,
      title: t('Medical Assistance', 'चिकित्सा सहायता'),
      description: t('Support medical care for students and needy families', 'छात्रों और जरूरतमंद परिवारों के लिए चिकित्सा देखभाल का समर्थन करें'),
    },
    {
      icon: Home,
      title: t('Dharamshala Maintenance', 'धर्मशाला रखरखाव'),
      description: t('Help maintain the pilgrim rest house', 'तीर्थयात्री विश्राम गृह के रखरखाव में मदद करें'),
    },
    {
      icon: Gift,
      title: t('General Donation', 'सामान्य दान'),
      description: t('Contribute to overall trust activities', 'समग्र ट्रस्ट गतिविधियों में योगदान करें'),
    },
  ];

  return (
    <PublicLayout>
      {/* Hero */}
      <PageHero
        title={t('Support Our Mission', 'हमारे मिशन का समर्थन करें')}
        subtitle={t(
          'Your generous donations help us continue the noble work of Vidya Daan and Jain Seva.',
          'आपका उदार दान हमें विद्या दान और जैन सेवा के महान कार्य को जारी रखने में मदद करता है।'
        )}
      >
        <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6">
          <Heart className="h-8 w-8 text-accent" />
        </div>
      </PageHero>

      {/* Tax benefit notice */}
      <div className="bg-primary text-center py-3">
        <p className="text-accent font-medium">
          {t('All donations are eligible for tax benefits under Section 80G', 'सभी दान धारा 80जी के तहत कर लाभ के लिए पात्र हैं')}
        </p>
      </div>

      {/* Donation Purposes */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-heading font-bold text-foreground text-center mb-8">
              {t('Where Your Donation Goes', 'आपका दान कहाँ जाता है')}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {donationPurposes.map((purpose, index) => (
                <Card key={index} className="hover:shadow-elegant transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                      <purpose.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="font-heading text-lg">{purpose.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{purpose.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Donation CTA */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <Card className="bg-card border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="font-heading text-2xl">
                  {t('Make a Donation', 'दान करें')}
                </CardTitle>
                <CardDescription>
                  {t(
                    'Contact our office to make a donation via cheque, bank transfer, or in person.',
                    'चेक, बैंक ट्रांसफर, या व्यक्तिगत रूप से दान करने के लिए हमारे कार्यालय से संपर्क करें।'
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-medium mb-2">{t('Bank Details', 'बैंक विवरण')}</p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>{t('Account Name: Seth Hirachand Gumanji Jain Trust', 'खाता नाम: सेठ हीराचंद गुमानजी जैन ट्रस्ट')}</p>
                    <p>{t('Bank: State Bank of India', 'बैंक: स्टेट बैंक ऑफ इंडिया')}</p>
                    <p>{t('Branch: Dadar (East)', 'शाखा: दादर (पूर्व)')}</p>
                    <p>IFSC: SBIN0001234</p>
                    <p>{t('Account No: XXXX XXXX XXXX', 'खाता संख्या: XXXX XXXX XXXX')}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t(
                    'For online payment options, please contact our office.',
                    'ऑनलाइन भुगतान विकल्पों के लिए, कृपया हमारे कार्यालय से संपर्क करें।'
                  )}
                </p>
                <Button size="lg" className="gap-2" asChild>
                  <a href="tel:+912224141234">
                    {t('Contact: +91 22 2414 1234', 'संपर्क: +91 22 2414 1234')}
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
