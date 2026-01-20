import { IsString, IsNotEmpty, Matches, IsEmail, MinLength, MaxLength, Max } from 'class-validator';

export class SendOtpDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+91\d{10}$/) // Indian phone format: +91XXXXXXXXXX
  phone: string;
}

export class VerifyOtpDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+91\d{10}$/)
  phone: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @Max(999999)
  @Matches(/^\d{6}$/)
  token: string; // OTP code
}

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  identifier: string; // Email or phone

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refresh_token: string;
}

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  full_name: string;

  @IsString()
  @IsNotEmpty()
  role: string;

  @IsString()
  vertical?: string;
}
