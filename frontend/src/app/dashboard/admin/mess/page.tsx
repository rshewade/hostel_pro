'use client';

import { FutureModulePage } from '@/components/future/ComingSoonPlaceholder';
import { useLanguage } from '@/contexts/LanguageContext';

const messIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default function AdminMessPage() {
  const { t } = useLanguage();

  const plannedFeatures = [
    t('Centralized mess menu planning and scheduling', 'केंद्रीकृत मेस मेनू योजना और शेड्यूलिंग'),
    t('Food inventory and supplier management', 'खाद्य सूची और आपूर्तिकर्ता प्रबंधन'),
    t('Mess attendance tracking and billing reconciliation', 'मेस उपस्थिति ट्रैकिंग और बिलिंग समाधान'),
    t('Special diet management (Jain, medical requirements)', 'विशेष आहार प्रबंधन (जैन, चिकित्सा आवश्यकताएं)'),
    t('Food quality monitoring and feedback analysis', 'खाद्य गुणवत्ता निगरानी और प्रतिक्रिया विश्लेषण'),
    t('Mess revenue and expense reporting', 'मेस राजस्व और व्यय रिपोर्टिंग'),
  ];

  return (
    <FutureModulePage
      title={t('Mess Management Admin', 'मेस प्रबंधन व्यवस्थापक')}
      description={t('Configure mess operations, menus, and billing', 'मेस संचालन, मेनू और बिलिंग कॉन्फ़िगर करें')}
      fullDescription={t(
        'This admin module will provide comprehensive mess management capabilities including menu planning, inventory tracking, attendance-based billing, special diet management, and detailed analytics on food costs and student satisfaction.',
        'यह व्यवस्थापक मॉड्यूल मेनू योजना, सूची ट्रैकिंग, उपस्थिति-आधारित बिलिंग, विशेष आहार प्रबंधन और खाद्य लागत और छात्र संतुष्टि पर विस्तृत विश्लेषण सहित व्यापक मेस प्रबंधन क्षमताएं प्रदान करेगा।'
      )}
      icon={messIcon}
      featureFlag="FEAT_MESS_MANAGEMENT"
      estimatedLaunch="Q1 2026"
      plannedFeatures={plannedFeatures}
    />
  );
}
