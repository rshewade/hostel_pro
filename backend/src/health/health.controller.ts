import { Controller, Get } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { SUPABASE_CLIENT } from '../supabase/supabase.provider';
import { SupabaseClient } from '@supabase/supabase-js';

@Controller('health')
export class HealthController {
  constructor(
    @Inject(SUPABASE_CLIENT) private supabase: SupabaseClient,
  ) {}

  @Get()
  async check() {
    try {
      // Test authentication API (most reliable connection test)
      const { error: authError } = await this.supabase.auth.getSession();

      // Test database (may fail if tables don't exist yet)
      let dbStatus = 'connected';
      let dbError = null;

      const { error } = await this.supabase
        .from('users')
        .select('count')
        .limit(1);

      if (error) {
        if (error.code === 'PGRST205') {
          // Table doesn't exist - this is normal for fresh project
          dbStatus = 'no_tables';
        } else {
          dbStatus = 'error';
          dbError = error.message;
        }
      }

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        supabase: authError ? 'error' : 'connected',
        database: dbStatus,
        databaseError: dbError,
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }

  @Get('supabase')
  async checkSupabase() {
    try {
      // Test auth API
      const { error: authError } = await this.supabase.auth.getSession();

      // Test database
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .limit(1);

      return {
        status: 'ok',
        connected: true,
        auth: authError ? 'error' : 'connected',
        database: error ? (error.code === 'PGRST205' ? 'no_tables' : 'error') : 'connected',
        hasData: data && data.length > 0,
        error: error ? (error.code === 'PGRST205' ? 'Tables not created yet' : error.message) : null,
      };
    } catch (error) {
      return {
        status: 'error',
        connected: false,
        error: error.message,
      };
    }
  }
}
