'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components';
import { InfoTooltip } from '@/components/feedback/Tooltip';

// Parent View-Only Permissions
// Role: parent
// Scope: read-only for fees data
// Allowed: GET /api/fees, GET /api/receipts/:id/download
// Forbidden: POST /api/payments (must use official channels)
// Note: All "Download Receipt" buttons should trigger GET, not POST

export default function ParentFeesPage() {
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
                Fee Status View
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
            <Link href="/dashboard/parent/fees" className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Fees View
            </Link>
            <Link href="/dashboard/parent/leave" className="text-sm" style={{ color: 'var(--text-link)' }}>
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
                  Your financial information is processed in compliance with the <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong>.
                  All fee data displayed here is read-only and securely encrypted.
                </p>
              </div>
            </div>
          </div>

          {/* Fee Summary Cards */}
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <div className="card p-6 border-l-4" style={{ borderLeftColor: 'var(--color-green-500)' }}>
              <h3 className="text-body-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                Total Paid This Year
              </h3>
              <p className="text-2xl font-bold" style={{ color: 'var(--color-green-600)' }}>
                INR 2,75,000
              </p>
            </div>
            <div className="card p-6 border-l-4" style={{ borderLeftColor: 'var(--color-yellow-500)' }}>
              <h3 className="text-body-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                Pending Amount
              </h3>
              <p className="text-2xl font-bold" style={{ color: 'var(--color-yellow-600)' }}>
                INR 0
              </p>
            </div>
            <div className="card p-6 border-l-4" style={{ borderLeftColor: 'var(--color-red-500)' }}>
              <h3 className="text-body-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                Overdue Amount
              </h3>
              <p className="text-2xl font-bold" style={{ color: 'var(--color-red-600)' }}>
                INR 0
              </p>
            </div>
          </div>

          {/* Fee Transactions */}
          <div className="card p-6 mb-8">
            <h2 className="text-heading-3 mb-6" style={{ color: 'var(--text-primary)' }}>
              Fee Transactions
            </h2>

            <div className="space-y-4">
              {/* Transaction Item */}
              <div className="flex items-start justify-between p-4 rounded-lg border" style={{ borderColor: 'var(--border-primary)' }}>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-body font-medium" style={{ color: 'var(--text-primary)' }}>
                      Hostel Fees - December 2025
                    </h3>
                    <span className="px-2 py-1 rounded text-xs font-medium text-white" style={{ background: 'var(--color-green-600)' }}>
                      Paid
                    </span>
                  </div>
                  <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                    Paid on: December 15, 2025
                  </p>
                  <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                    Payment ID: PAY-2025-12-001
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    INR 25,000
                  </p>
                  <Button variant="secondary" size="sm" className="mt-2">
                    Download Receipt
                  </Button>
                </div>
              </div>

              {/* Transaction Item */}
              <div className="flex items-start justify-between p-4 rounded-lg border" style={{ borderColor: 'var(--border-primary)' }}>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-body font-medium" style={{ color: 'var(--text-primary)' }}>
                      Hostel Fees - November 2025
                    </h3>
                    <span className="px-2 py-1 rounded text-xs font-medium text-white" style={{ background: 'var(--color-green-600)' }}>
                      Paid
                    </span>
                  </div>
                  <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                    Paid on: November 15, 2025
                  </p>
                  <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                    Payment ID: PAY-2025-11-002
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    INR 25,000
                  </p>
                  <Button variant="secondary" size="sm" className="mt-2">
                    Download Receipt
                  </Button>
                </div>
              </div>

              {/* Transaction Item */}
              <div className="flex items-start justify-between p-4 rounded-lg border" style={{ borderColor: 'var(--border-primary)' }}>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-body font-medium" style={{ color: 'var(--text-primary)' }}>
                      Security Deposit (One-time)
                    </h3>
                    <span className="px-2 py-1 rounded text-xs font-medium text-white" style={{ background: 'var(--color-green-600)' }}>
                      Paid
                    </span>
                  </div>
                  <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                    Paid on: August 15, 2024
                  </p>
                  <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                    Payment ID: PAY-2024-08-001
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    INR 50,000
                  </p>
                  <Button variant="secondary" size="sm" className="mt-2">
                    Download Receipt
                  </Button>
                </div>
              </div>

              {/* Transaction Item */}
              <div className="flex items-start justify-between p-4 rounded-lg border" style={{ borderColor: 'var(--border-primary)' }}>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-body font-medium" style={{ color: 'var(--text-primary)' }}>
                      Admission Fee (One-time)
                    </h3>
                    <span className="px-2 py-1 rounded text-xs font-medium text-white" style={{ background: 'var(--color-green-600)' }}>
                      Paid
                    </span>
                  </div>
                  <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                    Paid on: August 15, 2024
                  </p>
                  <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                    Payment ID: PAY-2024-08-000
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    INR 25,000
                  </p>
                  <Button variant="secondary" size="sm" className="mt-2">
                    Download Receipt
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* View-Only Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h4 className="text-sm font-semibold text-yellow-900 mb-1">View-Only Access</h4>
                <p className="text-sm text-yellow-700">
                  This fee information is for your reference only. All payments must be made through official hostel channels.
                  Please contact hostel administration for payment-related queries.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
