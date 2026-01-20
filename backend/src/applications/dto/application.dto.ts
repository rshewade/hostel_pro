import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsObject,
  IsPhoneNumber,
  IsUUID,
  IsDateString,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApplicationType, VerticalType, ApplicationStatus } from '../applications.types';

export class CreateApplicationDto {
  @ApiProperty({ enum: ['NEW', 'RENEWAL'], description: 'Application type' })
  @IsEnum(['NEW', 'RENEWAL'])
  @IsNotEmpty()
  type: ApplicationType;

  @ApiProperty({ enum: ['BOYS', 'GIRLS', 'DHARAMSHALA'], description: 'Hostel vertical' })
  @IsEnum(['BOYS', 'GIRLS', 'DHARAMSHALA'])
  @IsNotEmpty()
  vertical: VerticalType;

  @ApiProperty({ description: 'Applicant mobile number (Indian format)', example: '+919876543210' })
  @IsPhoneNumber('IN')
  @IsNotEmpty()
  applicantMobile: string;

  @ApiPropertyOptional({ description: 'Parent application ID for renewals' })
  @IsUUID()
  @IsOptional()
  parentApplicationId?: string;

  @ApiProperty({ description: 'Application form data', example: { name: 'John Doe', age: 20 } })
  @IsObject()
  @IsNotEmpty()
  data: Record<string, any>;
}

export class UpdateApplicationDto {
  @ApiPropertyOptional({ description: 'Application form data', example: { name: 'John Doe' } })
  @IsObject()
  @IsOptional()
  data?: Record<string, any>;

  @ApiPropertyOptional({ enum: ['DRAFT', 'SUBMITTED'], description: 'Application status (limited for applicants)' })
  @IsEnum(['DRAFT', 'SUBMITTED'])
  @IsOptional()
  status?: 'DRAFT' | 'SUBMITTED';
}

export class UpdateApplicationStatusDto {
  @ApiProperty({
    enum: ['UNDER_REVIEW', 'INTERVIEW_SCHEDULED', 'APPROVED', 'REJECTED', 'ARCHIVED'],
    description: 'New application status',
  })
  @IsEnum(['UNDER_REVIEW', 'INTERVIEW_SCHEDULED', 'APPROVED', 'REJECTED', 'ARCHIVED'])
  @IsNotEmpty()
  status: ApplicationStatus;

  @ApiPropertyOptional({ description: 'Reason for rejection' })
  @IsString()
  @IsOptional()
  rejectionReason?: string;

  @ApiPropertyOptional({ description: 'Interview notes' })
  @IsString()
  @IsOptional()
  interviewNotes?: string;
}

export class ScheduleInterviewDto {
  @ApiProperty({ description: 'Interview date and time', example: '2024-02-15T10:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  scheduledAt: string;

  @ApiProperty({ enum: ['IN_PERSON', 'VIDEO_CALL'], description: 'Interview mode' })
  @IsEnum(['IN_PERSON', 'VIDEO_CALL'])
  @IsNotEmpty()
  mode: 'IN_PERSON' | 'VIDEO_CALL';

  @ApiPropertyOptional({ description: 'Additional notes for the interview' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class ListApplicationsDto {
  @ApiPropertyOptional({ enum: ['BOYS', 'GIRLS', 'DHARAMSHALA'], description: 'Filter by vertical' })
  @IsEnum(['BOYS', 'GIRLS', 'DHARAMSHALA'])
  @IsOptional()
  vertical?: VerticalType;

  @ApiPropertyOptional({
    enum: ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'INTERVIEW_SCHEDULED', 'APPROVED', 'REJECTED', 'ARCHIVED'],
    description: 'Filter by status',
  })
  @IsEnum(['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'INTERVIEW_SCHEDULED', 'APPROVED', 'REJECTED', 'ARCHIVED'])
  @IsOptional()
  status?: ApplicationStatus;

  @ApiPropertyOptional({ enum: ['NEW', 'RENEWAL'], description: 'Filter by type' })
  @IsEnum(['NEW', 'RENEWAL'])
  @IsOptional()
  type?: ApplicationType;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;
}

export class TrackApplicationDto {
  @ApiProperty({ description: 'Application tracking number', example: 'HG-2024-00001' })
  @IsString()
  @IsNotEmpty()
  trackingNumber: string;

  @ApiProperty({ description: 'Applicant mobile number', example: '+919876543210' })
  @IsPhoneNumber('IN')
  @IsNotEmpty()
  mobile: string;
}
