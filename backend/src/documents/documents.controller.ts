import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseInterceptors,
  UploadedFile,
  Req,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { BulkDownloadService } from './bulk-download.service';
import {
  UploadDocumentDto,
  VerifyDocumentDto,
  ListDocumentsDto,
  BulkDownloadDto,
} from './dto/upload-document.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

interface AuthenticatedRequest extends Request {
  user: {
    sub: string; // user ID
    role: string;
    email?: string;
  };
}

@Controller('api/documents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocumentsController {
  constructor(
    private readonly documentsService: DocumentsService,
    private readonly bulkDownloadService: BulkDownloadService,
  ) {}

  /**
   * Upload a new document
   * POST /api/documents/upload
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadDocumentDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const uploadedBy = req.user.sub;
    const result = await this.documentsService.uploadDocument(
      file,
      dto,
      uploadedBy,
    );

    return {
      success: true,
      message: 'Document uploaded successfully',
      data: result,
    };
  }

  /**
   * Get signed URL for document access
   * GET /api/documents/:id/url
   */
  @Get(':id/url')
  async getSignedUrl(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const { sub: userId, role: userRole } = req.user;
    const result = await this.documentsService.getSignedUrl(id, userId, userRole);

    return {
      success: true,
      data: result,
    };
  }

  /**
   * Get document details
   * GET /api/documents/:id
   */
  @Get(':id')
  async getDocument(@Param('id', ParseUUIDPipe) id: string) {
    const document = await this.documentsService.getDocumentById(id);

    return {
      success: true,
      data: document,
    };
  }

  /**
   * List documents with filters
   * GET /api/documents
   */
  @Get()
  async listDocuments(
    @Query() query: ListDocumentsDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const { sub: userId, role: userRole } = req.user;
    const result = await this.documentsService.listDocuments(
      query,
      userId,
      userRole,
    );

    return {
      success: true,
      data: result.documents,
      meta: {
        total: result.total,
        page: query.page || 1,
        limit: query.limit || 20,
      },
    };
  }

  /**
   * Verify or reject a document (staff only)
   * PATCH /api/documents/:id/verify
   */
  @Patch(':id/verify')
  @Roles('SUPERINTENDENT', 'TRUSTEE', 'ACCOUNTS')
  async verifyDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: VerifyDocumentDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const verifiedBy = req.user.sub;
    const document = await this.documentsService.verifyDocument(
      id,
      dto.status,
      verifiedBy,
      dto.rejectionReason,
    );

    return {
      success: true,
      message: `Document ${dto.status.toLowerCase()} successfully`,
      data: document,
    };
  }

  /**
   * Delete a document
   * DELETE /api/documents/:id
   */
  @Delete(':id')
  async deleteDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.sub;
    await this.documentsService.deleteDocument(id, userId);

    return {
      success: true,
      message: 'Document deleted successfully',
    };
  }

  /**
   * Bulk download documents as ZIP or merged PDF
   * GET /api/documents/bulk-download
   */
  @Get('bulk-download')
  @Roles('SUPERINTENDENT', 'TRUSTEE', 'ACCOUNTS')
  async bulkDownload(
    @Query() query: BulkDownloadDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.sub;
    const format = query.format || 'zip';
    const result = await this.bulkDownloadService.bulkDownload(
      {
        studentUserId: query.studentUserId,
        applicationId: query.applicationId,
        documentType: query.documentType,
        status: query.status,
        vertical: query.vertical,
        dateFrom: query.dateFrom,
        dateTo: query.dateTo,
      },
      format,
      userId,
    );

    return {
      success: true,
      message: `Bulk download created with ${result.documentCount} documents`,
      data: result,
    };
  }

  /**
   * Create admission packet for a student (merged PDF)
   * POST /api/documents/admission-packet/:studentUserId
   */
  @Post('admission-packet/:studentUserId')
  @Roles('SUPERINTENDENT', 'TRUSTEE', 'ACCOUNTS')
  async createAdmissionPacket(
    @Param('studentUserId', ParseUUIDPipe) studentUserId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.sub;
    const result = await this.bulkDownloadService.createAdmissionPacket(
      studentUserId,
      userId,
    );

    return {
      success: true,
      message: 'Admission packet created successfully',
      data: result,
    };
  }
}
