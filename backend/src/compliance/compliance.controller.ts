import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ConsentService, ConsentType, REQUIRED_CONSENTS } from './consent.service';
import { AuditService, AuditQueryParams } from './audit.service';
import { DataRetentionService } from './data-retention.service';
import { AuditReportService } from './audit-report.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    role: string;
  };
}

class RecordConsentDto {
  consentType: ConsentType;
  version: string;
  consentText: string;
}

@ApiTags('compliance')
@Controller('api/v1/compliance')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ComplianceController {
  constructor(
    private readonly consentService: ConsentService,
    private readonly auditService: AuditService,
    private readonly dataRetentionService: DataRetentionService,
    private readonly auditReportService: AuditReportService,
  ) {}

  // ==================== Consent Management ====================

  /**
   * Record user consent
   */
  @Post('consent')
  @ApiOperation({ summary: 'Record user consent' })
  @ApiResponse({ status: 201, description: 'Consent recorded' })
  async recordConsent(
    @Body() dto: RecordConsentDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.consentService.recordConsent({
      userId: req.user.sub,
      consentType: dto.consentType,
      version: dto.version,
      consentText: dto.consentText,
    });
  }

  /**
   * Get user's active consents
   */
  @Get('consent/my')
  @ApiOperation({ summary: 'Get current user consents' })
  @ApiResponse({ status: 200, description: 'User consents' })
  async getMyConsents(@Request() req: AuthenticatedRequest) {
    return this.consentService.getUserConsents(req.user.sub);
  }

  /**
   * Check if consent renewal is needed
   */
  @Get('consent/check/:consentType')
  @ApiOperation({ summary: 'Check if consent renewal is needed' })
  @ApiParam({ name: 'consentType', description: 'Type of consent' })
  async checkConsentRenewal(
    @Param('consentType') consentType: ConsentType,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.consentService.checkConsentRenewal(req.user.sub, consentType);
  }

  /**
   * Get required consents for an operation
   */
  @Get('consent/required/:operation')
  @ApiOperation({ summary: 'Get required consents for an operation' })
  @ApiParam({ name: 'operation', enum: ['APPLICATION', 'ADMISSION', 'RENEWAL', 'PARENT_ACCESS'] })
  getRequiredConsents(
    @Param('operation') operation: keyof typeof REQUIRED_CONSENTS,
  ) {
    return {
      operation,
      requiredConsents: REQUIRED_CONSENTS[operation] || [],
    };
  }

  /**
   * Revoke consent
   */
  @Post('consent/:consentId/revoke')
  @ApiOperation({ summary: 'Revoke a consent' })
  @ApiParam({ name: 'consentId', description: 'Consent ID' })
  async revokeConsent(
    @Param('consentId') consentId: string,
    @Body('reason') reason?: string,
  ) {
    return this.consentService.revokeConsent(consentId, reason);
  }

  // ==================== Audit Logs ====================

  /**
   * Query audit logs (Staff only)
   */
  @Get('audit')
  @UseGuards(RolesGuard)
  @Roles('TRUSTEE', 'ACCOUNTS')
  @ApiOperation({ summary: 'Query audit logs' })
  @ApiQuery({ name: 'entityType', required: false })
  @ApiQuery({ name: 'entityId', required: false })
  @ApiQuery({ name: 'action', required: false })
  @ApiQuery({ name: 'actorId', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async queryAuditLogs(@Query() params: AuditQueryParams) {
    return this.auditService.query(params);
  }

  /**
   * Get audit trail for an entity
   */
  @Get('audit/entity/:entityType/:entityId')
  @UseGuards(RolesGuard)
  @Roles('TRUSTEE', 'ACCOUNTS', 'SUPERINTENDENT')
  @ApiOperation({ summary: 'Get audit trail for an entity' })
  async getEntityAuditTrail(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return this.auditService.getEntityAuditTrail(entityType as any, entityId);
  }

  /**
   * Get audit statistics
   */
  @Get('audit/stats')
  @UseGuards(RolesGuard)
  @Roles('TRUSTEE', 'ACCOUNTS')
  @ApiOperation({ summary: 'Get audit statistics' })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  async getAuditStats(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.auditService.getAuditStats(startDate, endDate);
  }

  /**
   * Detect suspicious activity
   */
  @Get('audit/suspicious')
  @UseGuards(RolesGuard)
  @Roles('TRUSTEE')
  @ApiOperation({ summary: 'Detect suspicious activity' })
  @ApiQuery({ name: 'hoursBack', required: false, type: Number })
  async detectSuspiciousActivity(@Query('hoursBack') hoursBack?: number) {
    return this.auditService.detectSuspiciousActivity(hoursBack || 24);
  }

  // ==================== Data Retention ====================

  /**
   * Get data retention statistics
   */
  @Get('retention/stats')
  @UseGuards(RolesGuard)
  @Roles('TRUSTEE', 'ACCOUNTS')
  @ApiOperation({ summary: 'Get data retention statistics' })
  async getRetentionStats() {
    return this.dataRetentionService.getRetentionStats();
  }

  /**
   * Export user data (DPDP compliance)
   */
  @Get('data-export')
  @ApiOperation({ summary: 'Export current user data (DPDP compliance)' })
  async exportMyData(@Request() req: AuthenticatedRequest) {
    return this.dataRetentionService.exportUserData(req.user.sub);
  }

  /**
   * Request data deletion (DPDP compliance)
   */
  @Post('data-deletion-request')
  @ApiOperation({ summary: 'Request data deletion (DPDP compliance)' })
  async requestDataDeletion(@Request() req: AuthenticatedRequest) {
    return this.dataRetentionService.handleDeletionRequest(
      req.user.sub,
      req.user.sub,
    );
  }

  // ==================== Audit Reports ====================

  /**
   * Get list of generated audit reports
   */
  @Get('reports')
  @UseGuards(RolesGuard)
  @Roles('TRUSTEE')
  @ApiOperation({ summary: 'Get list of audit reports' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getReports(@Query('limit') limit?: number) {
    return this.auditReportService.getReports(limit || 12);
  }

  /**
   * Generate report on demand
   */
  @Post('reports/generate')
  @UseGuards(RolesGuard)
  @Roles('TRUSTEE')
  @ApiOperation({ summary: 'Generate audit report for a month' })
  async generateReport(@Body('month') month: string) {
    const reportUrl = await this.auditReportService.generateOnDemandReport(month);
    return { reportUrl };
  }
}
