import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { JwtPayload } from './jwt.strategy';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RolesGuard, Reflector],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access if no roles are required', () => {
    const mockContext = createMockContext();
    
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([]);

    const result = guard.canActivate(mockContext);
    expect(result).toBe(true);
  });

  it('should allow access if user role matches required role', () => {
    const user = { sub: 'user-123', role: 'STUDENT' } as JwtPayload;
    const mockContext = createMockContext(user);
    
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['STUDENT']);

    const result = guard.canActivate(mockContext);
    expect(result).toBe(true);
  });

  it('should deny access if user has no role', () => {
    const mockContext = createMockContext(null);
    
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['STUDENT']);

    const result = guard.canActivate(mockContext);
    expect(result).toBe(false);
  });

  it('should deny access if user role does not match', () => {
    const user = { sub: 'user-123', role: 'STUDENT' } as JwtPayload;
    const mockContext = createMockContext(user);
    
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['TRUSTEE']);

    const result = guard.canActivate(mockContext);
    expect(result).toBe(false);
  });

  it('should allow access if user role matches one of multiple required roles', () => {
    const user = { sub: 'user-123', role: 'TRUSTEE' } as JwtPayload;
    const mockContext = createMockContext(user);
    
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['STUDENT', 'TRUSTEE', 'ACCOUNTS']);

    const result = guard.canActivate(mockContext);
    expect(result).toBe(true);
  });

  function createMockContext(user: JwtPayload | null = null): ExecutionContext {
    return {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ user }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as any;
  }
});
