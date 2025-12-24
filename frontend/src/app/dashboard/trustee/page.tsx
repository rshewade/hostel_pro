'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components';

export default function TrusteeDashboard() {
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
                Trustee Dashboard
              </h1>
            </div>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/dashboard/trustee" className="text-sm" style={{ color: 'var(--text-link)' }}>
              Dashboard
            </Link>
            <Link href="/dashboard/trustee/interviews" className="text-sm" style={{ color: 'var(--text-link)' }}>
              Interviews
            </Link>
            <Link href="/dashboard/trustee/approvals" className="text-sm" style={{ color: 'var(--text-link)' }}>
              Approvals
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
          {/* Stats Overview */}
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <div className="card p-6">
              <p className="text-body-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                Pending Interviews
              </p>
              <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                8
              </div>
            </div>
            <div className="card p-6">
              <p className="text-body-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                Applications for Review
              </p>
              <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                15
              </div>
            </div>
            <div className="card p-6">
              <p className="text-body-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                Pending Decisions
              </p>
              <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                5
              </div>
            </div>
          </div>

          {/* Applications Table */}
          <div className="card mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-heading-2" style={{ color: 'var(--text-primary)' }}>
                Forwarded Applications
              </h2>
              <Button variant="secondary" size="sm">
                View All
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: 'var(--surface-secondary)' }}>
                    <th className="px-4 py-3 text-left text-body-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Applicant
                    </th>
                    <th className="px-4 py-3 text-left text-body-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Vertical
                    </th>
                    <th className="px-4 py-3 text-left text-body-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Super. Note
                    </th>
                    <th className="px-4 py-3 text-left text-body-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Interview Date
                    </th>
                    <th className="px-4 py-3 text-left text-body-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b" style={{ borderColor: 'var(--border-primary)' }}>
                    <td className="px-4 py-3 text-body">Priya Sharma</td>
                    <td className="px-4 py-3 text-body">Girls Ashram</td>
                    <td className="px-4 py-3 text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                      Excellent academic record, verified documents
                    </td>
                    <td className="px-4 py-3 text-body">Jan 5, 2025</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button variant="primary" size="sm">
                          Schedule Interview
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
