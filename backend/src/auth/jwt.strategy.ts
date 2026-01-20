import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: string; // User ID (auth.users.id)
  email?: string;
  phone?: string;
  role: string; // STUDENT, SUPERINTENDENT, TRUSTEE, ACCOUNTS, PARENT
  vertical?: string; // BOYS, GIRLS, DHARAMSHALA
  exp?: number;
  iat?: number;
  iss?: string; // issuer
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('SUPABASE_JWT_SECRET') || '',
      issuer: configService.get<string>('SUPABASE_ISSUER') || 'https://fteqtsoifrqigegdvqhx.supabase.co',
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    // Validate that the payload contains required fields
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token: missing subject');
    }

    if (!payload.role) {
      throw new UnauthorizedException('Invalid token: missing role');
    }

    // Ensure role is one of the allowed roles
    const allowedRoles = ['STUDENT', 'SUPERINTENDENT', 'TRUSTEE', 'ACCOUNTS', 'PARENT'];
    if (!allowedRoles.includes(payload.role)) {
      throw new UnauthorizedException('Invalid token: invalid role');
    }

    // Return the payload - this will be attached to req.user
    return payload;
  }
}
