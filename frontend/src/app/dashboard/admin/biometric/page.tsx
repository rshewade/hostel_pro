'use client';

import { FutureModulePage } from '@/components/future/ComingSoonPlaceholder';
import { useLanguage } from '@/contexts/LanguageContext';

const biometricIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

export default function AdminBiometricPage() {
  const { t } = useLanguage();

  const plannedFeatures = [
    t('Configure and manage biometric devices across all hostels', 'सभी छात्रावासों में बायोमेट्रिक उपकरणों को कॉन्फ़िगर और प्रबंधित करें'),
    t('Real-time attendance monitoring dashboard', 'वास्तविक समय उपस्थिति निगरानी डैशबोर्ड'),
    t('Automated alerts for irregular attendance patterns', 'अनियमित उपस्थिति पैटर्न के लिए स्वचालित अलर्ट'),
    t('Generate compliance reports for management', 'प्रबंधन के लिए अनुपालन रिपोर्ट तैयार करें'),
    t('Manage student biometric enrollment and updates', 'छात्र बायोमेट्रिक नामांकन और अपडेट प्रबंधित करें'),
    t('Integration with existing CCTV and security systems', 'मौजूदा सीसीटीवी और सुरक्षा प्रणालियों के साथ एकीकरण'),
  ];

  return (
    <FutureModulePage
      title={t('Biometric Attendance Management', 'बायोमेट्रिक उपस्थिति प्रबंधन')}
      description={t('Configure devices and monitor attendance across hostels', 'उपकरणों को कॉन्फ़िगर करें और छात्रावासों में उपस्थिति की निगरानी करें')}
      fullDescription={t(
        'This admin module will enable you to manage biometric attendance terminals across all hostel locations, monitor real-time attendance data, configure automated alerts for irregular patterns, and generate comprehensive reports for management review.',
        'यह व्यवस्थापक मॉड्यूल आपको सभी छात्रावास स्थानों पर बायोमेट्रिक उपस्थिति टर्मिनलों का प्रबंधन करने, वास्तविक समय उपस्थिति डेटा की निगरानी करने, अनियमित पैटर्न के लिए स्वचालित अलर्ट कॉन्फ़िगर करने और प्रबंधन समीक्षा के लिए व्यापक रिपोर्ट तैयार करने में सक्षम बनाएगा।'
      )}
      icon={biometricIcon}
      featureFlag="FEAT_BIOMETRIC_ATTENDANCE"
      estimatedLaunch="Q2 2026"
      plannedFeatures={plannedFeatures}
    />
  );
}
