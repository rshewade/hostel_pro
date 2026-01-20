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
import { RoomsService } from './rooms.service';
import {
  CreateRoomDto,
  UpdateRoomDto,
  AllocateRoomDto,
  EndAllocationDto,
  TransferRoomDto,
  ListRoomsDto,
} from './dto/room.dto';
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

@ApiTags('rooms')
@Controller('api/v1/rooms')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  /**
   * Create a new room (Superintendent/Trustee only)
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles('SUPERINTENDENT', 'TRUSTEE')
  @ApiOperation({ summary: 'Create a new room' })
  @ApiResponse({ status: 201, description: 'Room created successfully' })
  @ApiResponse({ status: 409, description: 'Room already exists' })
  async createRoom(
    @Body() dto: CreateRoomDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.roomsService.createRoom(dto, req.user.sub);
  }

  /**
   * List rooms with filters
   */
  @Get()
  @ApiOperation({ summary: 'List rooms with filters' })
  @ApiResponse({ status: 200, description: 'List of rooms' })
  @ApiQuery({ name: 'vertical', required: false, enum: ['BOYS', 'GIRLS', 'DHARAMSHALA'] })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'floor', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async listRooms(
    @Query() filters: ListRoomsDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.roomsService.listRooms(
      filters,
      req.user.role,
      req.user.vertical,
    );
  }

  /**
   * Get room availability summary
   */
  @Get('availability')
  @ApiOperation({ summary: 'Get room availability summary' })
  @ApiResponse({ status: 200, description: 'Room availability by vertical' })
  @ApiQuery({ name: 'vertical', required: false, enum: ['BOYS', 'GIRLS', 'DHARAMSHALA'] })
  async getRoomAvailability(
    @Query('vertical') vertical?: string,
  ) {
    return this.roomsService.getRoomAvailability(vertical);
  }

  /**
   * Get current user's room allocation
   */
  @Get('my-room')
  @ApiOperation({ summary: 'Get current user room allocation' })
  @ApiResponse({ status: 200, description: 'User room allocation' })
  async getMyRoom(@Request() req: AuthenticatedRequest) {
    return this.roomsService.getStudentAllocation(req.user.sub);
  }

  /**
   * Get room by ID with occupants
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get room by ID with current occupants' })
  @ApiParam({ name: 'id', description: 'Room UUID' })
  @ApiResponse({ status: 200, description: 'Room details with occupants' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  async getRoom(@Param('id') id: string) {
    return this.roomsService.getRoomWithOccupants(id);
  }

  /**
   * Update room (Superintendent/Trustee only)
   */
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('SUPERINTENDENT', 'TRUSTEE')
  @ApiOperation({ summary: 'Update room details' })
  @ApiParam({ name: 'id', description: 'Room UUID' })
  @ApiResponse({ status: 200, description: 'Room updated' })
  @ApiResponse({ status: 400, description: 'Invalid update' })
  async updateRoom(
    @Param('id') id: string,
    @Body() dto: UpdateRoomDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.roomsService.updateRoom(id, dto, req.user.sub);
  }

  /**
   * Allocate room to a student
   */
  @Post(':id/allocate')
  @UseGuards(RolesGuard)
  @Roles('SUPERINTENDENT', 'TRUSTEE')
  @ApiOperation({ summary: 'Allocate room to a student' })
  @ApiParam({ name: 'id', description: 'Room UUID' })
  @ApiResponse({ status: 201, description: 'Room allocated successfully' })
  @ApiResponse({ status: 400, description: 'Room at full capacity' })
  @ApiResponse({ status: 409, description: 'Student already has allocation' })
  async allocateRoom(
    @Param('id') id: string,
    @Body() dto: AllocateRoomDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.roomsService.allocateRoom(id, dto, req.user.sub);
  }

  /**
   * End a room allocation
   */
  @Post('allocations/:allocationId/end')
  @UseGuards(RolesGuard)
  @Roles('SUPERINTENDENT', 'TRUSTEE')
  @ApiOperation({ summary: 'End a room allocation' })
  @ApiParam({ name: 'allocationId', description: 'Allocation UUID' })
  @ApiResponse({ status: 200, description: 'Allocation ended' })
  @ApiResponse({ status: 400, description: 'Allocation not active' })
  async endAllocation(
    @Param('allocationId') allocationId: string,
    @Body() dto: EndAllocationDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.roomsService.endAllocation(allocationId, dto, req.user.sub);
  }

  /**
   * Transfer student to different room
   */
  @Post('allocations/:allocationId/transfer')
  @UseGuards(RolesGuard)
  @Roles('SUPERINTENDENT', 'TRUSTEE')
  @ApiOperation({ summary: 'Transfer student to a different room' })
  @ApiParam({ name: 'allocationId', description: 'Current allocation UUID' })
  @ApiResponse({ status: 201, description: 'Student transferred successfully' })
  @ApiResponse({ status: 400, description: 'Transfer failed' })
  async transferRoom(
    @Param('allocationId') allocationId: string,
    @Body() dto: TransferRoomDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.roomsService.transferRoom(allocationId, dto, req.user.sub);
  }

  /**
   * Get student's room allocation
   */
  @Get('students/:studentUserId/allocation')
  @UseGuards(RolesGuard)
  @Roles('SUPERINTENDENT', 'TRUSTEE', 'ACCOUNTS')
  @ApiOperation({ summary: 'Get student room allocation' })
  @ApiParam({ name: 'studentUserId', description: 'Student user UUID' })
  @ApiResponse({ status: 200, description: 'Student allocation details' })
  async getStudentAllocation(@Param('studentUserId') studentUserId: string) {
    return this.roomsService.getStudentAllocation(studentUserId);
  }
}
