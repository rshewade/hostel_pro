import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
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
    const supabase = createServerClient();
    const body: PaymentAPI.VerifyRequest = await request.json();
    const { transaction_id } = body;

    if (!transaction_id) {
      return badRequestResponse('Transaction ID is required');
    }

    // Find payment by transaction_id
    const { data: payment, error } = await supabase
      .from('payments')
      .select('*')
      .eq('transaction_id', transaction_id)
      .single();

    if (error || !payment) {
      return notFoundResponse('Transaction not found');
    }

    console.log('\n========================================');
    console.log('🔍 PAYMENT VERIFIED');
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
    console.error('Error in POST /api/payments/verify:', error);
    return serverErrorResponse('Failed to verify payment', error);
  }
}
