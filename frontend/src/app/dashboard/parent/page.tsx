'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button, Badge } from '@/components';
import { InfoTooltip } from '@/components/feedback/Tooltip';

// Parent View-Only Permissions
// Role: parent
// Scope: read-only
// Allowed: GET endpoints for student data, fees, leaves, notifications
// Forbidden: POST/PUT/DELETE - All mutating operations
// Note: Backend middleware must enforce role-based access control

export default function ParentDashboard() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      {/* Header */}
      <header className="px-6 py-4 border-b" style={{ borderColor: 'var(--border-primary)' }}>
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/logo.png"
              alt="Seth Hirachand Gumanji Jain Hostel"
              width={40}
              height={40}
            />
            <div>
              <h1 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Parent Dashboard
              </h1>
              <span
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={{ background: 'var(--bg-gray-400)', color: 'var(--text-inverse)' }}
              >
                View-Only Access
              </span>
            </div>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/dashboard/parent" className="text-sm" style={{ color: 'var(--text-link)' }}>
              Dashboard
            </Link>
            <Link href="/dashboard/parent/fees" className="text-sm" style={{ color: 'var(--text-link)' }}>
              Fees View
            </Link>
            <Link href="/dashboard/parent/leave" className="text-sm" style={{ color: 'var(--text-link)' }}>
              Leave View
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {}}
            >
              Logout
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-8">
        <div className="mx-auto max-w-6xl">
           {/* Notice Banner */}
          <div className="mb-8 p-6 rounded-lg border-l-4" style={{ background: 'var(--color-blue-50)', borderLeftColor: 'var(--color-blue-500)' }}>
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--color-blue-600)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <h3 className="text-heading-4 mb-2 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  Parent Access Information
                  <InfoTooltip content="Parent accounts are limited to read-only access for security and data protection purposes." />
                </h3>
                <p className="text-body mb-2" style={{ color: 'var(--text-secondary)' }}>
                  As a parent/guardian, you have read-only access to view your ward's hostel information including fee status, leave applications, and notifications.
                </p>
                <p className="text-body-sm" style={{ color: 'var(--color-blue-700)' }}>
                  <strong>View-Only Access:</strong> You cannot make any changes or approve requests through this dashboard. All modifications must be done by the student or hostel administration.
                </p>
              </div>
            </div>
          </div>

          {/* DPDP Compliance Banner */}
          <div className="mb-8 p-6 rounded-lg border" style={{ borderColor: 'var(--color-green-200)', background: 'var(--color-green-50)' }}>
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--color-green-600)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div className="flex-1">
                <h3 className="text-heading-4 mb-2 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  Data Protection & Privacy
                  <InfoTooltip content="Your data is protected under the Digital Personal Data Protection (DPDP) Act, 2023" />
                </h3>
                <p className="text-body-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Your access to your ward's information is protected under the <strong>Digital Personal Data Protection Act, 2023</strong>. We maintain strict confidentiality and use your information solely for hostel management purposes.
                </p>
                <ul className="text-body-sm space-y-1" style={{ color: 'var(--color-green-800)' }}>
                  <li>• All data transmission is encrypted</li>
                  <li>• Access is logged and audited regularly</li>
                  <li>• Data is shared only with authorized hostel staff</li>
                  <li>• You may request access details or data deletion as per DPDP provisions</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Ward Profile Card */}
          <div className="card p-6 mb-8">
            <div className="flex items-start gap-6 mb-6">
              <div
                className="w-20 h-20 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--bg-accent)' }}
              >
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-on-accent)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 18 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7 7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-heading-2 mb-1" style={{ color: 'var(--text-primary)' }}>
                  Rahul Kumar
                </h2>
                <p className="text-body-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                  Your Son/Daughter
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                      Room No:
                    </span>
                    <span className="text-body font-medium" style={{ color: 'var(--text-primary)' }}>
                      A-201
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                      Joining Date:
                    </span>
                    <span className="text-body font-medium" style={{ color: 'var(--text-primary)' }}>
                      August 15, 2024
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                      Status:
                    </span>
                    <span className="px-2 py-1 rounded text-xs font-medium text-white" style={{ background: 'var(--color-green-600)' }}>
                      Checked-in
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Grid of Information Cards */}
          <div className="grid gap-6 md:grid-cols-2 mb-8">
             {/* Fee Status Card */}
            <div className="card p-6">
              <h3 className="text-heading-4 mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                Fee Status
                <InfoTooltip content="View only. Payments must be made through official hostel channels." />
              </h3>
              <div className="space-y-3">
                 <div className="flex justify-between items-center">
                    <span className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                      Room No:
                      <InfoTooltip content="Room assignment is managed by hostel administration" />
                    </span>
                    <span className="text-body font-medium" style={{ color: 'var(--text-primary)' }}>
                      A-201
                    </span>
                  </div>
                <div className="flex justify-between items-center">
                  <span className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                    This Month Paid:
                  </span>
                  <span className="text-xl font-bold text-green-600" style={{ color: 'var(--color-green-600)' }}>
                    INR 25,000
                  </span>
                </div>
              </div>
               <div className="pt-3 border-t" style={{ borderColor: 'var(--border-primary)' }}>
                <p className="text-body-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                  <strong>Last Payment:</strong> December 15, 2025
                </p>
                <Link href="/dashboard/parent/fees">
                  <Button variant="secondary" size="sm" fullWidth>
                    View Fee Details →
                  </Button>
                </Link>
              </div>
            </div>

             {/* Leave History Card */}
            <div className="card p-6">
              <h3 className="text-heading-4 mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                Leave History
                <InfoTooltip content="View only. Leave applications must be submitted by the student." />
              </h3>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center p-3 rounded" style={{ background: 'var(--bg-page)' }}>
                  <div>
                    <p className="text-body font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                      Winter Break Leave
                    </p>
                    <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                      Dec 25, 2025 - Jan 2, 2026
                    </p>
                  </div>
                  <span className="px-2 py-1 rounded text-xs" style={{ background: 'var(--color-green-100)', color: 'var(--color-green-700)' }}>
                    Approved
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 rounded" style={{ background: 'var(--bg-page)' }}>
                  <div>
                    <p className="text-body font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                      Weekend Leave
                    </p>
                    <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                      Nov 15-16, 2025
                    </p>
                  </div>
                  <span className="px-2 py-1 rounded text-xs" style={{ background: 'var(--color-red-100)', color: 'var(--color-red-700)' }}>
                    Rejected
                   </span>
                </div>
              </div>
              <Link href="/dashboard/parent/leave">
                <Button variant="primary" size="sm" fullWidth>
                  View Leave History →
                </Button>
              </Link>
            </div>

             {/* Notifications Card */}
            <div className="card p-6">
              <h3 className="text-heading-4 mb-4" style={{ color: 'var(--text-primary)' }}>
                Recent Notifications
              </h3>
              <div className="space-y-3 mb-4">
                <div className="flex items-start gap-3 p-3 rounded" style={{ background: 'var(--bg-page)' }}>
                  <span className="text-2xl">📢</span>
                  <div>
                    <p className="text-body font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                      Fee Payment Confirmation
                    </p>
                    <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                      December 15, 2025
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded" style={{ background: 'var(--bg-page)' }}>
                  <span className="text-2xl">📋</span>
                  <div>
                    <p className="text-body font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                      Leave Request Received
                    </p>
                    <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                      November 18, 2025
                    </p>
                  </div>
                </div>
              </div>
              <Button variant="secondary" size="sm" fullWidth disabled>
                View All Notifications
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="card p-6">
            <h3 className="text-heading-4 mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              Quick Links
              <InfoTooltip content="All information is view-only. Contact hostel administration for any changes required." />
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              <Link href="/dashboard/parent/fees" className="flex items-center gap-3 p-4 rounded-lg border hover:shadow-md transition-shadow" style={{ borderColor: 'var(--border-primary)' }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-green-100)' }}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--color-green-600)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-body font-medium" style={{ color: 'var(--text-primary)' }}>
                    View Fee History
                  </p>
                  <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                    Payments & Receipts
                  </p>
                </div>
              </Link>

              <Link href="/dashboard/parent/leave" className="flex items-center gap-3 p-4 rounded-lg border hover:shadow-md transition-shadow" style={{ borderColor: 'var(--border-primary)' }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-blue-100)' }}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--color-blue-600)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <p className="text-body font-medium" style={{ color: 'var(--text-primary)' }}>
                    Leave History
                  </p>
                  <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                    Past & Upcoming Leaves
                  </p>
                </div>
              </Link>
            </div>
          </div>

          {/* Permissions Footer */}
          <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              🔒 View-Only Access Mode
            </p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              This account operates in read-only mode. All modifications must be made by the student through their own account or by hostel administration.
              <br />
              <Link href="/login/parent" className="text-blue-600 hover:underline mt-1 inline-block">
                Re-authenticate →
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
