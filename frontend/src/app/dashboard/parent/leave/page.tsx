'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components';
import { InfoTooltip } from '@/components/feedback/Tooltip';

// Parent View-Only Permissions
// Role: parent
// Scope: read-only for leave data
// Allowed: GET /api/leaves
// Forbidden: POST /api/leaves, PUT /api/leaves/:id, DELETE /api/leaves/:id
// Note: All leave applications must be submitted by student through their own account

export default function ParentLeavePage() {
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
                Leave History View
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
            <Link href="/dashboard/parent/leave" className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Leave View
            </Link>
            <Button variant="ghost" size="sm" onClick={() => {}}>
              Logout
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-8">
        <div className="mx-auto max-w-4xl">
          {/* DPDP Compliance Banner */}
          <div className="mb-8 p-6 rounded-lg border" style={{ borderColor: 'var(--color-green-200)', background: 'var(--color-green-50)' }}>
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--color-green-600)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div className="flex-1">
                <h3 className="text-heading-4 mb-2 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  Data Protection & Privacy
                  <InfoTooltip content="Your data is protected under the Digital Personal Data Protection Act, 2023" />
                </h3>
                <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                  Your ward's leave information is processed in compliance with the <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong>.
                  All leave data displayed here is read-only and securely encrypted.
                </p>
              </div>
            </div>
          </div>

          {/* Leave Statistics */}
          <div className="grid gap-6 md:grid-cols-4 mb-8">
            <div className="card p-4 text-center">
              <p className="text-3xl font-bold" style={{ color: 'var(--color-green-600)' }}>
                3
              </p>
              <p className="text-body-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                Approved
              </p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-3xl font-bold" style={{ color: 'var(--color-red-600)' }}>
                1
              </p>
              <p className="text-body-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                Rejected
              </p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-3xl font-bold" style={{ color: 'var(--color-blue-600)' }}>
                0
              </p>
              <p className="text-body-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                Pending
              </p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                15
              </p>
              <p className="text-body-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                Total Days Taken
              </p>
            </div>
          </div>

          {/* Leave Applications */}
          <div className="card p-6">
            <h2 className="text-heading-3 mb-6" style={{ color: 'var(--text-primary)' }}>
              Leave Applications
            </h2>

            <div className="space-y-4">
              {/* Upcoming Leave */}
              <div className="border-l-4 p-4 rounded-lg" style={{ borderColor: 'var(--color-green-500)', background: 'var(--color-green-50)' }}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-body font-semibold" style={{ color: 'var(--text-primary)' }}>
                        Winter Break Leave
                      </h3>
                      <span className="px-2 py-1 rounded text-xs font-medium text-white" style={{ background: 'var(--color-green-600)' }}>
                        Approved
                      </span>
                      <span className="px-2 py-1 rounded text-xs font-medium" style={{ background: 'var(--color-blue-100)', color: 'var(--color-blue-700)' }}>
                        Upcoming
                      </span>
                    </div>
                    <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                      <strong>Duration:</strong> Dec 25, 2025 - Jan 2, 2026 (9 days)
                    </p>
                    <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                      <strong>Purpose:</strong> Winter holidays with family
                    </p>
                    <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                      <strong>Applied on:</strong> December 10, 2025
                    </p>
                    <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                      <strong>Approved on:</strong> December 12, 2025
                    </p>
                  </div>
                </div>
              </div>

              {/* Approved Leave - Completed */}
              <div className="border p-4 rounded-lg" style={{ borderColor: 'var(--border-primary)' }}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-body font-medium" style={{ color: 'var(--text-primary)' }}>
                        Diwali Leave
                      </h3>
                      <span className="px-2 py-1 rounded text-xs font-medium text-white" style={{ background: 'var(--color-green-600)' }}>
                        Approved
                      </span>
                      <span className="px-2 py-1 rounded text-xs font-medium" style={{ background: 'var(--color-gray-200)', color: 'var(--text-secondary)' }}>
                        Completed
                      </span>
                    </div>
                    <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                      <strong>Duration:</strong> Oct 30 - Nov 3, 2025 (4 days)
                    </p>
                    <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                      <strong>Purpose:</strong> Diwali celebrations with family
                    </p>
                    <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                      <strong>Applied on:</strong> October 25, 2025
                    </p>
                  </div>
                </div>
              </div>

              {/* Rejected Leave */}
              <div className="border-l-4 p-4 rounded-lg" style={{ borderColor: 'var(--color-red-500)', background: 'var(--color-red-50)' }}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-body font-medium" style={{ color: 'var(--text-primary)' }}>
                        Weekend Leave
                      </h3>
                      <span className="px-2 py-1 rounded text-xs font-medium text-white" style={{ background: 'var(--color-red-600)' }}>
                        Rejected
                      </span>
                    </div>
                    <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                      <strong>Duration:</strong> Nov 15-16, 2025 (2 days)
                    </p>
                    <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                      <strong>Purpose:</strong> Family function
                    </p>
                    <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                      <strong>Applied on:</strong> November 10, 2025
                    </p>
                    <p className="text-body-sm" style={{ color: 'var(--color-red-600)' }}>
                      <strong>Reason for Rejection:</strong> Leave not permitted during examination week
                    </p>
                  </div>
                </div>
              </div>

              {/* Past Approved Leave */}
              <div className="border p-4 rounded-lg" style={{ borderColor: 'var(--border-primary)' }}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-body font-medium" style={{ color: 'var(--text-primary)' }}>
                        Short Weekend Leave
                      </h3>
                      <span className="px-2 py-1 rounded text-xs font-medium text-white" style={{ background: 'var(--color-green-600)' }}>
                        Approved
                      </span>
                      <span className="px-2 py-1 rounded text-xs font-medium" style={{ background: 'var(--color-gray-200)', color: 'var(--text-secondary)' }}>
                        Completed
                      </span>
                    </div>
                    <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                      <strong>Duration:</strong> September 14-15, 2025 (2 days)
                    </p>
                    <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                      <strong>Purpose:</strong> Family visit
                    </p>
                    <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                      <strong>Applied on:</strong> September 10, 2025
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* View-Only Notice */}
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h4 className="text-sm font-semibold text-yellow-900 mb-1">View-Only Access</h4>
                <p className="text-sm text-yellow-700">
                  This leave history is for your reference only. All leave applications must be submitted by the student through their own account.
                  Please discuss leave plans with your ward and ensure they apply through proper channels.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
