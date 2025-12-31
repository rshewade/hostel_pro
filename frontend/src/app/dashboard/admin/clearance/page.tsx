'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components';
import {
  ExitDashboard,
  ClearanceDetailModal,
  ExitRequestSummary,
  ClearanceItemStatus,
} from '@/components/exit';
import { ArrowLeft, Download, AlertCircle, DollarSign } from 'lucide-react';

export default function AccountsClearancePage() {
  const router = useRouter();
  const [exitRequests, setExitRequests] = useState<ExitRequestSummary[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ExitRequestSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [bulkAction, setBulkAction] = useState<{
    requestIds: string[];
    action: string;
  } | null>(null);

  // Fetch exit requests on mount
  useEffect(() => {
    const fetchExitRequests = async () => {
      try {
        setLoading(true);

        // Mock API call - replace with actual API
        const response = await fetch('/api/accounts/exit-clearance');

        if (response.ok) {
          const data = await response.json();
          setExitRequests(data.requests || []);
        }
      } catch (error) {
        console.error('Error fetching exit requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExitRequests();
  }, []);

  const handleViewDetails = (requestId: string) => {
    const request = exitRequests.find((r) => r.id === requestId);
    if (request) {
      setSelectedRequest(request);
    }
  };

  const handleUpdateItemStatus = async (
    itemId: string,
    newStatus: ClearanceItemStatus,
    remarks?: string
  ) => {
    try {
      // Mock API call - replace with actual API
      const response = await fetch(`/api/clearance-items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, remarks }),
      });

      if (response.ok) {
        // Refresh exit requests data
        const refreshResponse = await fetch('/api/accounts/exit-clearance');
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          setExitRequests(data.requests || []);
        }

        alert('Clearance item updated successfully!');
      } else {
        throw new Error('Failed to update clearance item');
      }
    } catch (error) {
      console.error('Error updating clearance item:', error);
      alert('Failed to update clearance item. Please try again.');
    }
  };

  const handleBulkAction = (requestIds: string[], action: string) => {
    setBulkAction({ requestIds, action });
    setShowBulkConfirm(true);
  };

  const executeBulkAction = async () => {
    if (!bulkAction) return;

    try {
      // Mock API call - replace with actual API
      const response = await fetch('/api/clearance-items/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestIds: bulkAction.requestIds,
          action: bulkAction.action,
        }),
      });

      if (response.ok) {
        // Refresh exit requests data
        const refreshResponse = await fetch('/api/accounts/exit-clearance');
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          setExitRequests(data.requests || []);
        }

        alert(`Bulk action completed for ${bulkAction.requestIds.length} request(s)!`);
        setShowBulkConfirm(false);
        setBulkAction(null);
      } else {
        throw new Error('Failed to execute bulk action');
      }
    } catch (error) {
      console.error('Error executing bulk action:', error);
      alert('Failed to execute bulk action. Please try again.');
    }
  };

  const handleExportReport = async () => {
    try {
      // Mock API call - replace with actual API
      const response = await fetch('/api/accounts/exit-clearance/export');

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `accounts-clearance-report-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Failed to export report. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-page)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading exit clearance requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg-page)' }} className="min-h-screen">
      {/* Header */}
      <header className="px-4 py-4 border-b bg-white" style={{ borderColor: 'var(--border-primary)' }}>
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push('/dashboard/admin')} className="!p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Image src="/logo.png" alt="Logo" width={40} height={40} />
            <div>
              <h1 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Accounts Clearance Dashboard
              </h1>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Manage financial clearances and security deposit refunds
              </p>
            </div>
          </div>
          <Button variant="secondary" onClick={handleExportReport}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-8">
        <div className="mx-auto max-w-7xl">
          {/* Info Banner */}
          <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200">
            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-green-900">Accounts Responsibilities</h3>
                <p className="text-sm text-green-700 mt-1">
                  You are responsible for verifying financial clearances, processing security deposit refunds,
                  and ensuring all dues are settled. Check pending payments and outstanding balances before
                  marking items as complete.
                </p>
              </div>
            </div>
          </div>

          {/* Dashboard */}
          <ExitDashboard
            requests={exitRequests}
            userRole="ACCOUNTS"
            onViewDetails={handleViewDetails}
            onBulkAction={handleBulkAction}
          />
        </div>
      </main>

      {/* Detail Modal */}
      {selectedRequest && (
        <ClearanceDetailModal
          request={selectedRequest}
          userRole="ACCOUNTS"
          onClose={() => setSelectedRequest(null)}
          onUpdateItemStatus={handleUpdateItemStatus}
        />
      )}

      {/* Bulk Action Confirmation Modal */}
      {showBulkConfirm && bulkAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Confirm Bulk Action
                </h3>
                <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                  Are you sure you want to perform this action on {bulkAction.requestIds.length} exit request(s)?
                  This action will be logged in the audit trail.
                </p>
                <div className="mt-3 p-3 rounded-lg bg-orange-50 border border-orange-200">
                  <p className="text-xs text-orange-900">
                    <strong>Warning:</strong> Ensure all financial verifications are complete before
                    bulk approving accounts clearances. This action cannot be easily reversed.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowBulkConfirm(false);
                  setBulkAction(null);
                }}
              >
                Cancel
              </Button>
              <Button variant="primary" onClick={executeBulkAction}>
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
