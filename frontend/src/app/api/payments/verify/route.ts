import { NextRequest } from 'next/server';
import { findOne } from '@/lib/api/db';
import {
  successResponse,
  badRequestResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/api/responses';
import { PaymentAPI } from '@/types/api';

/**
 * POST /api/payments/verify
 * Verify payment status
 */
export async function POST(request: NextRequest) {
  try {
    const body: PaymentAPI.VerifyRequest = await request.json();
    const { transaction_id } = body;

    if (!transaction_id) {
      return badRequestResponse('Transaction ID is required');
    }

    // Find transaction
    const transaction = await findOne(
      'transactions',
      (txn: any) => txn.transaction_id === transaction_id
    );

    if (!transaction) {
      return notFoundResponse('Transaction not found');
    }

    console.log('\n========================================');
    console.log('🔍 PAYMENT VERIFIED');
    console.log('========================================');
    console.log('Transaction ID:', transaction_id);
    console.log('Status:', transaction.status);
    console.log('Amount:', transaction.amount);
    console.log('========================================\n');

    return successResponse({
      status: transaction.status,
      data: transaction,
    } as PaymentAPI.VerifyResponse);
  } catch (error: any) {
    console.error('Error in POST /api/payments/verify:', error);
    return serverErrorResponse('Failed to verify payment', error);
  }
}
