import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
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
    const supabase = createServerClient();

    // Get all interviews
    const { data: interviews, error: interviewError } = await supabase
      .from('interviews')
      .select('*');

    if (interviewError) {
      console.error('Supabase error fetching interviews:', interviewError);
      return serverErrorResponse('Failed to fetch interviews', interviewError);
    }

    // Count scheduled interviews
    const scheduledInterviews = (interviews || []).filter(
      (i: any) => i.status === InterviewStatus.SCHEDULED
    ).length;

    // Count completed this month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const completedThisMonth = (interviews || []).filter((i: any) => {
      if (i.status !== InterviewStatus.COMPLETED) return false;

      const scheduleDate = new Date(i.schedule_time);
      return (
        scheduleDate.getMonth() === currentMonth &&
        scheduleDate.getFullYear() === currentYear
      );
    }).length;

    // Get upcoming interviews
    const upcomingInterviews = (interviews || [])
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

    // Count applications awaiting approval (in INTERVIEW status)
    const { data: applications, error: appError } = await supabase
      .from('applications')
      .select('id')
      .eq('current_status', 'INTERVIEW');

    if (appError) {
      console.error('Supabase error fetching applications:', appError);
      return serverErrorResponse('Failed to fetch applications', appError);
    }

    const dashboardData: DashboardAPI.TrusteeDashboard = {
      interviews: {
        scheduled: scheduledInterviews,
        completed_this_month: completedThisMonth,
        upcoming: upcomingInterviews,
      },
      applications: {
        awaiting_approval: (applications || []).length,
      },
    };

    return successResponse(dashboardData);
  } catch (error: any) {
    console.error('Error in GET /api/dashboard/trustee:', error);
    return serverErrorResponse('Failed to fetch trustee dashboard', error);
  }
}
