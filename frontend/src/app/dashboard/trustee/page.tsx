'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/shadcn/button-extended';
import { Badge } from '@/components/shadcn/badge-extended';
import { Spinner } from '@/components/feedback/Spinner';
import { TrusteeStatsCard } from './_components';
import { FileText, CalendarDays, BedDouble, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface DashboardStats {
  pendingApplications: number;
  scheduledInterviews: number;
  pendingAllocations: number;
  approvedThisMonth: number;
  rejectedThisMonth: number;
  totalResidents: number;
}

interface RecentActivity {
  id: string;
  type: 'application' | 'interview' | 'allocation' | 'approval';
  description: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'scheduled';
}

export default function TrusteeOverview() {
  const { t } = useLanguage();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    pendingApplications: 0,
    scheduledInterviews: 0,
    pendingAllocations: 0,
    approvedThisMonth: 0,
    rejectedThisMonth: 0,
    totalResidents: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch applications to calculate stats
      const applicationsResponse = await fetch('/api/applications');
      if (!applicationsResponse.ok) {
        throw new Error('Failed to fetch applications');
      }
      const applicationsData = await applicationsResponse.json();
      const applications = Array.isArray(applicationsData) ? applicationsData : [];

      // Calculate stats from applications
      const pending = applications.filter((app: any) =>
        app.status === 'REVIEW' || app.status === 'FORWARDED' || app.currentStatus === 'REVIEW'
      ).length;

      const interviewScheduled = applications.filter((app: any) =>
        app.status === 'INTERVIEW_SCHEDULED' || app.currentStatus === 'INTERVIEW_SCHEDULED'
      ).length;

      const pendingAllocation = applications.filter((app: any) =>
        app.status === 'APPROVED' || app.currentStatus === 'APPROVED'
      ).length;

      const thisMonth = new Date();
      thisMonth.setDate(1);

      const approvedThisMonth = applications.filter((app: any) => {
        const updatedAt = new Date(app.updatedAt || app.updated_at);
        return (app.status === 'APPROVED' || app.currentStatus === 'APPROVED') && updatedAt >= thisMonth;
      }).length;

      const rejectedThisMonth = applications.filter((app: any) => {
        const updatedAt = new Date(app.updatedAt || app.updated_at);
        return (app.status === 'REJECTED' || app.currentStatus === 'REJECTED') && updatedAt >= thisMonth;
      }).length;

      setStats({
        pendingApplications: pending,
        scheduledInterviews: interviewScheduled,
        pendingAllocations: pendingAllocation,
        approvedThisMonth,
        rejectedThisMonth,
        totalResidents: 0, // Would need allocations API
      });

      // Create recent activities from latest applications
      const activities: RecentActivity[] = applications
        .slice(0, 5)
        .map((app: any) => ({
          id: app.id,
          type: 'application' as const,
          description: `Application ${app.trackingNumber || app.tracking_number || app.id} - ${app.firstName || 'Applicant'}`,
          timestamp: app.updatedAt || app.updated_at || app.createdAt || app.created_at,
          status: app.status === 'APPROVED' ? 'completed' as const :
                  app.status === 'INTERVIEW_SCHEDULED' ? 'scheduled' as const :
                  'pending' as const,
        }));

      setRecentActivities(activities);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
        <span className="ml-3" style={{ color: 'var(--text-secondary)' }}>
          {t('Loading dashboard...', 'डैशबोर्ड लोड हो रहा है...')}
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-lg border" style={{ background: 'var(--color-red-50)', borderColor: 'var(--color-red-200)' }}>
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <div>
            <p className="font-medium text-red-700">{t('Error loading dashboard', 'डैशबोर्ड लोड करने में त्रुटि')}</p>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
        <Button variant="secondary" size="sm" className="mt-4" onClick={fetchDashboardData}>
          {t('Retry', 'पुनः प्रयास करें')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          {t('Trustee Dashboard', 'ट्रस्टी डैशबोर्ड')}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          {t('Overview of applications, interviews, and allocations', 'आवेदन, साक्षात्कार, और आवंटन का अवलोकन')}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <TrusteeStatsCard
          title={t('Pending Applications', 'लंबित आवेदन')}
          value={stats.pendingApplications}
          subtitle={t('Awaiting review', 'समीक्षा की प्रतीक्षा')}
          icon={FileText}
          variant="warning"
          onClick={() => router.push('/dashboard/trustee/applications')}
        />
        <TrusteeStatsCard
          title={t('Scheduled Interviews', 'निर्धारित साक्षात्कार')}
          value={stats.scheduledInterviews}
          subtitle={t('This week', 'इस सप्ताह')}
          icon={CalendarDays}
          variant="primary"
          onClick={() => router.push('/dashboard/trustee/interviews')}
        />
        <TrusteeStatsCard
          title={t('Pending Allocations', 'लंबित आवंटन')}
          value={stats.pendingAllocations}
          subtitle={t('Approved, awaiting room', 'स्वीकृत, कमरे की प्रतीक्षा')}
          icon={BedDouble}
          variant="success"
          onClick={() => router.push('/dashboard/trustee/allocations')}
        />
        <TrusteeStatsCard
          title={t('Approved This Month', 'इस महीने स्वीकृत')}
          value={stats.approvedThisMonth}
          subtitle={`${stats.rejectedThisMonth} rejected`}
          icon={CheckCircle}
          variant="default"
          onClick={() => router.push('/dashboard/trustee/reports')}
        />
      </div>

      {/* Quick Actions */}
      <div className="p-6 rounded-lg" style={{ background: 'var(--surface-primary)' }}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          {t('Quick Actions', 'त्वरित कार्रवाई')}
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Button
            variant="primary"
            fullWidth
            onClick={() => router.push('/dashboard/trustee/applications')}
          >
            <FileText className="w-4 h-4 mr-2" />
            {t('Review Applications', 'आवेदन समीक्षा करें')}
          </Button>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => router.push('/dashboard/trustee/interviews')}
          >
            <CalendarDays className="w-4 h-4 mr-2" />
            {t('Manage Interviews', 'साक्षात्कार प्रबंधित करें')}
          </Button>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => router.push('/dashboard/trustee/allocations')}
          >
            <BedDouble className="w-4 h-4 mr-2" />
            {t('Allocate Rooms', 'कमरे आवंटित करें')}
          </Button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="p-6 rounded-lg" style={{ background: 'var(--surface-primary)' }}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          {t('Recent Activity', 'हाल की गतिविधि')}
        </h2>
        {recentActivities.length === 0 ? (
          <p className="text-gray-500 text-center py-8">{t('No recent activity', 'कोई हाल की गतिविधि नहीं')}</p>
        ) : (
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-3 rounded border"
                style={{ borderColor: 'var(--border-gray-200)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-gray-100">
                    {activity.type === 'application' && <FileText className="w-4 h-4 text-gray-600" />}
                    {activity.type === 'interview' && <CalendarDays className="w-4 h-4 text-blue-600" />}
                    {activity.type === 'allocation' && <BedDouble className="w-4 h-4 text-green-600" />}
                    {activity.type === 'approval' && <CheckCircle className="w-4 h-4 text-green-600" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {activity.timestamp ? new Date(activity.timestamp).toLocaleString() : 'Recently'}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={
                    activity.status === 'completed'
                      ? 'success'
                      : activity.status === 'scheduled'
                      ? 'warning'
                      : 'default'
                  }
                  size="sm"
                >
                  {activity.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Items Summary */}
      {stats.pendingApplications > 0 && (
        <div
          className="p-4 rounded-lg border-l-4"
          style={{ background: 'var(--color-yellow-50)', borderColor: 'var(--color-yellow-500)' }}
        >
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-800">
                {stats.pendingApplications} application{stats.pendingApplications > 1 ? 's' : ''} pending review
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                These applications have been forwarded by superintendents and are awaiting your decision.
              </p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-3"
                onClick={() => router.push('/dashboard/trustee/applications')}
              >
                {t('Review Now', 'अभी समीक्षा करें')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
