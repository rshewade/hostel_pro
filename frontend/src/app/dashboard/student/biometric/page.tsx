'use client';

import { FutureModulePage, ComingSoonPlaceholder } from '@/components/future/ComingSoonPlaceholder';
import { useLanguage } from '@/contexts/LanguageContext';

const biometricIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

export default function StudentBiometricPage() {
  const { t } = useLanguage();

  const plannedFeatures = [
    t('Real-time attendance tracking via fingerprint or facial recognition', 'फिंगरप्रिंट या चेहरे की पहचान के माध्यम से रीयल-टाइम उपस्थिति ट्रैकिंग'),
    t('Automated attendance reports and analytics', 'स्वचालित उपस्थिति रिपोर्ट और विश्लेषण'),
    t('Integration with leave management system', 'अवकाश प्रबंधन प्रणाली के साथ एकीकरण'),
    t('Secure biometric data storage with DPDP compliance', 'DPDP अनुपालन के साथ सुरक्षित बायोमेट्रिक डेटा संग्रहण'),
    t('Parent notification on arrival/departure', 'आगमन/प्रस्थान पर अभिभावक सूचना'),
    t('Missing attendance alerts and reminders', 'अनुपस्थित उपस्थिति अलर्ट और अनुस्मारक'),
  ];

  return (
    <FutureModulePage
      title={t('Biometric Attendance', 'बायोमेट्रिक उपस्थिति')}
      description={t('Track your attendance using fingerprint or facial recognition', 'फिंगरप्रिंट या चेहरे की पहचान का उपयोग करके अपनी उपस्थिति ट्रैक करें')}
      fullDescription={t('This module will enable you to mark your daily attendance using secure biometric verification. Simply scan your fingerprint or use facial recognition at the designated terminals when entering and exiting the hostel premises.', 'यह मॉड्यूल आपको सुरक्षित बायोमेट्रिक सत्यापन का उपयोग करके अपनी दैनिक उपस्थिति दर्ज करने में सक्षम करेगा। छात्रावास परिसर में प्रवेश और निकास के समय निर्दिष्ट टर्मिनलों पर बस अपना फिंगरप्रिंट स्कैन करें या चेहरे की पहचान का उपयोग करें।')}
      icon={biometricIcon}
      featureFlag="FEAT_BIOMETRIC_ATTENDANCE"
      estimatedLaunch="Q2 2026"
      plannedFeatures={plannedFeatures}
    />
  );
}
