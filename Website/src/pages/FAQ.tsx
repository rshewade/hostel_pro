import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const FAQ = () => {
  const { t, language } = useLanguage();

  const faqs = [
    {
      question: { en: 'Who can apply for hostel admission?', hi: 'छात्रावास प्रवेश के लिए कौन आवेदन कर सकता है?' },
      answer: { en: 'Students belonging to the Digambar Jain community who are enrolled in recognized colleges/universities in Mumbai can apply. A recommendation from a Jain Sangh or known reference is required.', hi: 'दिगंबर जैन समुदाय से संबंधित छात्र जो मुंबई में मान्यता प्राप्त कॉलेज/विश्वविद्यालयों में नामांकित हैं, आवेदन कर सकते हैं। जैन संघ या ज्ञात संदर्भ से अनुशंसा आवश्यक है।' },
    },
    {
      question: { en: 'What is the admission process?', hi: 'प्रवेश प्रक्रिया क्या है?' },
      answer: { en: 'Applications can be submitted through our online portal. After verification of documents, eligible candidates will be called for an interview. Final selection is based on academic merit and availability of seats.', hi: 'आवेदन हमारे ऑनलाइन पोर्टल के माध्यम से जमा किए जा सकते हैं। दस्तावेजों के सत्यापन के बाद, पात्र उम्मीदवारों को साक्षात्कार के लिए बुलाया जाएगा। अंतिम चयन शैक्षणिक योग्यता और सीटों की उपलब्धता पर आधारित है।' },
    },
    {
      question: { en: 'What are the hostel fees?', hi: 'छात्रावास शुल्क क्या है?' },
      answer: { en: 'Hostel fees are kept minimal to ensure affordability. The exact fee structure varies based on room type and is disclosed during the admission process. Scholarships are available for deserving students.', hi: 'सामर्थ्य सुनिश्चित करने के लिए छात्रावास शुल्क न्यूनतम रखा जाता है। सटीक शुल्क संरचना कमरे के प्रकार के आधार पर भिन्न होती है और प्रवेश प्रक्रिया के दौरान बताई जाती है। योग्य छात्रों के लिए छात्रवृत्ति उपलब्ध है।' },
    },
    {
      question: { en: 'How can I book a room at Dharamshala?', hi: 'मैं धर्मशाला में कमरा कैसे बुक कर सकता हूं?' },
      answer: { en: 'Rooms can be booked through our online booking portal or by contacting the trust office. Advance booking is recommended, especially during peak seasons and religious festivals.', hi: 'कमरे हमारे ऑनलाइन बुकिंग पोर्टल के माध्यम से या ट्रस्ट कार्यालय से संपर्क करके बुक किए जा सकते हैं। अग्रिम बुकिंग की सिफारिश की जाती है, विशेष रूप से पीक सीजन और धार्मिक त्योहारों के दौरान।' },
    },
    {
      question: { en: 'Are meals provided in the hostel?', hi: 'क्या छात्रावास में भोजन प्रदान किया जाता है?' },
      answer: { en: 'Yes, pure vegetarian Jain meals are provided in both hostels. The kitchen follows strict Jain dietary guidelines including no root vegetables after sunset.', hi: 'हां, दोनों छात्रावासों में शुद्ध शाकाहारी जैन भोजन प्रदान किया जाता है। रसोई सूर्यास्त के बाद कोई जड़ वाली सब्जियां नहीं सहित सख्त जैन आहार दिशानिर्देशों का पालन करती है।' },
    },
    {
      question: { en: 'How can I donate to the trust?', hi: 'मैं ट्रस्ट को दान कैसे कर सकता हूं?' },
      answer: { en: 'Donations can be made via bank transfer, cheque, or in person at the trust office. All donations are eligible for tax benefits under Section 80G. Contact our office for bank details.', hi: 'दान बैंक ट्रांसफर, चेक, या ट्रस्ट कार्यालय में व्यक्तिगत रूप से किया जा सकता है। सभी दान धारा 80जी के तहत कर लाभ के लिए पात्र हैं। बैंक विवरण के लिए हमारे कार्यालय से संपर्क करें।' },
    },
    {
      question: { en: 'What facilities are available for girls?', hi: 'लड़कियों के लिए क्या सुविधाएं उपलब्ध हैं?' },
      answer: { en: 'R.R. Shravika Ashram provides secure accommodation with women-only staff, 24/7 security, CCTV surveillance, library, study hall, and recreational facilities specifically designed for female students.', hi: 'आर.आर. श्राविका आश्रम महिला छात्रों के लिए विशेष रूप से डिज़ाइन की गई केवल महिला कर्मचारियों, 24/7 सुरक्षा, सीसीटीवी निगरानी, पुस्तकालय, अध्ययन कक्ष और मनोरंजक सुविधाओं के साथ सुरक्षित आवास प्रदान करता है।' },
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <PageHero
          title={t('Frequently Asked Questions', 'अक्सर पूछे जाने वाले प्रश्न')}
          subtitle={t('Find answers to common questions about our trust and services', 'हमारे ट्रस्ट और सेवाओं के बारे में सामान्य प्रश्नों के उत्तर खोजें')}
        />

        {/* FAQ */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-4">
                    <AccordionTrigger className="text-left font-heading font-semibold hover:no-underline">
                      {faq.question[language]}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                      {faq.answer[language]}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;
