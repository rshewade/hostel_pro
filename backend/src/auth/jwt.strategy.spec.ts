import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { JwtPayload } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let configService: ConfigService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '1h' },
        }),
      ],
      providers: [JwtStrategy],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should validate a valid JWT payload', async () => {
    const mockPayload: JwtPayload = {
      sub: 'user-123',
      email: 'test@example.com',
      role: 'STUDENT',
      vertical: 'BOYS',
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000),
    };

    const result = await strategy.validate(mockPayload);
    expect(result).toEqual(mockPayload);
  });

  it('should throw error if subject is missing', async () => {
    const invalidPayload: Partial<JwtPayload> = {
      role: 'STUDENT',
    };

    await expect(strategy.validate(invalidPayload as JwtPayload)).rejects.toThrow(
      'Invalid token: missing subject',
    );
  });

  it('should throw error if role is missing', async () => {
    const invalidPayload: Partial<JwtPayload> = {
      sub: 'user-123',
    };

    await expect(strategy.validate(invalidPayload as JwtPayload)).rejects.toThrow(
      'Invalid token: missing role',
    );
  });

  it('should throw error if role is invalid', async () => {
    const invalidPayload: JwtPayload = {
      sub: 'user-123',
      role: 'INVALID_ROLE',
    } as JwtPayload;

    await expect(strategy.validate(invalidPayload)).rejects.toThrow(
      'Invalid token: invalid role',
    );
  });
});
