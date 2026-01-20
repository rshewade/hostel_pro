import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { SUPABASE_CLIENT } from '../supabase/supabase.provider';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  CreateDeviceSessionDto,
  DeviceSession,
  UpdateDeviceSessionDto,
} from './device.types';

@Injectable()
export class DeviceSessionsService {
  constructor(
    @Inject(SUPABASE_CLIENT) private supabase: SupabaseClient,
  ) {}

  /**
   * Get user's device sessions
   */
  async getDeviceSessions(userId: string): Promise<DeviceSession[]> {
    try {
      const { data, error } = await this.supabase
        .from('device_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('last_seen', { ascending: false });

      if (error) {
        // If table doesn't exist, return empty array
        if (error.code === 'PGRST205') {
          return [];
        }
        throw error;
      }

      return data || [];
    } catch (error) {
      if (error.code === 'PGRST205') {
        return [];
      }
      throw error;
    }
  }

  /**
   * Get device session by user_id and device_id
   */
  async getDeviceSession(
    userId: string,
    deviceId: string,
  ): Promise<DeviceSession | null> {
    try {
      const { data, error } = await this.supabase
        .from('device_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('device_id', deviceId)
        .single();

      if (error) {
        if (error.code === 'PGRST205') {
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      if (error.code === 'PGRST205') {
        return null;
      }
      throw error;
    }
  }

  /**
   * Create or update device session
   */
  async upsertDeviceSession(dto: CreateDeviceSessionDto): Promise<DeviceSession | null> {
    try {
      // Check if device session already exists
      const existingSession = await this.getDeviceSession(
        dto.user_id,
        dto.device_id,
      );

      if (existingSession) {
        // Update existing session
        const { data, error } = await this.supabase
          .from('device_sessions')
          .update({
            last_seen: new Date().toISOString(),
            user_agent: dto.user_agent,
            ip_address: dto.ip_address,
            geo_location: dto.geo_location,
            updated_at: new Date().toISOString(),
            is_active: true,
          })
          .eq('user_id', dto.user_id)
          .eq('device_id', dto.device_id)
          .select()
          .single();

        if (error) {
          if (error.code === 'PGRST205') {
            return null;
          }
          throw error;
        }

        return data;
      } else {
        // Create new session
        const { data, error } = await this.supabase
          .from('device_sessions')
          .insert({
            ...dto,
            last_seen: new Date().toISOString(),
            is_active: true,
            suspicious: false, // Will be updated by security check
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) {
          if (error.code === 'PGRST205') {
            return null;
          }
          throw error;
        }

        return data;
      }
    } catch (error) {
      if (error.code === 'PGRST205') {
        return null;
      }
      throw error;
    }
  }

  /**
   * Deactivate device session
   */
  async deactivateDeviceSession(
    userId: string,
    deviceId: string,
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('device_sessions')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('device_id', deviceId);

      if (error) {
        if (error.code === 'PGRST205') {
          return false;
        }
        throw error;
      }

      return true;
    } catch (error) {
      if (error.code === 'PGRST205') {
        return false;
      }
      return false;
    }
  }

  /**
   * Check if this is a suspicious device (new device for user)
   */
  async isSuspiciousDevice(userId: string, deviceId: string): Promise<boolean> {
    const allDevices = await this.getDeviceSessions(userId);
    
    if (allDevices.length === 0) {
      return false; // First device - not suspicious
    }

    // Check if this device_id exists for this user
    const deviceExists = allDevices.some(d => d.device_id === deviceId);
    
    return !deviceExists; // New device - potentially suspicious
  }

  /**
   * Mark device as suspicious
   */
  async markDeviceAsSuspicious(
    userId: string,
    deviceId: string,
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('device_sessions')
        .update({
          suspicious: true,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('device_id', deviceId);

      if (error) {
        if (error.code === 'PGRST205') {
          return false;
        }
        throw error;
      }

      return true;
    } catch (error) {
      if (error.code === 'PGRST205') {
        return false;
      }
      return false;
    }
  }

  /**
   * Generate device ID from user-agent (basic fingerprint)
   */
  generateDeviceId(userAgent: string): string {
    // Simple hash of user agent for device identification
    // In production, use more sophisticated fingerprinting (canvas, webgl, etc.)
    let hash = 0;
    for (let i = 0; i < userAgent.length; i++) {
      hash = ((hash << 5) - hash) + userAgent.charCodeAt(i);
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Extract IP address from request
   */
  extractIpAddress(req: any): string {
    // Try to get IP from various sources
    return (
      req.ip ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      req.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ||
      '0.0.0.0'
    );
  }

  /**
   * Extract user-agent from request
   */
  extractUserAgent(req: any): string {
    return req.headers?.['user-agent'] || 'Unknown';
  }
}
