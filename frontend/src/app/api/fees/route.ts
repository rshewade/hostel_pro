import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
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
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('student_id');
    const status = searchParams.get('status') as FeeStatus | null;

    let query = supabase.from('fees').select('*');

    if (studentId) {
      query = query.eq('student_user_id', studentId);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data: fees, error } = await query.order('due_date', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return serverErrorResponse('Failed to fetch fees', error);
    }

    // Calculate summary
    const summary = {
      total_pending: 0,
      total_paid: 0,
      total_overdue: 0,
    };

    const now = new Date();
    (fees || []).forEach((fee: any) => {
      const amount = parseFloat(fee.amount) || 0;
      if (fee.status === 'PENDING') {
        const dueDate = new Date(fee.due_date);
        const isOverdue = dueDate < now;

        if (isOverdue) {
          summary.total_overdue += amount;
        } else {
          summary.total_pending += amount;
        }
      } else if (fee.status === 'PAID') {
        summary.total_paid += amount;
      } else if (fee.status === 'OVERDUE') {
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
