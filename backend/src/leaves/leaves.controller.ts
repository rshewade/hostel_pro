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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { LeavesService } from './leaves.service';
import {
  CreateLeaveRequestDto,
  UpdateLeaveStatusDto,
  RecordCheckoutDto,
  RecordReturnDto,
  CancelLeaveDto,
  ListLeavesDto,
} from './dto/leave.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    role: string;
  };
}

@ApiTags('leaves')
@Controller('api/v1/leaves')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class LeavesController {
  constructor(private readonly leavesService: LeavesService) {}

  /**
   * Create a new leave request (Students only)
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Create a new leave request' })
  @ApiResponse({ status: 201, description: 'Leave request created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid dates or overlapping leave' })
  async createLeaveRequest(
    @Body() dto: CreateLeaveRequestDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.leavesService.createLeaveRequest(dto, req.user.sub);
  }

  /**
   * List leave requests with filters
   */
  @Get()
  @ApiOperation({ summary: 'List leave requests with filters' })
  @ApiResponse({ status: 200, description: 'List of leave requests' })
  @ApiQuery({ name: 'studentUserId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'leaveType', required: false })
  @ApiQuery({ name: 'startDateFrom', required: false })
  @ApiQuery({ name: 'startDateTo', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async listLeaves(
    @Query() filters: ListLeavesDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.leavesService.listLeaves(
      filters,
      req.user.sub,
      req.user.role,
    );
  }

  /**
   * Get current user's leave requests
   */
  @Get('my-leaves')
  @ApiOperation({ summary: 'Get current user leave requests' })
  @ApiResponse({ status: 200, description: 'User leave requests' })
  async getMyLeaves(@Request() req: AuthenticatedRequest) {
    return this.leavesService.getStudentLeaves(req.user.sub);
  }

  /**
   * Get leave statistics for dashboard
   */
  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles('SUPERINTENDENT', 'TRUSTEE')
  @ApiOperation({ summary: 'Get leave statistics' })
  @ApiResponse({ status: 200, description: 'Leave statistics' })
  async getLeaveStats(@Request() req: AuthenticatedRequest) {
    return this.leavesService.getLeaveStats(req.user.role);
  }

  /**
   * Get pending leave requests (for superintendent)
   */
  @Get('pending')
  @UseGuards(RolesGuard)
  @Roles('SUPERINTENDENT', 'TRUSTEE')
  @ApiOperation({ summary: 'Get pending leave requests' })
  @ApiResponse({ status: 200, description: 'Pending leave requests' })
  async getPendingLeaves() {
    return this.leavesService.getPendingLeaves();
  }

  /**
   * Get leave request by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get leave request by ID' })
  @ApiParam({ name: 'id', description: 'Leave request UUID' })
  @ApiResponse({ status: 200, description: 'Leave request details' })
  @ApiResponse({ status: 404, description: 'Leave request not found' })
  async getLeave(@Param('id') id: string) {
    return this.leavesService.getLeaveById(id);
  }

  /**
   * Update leave request status (approve/reject)
   */
  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('SUPERINTENDENT', 'TRUSTEE')
  @ApiOperation({ summary: 'Approve or reject leave request' })
  @ApiParam({ name: 'id', description: 'Leave request UUID' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  @ApiResponse({ status: 400, description: 'Cannot update status' })
  async updateLeaveStatus(
    @Param('id') id: string,
    @Body() dto: UpdateLeaveStatusDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.leavesService.updateLeaveStatus(
      id,
      dto,
      req.user.sub,
      req.user.role,
    );
  }

  /**
   * Record checkout for approved leave
   */
  @Post(':id/checkout')
  @UseGuards(RolesGuard)
  @Roles('SUPERINTENDENT')
  @ApiOperation({ summary: 'Record checkout for approved leave' })
  @ApiParam({ name: 'id', description: 'Leave request UUID' })
  @ApiResponse({ status: 200, description: 'Checkout recorded' })
  @ApiResponse({ status: 400, description: 'Leave not approved' })
  async recordCheckout(
    @Param('id') id: string,
    @Body() dto: RecordCheckoutDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.leavesService.recordCheckout(id, dto, req.user.sub);
  }

  /**
   * Record return from leave
   */
  @Post(':id/return')
  @UseGuards(RolesGuard)
  @Roles('SUPERINTENDENT')
  @ApiOperation({ summary: 'Record return from leave' })
  @ApiParam({ name: 'id', description: 'Leave request UUID' })
  @ApiResponse({ status: 200, description: 'Return recorded' })
  @ApiResponse({ status: 400, description: 'Leave not checked out' })
  async recordReturn(
    @Param('id') id: string,
    @Body() dto: RecordReturnDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.leavesService.recordReturn(id, dto, req.user.sub);
  }

  /**
   * Cancel a leave request
   */
  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel a leave request' })
  @ApiParam({ name: 'id', description: 'Leave request UUID' })
  @ApiResponse({ status: 200, description: 'Leave request cancelled' })
  @ApiResponse({ status: 403, description: 'Not authorized to cancel' })
  async cancelLeave(
    @Param('id') id: string,
    @Body() dto: CancelLeaveDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.leavesService.cancelLeave(
      id,
      dto,
      req.user.sub,
      req.user.role,
    );
  }
}
