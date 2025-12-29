import { NextRequest } from 'next/server';
import { getCollection, find } from '@/lib/api/db';
import {
  successResponse,
  serverErrorResponse,
} from '@/lib/api/responses';
import { DashboardAPI, ApplicationStatus } from '@/types/api';

/**
 * GET /api/dashboard/superintendent
 * Get superintendent dashboard data
 */
export async function GET(request: NextRequest) {
  try {
    // Get all applications
    const applications = await getCollection('applications');

    // Count by status
    const byStatus: Record<ApplicationStatus, number> = {
      DRAFT: 0,
      SUBMITTED: 0,
      REVIEW: 0,
      INTERVIEW: 0,
      APPROVED: 0,
      REJECTED: 0,
      ARCHIVED: 0,
    };

    let pendingReview = 0;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    let totalThisMonth = 0;

    applications.forEach((app: any) => {
      byStatus[app.current_status as ApplicationStatus]++;

      if (app.current_status === 'SUBMITTED' || app.current_status === 'REVIEW') {
        pendingReview++;
      }

      const createdDate = new Date(app.created_at);
      if (
        createdDate.getMonth() === currentMonth &&
        createdDate.getFullYear() === currentYear
      ) {
        totalThisMonth++;
      }
    });

    // Get occupancy stats
    const rooms = await getCollection('rooms');
    let totalCapacity = 0;
    let currentOccupancy = 0;

    rooms.forEach((room: any) => {
      totalCapacity += room.capacity;
      currentOccupancy += room.current_occupancy;
    });

    const occupancyPercentage = totalCapacity > 0
      ? Math.round((currentOccupancy / totalCapacity) * 100)
      : 0;

    // Get recent applications
    const recentApplications = applications
      .filter((app: any) => app.current_status !== 'DRAFT' && app.current_status !== 'ARCHIVED')
      .sort((a: any, b: any) => {
        return new Date(b.submitted_at || b.created_at).getTime() -
               new Date(a.submitted_at || a.created_at).getTime();
      })
      .slice(0, 10);

    const dashboardData: DashboardAPI.SuperintendentDashboard = {
      applications: {
        pending_review: pendingReview,
        total_this_month: totalThisMonth,
        by_status: byStatus,
      },
      occupancy: {
        total_capacity: totalCapacity,
        current_occupancy: currentOccupancy,
        percentage: occupancyPercentage,
      },
      recent_applications: recentApplications,
    };

    return successResponse(dashboardData);
  } catch (error: any) {
    console.error('Error in GET /api/dashboard/superintendent:', error);
    return serverErrorResponse('Failed to fetch superintendent dashboard', error);
  }
}
