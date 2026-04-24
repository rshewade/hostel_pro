"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/shadcn/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card";
import { Building2, Users, Home, ExternalLink, FileText, CheckCircle } from "lucide-react";
import PublicLayout from "@/components/public/PublicLayout";
import PageHero from "@/components/public/PageHero";

const admissionsData = {
  'boys-hostel': {
    title: { en: "Boys' Hostel Admissions", hi: 'बालक छात्रावास प्रवेश' },
    subtitle: { en: 'Seth Hirachand Gumanji Jain Hostel', hi: 'सेठ हीराचंद गुमानजी जैन छात्रावास' },
    icon: Building2,
    color: 'blue',
    applyUrl: '/apply/boys-hostel/contact',
  },
  'girls-hostel': {
    title: { en: "Girls' Hostel Admissions", hi: 'बालिका छात्रावास प्रवेश' },
    subtitle: { en: 'R. R. Shravika Ashram', hi: 'आर. आर. श्राविका आश्रम' },
    icon: Users,
    color: 'rose',
    applyUrl: '/apply/girls-ashram/contact',
  },
  'dharamshala': {
    title: { en: 'Dharamshala Booking', hi: 'धर्मशाला बुकिंग' },
    subtitle: { en: 'Hirabaug', hi: 'हीराबाग' },
    icon: Home,
    color: 'amber',
    applyUrl: '/apply/dharamshala/contact',
  },
};

export default function AdmissionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { t, language } = useLanguage();
  const router = useRouter();

  const admission = admissionsData[id as keyof typeof admissionsData];

  if (!admission) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Page not found</h1>
          </div>
        </div>
      </PublicLayout>
    );
  }

  const Icon = admission.icon;
  const isDharamshala = id === 'dharamshala';

  const steps = isDharamshala
    ? [
        { en: 'Check room availability', hi: 'कमरे की उपलब्धता जांचें' },
        { en: 'Fill booking form with valid ID', hi: 'वैध आईडी के साथ बुकिंग फॉर्म भरें' },
        { en: 'Make advance payment', hi: 'अग्रिम भुगतान करें' },
        { en: 'Receive booking confirmation', hi: 'बुकिंग की पुष्टि प्राप्त करें' },
      ]
    : [
        { en: 'Check eligibility criteria', hi: 'पात्रता मानदंड जांचें' },
        { en: 'Create account / Login', hi: 'खाता बनाएं / लॉगिन करें' },
        { en: 'Fill online application form', hi: 'ऑनलाइन आवेदन फॉर्म भरें' },
        { en: 'Upload required documents', hi: 'आवश्यक दस्तावेज अपलोड करें' },
        { en: 'Submit and track application', hi: 'जमा करें और आवेदन ट्रैक करें' },
      ];

  const documents = isDharamshala
    ? [
        { en: 'Valid Government ID (Aadhar/Passport)', hi: 'वैध सरकारी आईडी (आधार/पासपोर्ट)' },
        { en: 'Hospital documents (if medical transit)', hi: 'अस्पताल के दस्तावेज (यदि चिकित्सा यात्रा)' },
      ]
    : [
        { en: 'Birth Certificate', hi: 'जन्म प्रमाण पत्र' },
        { en: 'Caste Certificate (Jain Community)', hi: 'जाति प्रमाण पत्र (जैन समुदाय)' },
        { en: 'College Admission Letter', hi: 'कॉलेज प्रवेश पत्र' },
        { en: 'Previous Academic Records', hi: 'पिछले शैक्षणिक रिकॉर्ड' },
        { en: 'Passport Size Photographs', hi: 'पासपोर्ट साइज फोटो' },
        { en: 'Recommendation Letter from Jain Sangh', hi: 'जैन संघ से अनुशंसा पत्र' },
      ];

  return (
    <PublicLayout>
      {/* Hero */}
      <PageHero
        title={admission.title[language]}
        subtitle={admission.subtitle[language]}
      >
        <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
          <Icon className="h-8 w-8 text-accent" />
        </div>
      </PageHero>

      {/* Content */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Process Steps */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">
                    {isDharamshala ? t('Booking Process', 'बुकिंग प्रक्रिया') : t('Application Process', 'आवेदन प्रक्रिया')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-4">
                    {steps.map((step, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium shrink-0">
                          {index + 1}
                        </span>
                        <span className="text-muted-foreground">{step[language]}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>

              {/* Required Documents */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {t('Required Documents', 'आवश्यक दस्तावेज')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {documents.map((doc, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">{doc[language]}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Login CTA */}
            <Card className="mt-8 bg-primary text-primary-foreground">
              <CardHeader className="text-center">
                <CardTitle className="font-heading text-2xl">
                  {isDharamshala ? t('Book Your Stay', 'अपना प्रवास बुक करें') : t('Start Your Application', 'अपना आवेदन शुरू करें')}
                </CardTitle>
                <CardDescription className="text-primary-foreground/80">
                  {isDharamshala
                    ? t('Click below to access the booking portal', 'बुकिंग पोर्टल तक पहुंचने के लिए नीचे क्लिक करें')
                    : t('Login to continue your application or register as a new applicant', 'अपना आवेदन जारी रखने के लिए लॉगिन करें या नए आवेदक के रूप में पंजीकरण करें')
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button
                  size="lg"
                  variant="accent"
                  className="gap-2"
                  onClick={() => router.push(admission.applyUrl)}
                >
                  <ExternalLink className="h-5 w-5" />
                  {isDharamshala ? t('Booking Portal', 'बुकिंग पोर्टल') : t('Login / Register', 'लॉगिन / पंजीकरण')}
                </Button>
                <p className="text-sm text-primary-foreground/60 mt-4">
                  {t('You will be redirected to the application form', 'आपको आवेदन पत्र पर पुनर्निर्देशित किया जाएगा')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
