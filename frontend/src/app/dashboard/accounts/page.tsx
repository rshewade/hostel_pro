'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components';

export default function AccountsDashboard() {
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
                Accounts Dashboard
              </h1>
            </div>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/dashboard/accounts" className="text-sm" style={{ color: 'var(--text-link)' }}>
              Dashboard
            </Link>
            <Link href="/dashboard/accounts/receivables" className="text-sm" style={{ color: 'var(--text-link)' }}>
              Receivables
            </Link>
            <Link href="/dashboard/accounts/payments" className="text-sm" style={{ color: 'var(--text-link)' }}>
              Payments Log
            </Link>
            <Link href="/dashboard/accounts/exports" className="text-sm" style={{ color: 'var(--text-link)' }}>
              Exports
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
          {/* Financial Overview Cards */}
          <div className="grid gap-6 md:grid-cols-4 mb-8">
            <div className="card p-6">
              <p className="text-body-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                Total Receivables
              </p>
              <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                INR 12,45,000
              </div>
            </div>
            <div className="card p-6">
              <p className="text-body-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                Collected This Month
              </p>
              <div className="text-3xl font-bold text-green-600" style={{ color: 'var(--color-green-600)' }}>
                INR 3,85,000
              </div>
            </div>
            <div className="card p-6">
              <p className="text-body-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                Overdue
              </p>
              <div className="text-3xl font-bold text-red-600" style={{ color: 'var(--color-red-600)' }}>
                INR 85,000
              </div>
            </div>
            <div className="card p-6">
              <p className="text-body-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                Pending Approvals
              </p>
              <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                24
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-6 md:grid-cols-2 mb-8">
            <div className="card p-6">
              <h3 className="text-heading-4 mb-4" style={{ color: 'var(--text-primary)' }}>
                Generate Receipts
              </h3>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                Create and download payment receipts for students
              </p>
              <Button variant="primary" size="md" fullWidth>
                Generate Receipts
              </Button>
            </div>
            <div className="card p-6">
              <h3 className="text-heading-4 mb-4" style={{ color: 'var(--text-primary)' }}>
                Export Data
              </h3>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                Export receivables and payment data for Tally integration
              </p>
              <div className="flex gap-3">
                <Button variant="secondary" size="md">
                  Export CSV
                </Button>
                <Button variant="secondary" size="md">
                  Export XLS
                </Button>
              </div>
            </div>
          </div>

          {/* Receivables Table */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-heading-2" style={{ color: 'var(--text-primary)' }}>
                Receivables Overview
              </h2>
              <Button variant="secondary" size="sm">
                Download Report
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: 'var(--surface-secondary)' }}>
                    <th className="px-4 py-3 text-left text-body-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Student Name
                    </th>
                    <th className="px-4 py-3 text-left text-body-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Vertical
                    </th>
                    <th className="px-4 py-3 text-left text-body-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Amount Due
                    </th>
                    <th className="px-4 py-3 text-left text-body-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Due Date
                    </th>
                    <th className="px-4 py-3 text-left text-body-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-body-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b" style={{ borderColor: 'var(--border-primary)' }}>
                    <td className="px-4 py-3 text-body">Rahul Jain</td>
                    <td className="px-4 py-3 text-body">Boys Hostel</td>
                    <td className="px-4 py-3 text-body font-medium">INR 25,000</td>
                    <td className="px-4 py-3 text-body">Dec 31, 2025</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded text-xs" style={{ background: 'var(--color-red-100)', color: 'var(--color-red-700)' }}>
                        Overdue
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button variant="secondary" size="sm">
                          Send Reminder
                        </Button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
