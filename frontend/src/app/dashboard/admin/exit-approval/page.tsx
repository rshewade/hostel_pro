'use client';

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components';
import {
  ExitApprovalScreen,
  ExitApprovalData,
  ApprovalMetadata,
  OverrideReason,
  AuditEntry,
} from '@/components/exit';
import { ArrowLeft, AlertCircle } from 'lucide-react';

function ExitApprovalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestId = searchParams.get('id');

  const [approvalData, setApprovalData] = useState<ExitApprovalData | null>(null);
  const [auditTrail, setAuditTrail] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock user data - replace with actual auth
  const userRole = 'TRUSTEE';
  const userName = 'Admin User';
  const userId = 'admin-001';
  const canOverride = userRole === 'TRUSTEE'; // Only trustees can override

  // Fetch approval data on mount
  useEffect(() => {
    if (!requestId) {
      router.push('/dashboard/admin');
      return;
    }

    const fetchApprovalData = async () => {
      try {
        setLoading(true);

        // Mock API call - replace with actual API
        const response = await fetch(`/api/exit-requests/${requestId}/approval`);

        if (response.ok) {
          const data = await response.json();
          setApprovalData(data.approvalData);
          setAuditTrail(data.auditTrail || []);
        } else {
          throw new Error('Failed to fetch approval data');
        }
      } catch (error) {
        console.error('Error fetching approval data:', error);
        alert('Failed to load exit request. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchApprovalData();
  }, [requestId, router]);

  const handleApprove = async (metadata: ApprovalMetadata) => {
    try {
      // Mock API call - replace with actual API
      const response = await fetch(`/api/exit-requests/${requestId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metadata }),
      });

      if (response.ok) {
        // Add approval entry to audit trail
        const approvalEntry: AuditEntry = {
          id: Date.now().toString(),
          action: 'APPROVED',
          description: `Exit request approved by ${metadata.approverName}`,
          actor: metadata.approverName,
          actorRole: metadata.approverRole,
          timestamp: metadata.timestamp,
          metadata: {
            remarks: metadata.remarks,
            deviceInfo: metadata.deviceInfo,
            ipAddress: metadata.ipAddress,
          },
        };

        setAuditTrail((prev) => [approvalEntry, ...prev]);

        // Update approval data
        if (approvalData) {
          setApprovalData({
            ...approvalData,
            currentStatus: 'UNDER_CLEARANCE', // Status will be updated to APPROVED by backend
            approvalHistory: [metadata, ...(approvalData.approvalHistory || [])],
          });
        }

        alert('Exit request approved successfully! Student has been transitioned to exited status.');

        // Redirect back to dashboard after a delay
        setTimeout(() => {
          router.push('/dashboard/admin');
        }, 2000);
      } else {
        throw new Error('Failed to approve exit request');
      }
    } catch (error) {
      console.error('Error approving exit request:', error);
      alert('Failed to approve exit request. Please try again.');
    }
  };

  const handleReject = async (remarks: string) => {
    try {
      // Mock API call - replace with actual API
      const response = await fetch(`/api/exit-requests/${requestId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ remarks, rejectedBy: userName, rejectedByRole: userRole }),
      });

      if (response.ok) {
        // Add rejection entry to audit trail
        const rejectionEntry: AuditEntry = {
          id: Date.now().toString(),
          action: 'REJECTED',
          description: `Exit request rejected: ${remarks}`,
          actor: userName,
          actorRole: userRole,
          timestamp: new Date().toISOString(),
        };

        setAuditTrail((prev) => [rejectionEntry, ...prev]);

        alert('Exit request rejected. Student will be notified.');

        // Redirect back to dashboard
        setTimeout(() => {
          router.push('/dashboard/admin');
        }, 2000);
      } else {
        throw new Error('Failed to reject exit request');
      }
    } catch (error) {
      console.error('Error rejecting exit request:', error);
      alert('Failed to reject exit request. Please try again.');
    }
  };

  const handleOverride = async (
    reason: OverrideReason,
    justification: string,
    metadata: ApprovalMetadata
  ) => {
    try {
      // Mock API call - replace with actual API
      const response = await fetch(`/api/exit-requests/${requestId}/override`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, justification, metadata }),
      });

      if (response.ok) {
        // Add override entry to audit trail
        const overrideEntry: AuditEntry = {
          id: Date.now().toString(),
          action: 'STATUS_CHANGE',
          description: `ADMIN OVERRIDE: Approval reversed by ${metadata.approverName}. Reason: ${reason}`,
          actor: metadata.approverName,
          actorRole: metadata.approverRole,
          timestamp: metadata.timestamp,
          metadata: {
            overrideReason: reason,
            justification,
            referencedApprovalId: approvalData?.approvalHistory?.[0]?.approverId,
          },
        };

        setAuditTrail((prev) => [overrideEntry, ...prev]);

        // Update approval data
        if (approvalData && approvalData.approvalHistory && approvalData.approvalHistory.length > 0) {
          setApprovalData({
            ...approvalData,
            currentStatus: 'UNDER_CLEARANCE', // Reverted back to under clearance
            lastOverride: {
              metadata,
              reason,
              referencedApprovalId: approvalData.approvalHistory[0].approverId,
            },
          });
        }

        alert('Approval override executed successfully. This action has been prominently logged.');

        // Redirect back to dashboard after a delay
        setTimeout(() => {
          router.push('/dashboard/admin');
        }, 2000);
      } else {
        throw new Error('Failed to override approval');
      }
    } catch (error) {
      console.error('Error overriding approval:', error);
      alert('Failed to override approval. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-page)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading exit approval data...</p>
        </div>
      </div>
    );
  }

  if (!approvalData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-page)' }}>
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-600" />
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            Exit Request Not Found
          </h2>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            The requested exit approval could not be loaded.
          </p>
          <Button variant="primary" onClick={() => router.push('/dashboard/admin')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg-page)' }} className="min-h-screen">
      {/* Header */}
      <header className="px-4 py-4 border-b bg-white" style={{ borderColor: 'var(--border-primary)' }}>
        <div className="mx-auto max-w-7xl flex items-center gap-4">
          <Image src="/logo.png" alt="Logo" width={40} height={40} />
          <div>
            <h1 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Exit Request Approval System
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Trustee Dashboard - Final Exit Approval
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-8">
        <div className="mx-auto max-w-6xl">
          <ExitApprovalScreen
            approvalData={approvalData}
            auditTrail={auditTrail}
            userRole={userRole}
            userName={userName}
            userId={userId}
            canOverride={canOverride}
            onApprove={handleApprove}
            onReject={handleReject}
            onOverride={handleOverride}
            onBack={() => router.push('/dashboard/admin')}
          />
        </div>
      </main>
    </div>
  );
}

export default function ExitApprovalPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-page)' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
          </div>
        </div>
      }
    >
      <ExitApprovalContent />
    </Suspense>
  );
}
