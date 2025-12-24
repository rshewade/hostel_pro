'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components';

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
          <div className="mb-8 p-6 rounded-lg border-l-4" style={{ background: 'var(--bg-page)', borderLeftColor: 'var(--color-gold-500)' }}>
            <h3 className="text-heading-4 mb-2" style={{ color: 'var(--text-primary)' }}>
              Parent Access Information
            </h3>
            <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
              As a parent/guardian, you have read-only access to view your ward's hostel information including fee status, leave applications, and notifications. You cannot make any changes or approve requests through this dashboard.
            </p>
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
              <h3 className="text-heading-4 mb-4" style={{ color: 'var(--text-primary)' }}>
                Fee Status
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                    Total Dues:
                  </span>
                  <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    INR 0
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
                <Button variant="secondary" size="sm" fullWidth disabled>
                  View Only
                </Button>
              </div>
            </div>

            {/* Leave History Card */}
            <div className="card p-6">
              <h3 className="text-heading-4 mb-4" style={{ color: 'var(--text-primary)' }}>
                Leave History
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
              <Button variant="primary" size="sm" fullWidth disabled>
                View Only
              </Button>
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
              <Button variant="primary" size="sm" fullWidth disabled>
                View Only
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
