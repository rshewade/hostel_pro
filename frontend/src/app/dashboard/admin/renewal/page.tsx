'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components';
import { AdminRenewalList } from '@/components/renewal/AdminRenewalList';
import { AdminRenewalDetail } from '@/components/renewal/AdminRenewalDetail';

export default function AdminRenewalPage() {
  const [selectedRenewal, setSelectedRenewal] = useState<string | null>(null);
  const [currentVertical, setCurrentVertical] = useState('Boys Hostel');

  const handleApprove = (id: string, remarks: string, notifyStudent: boolean, notifyParent: boolean) => {
    console.log('Approve:', { id, remarks, notifyStudent, notifyParent });
    setSelectedRenewal(null);
  };

  const handleReject = (id: string, remarks: string, notifyStudent: boolean, notifyParent: boolean) => {
    console.log('Reject:', { id, remarks, notifyStudent, notifyParent });
    setSelectedRenewal(null);
  };

  if (selectedRenewal) {
    return (
      <div style={{ background: 'var(--bg-page)' }} className="min-h-screen">
        <header className="px-4 py-4 border-b" style={{ borderColor: 'var(--border-primary)' }}>
          <div className="mx-auto max-w-7xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image src="/logo.png" alt="Logo" width={40} height={40} />
              <div>
                <h1 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Superintendent Dashboard
                </h1>
                <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'var(--bg-accent)', color: 'var(--text-on-accent)' }}>
                  {currentVertical}
                </span>
              </div>
            </div>
            <nav className="flex items-center gap-4">
              <select
                value={currentVertical}
                onChange={(e) => setCurrentVertical(e.target.value)}
                className="px-3 py-1.5 rounded-lg border text-sm"
                style={{ borderColor: 'var(--border-primary)' }}
              >
                <option value="Boys Hostel">Boys Hostel</option>
                <option value="Girls Ashram">Girls Ashram</option>
                <option value="Dharamshala">Dharamshala</option>
              </select>
            </nav>
          </div>
        </header>

        <main className="px-6 py-8">
          <AdminRenewalDetail
            renewalId={selectedRenewal}
            studentName="Amit Kumar Jain"
            studentId="STU001"
            vertical={currentVertical}
            room="A-201"
            type="RENEWAL"
            status="UNDER_REVIEW"
            academicYear="2025-26"
            period="SEMESTER_1"
            documentsUploaded={[
              { type: 'marksheet_latest', fileName: 'marksheet_2024.pdf', uploadedAt: '2025-01-10T10:30:00Z', status: 'UPLOADED' },
              { type: 'id_proof', fileName: 'aadhar_card.pdf', uploadedAt: '2025-01-10T10:35:00Z', status: 'UPLOADED' },
            ]}
            paymentStatus="COMPLETE"
            amountDue={0}
            amountPaid={60000}
            consentGiven={true}
            consentTimestamp="2025-01-10T10:40:00Z"
            createdAt="2025-01-10T10:00:00Z"
            submittedAt="2025-01-10T10:45:00Z"
            reviewedAt={null}
            approvedAt={null}
            superintendentRemarks={null}
            onBack={() => setSelectedRenewal(null)}
            onApprove={(remarks, notifyStudent, notifyParent) => handleApprove(selectedRenewal, remarks, notifyStudent, notifyParent)}
            onReject={(remarks, notifyStudent, notifyParent) => handleReject(selectedRenewal, remarks, notifyStudent, notifyParent)}
            onRequestChanges={() => {}}
          />
        </main>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg-page)' }} className="min-h-screen">
      <header className="px-4 py-4 border-b" style={{ borderColor: 'var(--border-primary)' }}>
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image src="/logo.png" alt="Logo" width={40} height={40} />
            <div>
              <h1 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Superintendent Dashboard
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'var(--bg-accent)', color: 'var(--text-on-accent)' }}>
                {currentVertical}
              </span>
            </div>
          </div>
          <nav className="flex items-center gap-6">
            <a href="/dashboard/admin" className="text-sm" style={{ color: 'var(--text-link)' }}>Dashboard</a>
            <a href="/dashboard/admin/applications" className="text-sm" style={{ color: 'var(--text-link)' }}>Applications</a>
            <a href="/dashboard/admin/renewal" className="text-sm font-semibold" style={{ color: 'var(--text-link)' }}>Renewals</a>
            <a href="/dashboard/admin/leave" className="text-sm" style={{ color: 'var(--text-link)' }}>Leaves</a>
            <select
              value={currentVertical}
              onChange={(e) => setCurrentVertical(e.target.value)}
              className="px-3 py-1.5 rounded-lg border text-sm"
              style={{ borderColor: 'var(--border-primary)' }}
            >
              <option value="Boys Hostel">Boys Hostel</option>
              <option value="Girls Ashram">Girls Ashram</option>
              <option value="Dharamshala">Dharamshala</option>
            </select>
          </nav>
        </div>
      </header>

      <main className="px-6 py-8">
        <AdminRenewalList
          title="Renewal Applications"
          showVerticalFilter={false}
          currentVertical={currentVertical}
          onViewDetail={(id) => setSelectedRenewal(id)}
          onApprove={(id) => handleApprove(id, '', true, true)}
          onReject={(id) => handleReject(id, '', true, true)}
        />
      </main>
    </div>
  );
}
