import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PaymentsController } from './payments.controller';
import { PaymentGatewayController } from './payment-gateway.controller';
import { PaymentsService } from './payments.service';
import { PaymentGatewayService } from './payment-gateway.service';
import { RazorpayService } from './razorpay/razorpay.service';
import { ReceiptService } from './receipt.service';
import { ReconciliationService } from './reconciliation.service';
import { RazorpayProvider } from './razorpay/razorpay.provider';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [
    SupabaseModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [
    PaymentsController,
    PaymentGatewayController,
  ],
  providers: [
    RazorpayProvider,
    RazorpayService,
    PaymentsService,
    PaymentGatewayService,
    ReceiptService,
    ReconciliationService,
  ],
  exports: [
    PaymentsService,
    PaymentGatewayService,
    ReceiptService,
  ],
})
export class PaymentsModule {}
