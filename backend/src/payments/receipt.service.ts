import {
  Injectable,
  Inject,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { SUPABASE_CLIENT } from '../supabase/supabase.provider';
import { SupabaseClient } from '@supabase/supabase-js';
import * as PDFDocument from 'pdfkit';

export interface ReceiptData {
  receiptNumber: string;
  paymentId: string;
  studentName: string;
  studentId: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  transactionId?: string;
  feeBreakdown?: { description: string; amount: number }[];
  vertical?: string;
}

@Injectable()
export class ReceiptService {
  private readonly logger = new Logger(ReceiptService.name);

  constructor(
    @Inject(SUPABASE_CLIENT) private supabase: SupabaseClient,
  ) {}

  /**
   * Generate a receipt number
   */
  async generateReceiptNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const prefix = `RCP-${year}${month}-`;

    const { data, error } = await this.supabase
      .from('gateway_payments')
      .select('receipt_url')
      .like('receipt_url', `%${prefix}%`)
      .order('created_at', { ascending: false })
      .limit(1);

    let nextNumber = 1;
    if (!error && data && data.length > 0 && data[0].receipt_url) {
      const match = data[0].receipt_url.match(/RCP-\d+-(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    return `${prefix}${nextNumber.toString().padStart(5, '0')}`;
  }

  /**
   * Generate PDF receipt
   */
  async generateReceipt(data: ReceiptData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50,
        });

        const chunks: Buffer[] = [];
        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header
        this.addHeader(doc, data.vertical);

        // Receipt title
        doc.moveDown(2);
        doc.fontSize(20).text('PAYMENT RECEIPT', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(12).text(`Receipt No: ${data.receiptNumber}`, { align: 'center' });

        // Receipt details
        doc.moveDown(2);
        this.addReceiptDetails(doc, data);

        // Fee breakdown
        if (data.feeBreakdown && data.feeBreakdown.length > 0) {
          doc.moveDown(1);
          this.addFeeBreakdown(doc, data.feeBreakdown, data.amount);
        } else {
          doc.moveDown(1);
          this.addSimpleAmount(doc, data.amount);
        }

        // Footer
        doc.moveDown(3);
        this.addFooter(doc);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Add header with institute details
   */
  private addHeader(doc: PDFKit.PDFDocument, vertical?: string): void {
    doc.fontSize(16).text('JAIN HOSTEL', { align: 'center' });
    doc.fontSize(10).text(
      vertical ? `${vertical} Hostel` : 'Hostel Management System',
      { align: 'center' },
    );
    doc.moveDown(0.3);
    doc.fontSize(9).text('123 Institute Road, City - 400001', { align: 'center' });
    doc.text('Phone: +91-9876543210 | Email: hostel@jainhostel.org', { align: 'center' });

    // Draw a line
    doc.moveDown(0.5);
    doc.strokeColor('#333333').lineWidth(1);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  }

  /**
   * Add receipt details
   */
  private addReceiptDetails(doc: PDFKit.PDFDocument, data: ReceiptData): void {
    const leftColumn = 70;
    const rightColumn = 300;
    const startY = doc.y;

    // Left column
    doc.fontSize(10);
    doc.text('Student Name:', leftColumn, startY);
    doc.text('Student ID:', leftColumn, startY + 20);
    doc.text('Payment Date:', leftColumn, startY + 40);

    doc.font('Helvetica-Bold');
    doc.text(data.studentName, leftColumn + 100, startY);
    doc.text(data.studentId, leftColumn + 100, startY + 20);
    doc.text(new Date(data.paymentDate).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }), leftColumn + 100, startY + 40);

    // Right column
    doc.font('Helvetica');
    doc.text('Payment Method:', rightColumn, startY);
    doc.text('Transaction ID:', rightColumn, startY + 20);

    doc.font('Helvetica-Bold');
    doc.text(data.paymentMethod || 'Online', rightColumn + 100, startY);
    doc.text(data.transactionId || '-', rightColumn + 100, startY + 20);

    doc.font('Helvetica');
    doc.y = startY + 70;
  }

  /**
   * Add fee breakdown table
   */
  private addFeeBreakdown(
    doc: PDFKit.PDFDocument,
    breakdown: { description: string; amount: number }[],
    total: number,
  ): void {
    const tableTop = doc.y;
    const col1 = 70;
    const col2 = 450;

    // Table header
    doc.rect(50, tableTop, 495, 25).fill('#f0f0f0');
    doc.fillColor('#333333');
    doc.font('Helvetica-Bold').fontSize(10);
    doc.text('Description', col1, tableTop + 7);
    doc.text('Amount (INR)', col2, tableTop + 7, { width: 80, align: 'right' });

    // Table rows
    let rowY = tableTop + 30;
    doc.font('Helvetica').fontSize(10);
    doc.fillColor('#000000');

    breakdown.forEach((item) => {
      doc.text(item.description, col1, rowY);
      doc.text(this.formatCurrency(item.amount), col2, rowY, { width: 80, align: 'right' });
      rowY += 20;
    });

    // Total row
    doc.strokeColor('#333333').lineWidth(0.5);
    doc.moveTo(50, rowY).lineTo(545, rowY).stroke();

    rowY += 10;
    doc.font('Helvetica-Bold');
    doc.text('Total Amount', col1, rowY);
    doc.text(this.formatCurrency(total), col2, rowY, { width: 80, align: 'right' });

    doc.y = rowY + 30;
  }

  /**
   * Add simple amount (no breakdown)
   */
  private addSimpleAmount(doc: PDFKit.PDFDocument, amount: number): void {
    doc.rect(50, doc.y, 495, 40).fill('#f0f0f0');
    doc.fillColor('#333333');
    doc.font('Helvetica-Bold').fontSize(14);
    doc.text(`Amount Paid: ${this.formatCurrency(amount)}`, 70, doc.y - 30, {
      align: 'center',
    });
    doc.fillColor('#000000');
    doc.y = doc.y + 20;
  }

  /**
   * Add footer
   */
  private addFooter(doc: PDFKit.PDFDocument): void {
    const footerY = doc.y;

    // Signature area
    doc.fontSize(9).text('Authorized Signature', 400, footerY);
    doc.moveTo(380, footerY - 5).lineTo(530, footerY - 5).stroke();

    // Notes
    doc.moveDown(2);
    doc.fontSize(8).fillColor('#666666');
    doc.text('This is a computer-generated receipt and does not require a physical signature.', 50, doc.y, {
      align: 'center',
    });
    doc.text('For any queries, please contact the accounts department.', { align: 'center' });

    // Generated timestamp
    doc.moveDown(1);
    doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, { align: 'center' });
  }

  /**
   * Format currency
   */
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  }

  /**
   * Upload receipt to Supabase Storage
   */
  async uploadReceipt(
    receiptBuffer: Buffer,
    receiptNumber: string,
    studentUserId: string,
  ): Promise<string> {
    const fileName = `receipts/${studentUserId}/${receiptNumber}.pdf`;

    const { error: uploadError } = await this.supabase.storage
      .from('documents')
      .upload(fileName, receiptBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      this.logger.error(`Failed to upload receipt: ${uploadError.message}`);
      throw new InternalServerErrorException('Failed to store receipt');
    }

    // Get public URL
    const { data } = this.supabase.storage
      .from('documents')
      .getPublicUrl(fileName);

    return data.publicUrl;
  }

  /**
   * Generate and store receipt for a payment
   */
  async generateAndStoreReceipt(
    paymentId: string,
    studentUserId: string,
  ): Promise<string> {
    // Fetch payment and student details
    const { data: payment, error: paymentError } = await this.supabase
      .from('gateway_payments')
      .select(`
        *,
        student:users!student_user_id(name, email)
      `)
      .eq('id', paymentId)
      .single();

    if (paymentError || !payment) {
      throw new InternalServerErrorException('Payment not found');
    }

    const receiptNumber = await this.generateReceiptNumber();

    const receiptData: ReceiptData = {
      receiptNumber,
      paymentId,
      studentName: payment.student?.name || 'Unknown',
      studentId: studentUserId.substring(0, 8).toUpperCase(),
      amount: payment.amount,
      paymentMethod: payment.payment_method || 'Online',
      paymentDate: payment.paid_at || payment.created_at,
      transactionId: payment.razorpay_payment_id,
      feeBreakdown: payment.fee_breakdown,
    };

    // Generate PDF
    const pdfBuffer = await this.generateReceipt(receiptData);

    // Upload to storage
    const receiptUrl = await this.uploadReceipt(pdfBuffer, receiptNumber, studentUserId);

    // Update payment with receipt URL
    await this.supabase
      .from('gateway_payments')
      .update({ receipt_url: receiptUrl })
      .eq('id', paymentId);

    this.logger.log(`Receipt generated: ${receiptNumber} for payment ${paymentId}`);

    return receiptUrl;
  }
}
