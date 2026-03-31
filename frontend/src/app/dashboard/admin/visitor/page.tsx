'use client';

import { FutureModulePage } from '@/components/future/ComingSoonPlaceholder';
import { useLanguage } from '@/contexts/LanguageContext';

const visitorIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
  </svg>
);

export default function AdminVisitorPage() {
  const { t } = useLanguage();

  const plannedFeatures = [
    t('Centralized visitor registration and approval workflow', 'केंद्रीकृत आगंतुक पंजीकरण और अनुमोदन कार्यप्रवाह'),
    t('Real-time visitor tracking dashboard', 'वास्तविक समय आगंतुक ट्रैकिंग डैशबोर्ड'),
    t('Gate pass generation and validation system', 'गेट पास निर्माण और सत्यापन प्रणाली'),
    t('Blacklist management and access control', 'ब्लैकलिस्ट प्रबंधन और पहुंच नियंत्रण'),
    t('Visitor analytics and heat map reports', 'आगंतुक विश्लेषण और हीट मैप रिपोर्ट'),
    t('Emergency lockdown capability', 'आपातकालीन लॉकडाउन क्षमता'),
  ];

  return (
    <FutureModulePage
      title={t('Visitor Management System', 'आगंतुक प्रबंधन प्रणाली')}
      description={t('Manage visitor registration, approvals, and security', 'आगंतुक पंजीकरण, अनुमोदन और सुरक्षा प्रबंधित करें')}
      fullDescription={t(
        'This module will provide comprehensive visitor management capabilities including pre-registration workflows, real-time tracking dashboards, gate pass validation, and security features like blacklist management and emergency lockdown capabilities.',
        'यह मॉड्यूल पूर्व-पंजीकरण कार्यप्रवाह, वास्तविक समय ट्रैकिंग डैशबोर्ड, गेट पास सत्यापन और ब्लैकलिस्ट प्रबंधन और आपातकालीन लॉकडाउन क्षमताओं जैसी सुरक्षा सुविधाओं सहित व्यापक आगंतुक प्रबंधन क्षमताएं प्रदान करेगा।'
      )}
      icon={visitorIcon}
      featureFlag="FEAT_VISITOR_MANAGEMENT"
      estimatedLaunch="Q3 2026"
      plannedFeatures={plannedFeatures}
    />
  );
}
