'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminRenewalList } from '@/components/renewal/AdminRenewalList';
import { AdminRenewalDetail } from '@/components/renewal/AdminRenewalDetail';
import { Spinner } from '@/components/feedback/Spinner';
import { useLanguage } from '@/contexts/LanguageContext';

interface RenewalRecord {
  id: string;
  student_id: string;
  student_name: string;
  vertical: string;
  room: string;
  type: string;
  status: string;
  days_remaining: number;
  documents_uploaded: number;
  documents_required: number;
  allocated_at: string;
  renewal_due_date: string;
}

// Helper to calculate academic year
function getAcademicYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  if (month >= 5) {
    return `${year}-${String(year + 1).slice(2)}`;
  }
  return `${year - 1}-${String(year).slice(2)}`;
}

function getSemesterPeriod(): string {
  const month = new Date().getMonth();
  return month >= 5 && month <= 10 ? 'SEMESTER_1' : 'SEMESTER_2';
}

export default function AdminRenewalPage() {
  const { t } = useLanguage();
  const [selectedRenewal, setSelectedRenewal] = useState<string | null>(null);
  const [currentVertical, setCurrentVertical] = useState('BOYS');
  const [renewalDetail, setRenewalDetail] = useState<RenewalRecord | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  // Fetch renewal detail when a renewal is selected
  const fetchRenewalDetail = useCallback(async (renewalId: string) => {
    setIsLoadingDetail(true);
    try {
      const res = await fetch('/api/renewals', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : undefined,
      });
      const data = await res.json();
      const renewals = data?.data || [];
      const found = renewals.find((r: RenewalRecord) => r.id === renewalId);
      setRenewalDetail(found || null);
    } catch (err) {
      console.error('Failed to fetch renewal detail:', err);
      setRenewalDetail(null);
    } finally {
      setIsLoadingDetail(false);
    }
  }, []);

  useEffect(() => {
    if (selectedRenewal) {
      fetchRenewalDetail(selectedRenewal);
    } else {
      setRenewalDetail(null);
    }
  }, [selectedRenewal, fetchRenewalDetail]);

  const handleApprove = async (id: string, remarks: string, notifyStudent: boolean, notifyParent: boolean) => {
    try {
      await fetch(`/api/renewals`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
        body: JSON.stringify({ id, action: 'APPROVE', remarks, notify_student: notifyStudent, notify_parent: notifyParent }),
      });
    } catch (err) {
      console.error('Failed to approve renewal:', err);
    }
    setSelectedRenewal(null);
  };

  const handleReject = async (id: string, remarks: string, notifyStudent: boolean, notifyParent: boolean) => {
    try {
      await fetch(`/api/renewals`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
        body: JSON.stringify({ id, action: 'REJECT', remarks, notify_student: notifyStudent, notify_parent: notifyParent }),
      });
    } catch (err) {
      console.error('Failed to reject renewal:', err);
    }
    setSelectedRenewal(null);
  };

  if (selectedRenewal) {
    if (isLoadingDetail) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <Spinner size="lg" />
          <span className="ml-3" style={{ color: 'var(--text-secondary)' }}>
            {t('Loading renewal details...', 'नवीनीकरण विवरण लोड हो रहे हैं...')}
          </span>
        </div>
      );
    }

    // Map API status to component-expected status
    const mapStatus = (apiStatus: string | undefined) => {
      const statusMap: Record<string, 'NOT_STARTED' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED'> = {
        'NOT_DUE': 'NOT_STARTED',
        'UPCOMING': 'NOT_STARTED',
        'DUE_SOON': 'IN_PROGRESS',
        'OVERDUE': 'IN_PROGRESS',
        'SUBMITTED': 'UNDER_REVIEW',
        'UNDER_REVIEW': 'UNDER_REVIEW',
        'APPROVED': 'APPROVED',
        'REJECTED': 'REJECTED',
      };
      return statusMap[apiStatus || ''] || 'NOT_STARTED';
    };

    return (
      <div className="mx-auto max-w-7xl">
        <AdminRenewalDetail
          renewalId={selectedRenewal}
          studentName={renewalDetail?.student_name || 'Unknown Student'}
          studentId={renewalDetail?.student_id || ''}
          vertical={renewalDetail?.vertical || currentVertical}
          room={renewalDetail?.room || 'Unassigned'}
          type="RENEWAL"
          status={mapStatus(renewalDetail?.status)}
          academicYear={getAcademicYear()}
          period={getSemesterPeriod()}
          documentsUploaded={[]}
          paymentStatus="PENDING"
          amountDue={0}
          amountPaid={0}
          consentGiven={false}
          consentTimestamp={null}
          createdAt={renewalDetail?.allocated_at || new Date().toISOString()}
          submittedAt={null}
          reviewedAt={null}
          approvedAt={null}
          superintendentRemarks={null}
          onBack={() => setSelectedRenewal(null)}
          onApprove={(remarks, notifyStudent, notifyParent) => handleApprove(selectedRenewal, remarks, notifyStudent, notifyParent)}
          onReject={(remarks, notifyStudent, notifyParent) => handleReject(selectedRenewal, remarks, notifyStudent, notifyParent)}
          onRequestChanges={() => {}}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <AdminRenewalList
        title={t('Renewal Applications', 'नवीनीकरण आवेदन')}
        showVerticalFilter={true}
        currentVertical={currentVertical}
        onViewDetail={(id) => setSelectedRenewal(id)}
        onApprove={(id) => handleApprove(id, '', true, true)}
        onReject={(id) => handleReject(id, '', true, true)}
      />
    </div>
  );
}
