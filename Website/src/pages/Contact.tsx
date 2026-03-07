import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MapPin, Phone, Mail, Clock, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const Contact = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: t('Message Sent!', 'संदेश भेजा गया!'),
      description: t('We will get back to you soon.', 'हम जल्द ही आपसे संपर्क करेंगे।'),
    });
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: t('Address', 'पता'),
      details: [
        t('Seth Hirachand Gumanji Jain Trust', 'सेठ हीराचंद गुमानजी जैन ट्रस्ट'),
        t('Hirabaug, Dr. B.A. Road', 'हीराबाग, डॉ. बी.ए. रोड'),
        t('Dadar (East), Mumbai - 400014', 'दादर (पूर्व), मुंबई - 400014'),
      ],
    },
    {
      icon: Phone,
      title: t('Phone', 'फोन'),
      details: ['+91 22 2414 1234', '+91 22 2414 5678'],
    },
    {
      icon: Mail,
      title: t('Email', 'ईमेल'),
      details: ['info@shgjaintrust.org', 'admissions@shgjaintrust.org'],
    },
    {
      icon: Clock,
      title: t('Office Hours', 'कार्यालय समय'),
      details: [
        t('Monday - Saturday', 'सोमवार - शनिवार'),
        t('10:00 AM - 6:00 PM', 'सुबह 10:00 - शाम 6:00'),
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <PageHero
          title={t('Contact Us', 'संपर्क करें')}
          subtitle={t(
            'We would love to hear from you. Reach out for any queries or assistance.',
            'हमें आपसे सुनना अच्छा लगेगा। किसी भी प्रश्न या सहायता के लिए संपर्क करें।'
          )}
        />

        {/* Content */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {/* Contact Info */}
              <div>
                <h2 className="text-2xl font-heading font-bold text-foreground mb-6">
                  {t('Get in Touch', 'संपर्क में रहें')}
                </h2>
                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                  {contactInfo.map((info, index) => (
                    <Card key={index} className="border-0 bg-muted/50">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <info.icon className="h-5 w-5 text-primary" />
                          <CardTitle className="text-base font-heading">{info.title}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {info.details.map((detail, i) => (
                          <p key={i} className="text-sm text-muted-foreground">
                            {detail}
                          </p>
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Map */}
                <div className="rounded-xl overflow-hidden h-64 bg-muted">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3771.984881088442!2d72.84456!3d19.0229!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDAxJzIyLjQiTiA3MsKwNTAnNDAuNCJF!5e0!3m2!1sen!2sin!4v1234567890"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Trust Location"
                  />
                </div>
              </div>

              {/* Contact Form */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="font-heading flex items-center gap-2">
                      <MessageCircle className="h-5 w-5" />
                      {t('Send us a Message', 'हमें संदेश भेजें')}
                    </CardTitle>
                    <CardDescription>
                      {t(
                        'Fill out the form below and we will respond within 24-48 hours.',
                        'नीचे फॉर्म भरें और हम 24-48 घंटों के भीतर जवाब देंगे।'
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">{t('Full Name', 'पूरा नाम')} *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder={t('Enter your full name', 'अपना पूरा नाम दर्ज करें')}
                          required
                        />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">{t('Email', 'ईमेल')} *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder={t('your@email.com', 'your@email.com')}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">{t('Phone Number', 'फोन नंबर')}</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+91 98765 43210"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="message">{t('Message', 'संदेश')} *</Label>
                        <Textarea
                          id="message"
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          placeholder={t('How can we help you?', 'हम आपकी कैसे मदद कर सकते हैं?')}
                          rows={5}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        {t('Send Message', 'संदेश भेजें')}
                      </Button>
                    </form>
                  </CardContent>
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

export default Contact;
