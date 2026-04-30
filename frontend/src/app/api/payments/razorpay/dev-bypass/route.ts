import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * DEV-ONLY: marks the application's admission fee as paid and flips the
 * application to SUBMITTED, without invoking Razorpay. Disabled unless
 * PAYMENT_BYPASS=true in the server env.
 */
export async function POST(request: NextRequest) {
  if (process.env.PAYMENT_BYPASS !== 'true') {
    return NextResponse.json(
      { success: false, error: 'Payment bypass not enabled' },
      { status: 403 },
    );
  }

  try {
    const { applicationId } = (await request.json()) as { applicationId?: string };
    if (!applicationId) {
      return NextResponse.json(
        { success: false, error: 'applicationId is required' },
        { status: 400 },
      );
    }

    const { rows: feeRows } = await query(
      `SELECT id, status FROM fees
       WHERE application_id = $1 AND fee_head = 'ADMISSION_FEE'
       ORDER BY created_at DESC LIMIT 1`,
      [applicationId],
    );
    if (!feeRows[0]) {
      return NextResponse.json(
        { success: false, error: 'Admission fee record not found' },
        { status: 404 },
      );
    }
    const fee = feeRows[0];

    await query('BEGIN');
    try {
      if (fee.status !== 'PAID') {
        await query(
          `UPDATE fees SET status='PAID', paid_amount=amount, paid_at=NOW(), payment_method='ONLINE'
           WHERE id=$1`,
          [fee.id],
        );
      }
      await query(
        `UPDATE applications
         SET current_status='SUBMITTED', submitted_at=COALESCE(submitted_at, NOW())
         WHERE id=$1 AND current_status='DRAFT'`,
        [applicationId],
      );
      await query(
        `INSERT INTO audit_logs (entity_type, entity_id, action, metadata)
         VALUES ('APPLICATION', $1, 'STATUS_CHANGE', $2)`,
        [applicationId, JSON.stringify({ event: 'PAYMENT_BYPASS', feeId: fee.id })],
      );
      await query('COMMIT');
    } catch (e) {
      await query('ROLLBACK');
      throw e;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in /api/payments/razorpay/dev-bypass:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal error' },
      { status: 500 },
    );
  }
}
