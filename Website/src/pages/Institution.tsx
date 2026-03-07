import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Building2, Users, Home, MapPin, Phone, Clock, 
  Wifi, BookOpen, Utensils, Shield, Heart, ExternalLink,
  BedDouble, Droplets, Car, Users2
} from 'lucide-react';

const institutionsData = {
  'boys-hostel': {
    title: { en: "Boys' Hostel", hi: 'बालक छात्रावास' },
    subtitle: { en: 'Seth Hirachand Gumanji Jain Hostel', hi: 'सेठ हीराचंद गुमानजी जैन छात्रावास' },
    icon: Building2,
    color: 'blue',
    description: {
      en: 'The Seth Hirachand Gumanji Jain Hostel has been serving Jain boys pursuing higher education in Mumbai since 1955. Our hostel provides a safe, disciplined, and conducive environment for academic excellence while nurturing Jain values and traditions.',
      hi: 'सेठ हीराचंद गुमानजी जैन छात्रावास 1955 से मुंबई में उच्च शिक्षा प्राप्त कर रहे जैन बालकों की सेवा कर रहा है। हमारा छात्रावास जैन मूल्यों और परंपराओं का पोषण करते हुए शैक्षणिक उत्कृष्टता के लिए एक सुरक्षित, अनुशासित और अनुकूल वातावरण प्रदान करता है।'
    },
    facilities: [
      { icon: BedDouble, label: { en: 'Furnished Rooms', hi: 'सुसज्जित कमरे' } },
      { icon: Wifi, label: { en: 'High-Speed WiFi', hi: 'हाई-स्पीड वाईफाई' } },
      { icon: BookOpen, label: { en: 'Study Hall & Library', hi: 'अध्ययन कक्ष और पुस्तकालय' } },
      { icon: Utensils, label: { en: 'Vegetarian Mess', hi: 'शाकाहारी भोजनालय' } },
      { icon: Droplets, label: { en: '24/7 Water Supply', hi: '24/7 जल आपूर्ति' } },
      { icon: Shield, label: { en: 'Security & CCTV', hi: 'सुरक्षा और सीसीटीवी' } },
    ],
    eligibility: [
      { en: 'Must belong to Digambar Jain community', hi: 'दिगंबर जैन समुदाय से संबंधित होना चाहिए' },
      { en: 'Enrolled in recognized college/university in Mumbai', hi: 'मुंबई में मान्यता प्राप्त कॉलेज/विश्वविद्यालय में नामांकित' },
      { en: 'Good academic record', hi: 'अच्छा शैक्षणिक रिकॉर्ड' },
      { en: 'Recommendation from Jain Sangh or known reference', hi: 'जैन संघ या ज्ञात संदर्भ से अनुशंसा' },
    ],
    location: { en: 'Hirabaug, Dr. B.A. Road, Mumbai - 400014', hi: 'हीराबाग, डॉ. बी.ए. रोड, मुंबई - 400014' },
    contact: '+91 22 2414 1234',
  },
  'girls-hostel': {
    title: { en: "Girls' Hostel", hi: 'बालिका छात्रावास' },
    subtitle: { en: 'R. R. Shravika Ashram', hi: 'आर. आर. श्राविका आश्रम' },
    icon: Users,
    color: 'rose',
    description: {
      en: 'R. R. Shravika Ashram was established in 1972 with a vision to empower Jain women through education. The ashram provides a secure, nurturing environment specifically designed for female students, combining modern facilities with traditional Jain values.',
      hi: 'आर. आर. श्राविका आश्रम की स्थापना 1972 में शिक्षा के माध्यम से जैन महिलाओं को सशक्त बनाने की दृष्टि से की गई थी। आश्रम विशेष रूप से महिला छात्रों के लिए डिज़ाइन किया गया एक सुरक्षित, पोषण वातावरण प्रदान करता है, जो आधुनिक सुविधाओं को पारंपरिक जैन मूल्यों के साथ जोड़ता है।'
    },
    facilities: [
      { icon: BedDouble, label: { en: 'Safe Furnished Rooms', hi: 'सुरक्षित सुसज्जित कमरे' } },
      { icon: Wifi, label: { en: 'High-Speed WiFi', hi: 'हाई-स्पीड वाईफाई' } },
      { icon: BookOpen, label: { en: 'Study Hall & Library', hi: 'अध्ययन कक्ष और पुस्तकालय' } },
      { icon: Utensils, label: { en: 'Jain Vegetarian Kitchen', hi: 'जैन शाकाहारी रसोई' } },
      { icon: Shield, label: { en: 'Women Security Staff', hi: 'महिला सुरक्षा कर्मचारी' } },
      { icon: Heart, label: { en: 'Medical Facilities', hi: 'चिकित्सा सुविधाएं' } },
    ],
    eligibility: [
      { en: 'Must belong to Digambar Jain community', hi: 'दिगंबर जैन समुदाय से संबंधित होना चाहिए' },
      { en: 'Female students enrolled in Mumbai institutions', hi: 'मुंबई संस्थानों में नामांकित महिला छात्राएं' },
      { en: 'Good academic record and character', hi: 'अच्छा शैक्षणिक रिकॉर्ड और चरित्र' },
      { en: 'Parent/Guardian consent required', hi: 'माता-पिता/अभिभावक की सहमति आवश्यक' },
    ],
    location: { en: 'R.R. Shravika Ashram, Near Hirabaug, Mumbai - 400014', hi: 'आर.आर. श्राविका आश्रम, हीराबाग के पास, मुंबई - 400014' },
    contact: '+91 22 2414 5678',
  },
  'dharamshala': {
    title: { en: 'Dharamshala', hi: 'धर्मशाला' },
    subtitle: { en: 'Hirabaug', hi: 'हीराबाग' },
    icon: Home,
    color: 'amber',
    description: {
      en: 'Hirabaug Dharamshala serves as a sacred rest house for Jain pilgrims, travelers, and families. Strategically located near major hospitals, it provides peaceful accommodation for families with members undergoing medical treatment, as well as for those on religious pilgrimages.',
      hi: 'हीराबाग धर्मशाला जैन तीर्थयात्रियों, यात्रियों और परिवारों के लिए एक पवित्र विश्राम गृह के रूप में कार्य करती है। प्रमुख अस्पतालों के पास रणनीतिक रूप से स्थित, यह चिकित्सा उपचार से गुजर रहे सदस्यों वाले परिवारों के साथ-साथ धार्मिक तीर्थयात्राओं पर जाने वालों के लिए शांतिपूर्ण आवास प्रदान करता है।'
    },
    facilities: [
      { icon: BedDouble, label: { en: 'AC & Non-AC Rooms', hi: 'एसी और नॉन-एसी कमरे' } },
      { icon: Users2, label: { en: 'Dormitory & Halls', hi: 'छात्रावास और हॉल' } },
      { icon: Utensils, label: { en: 'Jain Bhojanshala', hi: 'जैन भोजनशाला' } },
      { icon: Car, label: { en: 'Parking Facility', hi: 'पार्किंग सुविधा' } },
      { icon: Droplets, label: { en: '24/7 Hot Water', hi: '24/7 गर्म पानी' } },
      { icon: Shield, label: { en: '24/7 Security', hi: '24/7 सुरक्षा' } },
    ],
    eligibility: [
      { en: 'Priority given to Jain community members', hi: 'जैन समुदाय के सदस्यों को प्राथमिकता' },
      { en: 'Medical transit families welcome', hi: 'चिकित्सा यात्रा परिवारों का स्वागत' },
      { en: 'Advance booking recommended', hi: 'अग्रिम बुकिंग अनुशंसित' },
      { en: 'Valid ID proof required', hi: 'वैध आईडी प्रमाण आवश्यक' },
    ],
    location: { en: 'Hirabaug Dharamshala, Dr. B.A. Road, Mumbai - 400014', hi: 'हीराबाग धर्मशाला, डॉ. बी.ए. रोड, मुंबई - 400014' },
    contact: '+91 22 2414 9012',
  },
};

