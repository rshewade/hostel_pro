import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Headers,
  UseGuards,
  Request,
  RawBodyRequest,
  BadRequestException,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { PaymentGatewayService } from './payment-gateway.service';
import { RazorpayService } from './razorpay/razorpay.service';
import {
  InitiatePaymentDto,
  VerifyPaymentDto,
  RefundPaymentDto,
  InitiatePaymentResponseDto,
  PaymentStatusResponseDto,
  RefundResponseDto,
} from './dto/gateway.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Public } from '../auth/public.decorator';

interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    role: string;
  };
  rawBody?: Buffer;
}

@ApiTags('payments')
@Controller('api/v1/payments')
export class PaymentGatewayController {
  private readonly logger = new Logger(PaymentGatewayController.name);

  constructor(
    private readonly paymentGatewayService: PaymentGatewayService,
    private readonly razorpayService: RazorpayService,
  ) {}

  /**
   * Initiate a payment
   */
  @Post('initiate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Initiate a payment via Razorpay' })
  @ApiResponse({ status: 201, description: 'Payment initiated', type: InitiatePaymentResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  async initiatePayment(
    @Body() dto: InitiatePaymentDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<InitiatePaymentResponseDto> {
    return this.paymentGatewayService.initiatePayment(dto, req.user.sub);
  }

  /**
   * Verify payment after Razorpay checkout
   */
  @Post('verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Verify payment signature after checkout' })
  @ApiResponse({ status: 200, description: 'Payment verified', type: PaymentStatusResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid signature' })
  @HttpCode(HttpStatus.OK)
  async verifyPayment(
    @Body() dto: VerifyPaymentDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<PaymentStatusResponseDto> {
    return this.paymentGatewayService.verifyPayment(dto, req.user.sub);
  }

  /**
   * Get payment status
   */
  @Get(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get payment status' })
  @ApiParam({ name: 'id', description: 'Payment UUID' })
  @ApiResponse({ status: 200, description: 'Payment status', type: PaymentStatusResponseDto })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async getPaymentStatus(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<PaymentStatusResponseDto> {
    return this.paymentGatewayService.getPaymentStatus(
      id,
      req.user.sub,
      req.user.role,
    );
  }

  /**
   * Process refund (Accounts/Trustee only)
   */
  @Post(':id/refund')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ACCOUNTS', 'TRUSTEE')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Process refund for a payment' })
  @ApiParam({ name: 'id', description: 'Payment UUID' })
  @ApiResponse({ status: 201, description: 'Refund processed', type: RefundResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid refund request' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async processRefund(
    @Param('id') id: string,
    @Body() dto: RefundPaymentDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<RefundResponseDto> {
    return this.paymentGatewayService.processRefund(id, dto, req.user.sub);
  }

  /**
   * Razorpay webhook endpoint
   * This endpoint receives webhook events from Razorpay
   */
  @Post('webhook')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpoint() // Hide from Swagger as it's for Razorpay only
  async handleWebhook(
    @Headers('x-razorpay-signature') signature: string,
    @Request() req: RawBodyRequest<Request>,
  ): Promise<{ status: string }> {
    // Get raw body for signature verification
    const rawBody = req.rawBody;
    if (!rawBody) {
      this.logger.warn('Webhook received without raw body');
      throw new BadRequestException('Invalid webhook payload');
    }

    const bodyString = rawBody.toString('utf8');

    // Verify webhook signature
    const isValid = this.razorpayService.verifyWebhookSignature(bodyString, signature);
    if (!isValid) {
      this.logger.warn('Invalid webhook signature');
      throw new BadRequestException('Invalid signature');
    }

    // Parse the webhook payload
    let payload: { event: string; payload: Record<string, unknown> };
    try {
      payload = JSON.parse(bodyString);
    } catch {
      this.logger.error('Failed to parse webhook payload');
      throw new BadRequestException('Invalid JSON payload');
    }

    // Process the webhook event
    await this.paymentGatewayService.handleWebhook(payload.event, payload.payload);

    return { status: 'ok' };
  }

  /**
   * Get Razorpay configuration for frontend
   */
  @Get('config')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get Razorpay configuration for frontend' })
  @ApiResponse({ status: 200, description: 'Razorpay configuration' })
  getConfig(): { keyId: string; currency: string } {
    return {
      keyId: this.razorpayService.getKeyId(),
      currency: 'INR',
    };
  }
}
