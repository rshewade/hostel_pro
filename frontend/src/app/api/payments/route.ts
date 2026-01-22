import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import {
  createdResponse,
  badRequestResponse,
  notFoundResponse,
  serverErrorResponse,
  validateFields,
} from '@/lib/api/responses';
import { PaymentAPI } from '@/types/api';

/**
 * POST /api/payments
 * Initiate a new payment
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const body: PaymentAPI.InitiateRequest = await request.json();
    const { fee_id, payment_method, amount } = body;

    // Validate input
    const validation = validateFields([
      {
        field: 'fee_id',
        value: fee_id,
        rules: [{ type: 'required', message: 'Fee ID is required' }],
      },
      {
        field: 'payment_method',
        value: payment_method,
        rules: [{ type: 'required', message: 'Payment method is required' }],
      },
      {
        field: 'amount',
        value: amount,
        rules: [
          { type: 'required', message: 'Amount is required' },
          {
            type: 'custom',
            message: 'Amount must be greater than 0',
            validator: (val: number) => val > 0,
          },
        ],
      },
    ]);

    if (!validation.isValid) {
      return badRequestResponse('Validation failed', validation.errors);
    }

    // Verify fee exists
    const { data: fee, error: feeError } = await supabase
      .from('fees')
      .select('*')
      .eq('id', fee_id)
      .single();

    if (feeError || !fee) {
      return notFoundResponse('Fee not found');
    }

    // Check if fee is already paid
    if (fee.status === 'PAID') {
      return badRequestResponse('Fee has already been paid');
    }

    // Verify amount matches fee
    const feeAmount = parseFloat(fee.amount);
    if (amount !== feeAmount) {
      return badRequestResponse(
        `Payment amount (${amount}) does not match fee amount (${feeAmount})`
      );
    }

    // Create payment record
    const transactionId = `TXN${Date.now()}`;
    const { data: payment, error: insertError } = await supabase
      .from('payments')
      .insert({
        fee_id,
        student_user_id: fee.student_user_id,
        amount,
        payment_method: payment_method.toUpperCase(),
        transaction_id: transactionId,
        status: 'PENDING',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      return serverErrorResponse('Failed to create payment', insertError);
    }

    // For mock implementation in development, immediately mark as success
    if (process.env.NODE_ENV === 'development') {
      // Auto-complete payment in development
      await supabase
        .from('payments')
        .update({
          status: 'PAID',
          paid_at: new Date().toISOString(),
        })
        .eq('id', payment.id);

      // Update fee status
      await supabase
        .from('fees')
        .update({
          status: 'PAID',
          paid_at: new Date().toISOString(),
        })
        .eq('id', fee_id);
    }

    console.log('\n========================================');
    console.log('💰 PAYMENT INITIATED');
    console.log('========================================');
    console.log('Transaction ID:', transactionId);
    console.log('Fee ID:', fee_id);
    console.log('Amount:', amount);
    console.log('Payment Method:', payment_method);
    console.log('Status:', payment.status);
    console.log('========================================\n');

    const response: PaymentAPI.InitiateResponse = {
      success: true,
      transaction_id: transactionId,
      ...(payment_method === 'UPI' && {
        payment_url: `upi://pay?pa=hostel@bank&pn=Hostel&am=${amount}&tn=${transactionId}`,
      }),
    };

    return createdResponse(response, 'Payment initiated successfully');
  } catch (error: any) {
    console.error('Error in POST /api/payments:', error);
    return serverErrorResponse('Failed to initiate payment', error);
  }
}