const Institution = () => {
  const { id } = useParams<{ id: string }>();
  const { t, language } = useLanguage();
  
  const institution = institutionsData[id as keyof typeof institutionsData];
  
  if (!institution) {
    return <div>Institution not found</div>;
  }

  const Icon = institution.icon;
  const colorClasses = {
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600', badge: 'bg-blue-100 text-blue-800' },
    rose: { bg: 'bg-rose-50', icon: 'text-rose-600', badge: 'bg-rose-100 text-rose-800' },
    amber: { bg: 'bg-amber-50', icon: 'text-amber-600', badge: 'bg-amber-100 text-amber-800' },
  }[institution.color];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <PageHero
          title={institution.title[language]}
          subtitle={institution.subtitle[language]}
        >
          <div className={`w-16 h-16 rounded-full ${colorClasses.bg} flex items-center justify-center mx-auto mb-4`}>
            <Icon className={`h-8 w-8 ${colorClasses.icon}`} />
          </div>
        </PageHero>

        {/* Content */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Description */}
              <div className="mb-12">
                <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                  {t('Overview', 'अवलोकन')}
                </h2>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {institution.description[language]}
                </p>
              </div>

              {/* Facilities */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="font-heading">{t('Facilities', 'सुविधाएं')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {institution.facilities.map((facility, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <facility.icon className="h-5 w-5 text-primary" />
                        <span className="text-sm">{facility.label[language]}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Eligibility */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="font-heading">{t('Eligibility Criteria', 'पात्रता मानदंड')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {institution.eligibility.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                        <span className="text-muted-foreground">{item[language]}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Contact & CTA */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-heading">{t('Contact Information', 'संपर्क जानकारी')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-5 w-5 text-primary mt-0.5" />
                      <span className="text-muted-foreground">{institution.location[language]}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-5 w-5 text-primary" />
                      <span className="text-muted-foreground">{institution.contact}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      <span className="text-muted-foreground">
                        {t('Office: 10 AM - 6 PM (Mon-Sat)', 'कार्यालय: सुबह 10 - शाम 6 (सोम-शनि)')}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className={colorClasses.bg}>
                  <CardHeader>
                    <CardTitle className="font-heading">
                      {id === 'dharamshala' ? t('Book Now', 'अभी बुक करें') : t('Apply Now', 'अभी आवेदन करें')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      {id === 'dharamshala' 
                        ? t('Book your stay at Hirabaug Dharamshala', 'हीराबाग धर्मशाला में अपना प्रवास बुक करें')
                        : t('Start your admission application process', 'अपनी प्रवेश आवेदन प्रक्रिया शुरू करें')
                      }
                    </p>
                    <Link to={`/admissions/${id}`}>
                      <Button className="w-full gap-2">
                        <ExternalLink className="h-4 w-4" />
                        {id === 'dharamshala' ? t('Booking Portal', 'बुकिंग पोर्टल') : t('Login / Apply', 'लॉगिन / आवेदन करें')}
                      </Button>
                    </Link>
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

export default Institution;
