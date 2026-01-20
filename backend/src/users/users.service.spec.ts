import { Test, TestingModule } from '@nestjs/testing';
import { UsersService, UserProfile } from './users.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { ConfigModule } from '@nestjs/config';

describe('UsersService', () => {
  let service: UsersService;
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        SupabaseModule,
      ],
      providers: [UsersService],
    }).compile();

    service = app.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should extract user role from metadata', () => {
    const userMetadata = { role: 'STUDENT' };
    const appMetadata = {};
    const role = service.extractUserRole(userMetadata, appMetadata);
    expect(role).toBe('STUDENT');
  });

  it('should extract user role from app_metadata when user_metadata is empty', () => {
    const userMetadata = {};
    const appMetadata = { role: 'TRUSTEE' };
    const role = service.extractUserRole(userMetadata, appMetadata);
    expect(role).toBe('TRUSTEE');
  });

  it('should default to STUDENT role when not found in metadata', () => {
    const userMetadata = {};
    const appMetadata = {};
    const role = service.extractUserRole(userMetadata, appMetadata);
    expect(role).toBe('STUDENT');
  });

  it('should extract user vertical from metadata', () => {
    const userMetadata = { vertical: 'BOYS' };
    const appMetadata = {};
    const vertical = service.extractUserVertical(userMetadata, appMetadata);
    expect(vertical).toBe('BOYS');
  });

  it('should extract user vertical from app_metadata when user_metadata is empty', () => {
    const userMetadata = {};
    const appMetadata = { vertical: 'GIRLS' };
    const vertical = service.extractUserVertical(userMetadata, appMetadata);
    expect(vertical).toBe('GIRLS');
  });

  it('should return undefined for vertical when not in metadata', () => {
    const userMetadata = {};
    const appMetadata = {};
    const vertical = service.extractUserVertical(userMetadata, appMetadata);
    expect(vertical).toBeUndefined();
  });

  it('should handle getUserByAuthId when table does not exist', async () => {
    // This will return null because public.users table doesn't exist
    const user = await service.getUserByAuthId('test-auth-id');
    expect(user).toBeNull();
  });

  it('should handle userExists when table does not exist', async () => {
    // This will return false because public.users table doesn't exist
    const exists = await service.userExists('test-auth-id');
    expect(exists).toBe(false);
  });

  it('should validate role and default to STUDENT for invalid roles', () => {
    const userMetadata = { role: 'INVALID_ROLE' };
    const appMetadata = {};
    const role = service.extractUserRole(userMetadata, appMetadata);
    expect(role).toBe('STUDENT'); // Default to STUDENT for invalid roles
  });

  it('should validate all valid roles', () => {
    const validRoles = ['STUDENT', 'SUPERINTENDENT', 'TRUSTEE', 'ACCOUNTS', 'PARENT'];
    
    validRoles.forEach((role) => {
      const userMetadata = { role };
      const appMetadata = {};
      const extractedRole = service.extractUserRole(userMetadata, appMetadata);
      expect(extractedRole).toBe(role);
    });
  });
});
