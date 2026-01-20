import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ComplianceController } from './compliance.controller';
import { CryptoService } from './crypto.service';
import { ConsentService } from './consent.service';
import { AuditService } from './audit.service';
import { DataRetentionService } from './data-retention.service';
import { AuditReportService } from './audit-report.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [
    SupabaseModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [ComplianceController],
  providers: [
    CryptoService,
    ConsentService,
    AuditService,
    DataRetentionService,
    AuditReportService,
  ],
  exports: [
    CryptoService,
    ConsentService,
    AuditService,
    DataRetentionService,
    AuditReportService,
  ],
})
export class ComplianceModule {}
