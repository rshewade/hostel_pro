import { NextRequest } from 'next/server';
import { find, getCollection } from '@/lib/api/db';
import {
  successResponse,
  serverErrorResponse,
} from '@/lib/api/responses';
import { DashboardAPI, InterviewStatus } from '@/types/api';

/**
 * GET /api/dashboard/trustee
 * Get trustee dashboard data
 */
export async function GET(request: NextRequest) {
  try {
    // Get all interviews
    const interviews = await getCollection('interviews');

    // Count scheduled interviews
    const scheduledInterviews = interviews.filter(
      (i: any) => i.status === InterviewStatus.SCHEDULED
    ).length;

    // Count completed this month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const completedThisMonth = interviews.filter((i: any) => {
      if (i.status !== InterviewStatus.COMPLETED) return false;

      const scheduleDate = new Date(i.schedule_time);
      return (
        scheduleDate.getMonth() === currentMonth &&
        scheduleDate.getFullYear() === currentYear
      );
    }).length;

    // Get upcoming interviews
    const upcomingInterviews = interviews
      .filter((i: any) => {
        return (
          i.status === InterviewStatus.SCHEDULED &&
          new Date(i.schedule_time) > new Date()
        );
      })
      .sort((a: any, b: any) => {
        return new Date(a.schedule_time).getTime() - new Date(b.schedule_time).getTime();
      })
      .slice(0, 5);

    // Count applications awaiting approval
    const applications = await find(
      'applications',
      (app: any) => app.current_status === 'INTERVIEW'
    );

    const dashboardData: DashboardAPI.TrusteeDashboard = {
      interviews: {
        scheduled: scheduledInterviews,
        completed_this_month: completedThisMonth,
        upcoming: upcomingInterviews,
      },
      applications: {
        awaiting_approval: applications.length,
      },
    };

    return successResponse(dashboardData);
  } catch (error: any) {
    console.error('Error in GET /api/dashboard/trustee:', error);
    return serverErrorResponse('Failed to fetch trustee dashboard', error);
  }
}
