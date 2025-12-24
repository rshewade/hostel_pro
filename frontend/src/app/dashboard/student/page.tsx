'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components';
import { JourneyTracker, QuickActionsGrid, HeroStatusArea, StatusBadge } from '@/components/dashboard';

interface ResidentState {
  status: 'NEW' | 'CHECKED_IN' | 'RENEWAL_DUE' | 'RENEWED' | 'EXIT_INITIATED' | 'EXITED';
  daysUntilRenewal?: number;
  exitAllowed?: boolean;
}

export default function StudentDashboard() {
  const [vertical, setVertical] = useState('Boys Hostel');
  const [residentState, setResidentState] = useState<ResidentState>({ status: 'CHECKED_IN', exitAllowed: true });

  // Journey stages - these will be dynamically updated based on state
  const getJourneyStages = (): typeof journeyStages => {
    switch (residentState.status) {
      case 'NEW':
        return [
          {
            id: 'welcome',
            label: 'Welcome',
            description: 'Complete your admission formalities',
            status: 'CURRENT' as const,
            icon: '🎉',
            date: new Date(),
          },
          {
            id: 'checked-in',
            label: 'Checked-in',
            description: 'You will be checked in soon',
            status: 'UPCOMING' as const,
            icon: '🏠',
          },
          {
            id: 'renewal',
            label: 'Renewal',
            description: 'Renew when due',
            status: 'UPCOMING' as const,
            icon: '📜',
          },
          {
            id: 'exited',
            label: 'Checked Out',
            description: 'After your stay ends',
            status: 'UPCOMING' as const,
            icon: '🚪',
          },
        ];
      case 'CHECKED_IN':
        return [
          {
            id: 'checked-in',
            label: 'Checked-in',
            description: 'You are currently staying at hostel',
            status: 'COMPLETED' as const,
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
            status: 'UPCOMING' as const,
            icon: '✓',
            date: new Date('2024-08-01'),
          },
          {
            id: 'exited',
            label: 'Checked Out',
            description: 'You have left the hostel',
            status: 'UPCOMING' as const,
            icon: '🚪',
          },
        ];
      case 'RENEWAL_DUE':
        return [
          {
            id: 'checked-in',
            label: 'Checked-in',
            description: 'You have been staying since August 2024',
            status: 'COMPLETED' as const,
            icon: '🏠',
            date: new Date('2024-08-15'),
          },
          {
            id: 'renewal-due',
            label: 'Renewal Due',
            description: `Your 6-month renewal is due in ${residentState.daysUntilRenewal || 30} days`,
            status: 'CURRENT' as const,
            icon: '📜',
            date: new Date('2025-02-15'),
          },
          {
            id: 'renewed',
            label: 'Renewed',
            description: 'After you complete renewal',
            status: 'UPCOMING' as const,
            icon: '✓',
          },
          {
            id: 'exited',
            label: 'Checked Out',
            description: 'After your stay ends',
            status: 'UPCOMING' as const,
            icon: '🚪',
          },
        ];
      case 'RENEWED':
        return [
          {
            id: 'checked-in',
            label: 'Checked-in',
            description: 'You have been staying since August 2024',
            status: 'COMPLETED' as const,
            icon: '🏠',
            date: new Date('2024-08-15'),
          },
          {
            id: 'renewal-due',
            label: 'Renewal Due',
            description: 'Your next renewal will be in August 2025',
            status: 'UPCOMING' as const,
            icon: '📜',
            date: new Date('2025-08-01'),
          },
          {
            id: 'renewed',
            label: 'Renewed',
            description: 'Successfully renewed for this period',
            status: 'COMPLETED' as const,
            icon: '✓',
            date: new Date('2024-12-01'),
          },
          {
            id: 'exited',
            label: 'Checked Out',
            description: 'After your stay ends',
            status: 'UPCOMING' as const,
            icon: '🚪',
          },
        ];
      case 'EXIT_INITIATED':
        return [
          {
            id: 'checked-in',
            label: 'Checked-in',
            description: 'You were staying since August 2024',
            status: 'COMPLETED' as const,
            icon: '🏠',
            date: new Date('2024-08-15'),
          },
          {
            id: 'renewal-due',
            label: 'Renewal',
            description: 'Pending completion',
            status: 'UPCOMING' as const,
            icon: '📜',
          },
          {
            id: 'exit-process',
            label: 'Exit Process',
            description: 'Complete checkout procedure',
            status: 'CURRENT' as const,
            icon: '🚪',
          },
          {
            id: 'exited',
            label: 'Checked Out',
            description: 'After checkout',
            status: 'UPCOMING' as const,
            icon: '🚪',
          },
        ];
      case 'EXITED':
        return [
          {
            id: 'checked-in',
            label: 'Checked-in',
            description: 'You stayed from August 2024 to December 2024',
            status: 'COMPLETED' as const,
            icon: '🏠',
            date: new Date('2024-08-15'),
          },
          {
            id: 'renewal-due',
            label: 'Renewal',
            description: 'Your stay has ended',
            status: 'LOCKED' as const,
            icon: '🔒',
          },
          {
            id: 'exit-process',
            label: 'Exit Process',
            description: 'Completed on December 20',
            status: 'COMPLETED' as const,
            icon: '✓',
          },
          {
            id: 'exited',
            label: 'Checked Out',
            description: 'Thank you for staying with us',
            status: 'COMPLETED' as const,
            icon: '🎉',
          },
        ];
      default:
        return [];
    }
  };

  const journeyStages = getJourneyStages();

  // Get quick actions based on state
  const getQuickActions = (): typeof quickActions => {
    switch (residentState.status) {
      case 'NEW':
        return [
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
        ];
      case 'CHECKED_IN':
        return [
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
            enabled: false,
            visibility: 'ALWAYS' as const,
          },
          {
            id: 'exit-process',
            title: 'Initiate Exit',
            description: 'Start checkout process from hostel',
            icon: '🚪',
            link: '/dashboard/student/exit',
            enabled: false,
            visibility: 'EXIT_ALLOWED' as const,
          },
        ];
      case 'RENEWAL_DUE':
        return [
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
            description: `Renew your stay for next semester`,
            icon: '📜',
            link: '/dashboard/student/renewal',
            enabled: true,
            visibility: 'RENEWAL_WINDOW' as const,
            badge: {
              text: `${residentState.daysUntilRenewal || 30} days`,
              variant: 'warning' as const,
            },
          },
          {
            id: 'exit-process',
            title: 'Initiate Exit',
            description: 'Start checkout process from hostel',
            icon: '🚪',
            link: '/dashboard/student/exit',
            enabled: true,
            visibility: 'ALWAYS' as const,
          },
        ];
      case 'RENEWED':
        return [
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
            enabled: false,
            visibility: 'RENEWAL_WINDOW' as const,
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
      case 'EXIT_INITIATED':
        return [
          {
            id: 'pay-fees',
            title: 'Pay Fees',
            description: 'View and pay any outstanding dues',
            icon: '💳',
            link: '/dashboard/student/fees',
            enabled: true,
            visibility: 'ALWAYS' as const,
          },
          {
            id: 'download-letters',
            title: 'Download Letters',
            description: 'Download your exit documents',
            icon: '📄',
            link: '/dashboard/student/documents',
            enabled: true,
            visibility: 'ALWAYS' as const,
          },
          {
            id: 'apply-leave',
            title: 'Apply for Leave',
            description: 'Leave requires exit process completion',
            icon: '🏖️',
            link: '/dashboard/student/leave',
            enabled: true,
            visibility: 'PENDING_ITEMS' as const,
            badge: {
              text: 'Exit pending',
              variant: 'warning' as const,
            },
          },
          {
            id: 'view-room',
            title: 'View Room Details',
            description: 'See your room information before exit',
            icon: '🛏️',
            link: '/dashboard/student/room',
            enabled: true,
            visibility: 'ALWAYS' as const,
          },
          {
            id: 'exit-process',
            title: 'Complete Exit Checklist',
            description: 'Complete all exit checklist items',
            icon: '📋',
            link: '/dashboard/student/exit',
            enabled: true,
            visibility: 'ALWAYS' as const,
          },
        ];
      case 'EXITED':
        return [
          {
            id: 'readmit',
            title: 'Apply for Readmission',
            description: 'Start new hostel application',
            icon: '📝',
            link: '/apply',
            enabled: true,
            visibility: 'ALWAYS' as const,
            badge: {
              text: 'New Application',
              variant: 'info' as const,
            },
          },
        ];
      default:
        return [];
    }
  };

  const quickActions = getQuickActions();

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
            title={residentState.status === 'CHECKED_IN' ? 'Welcome Back, Student!' :
                    residentState.status === 'RENEWAL_DUE' ? 'Renewal Reminder' :
                    residentState.status === 'RENEWED' ? 'Successfully Renewed!' :
                    residentState.status === 'EXIT_INITIATED' ? 'Exit Process Started' :
                    residentState.status === 'EXITED' ? 'Thank you for staying with us' : 'Welcome to Hostel'}
            message={residentState.status === 'CHECKED_IN' ? 'You are currently checked in to hostel. All systems are active.' :
                    residentState.status === 'RENEWAL_DUE' ? `Your 6-month renewal is due in ${residentState.daysUntilRenewal || 30} days. Please complete renewal to avoid late fees.` :
                    residentState.status === 'RENEWED' ? 'Your stay has been renewed for the next academic period. Continue with your studies!' :
                    residentState.status === 'EXIT_INITIATED' ? 'You have initiated the exit process. Complete the checklist before leaving.' :
                    residentState.status === 'EXITED' ? 'Thank you for staying with us! Your exit has been completed.' : 'Complete your admission formalities.'}
            badge={residentState.status === 'CHECKED_IN' ? { text: 'Checked-in', variant: 'success' as const } :
                     residentState.status === 'RENEWAL_DUE' ? { text: 'Due Soon', variant: 'warning' as const } :
                     residentState.status === 'RENEWED' ? { text: 'Renewed', variant: 'success' as const } :
                     residentState.status === 'EXIT_INITIATED' ? { text: 'In Progress', variant: 'warning' as const } :
                     residentState.status === 'EXITED' ? { text: 'Completed', variant: 'info' as const } : undefined}
            helperText={residentState.status === 'CHECKED_IN' ? 'All systems active. No action required.' :
                      residentState.status === 'RENEWAL_DUE' ? 'Visit renewal section to complete your 6-month renewal.' :
                      residentState.status === 'RENEWED' ? 'Your next renewal is due in August 2025.' :
                      residentState.status === 'EXIT_INITIATED' ? 'Complete the exit checklist: clear room, return keys.' :
                      undefined}
            variant={residentState.status === 'RENEWAL_DUE' ? 'warning' :
                    residentState.status === 'RENEWED' ? 'info' : 'default'}
            showProgress={residentState.status === 'RENEWAL_DUE'}
            progressPercent={residentState.status === 'RENEWAL_DUE' && residentState.daysUntilRenewal ? Math.max(0, 100 - (residentState.daysUntilRenewal / 30) * 100) : 0}
          />

          <JourneyTracker
            stages={journeyStages}
            currentStageIndex={journeyStages.findIndex(s => s.status === 'CURRENT')}
            variant="timeline"
          />

          <JourneyTracker
            stages={journeyStages}
            currentStageIndex={0}
            variant="timeline"
          />

          {/* Quick Actions Grid */}
          <QuickActionsGrid actions={quickActions} />

          {/* Notifications Panel - Based on state */}
          <div className="card p-6 mt-8">
            <h3 className="text-heading-4 mb-4" style={{ color: 'var(--text-primary)' }}>
              Notifications
            </h3>
            <div className="space-y-3">
              {residentState.status === 'NEW' && (
                <>
                  <div className="flex items-start gap-3 p-4 rounded" style={{ background: 'var(--bg-page)' }}>
                    <span style={{ color: 'var(--color-blue-600)' }}>📝</span>
                    <div>
                      <p className="text-body font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                        Application Status
                      </p>
                      <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                        Complete all admission formalities to get checked in
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded" style={{ background: 'var(--bg-page)' }}>
                    <span style={{ color: 'var(--color-gold-600)' }}>🎓</span>
                    <div>
                      <p className="text-body font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                        Room Assignment
                      </p>
                      <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                        Your room will be assigned after check-in
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded" style={{ background: 'var(--bg-page)' }}>
                    <span style={{ color: 'var(--color-green-600)' }}>✓</span>
                    <div>
                      <p className="text-body font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                        Documents Verified
                      </p>
                      <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                        Your uploaded documents have been verified
                      </p>
                    </div>
                  </div>
                </>
              )}

              {residentState.status === 'CHECKED_IN' && (
                <>
                  <div className="flex items-start gap-3 p-4 rounded" style={{ background: 'var(--bg-page)' }}>
                    <span style={{ color: 'var(--color-red-500)' }}>⚠</span>
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
                    <span style={{ color: 'var(--color-gold-600)' }}>📢</span>
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
                </>
              )}

              {residentState.status === 'RENEWAL_DUE' && (
                <>
                  <div className="flex items-start gap-3 p-4 rounded" style={{ background: 'var(--bg-state-warning-bg)' }}>
                    <span style={{ color: 'var(--color-red-600)' }}>⚠</span>
                    <div>
                      <p className="text-body font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                        Overdue Payment
                      </p>
                      <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                        Your hostel fees are past due. Please pay immediately to avoid late charges.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded" style={{ background: 'var(--bg-state-warning-bg)' }}>
                    <span style={{ color: 'var(--color-gold-600)' }}>📢</span>
                    <div>
                      <p className="text-body font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                        Action Required
                      </p>
                      <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                        Complete renewal process immediately
                      </p>
                    </div>
                  </div>
                </>
              )}

              {residentState.status === 'RENEWED' && (
                <>
                  <div className="flex items-start gap-3 p-4 rounded" style={{ background: 'var(--bg-page)' }}>
                    <span style={{ color: 'var(--color-green-600)' }}>✓</span>
                    <div>
                      <p className="text-body font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                        Renewal Completed
                      </p>
                      <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                        Your stay has been renewed for next period (Aug 2025 - Feb 2026)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded" style={{ background: 'var(--bg-page)' }}>
                    <span style={{ color: 'var(--color-gold-600)' }}>📄</span>
                    <div>
                      <p className="text-body font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                        Receipt Downloaded
                      </p>
                      <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                        Your renewal receipt has been generated
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded" style={{ background: 'var(--bg-page)' }}>
                    <span style={{ color: 'var(--color-sky-600)' }}>ℹ️</span>
                    <div>
                      <p className="text-body font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                        Holiday Schedule
                      </p>
                      <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                        The hostel will remain closed from December 25 to January 1
                      </p>
                    </div>
                  </div>
                </>
              )}

              {residentState.status === 'EXIT_INITIATED' && (
                <>
                  <div className="flex items-start gap-3 p-4 rounded" style={{ background: 'var(--bg-state-warning-bg)' }}>
                    <span style={{ color: 'var(--color-gold-600)' }}>📋</span>
                    <div>
                      <p className="text-body font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                        Room Clearance Pending
                      </p>
                      <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                        Please clear room and return all keys
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded" style={{ background: 'var(--bg-state-warning-bg)' }}>
                    <span style={{ color: 'var(--color-gold-600)' }}>📋</span>
                    <div>
                      <p className="text-body font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                        Fee Settlement Pending
                      </p>
                      <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                        Complete fee settlement before final exit
                      </p>
                    </div>
                  </div>
                </>
              )}

              {residentState.status === 'EXITED' && (
                <div className="flex items-start gap-3 p-4 rounded" style={{ background: 'var(--bg-state-info-bg)' }}>
                  <span style={{ color: 'var(--color-gold-600)' }}>🏠</span>
                  <div>
                    <p className="text-body font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                      Application Period Closed
                      </p>
                      <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                        Hostel is closed for semester break. Apply for readmission when reopen.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
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

          {/* Quick Profile Card - Based on State */}
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
                  {residentState.status !== 'NEW' ? 'A-201' : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                  Joining Date:
                </span>
                <span className="text-body font-medium" style={{ color: 'var(--text-primary)' }}>
                  {residentState.status !== 'NEW' ? 'August 15, 2024' : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                  Status:
                </span>
                <StatusBadge
                  text={residentState.status === 'CHECKED_IN' ? 'Checked-in' :
                       residentState.status === 'RENEWAL_DUE' ? 'Renewal Due' :
                       residentState.status === 'RENEWED' ? 'Renewed' :
                       residentState.status === 'EXIT_INITIATED' ? 'Exit Process' :
                       residentState.status === 'EXITED' ? 'Checked Out' : 'Unknown'}
                  variant={residentState.status === 'CHECKED_IN' ? 'success' :
                           residentState.status === 'RENEWAL_DUE' ? 'warning' :
                           residentState.status === 'RENEWED' ? 'success' :
                           residentState.status === 'EXIT_INITIATED' ? 'warning' : 'info'}
                  size="md"
                  rounded
                />
              </div>
              <div className="flex justify-between">
                <span className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                  Current Period:
                </span>
                <span className="text-body font-medium" style={{ color: 'var(--text-primary)' }}>
                  {residentState.status === 'NEW' ? 'Not Started' : 'Semester 1, 2024-25'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                  {residentState.status === 'RENEWAL_DUE' ? 'Renewal Due:' :
                    residentState.status === 'RENEWED' ? 'Renewed On:' :
                    residentState.status === 'EXIT_INITIATED' ? 'Exit Date:' :
                    residentState.status === 'EXITED' ? 'Checked Out On:' : 'Exit:'}
                </span>
                <span className="text-body font-medium" style={{ color: 'var(--text-primary)' }}>
                  {residentState.status === 'RENEWAL_DUE' ? 'February 15, 2025' :
                    residentState.status === 'RENEWED' ? 'August 15, 2024' :
                    residentState.status === 'EXIT_INITIATED' ? 'December 20, 2024' :
                    residentState.status === 'EXITED' ? 'December 20, 2024' : '-'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
