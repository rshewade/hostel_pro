import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Inject } from '@nestjs/common';
import { SUPABASE_CLIENT } from '../supabase/supabase.provider';
import { SupabaseClient } from '@supabase/supabase-js';
import { JwtPayload } from './jwt.strategy';
import { UsersService, UserProfile } from '../users/users.service';
import { AuditService } from '../audit/audit.service';
import { DeviceSessionsService } from '../devices/device-sessions.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(SUPABASE_CLIENT) private supabase: SupabaseClient,
    private configService: ConfigService,
    private usersService: UsersService,
    private auditService: AuditService,
    private deviceSessionsService: DeviceSessionsService,
  ) {}

  /**
   * Send OTP to phone number
   */
  async sendOtp(phone: string, ip: string = '0.0.0.0', userAgent: string = 'Unknown') {
    try {
      const { data, error } = await this.supabase.auth.signInWithOtp({
        phone,
      });

      if (error) {
        // Log failed OTP send
        await this.auditService.logOtpSend(
          phone,
          ip,
          userAgent,
          false,
          error.message,
        );
        throw new UnauthorizedException(`Failed to send OTP: ${error.message}`);
      }

      // Log successful OTP send
      await this.auditService.logOtpSend(phone, ip, userAgent, true);

      return {
        success: true,
        message: 'OTP sent successfully',
        // In development, return OTP for testing
        devOtp: process.env.NODE_ENV === 'development' ? this.extractDevOtp(error) : undefined,
      };
    } catch (error) {
      // Log error
      await this.auditService.logOtpSend(
        phone,
        ip,
        userAgent,
        false,
        error.message || 'Unknown error',
      );
      throw new UnauthorizedException(error.message || 'Failed to send OTP');
    }
  }

  /**
   * Verify OTP and return session
   */
  async verifyOtp(
    phone: string,
    token: string,
    ip: string = '0.0.0.0',
    userAgent: string = 'Unknown',
  ) {
    try {
      const { data, error } = await this.supabase.auth.verifyOtp({
        phone,
        token,
        type: 'sms',
      });

      if (error) {
        // Log failed OTP verify
        await this.auditService.logOtpVerify(
          phone,
          ip,
          userAgent,
          false,
          undefined,
          error.message,
        );
        throw new UnauthorizedException(`Invalid OTP: ${error.message}`);
      }

      // Extract user metadata for role and vertical
      const userMetadata = data.user?.user_metadata || {};
      const appMetadata = data.user?.app_metadata || {};

      // Get role and vertical from metadata
      const role = this.usersService.extractUserRole(userMetadata, appMetadata);
      const vertical = this.usersService.extractUserVertical(userMetadata, appMetadata);

      // Check if user exists in public.users table
      const userProfile = await this.usersService.getUserByAuthId(data.user.id);

      // Generate device ID from user-agent
      const deviceId = this.deviceSessionsService.generateDeviceId(userAgent);

      // Check if this is a new device (potentially suspicious)
      const isNewDevice = await this.deviceSessionsService.isSuspiciousDevice(
        data.user.id,
        deviceId,
      );

      // Create/update device session
      await this.deviceSessionsService.upsertDeviceSession({
        user_id: data.user.id,
        device_id: deviceId,
        user_agent: userAgent,
        ip_address: ip,
      });

      // Log successful OTP verify
      await this.auditService.logOtpVerify(
        phone,
        ip,
        userAgent,
        true,
        data.user.id,
      );

      // Build response
      const response: any = {
        access_token: data.session?.access_token,
        refresh_token: data.session?.refresh_token,
        expires_in: data.session?.expires_in,
        user: {
          id: data.user.id, // Default to auth.users.id
          email: data.user.email,
          phone: data.user.phone,
          role: role, // Default to PARENT for OTP login
          vertical: vertical,
          first_login: false,
          new_device: isNewDevice, // Flag for frontend
        },
      };

      // If user exists in public.users, use their details
      if (userProfile) {
        response.user.id = userProfile.id; // Use public.users.id
        response.user.role = userProfile.role;
        response.user.vertical = userProfile.vertical;
        response.user.first_login = userProfile.requires_password_change || false;
      } else {
        // User doesn't exist in public.users yet
        // This is expected for new users or before migration
        // Role and vertical come from auth.users metadata
        response.user.first_login = true; // New user - treat as first login
      }

      return response;
    } catch (error) {
      // Log error
      await this.auditService.logOtpVerify(
        phone,
        ip,
        userAgent,
        false,
        undefined,
        error.message || 'Unknown error',
      );
      throw new UnauthorizedException(error.message || 'Failed to verify OTP');
    }
  }

  /**
   * Login with email or phone + password
   */
  async login(
    identifier: string,
    password: string,
    ip: string = '0.0.0.0',
    userAgent: string = 'Unknown',
  ) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: identifier.includes('@') ? identifier : undefined,
        phone: !identifier.includes('@') ? identifier : undefined,
        password,
      });

      if (error) {
        // Log failed login attempt
        await this.auditService.logFailedLogin(identifier, ip, userAgent, error.message);
        throw new UnauthorizedException(`Login failed: ${error.message}`);
      }

      // Extract user metadata
      const userMetadata = data.user?.user_metadata || {};
      const appMetadata = data.user?.app_metadata || {};

      // Get role and vertical from metadata
      const role = this.usersService.extractUserRole(userMetadata, appMetadata);
      const vertical = this.usersService.extractUserVertical(userMetadata, appMetadata);

      // Check if user exists in public.users table
      const userProfile = await this.usersService.getUserByAuthId(data.user.id);

      // Generate device ID from user-agent
      const deviceId = this.deviceSessionsService.generateDeviceId(userAgent);

      // Create/update device session
      await this.deviceSessionsService.upsertDeviceSession({
        user_id: data.user.id,
        device_id: deviceId,
        user_agent: userAgent,
        ip_address: ip,
      });

      // Log successful login
      await this.auditService.logLogin(
        data.user.id,
        role,
        ip,
        userAgent,
        true,
        'PASSWORD',
      );

      // Build response
      const response: any = {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_in: data.session.expires_in,
        user: {
          id: data.user.id, // Default to auth.users.id
          email: data.user.email,
          phone: data.user.phone,
          role: role,
          vertical: vertical,
          first_login: false,
        },
      };

      // If user exists in public.users, use their details
      if (userProfile) {
        response.user.id = userProfile.id; // Use public.users.id
        response.user.role = userProfile.role;
        response.user.vertical = userProfile.vertical;
        response.user.first_login = userProfile.requires_password_change || false;
      } else {
        // User doesn't exist in public.users yet
        response.user.first_login = true; // New user
      }

      return response;
    } catch (error) {
      // Log error
      await this.auditService.logFailedLogin(identifier, ip, userAgent, error.message || 'Unknown error');
      throw new UnauthorizedException(error.message || 'Failed to login');
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshSession(
    refreshToken: string,
    ip: string = '0.0.0.0',
    userAgent: string = 'Unknown',
  ) {
    try {
      const { data, error } = await this.supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error) {
        // Log failed refresh attempt
        await this.auditService.logSessionRefresh(
          'unknown',
          'unknown',
          ip,
          userAgent,
          false,
          error.message,
        );
        throw new UnauthorizedException(error.message);
      }

      // Extract user metadata
      const userMetadata = data.user?.user_metadata || {};
      const appMetadata = data.user?.app_metadata || {};

      // Get role and vertical from metadata
      const role = this.usersService.extractUserRole(userMetadata, appMetadata);
      const vertical = this.usersService.extractUserVertical(userMetadata, appMetadata);

      // Check if user exists in public.users table
      const userProfile = await this.usersService.getUserByAuthId(data.user.id);

      // Log successful session refresh
      await this.auditService.logSessionRefresh(
        data.user.id,
        role,
        ip,
        userAgent,
        true,
      );

      // Build response
      const response: any = {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_in: data.session.expires_in,
        user: {
          id: data.user.id, // Default to auth.users.id
          email: data.user.email,
          phone: data.user.phone,
          role: role,
          vertical: vertical,
          first_login: false,
        },
      };

      // If user exists in public.users, use their details
      if (userProfile) {
        response.user.id = userProfile.id; // Use public.users.id
        response.user.role = userProfile.role;
        response.user.vertical = userProfile.vertical;
        response.user.first_login = userProfile.requires_password_change || false;
      }

      return response;
    } catch (error) {
      // Log error
      await this.auditService.logSessionRefresh(
        'unknown',
        'unknown',
        ip,
        userAgent,
        false,
        error.message || 'Unknown error',
      );
      throw new UnauthorizedException('Failed to refresh session');
    }
  }

  /**
   * Logout user
   */
  async logout(
    accessToken: string,
    actorId: string,
    actorType: string,
    ip: string = '0.0.0.0',
    userAgent: string = 'Unknown',
  ) {
    try {
      const { error } = await this.supabase.auth.signOut();

      if (error) {
        // Log failed logout
        await this.auditService.logLogout(
          actorId,
          actorType,
          ip,
          userAgent,
          false,
        );
        throw new UnauthorizedException(error.message);
      }

      // Log successful logout
      await this.auditService.logLogout(actorId, actorType, ip, userAgent, true);

      return { success: true };
    } catch (error) {
      // Log error
      await this.auditService.logLogout(
        actorId,
        actorType,
        ip,
        userAgent,
        false,
      );
      throw new UnauthorizedException('Failed to logout');
    }
  }

  /**
   * Extract development OTP from error message (for testing)
   */
  private extractDevOtp(error: any): string | undefined {
    if (error?.message?.includes('OTP')) {
      const match = error.message.match(/OTP[:\s]*(\d{6})/i);
      return match ? match[1] : undefined;
    }
    return undefined;
  }
}
