import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { SUPABASE_CLIENT } from '../supabase/supabase.provider';
import { SupabaseClient } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  auth_user_id: string;
  email?: string;
  phone?: string;
  full_name?: string;
  role: string;
  vertical?: string;
  requires_password_change: boolean;
  dpdp_consent: boolean;
  created_at: string;
  updated_at: string;
  status?: string;
}

@Injectable()
export class UsersService {
  constructor(
    @Inject(SUPABASE_CLIENT) private supabase: SupabaseClient,
  ) {}

  /**
   * Get user profile by auth_user_id
   */
  async getUserByAuthId(authUserId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', authUserId)
        .single();

      if (error) {
        // If table doesn't exist (PGRST205), return null
        if (error.code === 'PGRST205') {
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      // If table doesn't exist yet, return null
      if (error.code === 'PGRST205') {
        return null;
      }
      return null;
    }
  }

  /**
   * Create new user profile in public.users table
   */
  async createUserProfile(userData: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .insert({
          ...userData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        // If table doesn't exist, return null
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
   * Update user profile
   */
  async updateUserProfile(
    authUserId: string,
    updates: Partial<UserProfile>,
  ): Promise<UserProfile | null> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('auth_user_id', authUserId)
        .select()
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
   * Check if user profile exists
   */
  async userExists(authUserId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', authUserId)
        .limit(1);

      if (error) {
        if (error.code === 'PGRST205') {
          return false;
        }
        throw error;
      }

      return data && data.length > 0;
    } catch (error) {
      if (error.code === 'PGRST205') {
        return false;
      }
      return false;
    }
  }

  /**
   * Get user role from metadata
   */
  extractUserRole(userMetadata: any, appMetadata: any): string {
    // Prioritize user_metadata over app_metadata
    const role = userMetadata.role || appMetadata.role || 'STUDENT';
    
    // Validate role
    const validRoles = ['STUDENT', 'SUPERINTENDENT', 'TRUSTEE', 'ACCOUNTS', 'PARENT'];
    return validRoles.includes(role) ? role : 'STUDENT';
  }

  /**
   * Get user vertical from metadata
   */
  extractUserVertical(userMetadata: any, appMetadata: any): string | undefined {
    return userMetadata.vertical || appMetadata.vertical;
  }
}
