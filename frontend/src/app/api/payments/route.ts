import { NextRequest } from 'next/server';
import { findById, insert, updateById, generateId } from '@/lib/api/db';
import {
  successResponse,
  createdResponse,
  badRequestResponse,
  notFoundResponse,
  serverErrorResponse,
  validateFields,
} from '@/lib/api/responses';
import { PaymentAPI, FeeStatus, TransactionStatus } from '@/types/api';

/**
 * POST /api/payments
 * Initiate a new payment
 */
export async function POST(request: NextRequest) {
  try {
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
    const fee = await findById('fees', fee_id);
    if (!fee) {
      return notFoundResponse('Fee not found');
    }

    // Check if fee is already paid
    if (fee.status === FeeStatus.PAID) {
      return badRequestResponse('Fee has already been paid');
    }

    // Verify amount matches fee
    if (amount !== fee.amount) {
      return badRequestResponse(
        `Payment amount (${amount}) does not match fee amount (${fee.amount})`
      );
    }

    // Create transaction
    const transactionId = generateId('txn');
    const transaction = {
      id: transactionId,
      fee_id,
      amount,
      payment_method,
      transaction_id: `TXN${Date.now()}`,
      status: TransactionStatus.PENDING,
      created_at: new Date().toISOString(),
    };

    await insert('transactions', transaction);

    // For mock implementation, immediately mark as success
    // In production, this would return payment gateway URL
    if (process.env.NODE_ENV === 'development') {
      // Auto-complete payment in development
      await updateById('transactions', transactionId, {
        status: TransactionStatus.SUCCESS,
      });

      // Update fee status
      await updateById('fees', fee_id, {
        status: FeeStatus.PAID,
        paid_at: new Date().toISOString(),
      });
    }

    console.log('\n========================================');
    console.log('💰 PAYMENT INITIATED');
    console.log('========================================');
    console.log('Transaction ID:', transaction.transaction_id);
    console.log('Fee ID:', fee_id);
    console.log('Amount:', amount);
    console.log('Payment Method:', payment_method);
    console.log('Status:', transaction.status);
    console.log('========================================\n');

    const response: PaymentAPI.InitiateResponse = {
      success: true,
      transaction_id: transaction.transaction_id,
      ...(payment_method === 'UPI' && {
        payment_url: `upi://pay?pa=hostel@bank&pn=Hostel&am=${amount}&tn=${transaction.transaction_id}`,
      }),
    };

    return createdResponse(response, 'Payment initiated successfully');
  } catch (error: any) {
    console.error('Error in POST /api/payments:', error);
    return serverErrorResponse('Failed to initiate payment', error);
  }
}
