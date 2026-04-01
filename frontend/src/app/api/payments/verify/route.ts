import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import {
  successResponse,
  badRequestResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/api/responses';
import { PaymentAPI } from '@/types/api';
import { requireAuth } from '@/lib/authorize';

/**
 * POST /api/payments/verify
 * Verify payment status
 * Auth: any authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body: PaymentAPI.VerifyRequest = await request.json();
    const { transaction_id } = body;

    if (!transaction_id) {
      return badRequestResponse('Transaction ID is required');
    }

    // Find payment by transaction_id
    const { rows } = await query(
      'SELECT * FROM payments WHERE transaction_id = $1',
      [transaction_id]
    );

    if (rows.length === 0) {
      return notFoundResponse('Transaction not found');
    }

    const payment = rows[0];

    console.log('\n========================================');
    console.log('PAYMENT VERIFIED');
    console.log('========================================');
    console.log('Transaction ID:', transaction_id);
    console.log('Status:', payment.status);
    console.log('Amount:', payment.amount);
    console.log('========================================\n');

    return successResponse({
      status: payment.status,
      data: payment,
    } as PaymentAPI.VerifyResponse);
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    console.error('Error in POST /api/payments/verify:', error);
    return serverErrorResponse('Failed to verify payment', error);
  }
}
