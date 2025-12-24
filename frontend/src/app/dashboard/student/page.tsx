'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components';
import { JourneyTracker, QuickActionsGrid, HeroStatusArea, StatusBadge } from '@/components/dashboard';

export default function StudentDashboard() {
  const [vertical, setVertical] = useState('Boys Hostel');

  // Journey stages
  const journeyStages = [
    {
      id: 'checked-in',
      label: 'Checked-in',
      description: 'You are currently staying at the hostel',
      status: 'CURRENT' as const,
      icon: '🏠',
      date: new Date('2024-08-15'),
    },
    {
      id: 'renewal-due',
      label: 'Renewal Due',
      description: 'Your 6-month renewal is approaching',
      status: 'UPCOMING' as const,
      icon: '📜',
      date: new Date('2025-02-15'),
    },
    {
      id: 'renewed',
      label: 'Renewed',
      description: 'Successfully renewed for next period',
      status: 'COMPLETED' as const,
      icon: '✓',
      date: new Date('2024-08-01'),
    },
    {
      id: 'exited',
      label: 'Checked Out',
      description: 'You have left the hostel',
      status: 'LOCKED' as const,
      icon: '🚪',
    },
  ];

  // Quick actions
  const quickActions = [
    {
      id: 'pay-fees',
      title: 'Pay Fees',
      description: 'View and pay your pending dues',
      icon: '💳',
      link: '/dashboard/student/fees',
      enabled: true,
      visibility: 'ALWAYS' as const,
    },
    {
      id: 'download-letters',
      title: 'Download Letters',
      description: 'Get admission and official documents',
      icon: '📄',
      link: '/dashboard/student/documents',
      enabled: true,
      visibility: 'ALWAYS' as const,
    },
    {
      id: 'apply-leave',
      title: 'Apply for Leave',
      description: 'Request leave from hostel',
      icon: '🏖️',
      link: '/dashboard/student/leave',
      enabled: true,
      visibility: 'ALWAYS' as const,
    },
    {
      id: 'view-room',
      title: 'View Room Details',
      description: 'See your room information',
      icon: '🛏️',
      link: '/dashboard/student/room',
      enabled: true,
      visibility: 'ALWAYS' as const,
    },
    {
      id: 'renew',
      title: 'Renew Now',
      description: 'Renew your stay for next semester',
      icon: '📜',
      link: '/dashboard/student/renewal',
      enabled: true,
      visibility: 'RENEWAL_WINDOW' as const,
      badge: {
        text: 'Due in 30 days',
        variant: 'warning',
      },
    },
    {
      id: 'exit-process',
      title: 'Initiate Exit',
      description: 'Start checkout process from hostel',
      icon: '🚪',
      link: '/dashboard/student/exit',
      enabled: true,
      visibility: 'EXIT_ALLOWED' as const,
    },
  ];

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
                Student Dashboard
              </h1>
              <span
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={{ background: 'var(--bg-accent)', color: 'var(--text-on-accent)' }}
              >
                {vertical}
              </span>
            </div>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/dashboard/student" className="text-sm" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
              Dashboard
            </Link>
            <Link href="/dashboard/student/fees" className="text-sm" style={{ color: 'var(--text-link)' }}>
              Fees
            </Link>
            <Link href="/dashboard/student/leave" className="text-sm" style={{ color: 'var(--text-link)' }}>
              Leave
            </Link>
            <Link href="/dashboard/student/documents" className="text-sm" style={{ color: 'var(--text-link)' }}>
              Documents
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
          {/* Hero Status Area with Journey Tracker */}
          <HeroStatusArea
            title="Welcome Back, Student!"
            message="You are currently checked in to the hostel. All systems are active."
            badge={{ text: 'Checked-in', variant: 'success' }}
            helperText="All systems active. No action required."
            variant="default"
          />

          <JourneyTracker
            stages={journeyStages}
            currentStageIndex={0}
            variant="timeline"
          />

          {/* Quick Actions Grid */}
          <QuickActionsGrid actions={quickActions} />

          {/* Notifications Panel */}
            <div className="card p-6 mt-8">
            <h3 className="text-heading-4 mb-4" style={{ color: 'var(--text-primary)' }}>
              Notifications
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 rounded" style={{ background: 'var(--bg-page)' }}>
                <span style={{ color: 'var(--color-red-600)' }}>⚠</span>
                <div>
                  <p className="text-body font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                    Fee Payment Due
                  </p>
                  <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                    Due date: December 31, 2025
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded" style={{ background: 'var(--bg-page)' }}>
                <span style={{ color: 'var(--color-yellow-600)' }}>📢</span>
                <div>
                  <p className="text-body font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                    Renewal Reminder
                  </p>
                  <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                    Your 6-month renewal is due in 30 days
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded" style={{ background: 'var(--bg-page)' }}>
                <span style={{ color: 'var(--color-green-600)' }}>✓</span>
                <div>
                  <p className="text-body font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                    Leave Approved
                  </p>
                  <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                    Your leave request for December 25-30 has been approved
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Profile Card */}
          <div className="card p-6 mt-8">
            <h3 className="text-heading-4 mb-4" style={{ color: 'var(--text-primary)' }}>
              Quick Profile
            </h3>
            <div className="space-y-4">
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
                <StatusBadge text="Checked-in" variant="success" size="md" rounded />
              </div>
              <div className="flex justify-between">
                <span className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                  Current Period:
                </span>
                <span className="text-body font-medium" style={{ color: 'var(--text-primary)' }}>
                  Semester 1, 2024-25
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                  Renewal Due:
                </span>
                <span className="text-body font-medium" style={{ color: 'var(--color-yellow-600)' }}>
                  February 15, 2025 (92 days)
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
