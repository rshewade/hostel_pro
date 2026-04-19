'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components';
import { useLanguage } from '@/contexts/LanguageContext';
import { Spinner } from '@/components/feedback/Spinner';
import { RenewalCard } from '@/components/renewal/RenewalCard';
import { RenewalStatusTracker, RenewalStatus } from '@/components/renewal/RenewalStatusTracker';
import { InfoReviewStep } from '@/components/renewal/InfoReviewStep';
import { DocumentReuploadStep } from '@/components/renewal/DocumentReuploadStep';
import { FeeTopupStep } from '@/components/renewal/FeeTopupStep';
import { ConsentStep } from '@/components/renewal/ConsentStep';
import { RenewalBanner } from '@/components/renewal/RenewalBanner';
import { FormWizard } from '@/components/forms/FormWizard';
import { ArrowLeft, ArrowRight, CheckCircle, FileText, IndianRupee, Shield } from 'lucide-react';

const STEPS = [
  {
    id: 'review',
    title: 'Review Info',
    description: 'Verify your personal and academic details',
    icon: <CheckCircle className="w-5 h-5" />,
    component: InfoReviewStep,
  },
  {
    id: 'documents',
    title: 'Documents',
    description: 'Upload required documents',
    icon: <FileText className="w-5 h-5" />,
    component: DocumentReuploadStep,
  },
  {
    id: 'payment',
    title: 'Payment',
    description: 'Complete fee top-up',
    icon: <IndianRupee className="w-5 h-5" />,
    component: FeeTopupStep,
  },
  {
    id: 'consent',
    title: 'Consent',
    description: 'DPDP consent renewal',
    icon: <Shield className="w-5 h-5" />,
    component: ConsentStep,
  },
];

// Helper to calculate academic year from current date
function getAcademicYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed
  // Academic year starts in June (month 5)
  if (month >= 5) {
    return `${year}-${String(year + 1).slice(2)}`;
  }
  return `${year - 1}-${String(year).slice(2)}`;
}

// Helper to calculate semester period
function getSemesterPeriod(): string {
  const month = new Date().getMonth();
  return month >= 5 && month <= 10 ? 'SEMESTER 1' : 'SEMESTER 2';
}

interface UserProfile {
  id: string;
  full_name: string;
  vertical: string;
}

interface RenewalData {
  id: string;
  status: string;
  days_remaining: number;
}

