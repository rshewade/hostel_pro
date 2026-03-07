import { useLanguage } from '@/contexts/LanguageContext';
import { BookOpen, Heart, Shield, Sparkles } from 'lucide-react';

const MissionSection = () => {
  const { t } = useLanguage();

  const values = [
    {
      icon: BookOpen,
      title: t('Vidya Daan', 'विद्या दान'),
      description: t(
        'The gift of knowledge - supporting education as the highest form of charity.',
        'ज्ञान का दान - दान के उच्चतम रूप के रूप में शिक्षा का समर्थन।'
      ),
    },
    {
      icon: Heart,
      title: t('Seva Bhavna', 'सेवा भावना'),
      description: t(
        'Spirit of selfless service to the community and those in need.',
        'समुदाय और जरूरतमंदों की निस्वार्थ सेवा की भावना।'
      ),
    },
    {
      icon: Shield,
      title: t('Dharma', 'धर्म'),
      description: t(
        'Upholding Jain principles of non-violence, truth, and righteous conduct.',
        'अहिंसा, सत्य और सदाचार के जैन सिद्धांतों को बनाए रखना।'
      ),
    },
    {
      icon: Sparkles,
      title: t('Samyak Darshan', 'सम्यक दर्शन'),
      description: t(
        'Right faith and vision guiding all our charitable endeavors.',
        'सम्यक श्रद्धा और दृष्टि हमारे सभी धर्मार्थ प्रयासों का मार्गदर्शन करती है।'
      ),
    },
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <p className="text-primary font-medium mb-2">
              {t('Our Mission', 'हमारा मिशन')}
            </p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-6">
              {t(
                'Serving with Faith, Compassion & Dedication',
                'श्रद्धा, करुणा और समर्पण के साथ सेवा'
              )}
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              {t(
                'Seth Hirachand Gumanji Jain Trust has been a beacon of hope and service for the Jain community since 1940. Rooted in the values of Vidya Daan (gift of education), our trust continues the legacy of the illustrious Javeri family in supporting students, pilgrims, and families in need.',
                'सेठ हीराचंद गुमानजी जैन ट्रस्ट 1940 से जैन समुदाय के लिए आशा और सेवा का प्रतीक रहा है। विद्या दान (शिक्षा का उपहार) के मूल्यों में निहित, हमारा ट्रस्ट छात्रों, तीर्थयात्रियों और जरूरतमंद परिवारों की सहायता में प्रसिद्ध जावेरी परिवार की विरासत को जारी रखता है।'
              )}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {t(
                'Through our Boys\' Hostel, Girls\' Hostel (R.R. Shravika Ashram), and Dharamshala (Hirabaug), we strive to provide affordable accommodation, quality facilities, and a nurturing environment aligned with Jain ethics and traditions.',
                'हमारे बालक छात्रावास, बालिका छात्रावास (आर.आर. श्राविका आश्रम), और धर्मशाला (हीराबाग) के माध्यम से, हम जैन नैतिकता और परंपराओं के अनुरूप किफायती आवास, गुणवत्तापूर्ण सुविधाएं और पोषण वातावरण प्रदान करने का प्रयास करते हैं।'
              )}
            </p>
          </div>

          {/* Values Grid */}
          <div className="grid grid-cols-2 gap-4">
            {values.map((value, index) => (
              <div
                key={index}
                className="p-6 rounded-xl bg-muted/50 hover:bg-muted transition-colors group"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <value.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-foreground mb-2">
                  {value.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MissionSection;
