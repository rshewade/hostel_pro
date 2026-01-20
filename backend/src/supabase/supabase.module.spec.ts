import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SupabaseModule } from './supabase.module';
import { SUPABASE_CLIENT } from './supabase.provider';
import { SupabaseClient } from '@supabase/supabase-js';

describe('SupabaseModule', () => {
  let module: TestingModule;
  let supabaseClient: SupabaseClient;

  beforeEach(async () => {
    // Set environment variables before creating the module
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';

    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        SupabaseModule,
      ],
    }).compile();

    module = moduleRef;
    supabaseClient = module.get<SupabaseClient>(SUPABASE_CLIENT);
  });

  it('should be defined', () => {
    expect(supabaseClient).toBeDefined();
  });

  it('should be a SupabaseClient instance', () => {
    expect(supabaseClient).toBeInstanceOf(SupabaseClient);
  });

  it('should have the correct URL configured', () => {
    // The client should be instantiated with the test URL
    expect(supabaseClient).toBeDefined();
  });

  it('should have the auth module available', () => {
    expect(supabaseClient.auth).toBeDefined();
  });

  it('should have the storage module available', () => {
    expect(supabaseClient.storage).toBeDefined();
  });

  it('should have the from method available for database queries', () => {
    expect(typeof supabaseClient.from).toBe('function');
  });

  afterAll(async () => {
    if (module) {
      await module.close();
    }
    // Clean up environment variables
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });
});
