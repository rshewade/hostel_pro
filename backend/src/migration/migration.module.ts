import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from '../supabase/supabase.module';
import { ValidationService } from './validation.service';
import { MigrationService } from './migration.service';
import { VerificationService } from './verification.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    SupabaseModule,
  ],
  providers: [
    ValidationService,
    MigrationService,
    VerificationService,
  ],
  exports: [
    ValidationService,
    MigrationService,
    VerificationService,
  ],
})
export class MigrationModule {}
