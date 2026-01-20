import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import {
  CreateApplicationDto,
  UpdateApplicationDto,
  UpdateApplicationStatusDto,
  ScheduleInterviewDto,
  ListApplicationsDto,
  TrackApplicationDto,
} from './dto/application.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    role: string;
    vertical?: string;
  };
}

@ApiTags('applications')
@Controller('api/v1/applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  /**
   * Public endpoint - Create new application (guest access with OTP)
   */
  @Post()
  @ApiOperation({ summary: 'Create a new application' })
  @ApiResponse({ status: 201, description: 'Application created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async createApplication(
    @Body() dto: CreateApplicationDto,
  ) {
    return this.applicationsService.createApplication(dto);
  }

  /**
   * Public endpoint - Track application by tracking number
   */
  @Post('track')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Track application status (public)' })
  @ApiResponse({ status: 200, description: 'Application details returned' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  async trackApplication(@Body() dto: TrackApplicationDto) {
    return this.applicationsService.getApplicationByTracking(
      dto.trackingNumber,
      dto.mobile,
    );
  }

  /**
   * Protected - List applications with filters
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'List applications with filters' })
  @ApiResponse({ status: 200, description: 'List of applications' })
  @ApiQuery({ name: 'vertical', required: false, enum: ['BOYS', 'GIRLS', 'DHARAMSHALA'] })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'type', required: false, enum: ['NEW', 'RENEWAL'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async listApplications(
    @Query() filters: ListApplicationsDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.applicationsService.listApplications(
      filters,
      req.user.sub,
      req.user.role,
      req.user.vertical,
    );
  }

  /**
   * Protected - Get application statistics for dashboard
   */
  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERINTENDENT', 'TRUSTEE', 'ACCOUNTS')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get application statistics' })
  @ApiResponse({ status: 200, description: 'Application statistics' })
  async getApplicationStats(@Request() req: AuthenticatedRequest) {
    return this.applicationsService.getApplicationStats(
      req.user.role,
      req.user.vertical,
    );
  }

  /**
   * Protected - Get single application by ID
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get application by ID' })
  @ApiParam({ name: 'id', description: 'Application UUID' })
  @ApiResponse({ status: 200, description: 'Application details' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  async getApplication(@Param('id') id: string) {
    return this.applicationsService.getApplicationById(id);
  }

  /**
   * Protected - Update application (for applicants)
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update application data' })
  @ApiParam({ name: 'id', description: 'Application UUID' })
  @ApiResponse({ status: 200, description: 'Application updated' })
  @ApiResponse({ status: 403, description: 'Not authorized to update' })
  async updateApplication(
    @Param('id') id: string,
    @Body() dto: UpdateApplicationDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.applicationsService.updateApplication(
      id,
      dto,
      req.user.sub,
      req.user.role,
    );
  }

  /**
   * Protected - Update application status (for staff)
   */
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERINTENDENT', 'TRUSTEE')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update application status' })
  @ApiParam({ name: 'id', description: 'Application UUID' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  @ApiResponse({ status: 403, description: 'Not authorized' })
  async updateApplicationStatus(
    @Param('id') id: string,
    @Body() dto: UpdateApplicationStatusDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.applicationsService.updateApplicationStatus(
      id,
      dto,
      req.user.sub,
      req.user.role,
      req.user.vertical,
    );
  }

  /**
   * Protected - Schedule interview for application
   */
  @Post(':id/interview')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERINTENDENT', 'TRUSTEE')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Schedule interview for application' })
  @ApiParam({ name: 'id', description: 'Application UUID' })
  @ApiResponse({ status: 201, description: 'Interview scheduled' })
  @ApiResponse({ status: 400, description: 'Cannot schedule interview for this status' })
  async scheduleInterview(
    @Param('id') id: string,
    @Body() dto: ScheduleInterviewDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.applicationsService.scheduleInterview(
      id,
      dto,
      req.user.sub,
      req.user.role,
      req.user.vertical,
    );
  }
}
