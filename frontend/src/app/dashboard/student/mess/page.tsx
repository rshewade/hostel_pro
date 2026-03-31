'use client';

import { FutureModulePage } from '@/components/future/ComingSoonPlaceholder';
import { useLanguage } from '@/contexts/LanguageContext';

const messIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default function StudentMessPage() {
  const { t } = useLanguage();

  const plannedFeatures = [
    t('Daily mess menu display with nutritional information', 'पोषण संबंधी जानकारी के साथ दैनिक मेस मेनू प्रदर्शन'),
    t('Mess attendance tracking and billing', 'मेस उपस्थिति ट्रैकिंग और बिलिंग'),
    t('Special meal requests (Jain food, fasting days, etc.)', 'विशेष भोजन अनुरोध (जैन भोजन, उपवास के दिन, आदि)'),
    t('Mess fee payment and refund management', 'मेस शुल्क भुगतान और वापसी प्रबंधन'),
    t('Feedback and rating system for food quality', 'भोजन की गुणवत्ता के लिए प्रतिक्रिया और रेटिंग प्रणाली'),
    t('Weekly/monthly consumption reports', 'साप्ताहिक/मासिक उपभोग रिपोर्ट'),
  ];

  return (
    <FutureModulePage
      title={t('Mess Management', 'मेस प्रबंधन')}
      description={t('View mess menus, track attendance, and manage food preferences', 'मेस मेनू देखें, उपस्थिति ट्रैक करें, और भोजन प्राथमिकताएं प्रबंधित करें')}
      fullDescription={t('This module will help you stay informed about the daily mess menu, track your mess attendance, and manage special food requirements. You can also provide feedback on food quality and view your mess billing details.', 'यह मॉड्यूल आपको दैनिक मेस मेनू के बारे में जानकारी रखने, अपनी मेस उपस्थिति ट्रैक करने, और विशेष भोजन आवश्यकताओं को प्रबंधित करने में मदद करेगा। आप भोजन की गुणवत्ता पर प्रतिक्रिया भी दे सकते हैं और अपने मेस बिलिंग विवरण देख सकते हैं।')}
      icon={messIcon}
      featureFlag="FEAT_MESS_MANAGEMENT"
      estimatedLaunch="Q1 2026"
      plannedFeatures={plannedFeatures}
    />
  );
}
