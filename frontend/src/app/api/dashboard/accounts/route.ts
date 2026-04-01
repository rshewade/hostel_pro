import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import {
  successResponse,
  serverErrorResponse,
} from '@/lib/api/responses';
import { DashboardAPI, TransactionStatus, FeeStatus } from '@/types/api';
import { requireAuth } from '@/lib/authorize';

/**
 * GET /api/dashboard/accounts
 * Get accounts dashboard data
 * Auth: ACCOUNTS only
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request, ['ACCOUNTS']);
    // Get all payments (transactions)
    const { rows: transactions } = await query('SELECT * FROM payments');

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    let collectedThisMonth = 0;

    (transactions || []).forEach((txn: any) => {
      if (txn.status === TransactionStatus.SUCCESS || txn.status === 'PAID') {
        const txnDate = new Date(txn.created_at);
        if (
          txnDate.getMonth() === currentMonth &&
          txnDate.getFullYear() === currentYear
        ) {
          collectedThisMonth += txn.amount || 0;
        }
      }
    });

    // Get fee summary
    const { rows: fees } = await query('SELECT * FROM fees');

    let pendingAmount = 0;
    let overdueAmount = 0;

    (fees || []).forEach((fee: any) => {
      if (fee.status === FeeStatus.PENDING || fee.status === 'PENDING') {
        const dueDate = new Date(fee.due_date);
        const isOverdue = dueDate < new Date();

        if (isOverdue) {
          overdueAmount += fee.amount || 0;
        } else {
          pendingAmount += fee.amount || 0;
        }
      }
    });

    // Get recent transactions (successful ones)
    const recentTransactions = (transactions || [])
      .filter((txn: any) => txn.status === TransactionStatus.SUCCESS || txn.status === 'PAID')
      .sort((a: any, b: any) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      })
      .slice(0, 10);

    const dashboardData: DashboardAPI.AccountsDashboard = {
      payments: {
        collected_this_month: collectedThisMonth,
        pending: pendingAmount,
        overdue: overdueAmount,
      },
      recent_transactions: recentTransactions,
    };

    return successResponse(dashboardData);
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    console.error('Error in GET /api/dashboard/accounts:', error);
    return serverErrorResponse('Failed to fetch accounts dashboard', error);
  }
}
