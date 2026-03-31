'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components';
import { ComingSoonPlaceholder } from '@/components/future/ComingSoonPlaceholder';
import { DPDPComplianceBanner } from '@/components/audit/DPDPComplianceBanner';
import { useLanguage } from '@/contexts/LanguageContext';

interface StudentProfile {
  id: string;
  full_name: string;
  vertical: string;
  room_number?: string;
  joining_date?: string;
  check_in_confirmed?: boolean;
}

export default function StudentDashboard() {
  const { t } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [vertical, setVertical] = useState('Boys Hostel');
  const [status, setStatus] = useState('CHECKED_IN');
  const [roomNumber, setRoomNumber] = useState<string | null>(null);
  const [joiningDate, setJoiningDate] = useState<string | null>(null);
  const [academicYear, setAcademicYear] = useState<string>('');
  const [currentPeriod, setCurrentPeriod] = useState<string>('');
  const [renewalDaysRemaining, setRenewalDaysRemaining] = useState<number | null>(null);
  const [renewalDueDate, setRenewalDueDate] = useState<string | null>(null);
  const [feeDueDate, setFeeDueDate] = useState<string | null>(null);
  const [pendingFeeAmount, setPendingFeeAmount] = useState<number>(0);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          router.push('/login');
          return;
        }

        // Handle both JWT tokens (Supabase) and legacy base64 tokens
        let userId: string;
        try {
          if (token.includes('.')) {
            // JWT token format: header.payload.signature
            const payload = token.split('.')[1];
            // JWT uses base64url encoding, convert to standard base64
            const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
            const tokenData = JSON.parse(atob(base64));
            // Supabase JWT has 'sub' as user ID, but we store our userId separately
            userId = localStorage.getItem('userId') || tokenData.sub;
          } else {
            // Legacy base64 encoded JSON token
            const tokenData = JSON.parse(atob(token));
            userId = tokenData.userId;
          }
        } catch (e) {
          console.error('Failed to decode token:', e);
          router.push('/login');
          return;
        }

        if (!userId) {
          router.push('/login');
          return;
        }

        // Fetch user profile
        const profileResponse = await fetch(`/api/users/profile?user_id=${userId}`);
        if (profileResponse.ok) {
          const profileResult = await profileResponse.json();
          const userData = profileResult.data || profileResult;
          setProfile(userData);

          // Set vertical display name
          const verticalMap: Record<string, string> = {
            'BOYS': 'Boys Hostel',
            'GIRLS': 'Girls Ashram',
            'DHARAMSHALA': 'Dharamshala',
          };
          setVertical(verticalMap[userData.vertical] || userData.vertical || 'Boys Hostel');
        }

        // Fetch room allocation
        const allocationsResponse = await fetch(`/api/allocations?student_id=${userId}`);
        if (allocationsResponse.ok) {
          const allocationsResult = await allocationsResponse.json();
          const allocationsData = allocationsResult.data || allocationsResult || [];
          const activeAllocation = (Array.isArray(allocationsData) ? allocationsData : []).find(
            (a: any) => (a.student_user_id === userId || a.student_id === userId) && a.status === 'ACTIVE'
          );

          if (activeAllocation) {
            setStatus(activeAllocation.check_in_confirmed ? 'CHECKED_IN' : 'ALLOCATED');
            setJoiningDate(activeAllocation.allocated_at);

            // Fetch room details
            const roomsResponse = await fetch('/api/rooms');
            if (roomsResponse.ok) {
              const roomsResult = await roomsResponse.json();
              const roomsList = roomsResult.data || roomsResult || [];
              const room = (Array.isArray(roomsList) ? roomsList : []).find(
                (r: any) => r.id === activeAllocation.room_id
              );
              if (room) {
                setRoomNumber(room.room_number);
              }
            }
          } else {
            setStatus('NOT_ALLOCATED');
          }
        }

        // Fetch renewal data (academic year, period, days remaining)
        const renewalsResponse = await fetch(`/api/renewals`);
        if (renewalsResponse.ok) {
          const renewalsResult = await renewalsResponse.json();
          const renewalsData = renewalsResult.data || renewalsResult || [];
          const studentRenewal = (Array.isArray(renewalsData) ? renewalsData : []).find(
            (r: any) => r.student_id === userId
          );
          if (studentRenewal) {
            setRenewalDaysRemaining(studentRenewal.days_remaining);
            setRenewalDueDate(studentRenewal.renewal_due_date);
          }
        }

        // Fetch fee data for notifications
        const feesResponse = await fetch(`/api/fees?student_id=${userId}`);
        if (feesResponse.ok) {
          const feesResult = await feesResponse.json();
          const feesData = feesResult.data?.data || feesResult.data || [];
          const summary = feesResult.data?.summary || feesResult.summary || {};
          const pendingTotal = (summary.total_pending || 0) + (summary.total_overdue || 0);
          setPendingFeeAmount(pendingTotal);

          // Find nearest upcoming due date
          const now = new Date();
          const pendingFees = (Array.isArray(feesData) ? feesData : [])
            .filter((f: any) => f.status === 'PENDING' && new Date(f.due_date) > now)
            .sort((a: any, b: any) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
          if (pendingFees.length > 0) {
            setFeeDueDate(pendingFees[0].due_date);
          }
        }

        // Derive academic year and period from allocation date
        const allocationDate = joiningDate ? new Date(joiningDate) : new Date();
        const year = allocationDate.getFullYear();
        const month = allocationDate.getMonth(); // 0-indexed
        // Academic year runs June to May
        const ayStart = month >= 5 ? year : year - 1;
        setAcademicYear(`${ayStart}-${String(ayStart + 1).slice(2)}`);
        // Period: June-Nov = Semester 1, Dec-May = Semester 2
        const currentMonth = new Date().getMonth();
        setCurrentPeriod(currentMonth >= 5 && currentMonth <= 10 ? 'SEMESTER 1' : 'SEMESTER 2');
      } catch (err) {
        console.error('Error fetching profile data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [router]);

  const getStatusDisplay = () => {
    switch (status) {
      case 'CHECKED_IN':
        return { label: t('Checked-in', 'चेक-इन'), color: 'var(--color-green-600)' };
      case 'ALLOCATED':
        return { label: t('Room Allocated', 'कमरा आवंटित'), color: 'var(--color-blue-600)' };
      case 'NOT_ALLOCATED':
        return { label: t('Pending Allocation', 'आवंटन लंबित'), color: 'var(--color-gold-600)' };
      default:
        return { label: status, color: 'var(--color-gray-600)' };
    }
  };

  const statusDisplay = getStatusDisplay();

  if (loading) {
    return (
      <div style={{ background: 'var(--bg-page)' }} className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-900 mx-auto mb-4"></div>
          <p style={{ color: 'var(--text-secondary)' }}>{t('Loading dashboard...', 'डैशबोर्ड लोड हो रहा है...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg-page)' }} className="min-h-screen">
      <main className="px-6 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 p-6 rounded-lg" style={{ background: 'var(--surface-primary)' }}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-heading-2 mb-2" style={{ color: 'var(--text-primary)' }}>
                  {t('Welcome', 'स्वागत')}, {profile?.full_name || t('Student', 'छात्र')}!
                </h2>
                <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
                  {t('You are logged in as', 'आप लॉगिन हैं')} <strong>{profile?.full_name || t('Student', 'छात्र')}</strong> {t('at', 'में')} <strong>{vertical}</strong>
                </p>
                <p className="text-body-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                  {t('Academic Year', 'शैक्षणिक वर्ष')}: <strong>{academicYear || 'N/A'}</strong> | {t('Current Period', 'वर्तमान अवधि')}: <strong>{currentPeriod || 'N/A'}</strong>
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-medium text-white" style={{ background: statusDisplay.color }}>
                {statusDisplay.label}
              </span>
            </div>
          </div>

          {renewalDaysRemaining !== null && renewalDaysRemaining <= 30 && (
            <div className="mb-8 p-4 rounded-lg border-l-4" style={{ background: 'var(--bg-page)', borderLeftColor: 'var(--color-gold-500)' }}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔔</span>
                <div>
                  <h3 className="text-heading-4 mb-2" style={{ color: 'var(--text-primary)' }}>
                    {t('DPDP Consent Renewal Required', 'DPDP सहमति नवीनीकरण आवश्यक')}
                  </h3>
                  <p className="text-body-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                    {t('Your 6-month stay renewal is approaching. Please review and update your Data Protection and Privacy Principles consent before completing your renewal.', 'आपका 6 महीने का नवीनीकरण नज़दीक आ रहा है। कृपया अपना नवीनीकरण पूरा करने से पहले अपनी डेटा सुरक्षा और गोपनीयता सिद्धांत सहमति की समीक्षा करें और अपडेट करें।')}
                  </p>
                  <div className="flex gap-3">
                    <Button variant="primary" size="sm">
                      {t('Review Consent', 'सहमति की समीक्षा करें')}
                    </Button>
                    <a href="/dpdp-policy" className="text-sm" style={{ color: 'var(--text-link)' }}>
                      {t('Read Full Policy', 'पूरी नीति पढ़ें')}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="card p-6 text-center">
              <div className="text-3xl mb-3">💳</div>
              <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{t('Pay Fees', 'शुल्क भुगतान')}</h3>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{t('View and pay your pending dues', 'अपने लंबित शुल्क देखें और भुगतान करें')}</p>
              <Button variant="primary" size="md" fullWidth onClick={() => router.push('/dashboard/student/fees')}>{t('Go to Fees', 'शुल्क पर जाएं')}</Button>
            </div>

            <div className="card p-6 text-center">
              <div className="text-3xl mb-3">📄</div>
              <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{t('Download Letters', 'पत्र डाउनलोड करें')}</h3>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{t('Get admission and official documents', 'प्रवेश और आधिकारिक दस्तावेज़ प्राप्त करें')}</p>
              <Button variant="primary" size="md" fullWidth onClick={() => router.push('/dashboard/student/documents')}>{t('View Documents', 'दस्तावेज़ देखें')}</Button>
            </div>

            <div className="card p-6 text-center">
              <div className="text-3xl mb-3">🏖️</div>
              <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{t('Apply for Leave', 'अवकाश के लिए आवेदन')}</h3>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{t('Request leave from hostel', 'छात्रावास से अवकाश का अनुरोध करें')}</p>
              <Button variant="primary" size="md" fullWidth onClick={() => router.push('/dashboard/student/leave')}>{t('Apply Leave', 'अवकाश आवेदन')}</Button>
            </div>

            <div className="card p-6 text-center">
              <div className="text-3xl mb-3">🛏️</div>
              <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{t('Room Details', 'कमरे का विवरण')}</h3>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{t('View your room information', 'अपने कमरे की जानकारी देखें')}</p>
              <Button variant="primary" size="md" fullWidth onClick={() => router.push('/dashboard/student/room')}>{t('View Room', 'कमरा देखें')}</Button>
            </div>

            <div className="card p-6 text-center">
              <div className="text-3xl mb-3">📜</div>
              <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{t('Renewal', 'नवीनीकरण')}</h3>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{t('Renew your stay for next semester', 'अगले सेमेस्टर के लिए अपना रहना नवीनीकृत करें')}</p>
              <Button variant="primary" size="md" fullWidth onClick={() => router.push('/dashboard/student/renewal')}>
                {t('Renew Now', 'अभी नवीनीकरण करें')}
              </Button>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-heading-3 mb-4" style={{ color: 'var(--text-primary)' }}>{t('Coming Soon', 'जल्द आ रहा है')}</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <ComingSoonPlaceholder
                title={t('Biometric Attendance', 'बायोमेट्रिक उपस्थिति')}
                description={t('Mark attendance via fingerprint or face scan', 'फिंगरप्रिंट या फेस स्कैन से उपस्थिति दर्ज करें')}
                icon="👆"
                estimatedLaunch="Q2 2026"
                featureFlag="FEAT_BIOMETRIC_ATTENDANCE"
              />
              <ComingSoonPlaceholder
                title={t('Mess Management', 'मेस प्रबंधन')}
                description={t('View menus, track attendance, manage food preferences', 'मेनू देखें, उपस्थिति ट्रैक करें, भोजन प्राथमिकताएं प्रबंधित करें')}
                icon="🍽️"
                estimatedLaunch="Q1 2026"
                featureFlag="FEAT_MESS_MANAGEMENT"
              />
              <ComingSoonPlaceholder
                title={t('Visitor Management', 'आगंतुक प्रबंधन')}
                description={t('Pre-register visitors and manage gate passes', 'आगंतुकों को पूर्व-पंजीकृत करें और गेट पास प्रबंधित करें')}
                icon="👥"
                estimatedLaunch="Q3 2026"
                featureFlag="FEAT_VISITOR_MANAGEMENT"
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4 mb-8">
            <div className="card p-6 md:col-span-2">
              <h3 className="text-heading-4 mb-4" style={{ color: 'var(--text-primary)' }}>{t('Notifications', 'सूचनाएं')}</h3>
              <div className="space-y-3">
                {pendingFeeAmount > 0 && feeDueDate && (
                  <div className="flex items-start gap-3 p-3 rounded" style={{ background: 'var(--bg-page)' }}>
                    <span className="text-red-500 text-lg">⚠</span>
                    <div>
                      <p className="text-body font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{t('Fee payment due', 'शुल्क भुगतान बकाया')}</p>
                      <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                        {t('Due date', 'नियत तारीख')}: {new Date(feeDueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                )}
                {renewalDaysRemaining !== null && renewalDaysRemaining <= 60 && (
                  <div className="flex items-start gap-3 p-3 rounded" style={{ background: 'var(--bg-page)' }}>
                    <span style={{ color: 'var(--color-gold-600)' }} className="text-lg">📢</span>
                    <div>
                      <p className="text-body font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{t('Renewal reminder', 'नवीनीकरण अनुस्मारक')}</p>
                      <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                        {t(`Your 6-month renewal is due in ${renewalDaysRemaining} days`, `आपका 6 महीने का नवीनीकरण ${renewalDaysRemaining} दिनों में बकाया है`)}
                        {renewalDueDate && ` (${new Date(renewalDueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })})`}
                      </p>
                    </div>
                  </div>
                )}
                {renewalDaysRemaining !== null && renewalDaysRemaining <= 30 && (
                  <div className="flex items-start gap-3 p-3 rounded" style={{ background: 'var(--color-gold-50)', borderLeft: '3px solid var(--color-gold-500)' }}>
                    <span className="text-xl">🔔</span>
                    <div>
                      <p className="text-body font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{t('DPDP Consent Renewal Required', 'DPDP सहमति नवीनीकरण आवश्यक')}</p>
                      <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>{t('Please review and accept updated DPDP consent as part of your renewal process', 'कृपया अपने नवीनीकरण प्रक्रिया के हिस्से के रूप में अपडेट की गई DPDP सहमति की समीक्षा करें और स्वीकार करें')}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-heading-4 mb-4" style={{ color: 'var(--text-primary)' }}>{t('Quick Profile', 'त्वरित प्रोफ़ाइल')}</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>{t('Room No', 'कमरा नं')}:</span>
                <span className="text-body font-medium" style={{ color: 'var(--text-primary)' }}>
                  {roomNumber || t('Not Allocated', 'आवंटित नहीं')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>{t('Joining Date', 'प्रवेश तिथि')}:</span>
                <span className="text-body font-medium" style={{ color: 'var(--text-primary)' }}>
                  {joiningDate
                    ? new Date(joiningDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                    : t('Not Available', 'उपलब्ध नहीं')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>{t('Academic Year', 'शैक्षणिक वर्ष')}:</span>
                <span className="text-body font-medium" style={{ color: 'var(--text-primary)' }}>{academicYear || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>{t('Current Period', 'वर्तमान अवधि')}:</span>
                <span className="text-body font-medium" style={{ color: 'var(--text-primary)' }}>{currentPeriod || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>{t('Renewal Due', 'नवीनीकरण बकाया')}:</span>
                <span className="text-body font-medium" style={{ color: renewalDaysRemaining !== null && renewalDaysRemaining <= 30 ? 'var(--color-gold-600)' : 'var(--text-primary)' }}>
                  {renewalDaysRemaining !== null ? `${renewalDaysRemaining} ${t('days', 'दिन')}` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>{t('Status', 'स्थिति')}:</span>
                <span className="px-2 py-1 rounded text-xs font-medium text-white" style={{ background: statusDisplay.color }}>
                  {statusDisplay.label}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <DPDPComplianceBanner variant="footer" showPolicyLink={true} showRetentionLink={true} />
    </div>
  );
}
