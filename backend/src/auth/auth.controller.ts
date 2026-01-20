import { Controller, Get, Post, UseGuards, Request, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import { Public } from './public.decorator';
import { AuthService } from './auth.service';
import { DeviceSessionsService } from '../devices/device-sessions.service';
import { SendOtpDto, VerifyOtpDto, LoginDto, RefreshTokenDto } from './dto/auth.dto';

@Controller('api/auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private deviceSessionsService: DeviceSessionsService,
  ) {}

  /**
   * Send OTP to phone number (Rate limited: 3 per 5 minutes)
   */
  @Post('otp/send')
  @Public()
  @Throttle({ default: { limit: 3, ttl: 300000 } }) // 3 requests per 5 minutes
  @HttpCode(HttpStatus.OK)
  async sendOtp(@Body() sendOtpDto: SendOtpDto, @Request() req: any) {
    const ip = this.deviceSessionsService.extractIpAddress(req);
    const userAgent = this.deviceSessionsService.extractUserAgent(req);
    return this.authService.sendOtp(sendOtpDto.phone, ip, userAgent);
  }

  /**
   * Verify OTP and get session
   */
  @Post('otp/verify')
  @Public()
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto, @Request() req: any) {
    const ip = this.deviceSessionsService.extractIpAddress(req);
    const userAgent = this.deviceSessionsService.extractUserAgent(req);
    return this.authService.verifyOtp(verifyOtpDto.phone, verifyOtpDto.token, ip, userAgent);
  }

  /**
   * Login with email/phone + password
   */
  @Post('login')
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Request() req: any) {
    const ip = this.deviceSessionsService.extractIpAddress(req);
    const userAgent = this.deviceSessionsService.extractUserAgent(req);
    return this.authService.login(loginDto.identifier, loginDto.password, ip, userAgent);
  }

  /**
   * Refresh access token
   */
  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto, @Request() req: any) {
    const ip = this.deviceSessionsService.extractIpAddress(req);
    const userAgent = this.deviceSessionsService.extractUserAgent(req);
    return this.authService.refreshSession(refreshTokenDto.refresh_token, ip, userAgent);
  }

  /**
   * Logout user
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req: { user: any }) {
    const ip = this.deviceSessionsService.extractIpAddress(req);
    const userAgent = this.deviceSessionsService.extractUserAgent(req);
    return this.authService.logout(
      req.user.sub,
      req.user.role,
      ip,
      userAgent,
    );
  }

  /**
   * Test endpoint to verify authentication is working
   */
  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  getProfile(@Request() req: { user: any }) {
    return {
      user: req.user,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Test endpoint for different roles
   */
  @Get('test/student')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT')
  studentOnly(@Request() req: { user: any }) {
    return {
      message: 'Access granted: Student endpoint',
      user: req.user,
    };
  }

  @Get('test/superintendent')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERINTENDENT')
  superintendentOnly(@Request() req: { user: any }) {
    return {
      message: 'Access granted: Superintendent endpoint',
      user: req.user,
    };
  }

  @Get('test/trustee')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TRUSTEE')
  trusteeOnly(@Request() req: { user: any }) {
    return {
      message: 'Access granted: Trustee endpoint',
      user: req.user,
    };
  }

  @Get('test/accounts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ACCOUNTS')
  accountsOnly(@Request() req: { user: any }) {
    return {
      message: 'Access granted: Accounts endpoint',
      user: req.user,
    };
  }

  @Get('test/parent')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PARENT')
  parentOnly(@Request() req: { user: any }) {
    return {
      message: 'Access granted: Parent endpoint',
      user: req.user,
    };
  }

  /**
   * Public endpoint - no authentication required
   */
  @Get('public')
  @Public()
  getPublic() {
    return {
      message: 'This is a public endpoint',
      timestamp: new Date().toISOString(),
    };
  }
}
