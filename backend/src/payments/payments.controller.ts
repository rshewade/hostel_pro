import {
  Controller,
  Get,
  Post,
  Patch,
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
import { PaymentsService } from './payments.service';
import {
  CreateFeeDto,
  RecordPaymentDto,
  VerifyPaymentDto,
  UpdateFeeStatusDto,
  ListFeesDto,
  ListPaymentsDto,
} from './dto/payment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    role: string;
  };
}

@ApiTags('payments')
@Controller('api/v1/payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * Create a new fee (Accounts only)
   */
  @Post('fees')
  @UseGuards(RolesGuard)
  @Roles('ACCOUNTS', 'TRUSTEE')
  @ApiOperation({ summary: 'Create a new fee for a student' })
  @ApiResponse({ status: 201, description: 'Fee created successfully' })
  @ApiResponse({ status: 403, description: 'Not authorized' })
  async createFee(
    @Body() dto: CreateFeeDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.paymentsService.createFee(dto, req.user.sub);
  }

  /**
   * List fees with filters
   */
  @Get('fees')
  @ApiOperation({ summary: 'List fees with filters' })
  @ApiResponse({ status: 200, description: 'List of fees' })
  @ApiQuery({ name: 'studentUserId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'feeType', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async listFees(
    @Query() filters: ListFeesDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.paymentsService.listFees(
      filters,
      req.user.sub,
      req.user.role,
    );
  }

  /**
   * Get student's own fees (for dashboard)
   */
  @Get('my-fees')
  @ApiOperation({ summary: 'Get current user fees' })
  @ApiResponse({ status: 200, description: 'User fees list' })
  async getMyFees(@Request() req: AuthenticatedRequest) {
    return this.paymentsService.getStudentFees(req.user.sub);
  }

  /**
   * Get fee by ID
   */
  @Get('fees/:id')
  @ApiOperation({ summary: 'Get fee by ID' })
  @ApiParam({ name: 'id', description: 'Fee UUID' })
  @ApiResponse({ status: 200, description: 'Fee details' })
  @ApiResponse({ status: 404, description: 'Fee not found' })
  async getFee(@Param('id') id: string) {
    return this.paymentsService.getFeeById(id);
  }

  /**
   * Update fee status (Accounts only)
   */
  @Patch('fees/:id/status')
  @UseGuards(RolesGuard)
  @Roles('ACCOUNTS', 'TRUSTEE')
  @ApiOperation({ summary: 'Update fee status (including waiver)' })
  @ApiParam({ name: 'id', description: 'Fee UUID' })
  @ApiResponse({ status: 200, description: 'Fee status updated' })
  @ApiResponse({ status: 403, description: 'Not authorized' })
  async updateFeeStatus(
    @Param('id') id: string,
    @Body() dto: UpdateFeeStatusDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.paymentsService.updateFeeStatus(id, dto, req.user.sub);
  }

  /**
   * Record a payment
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles('ACCOUNTS', 'TRUSTEE')
  @ApiOperation({ summary: 'Record a payment against a fee' })
  @ApiResponse({ status: 201, description: 'Payment recorded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid payment amount' })
  async recordPayment(
    @Body() dto: RecordPaymentDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.paymentsService.recordPayment(dto, req.user.sub);
  }

  /**
   * List payments with filters
   */
  @Get()
  @ApiOperation({ summary: 'List payments with filters' })
  @ApiResponse({ status: 200, description: 'List of payments' })
  @ApiQuery({ name: 'studentUserId', required: false })
  @ApiQuery({ name: 'feeId', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async listPayments(
    @Query() filters: ListPaymentsDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.paymentsService.listPayments(
      filters,
      req.user.sub,
      req.user.role,
    );
  }

  /**
   * Get payment by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiParam({ name: 'id', description: 'Payment UUID' })
  @ApiResponse({ status: 200, description: 'Payment details' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async getPayment(@Param('id') id: string) {
    return this.paymentsService.getPaymentById(id);
  }

  /**
   * Verify a payment (Accounts only)
   */
  @Patch(':id/verify')
  @UseGuards(RolesGuard)
  @Roles('ACCOUNTS', 'TRUSTEE')
  @ApiOperation({ summary: 'Verify a payment' })
  @ApiParam({ name: 'id', description: 'Payment UUID' })
  @ApiResponse({ status: 200, description: 'Payment verified' })
  @ApiResponse({ status: 400, description: 'Payment already verified' })
  async verifyPayment(
    @Param('id') id: string,
    @Body() dto: VerifyPaymentDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.paymentsService.verifyPayment(id, dto, req.user.sub);
  }

  /**
   * Get payment summary for a student
   */
  @Get('summary/:studentUserId')
  @ApiOperation({ summary: 'Get payment summary for a student' })
  @ApiParam({ name: 'studentUserId', description: 'Student user UUID' })
  @ApiResponse({ status: 200, description: 'Payment summary' })
  @ApiResponse({ status: 403, description: 'Not authorized to view this summary' })
  async getPaymentSummary(
    @Param('studentUserId') studentUserId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.paymentsService.getPaymentSummary(
      studentUserId,
      req.user.sub,
      req.user.role,
    );
  }
}
