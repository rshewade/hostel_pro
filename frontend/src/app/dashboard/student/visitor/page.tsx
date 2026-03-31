'use client';

import { FutureModulePage } from '@/components/future/ComingSoonPlaceholder';
import { useLanguage } from '@/contexts/LanguageContext';

const visitorIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
  </svg>
);

export default function StudentVisitorPage() {
  const { t } = useLanguage();

  const plannedFeatures = [
    t('Pre-register visitors and generate QR codes for check-in', 'आगंतुकों को पूर्व-पंजीकृत करें और चेक-इन के लिए QR कोड जनरेट करें'),
    t('Real-time visitor tracking within premises', 'परिसर के भीतर रीयल-टाइम आगंतुक ट्रैकिंग'),
    t('Automated entry/exit notifications to students', 'छात्रों को स्वचालित प्रवेश/निकास सूचनाएं'),
    t('Secure visitor log with ID verification', 'आईडी सत्यापन के साथ सुरक्षित आगंतुक लॉग'),
    t('Blacklist management for restricted individuals', 'प्रतिबंधित व्यक्तियों के लिए ब्लैकलिस्ट प्रबंधन'),
    t('Generate visitor reports for security audits', 'सुरक्षा ऑडिट के लिए आगंतुक रिपोर्ट जनरेट करें'),
  ];

  return (
    <FutureModulePage
      title={t('Visitor Management', 'आगंतुक प्रबंधन')}
      description={t('Pre-register visitors and manage gate passes', 'आगंतुकों को पूर्व-पंजीकृत करें और गेट पास प्रबंधित करें')}
      fullDescription={t('This module will allow you to pre-register your expected visitors, generate gate passes, and receive notifications when visitors arrive. You can also view the complete visitor history for your room.', 'यह मॉड्यूल आपको अपने अपेक्षित आगंतुकों को पूर्व-पंजीकृत करने, गेट पास जनरेट करने, और आगंतुकों के आगमन पर सूचनाएं प्राप्त करने की अनुमति देगा। आप अपने कमरे का पूरा आगंतुक इतिहास भी देख सकते हैं।')}
      icon={visitorIcon}
      featureFlag="FEAT_VISITOR_MANAGEMENT"
      estimatedLaunch="Q3 2026"
      plannedFeatures={plannedFeatures}
    />
  );
}