export default function StudentRenewalPage() {
  const { t } = useLanguage();
  const [currentStatus, setCurrentStatus] = useState<RenewalStatus>('IN_PROGRESS');
  const [renewalCompleted, setRenewalCompleted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [renewalInfo, setRenewalInfo] = useState<RenewalData | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    async function fetchProfileAndRenewal() {
      try {
        // Get userId from auth session
        const sessionRes = await fetch('/api/auth/session');
        const sessionData = await sessionRes.json();
        const userId = sessionData?.data?.user?.id || sessionData?.user?.id || '';

        if (userId) {
          // Fetch profile
          const profileRes = await fetch(`/api/users/profile?user_id=${userId}`);
          const profileData = await profileRes.json();
          if (profileData?.data) {
            setProfile(profileData.data);
          }

          // Fetch renewal info
          const renewalRes = await fetch(`/api/renewals?student_id=${userId}`);
          const renewalData = await renewalRes.json();
          const renewals = renewalData?.data || [];
          if (renewals.length > 0) {
            setRenewalInfo(renewals[0]);
            // Map API renewal status to component status
            const apiStatus = renewals[0].status;
            if (apiStatus === 'SUBMITTED' || apiStatus === 'UNDER_REVIEW') {
              setCurrentStatus('SUBMITTED');
            } else if (apiStatus === 'APPROVED') {
              setCurrentStatus('APPROVED');
              setRenewalCompleted(true);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load profile/renewal data:', err);
      } finally {
        setIsLoadingProfile(false);
      }
    }
    fetchProfileAndRenewal();
  }, []);

  const studentId = profile?.id || '';
  const studentName = profile?.full_name || '';
  const vertical = profile?.vertical || '';
  const academicYear = getAcademicYear();
  const period = getSemesterPeriod();
  const daysRemaining = renewalInfo?.days_remaining ?? 0;

  const handleSubmit = async (data: any) => {
    setRenewalCompleted(true);
    setCurrentStatus('SUBMITTED');
  };

  if (renewalCompleted) {
    return (
      <div style={{ background: 'var(--bg-page)' }} className="min-h-screen">
        <main className="px-6 py-8">
          <div className="mx-auto max-w-4xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {t('6-Month Stay Renewal', '6 महीने का रहने का नवीनीकरण')}
                </h1>
                <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'var(--bg-accent)', color: 'var(--text-on-accent)' }}>
                  {vertical || 'Hostel'}
                </span>
              </div>
            </div>

            <div className="text-center mb-8">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                {t('Renewal Submitted Successfully!', 'नवीनीकरण सफलतापूर्वक जमा हो गया!')}
              </h1>
              <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                {t('Your renewal application has been submitted and is now under review.', 'आपका नवीनीकरण आवेदन जमा कर दिया गया है और अब समीक्षाधीन है।')}
              </p>
            </div>

            <RenewalBanner
              type="success"
              title="Application Received"
              message="Your renewal application has been submitted successfully. The administration will review your application and documents. You will be notified once a decision is made."
              daysRemaining={daysRemaining}
              className="mb-6"
            />

            <div className="card p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                {t("What's Next?", 'आगे क्या?')}
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-blue-600">1</span>
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{t('Application Under Review', 'आवेदन समीक्षाधीन')}</p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {t('Your application is being reviewed by the superintendent', 'आपका आवेदन अधीक्षक द्वारा समीक्षा किया जा रहा है')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-gray-600">2</span>
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{t('Decision Notification', 'निर्णय सूचना')}</p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {t('You will receive an SMS/WhatsApp notification once a decision is made', 'निर्णय लिए जाने पर आपको SMS/WhatsApp सूचना प्राप्त होगी')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-gray-600">3</span>
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{t('View Status Online', 'ऑनलाइन स्थिति देखें')}</p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {t('Track your application status anytime on this page', 'इस पृष्ठ पर किसी भी समय अपने आवेदन की स्थिति ट्रैक करें')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <RenewalStatusTracker
              currentStatus="SUBMITTED"
              showLabels={true}
              size="md"
              className="mb-6"
            />

            <div className="flex justify-center">
              <Button variant="secondary" onClick={() => window.location.href = '/dashboard/student'}>
                {t('Return to Dashboard', 'डैशबोर्ड पर वापस जाएं')}
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg-page)' }} className="min-h-screen">
      <main className="px-6 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {t('6-Month Stay Renewal', '6 महीने का रहने का नवीनीकरण')}
              </h1>
              <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'var(--bg-accent)', color: 'var(--text-on-accent)' }}>
                {vertical || 'Hostel'} | {academicYear} | {period}
              </span>
            </div>
          </div>

          {isLoadingProfile ? (
            <div className="flex items-center justify-center py-8">
              <Spinner size="md" />
              <span className="ml-3" style={{ color: 'var(--text-secondary)' }}>
                {t('Loading your renewal info...', 'आपकी नवीनीकरण जानकारी लोड हो रही है...')}
              </span>
            </div>
          ) : currentStep === 0 && (
            <div className="mb-6">
              <RenewalCard
                studentId={studentId}
                studentName={studentName}
                vertical={vertical || 'Hostel'}
                renewalStatus={currentStatus}
                daysRemaining={daysRemaining}
                academicYear={academicYear}
                period={period}
                onContinueRenewal={() => {}}
              />
            </div>
          )}

          <div className="mb-6">
            <RenewalStatusTracker
              currentStatus={currentStatus}
              showLabels={true}
              size="md"
            />
          </div>

          <FormWizard
            steps={STEPS}
            onSubmit={handleSubmit}
            onSubmitLabel="Submit Renewal"
            orientation="horizontal"
          />
        </div>
      </main>
    </div>
  );
}
