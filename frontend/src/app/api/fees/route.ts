import { NextRequest } from 'next/server';
import { find } from '@/lib/api/db';
import {
  successResponse,
  serverErrorResponse,
} from '@/lib/api/responses';
import { FeeAPI, FeeStatus } from '@/types/api';

/**
 * GET /api/fees
 * List fees with optional filtering by student and status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('student_id');
    const status = searchParams.get('status') as FeeStatus | null;

    let fees = await find('fees', (fee: any) => {
      const matchesStudent = !studentId || fee.student_id === studentId;
      const matchesStatus = !status || fee.status === status;

      return matchesStudent && matchesStatus;
    });

    // Calculate summary
    const summary = {
      total_pending: 0,
      total_paid: 0,
      total_overdue: 0,
    };

    fees.forEach((fee: any) => {
      const amount = fee.amount || 0;
      if (fee.status === FeeStatus.PENDING) {
        // Check if overdue
        const dueDate = new Date(fee.due_date);
        const isOverdue = dueDate < new Date();

        if (isOverdue) {
          summary.total_overdue += amount;
        } else {
          summary.total_pending += amount;
        }
      } else if (fee.status === FeeStatus.PAID) {
        summary.total_paid += amount;
      } else if (fee.status === FeeStatus.OVERDUE) {
        summary.total_overdue += amount;
      }
    });

    return successResponse({
      data: fees,
      summary,
    } as FeeAPI.ListResponse);
  } catch (error: any) {
    console.error('Error in GET /api/fees:', error);
    return serverErrorResponse('Failed to fetch fees', error);
  }
}
