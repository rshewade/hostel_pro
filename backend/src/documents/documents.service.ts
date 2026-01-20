import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { SUPABASE_CLIENT } from '../supabase/supabase.provider';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  Document,
  DocumentStatus,
  StorageBucket,
  UploadResult,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
  CATEGORY_BUCKET_MAP,
} from './documents.types';
import { UploadDocumentDto, ListDocumentsDto } from './dto/upload-document.dto';
import { DocumentProcessorService } from './document-processor.service';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    @Inject(SUPABASE_CLIENT) private supabase: SupabaseClient,
    private readonly processorService: DocumentProcessorService,
  ) {}

  /**
   * Validate file type and size
   */
  validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File size exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
      );
    }
  }

  /**
   * Get storage bucket based on category
   */
  getBucketForCategory(category: string): StorageBucket {
    const bucket = CATEGORY_BUCKET_MAP[category];
    if (!bucket) {
      throw new BadRequestException(`Invalid category: ${category}`);
    }
    return bucket;
  }

  /**
   * Generate storage path for document
   * Format: {userId}/{applicationId|general}/{timestamp}_{filename}
   */
  generateStoragePath(
    userId: string,
    applicationId: string | undefined,
    fileName: string,
  ): string {
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const timestamp = Date.now();
    const folder = applicationId || 'general';
    return `${userId}/${folder}/${timestamp}_${sanitizedFileName}`;
  }

  /**
   * Upload document to Supabase Storage and create database record
   */
  async uploadDocument(
    file: Express.Multer.File,
    dto: UploadDocumentDto,
    uploadedBy: string,
  ): Promise<UploadResult> {
    // Validate file
    this.validateFile(file);

    // Determine user ID for path
    const userId = dto.studentUserId || uploadedBy;

    // Get bucket
    const bucket = this.getBucketForCategory(dto.category);

    // Generate storage path
    const storagePath = this.generateStoragePath(
      userId,
      dto.applicationId,
      file.originalname,
    );

    // Upload to Supabase Storage
    const { error: uploadError } = await this.supabase.storage
      .from(bucket)
      .upload(storagePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      throw new InternalServerErrorException(
        `Failed to upload file: ${uploadError.message}`,
      );
    }

    // Create database record
    const documentRecord = {
      application_id: dto.applicationId || null,
      student_user_id: dto.studentUserId || null,
      document_type: dto.documentType,
      bucket_id: bucket,
      storage_path: storagePath,
      file_name: file.originalname,
      file_size: file.size,
      mime_type: file.mimetype,
      status: 'UPLOADED' as DocumentStatus,
      uploaded_by: uploadedBy,
      metadata: {
        originalName: file.originalname,
        category: dto.category,
        description: dto.description,
      },
    };

    const { data: document, error: dbError } = await this.supabase
      .from('documents')
      .insert(documentRecord)
      .select()
      .single();

    if (dbError) {
      // Rollback: delete uploaded file
      await this.supabase.storage.from(bucket).remove([storagePath]);
      throw new InternalServerErrorException(
        `Failed to create document record: ${dbError.message}`,
      );
    }

    // Process document asynchronously (generate thumbnail)
    // This runs in background and updates the document record
    this.processDocumentAsync(document.id, bucket, storagePath, file.mimetype);

    // Generate signed URL for immediate access
    const { data: signedUrlData } = await this.supabase.storage
      .from(bucket)
      .createSignedUrl(storagePath, 3600); // 1 hour

    return {
      document,
      signedUrl: signedUrlData?.signedUrl || '',
    };
  }

  /**
   * Process document asynchronously (thumbnail generation)
   * Runs in background to avoid blocking upload response
   */
  private async processDocumentAsync(
    documentId: string,
    bucket: StorageBucket,
    storagePath: string,
    mimeType: string,
  ): Promise<void> {
    try {
      const result = await this.processorService.processDocument(
        bucket,
        storagePath,
        mimeType,
        { generateThumbnail: true },
      );

      // Update document with thumbnail URL if generated
      if (result.thumbnailPath) {
        await this.supabase
          .from('documents')
          .update({
            metadata: {
              thumbnail_path: result.thumbnailPath,
              thumbnail_url: result.thumbnailUrl,
            },
          })
          .eq('id', documentId);
      }
    } catch (error) {
      this.logger.warn(`Background processing failed for document ${documentId}: ${error.message}`);
      // Don't throw - this is background processing
    }
  }

  /**
   * Get document by ID
   */
  async getDocumentById(documentId: string): Promise<Document> {
    const { data, error } = await this.supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Document not found: ${documentId}`);
    }

    return data;
  }

  /**
   * Generate signed URL for document access
   */
  async getSignedUrl(
    documentId: string,
    userId: string,
    userRole: string,
  ): Promise<{ url: string; expiresAt: string }> {
    const document = await this.getDocumentById(documentId);

    // Access control check
    await this.checkAccessPermission(document, userId, userRole);

    // Generate signed URL
    const { data, error } = await this.supabase.storage
      .from(document.bucket_id)
      .createSignedUrl(document.storage_path, 3600); // 1 hour

    if (error || !data) {
      throw new InternalServerErrorException('Failed to generate signed URL');
    }

    // Log access to audit_logs
    await this.logDocumentAccess(documentId, userId, userRole);

    const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();

    return {
      url: data.signedUrl,
      expiresAt,
    };
  }

  /**
   * Check if user has permission to access document
   */
  private async checkAccessPermission(
    document: Document,
    userId: string,
    userRole: string,
  ): Promise<void> {
    // Trustees and Accounts can access all documents
    if (['TRUSTEE', 'ACCOUNTS'].includes(userRole)) {
      return;
    }

    // Superintendents can only access documents in their vertical
    if (userRole === 'SUPERINTENDENT') {
      const hasAccess = await this.superintendentCanAccessDocument(userId, document);
      if (!hasAccess) {
        throw new ForbiddenException('You can only access documents in your vertical');
      }
      return;
    }

    // Students can only access their own documents
    if (userRole === 'STUDENT') {
      if (document.student_user_id !== userId && document.uploaded_by !== userId) {
        throw new ForbiddenException('You do not have access to this document');
      }
      return;
    }

    // Parents can access their children's documents
    if (userRole === 'PARENT') {
      const hasAccess = await this.parentCanAccessDocument(userId, document);
      if (!hasAccess) {
        throw new ForbiddenException('You can only access your children\'s documents');
      }
      return;
    }

    throw new ForbiddenException('You do not have access to this document');
  }

  /**
   * Check if superintendent can access document based on vertical
   */
  private async superintendentCanAccessDocument(
    superintendentUserId: string,
    document: Document,
  ): Promise<boolean> {
    // Get superintendent's vertical
    const { data: superintendent } = await this.supabase
      .from('users')
      .select('vertical')
      .eq('id', superintendentUserId)
      .single();

    if (!superintendent?.vertical) {
      return false;
    }

    // If document has student_user_id, check student's vertical
    if (document.student_user_id) {
      const { data: student } = await this.supabase
        .from('users')
        .select('vertical')
        .eq('id', document.student_user_id)
        .single();

      return student?.vertical === superintendent.vertical;
    }

    // If document is from application, check application's vertical
    if (document.application_id) {
      const { data: application } = await this.supabase
        .from('applications')
        .select('vertical')
        .eq('id', document.application_id)
        .single();

      return application?.vertical === superintendent.vertical;
    }

    // Default: allow access if no vertical context
    return true;
  }

  /**
   * Check if parent can access document (child's document)
   */
  private async parentCanAccessDocument(
    parentUserId: string,
    document: Document,
  ): Promise<boolean> {
    // Get parent's mobile number
    const { data: parent } = await this.supabase
      .from('users')
      .select('mobile')
      .eq('id', parentUserId)
      .single();

    if (!parent?.mobile) {
      return false;
    }

    // Check if document belongs to a student whose parent_mobile matches
    if (document.student_user_id) {
      const { data: student } = await this.supabase
        .from('users')
        .select('parent_mobile')
        .eq('id', document.student_user_id)
        .single();

      return student?.parent_mobile === parent.mobile;
    }

    return false;
  }

  /**
   * Log document access to audit_logs
   */
  private async logDocumentAccess(
    documentId: string,
    actorId: string,
    actorRole: string,
  ): Promise<void> {
    try {
      await this.supabase.from('audit_logs').insert({
        entity_type: 'DOCUMENT',
        entity_id: documentId,
        action: 'ACCESS_URL',
        actor_id: actorId,
        actor_role: actorRole,
        metadata: {
          access_type: 'signed_url',
        },
      });
    } catch (error) {
      // Don't throw on audit log failure, just log it
      console.error('Failed to log document access:', error);
    }
  }

  /**
   * List documents with filters
   */
  async listDocuments(
    filters: ListDocumentsDto,
    userId: string,
    userRole: string,
  ): Promise<{ documents: Document[]; total: number }> {
    let query = this.supabase.from('documents').select('*', { count: 'exact' });

    // Apply filters
    if (filters.studentUserId) {
      query = query.eq('student_user_id', filters.studentUserId);
    }

    if (filters.applicationId) {
      query = query.eq('application_id', filters.applicationId);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.documentType) {
      query = query.eq('document_type', filters.documentType);
    }

    // Role-based filtering
    if (userRole === 'STUDENT') {
      query = query.or(`student_user_id.eq.${userId},uploaded_by.eq.${userId}`);
    }

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new InternalServerErrorException(
        `Failed to list documents: ${error.message}`,
      );
    }

    return {
      documents: data || [],
      total: count || 0,
    };
  }

  /**
   * Verify or reject a document (staff only)
   */
  async verifyDocument(
    documentId: string,
    status: 'VERIFIED' | 'REJECTED',
    verifiedBy: string,
    rejectionReason?: string,
  ): Promise<Document> {
    const updateData: Partial<Document> = {
      status,
      verified_by: verifiedBy,
      verified_at: new Date().toISOString(),
    };

    if (status === 'REJECTED' && rejectionReason) {
      updateData.metadata = { rejectionReason };
    }

    const { data, error } = await this.supabase
      .from('documents')
      .update(updateData)
      .eq('id', documentId)
      .select()
      .single();

    if (error || !data) {
      throw new InternalServerErrorException(
        `Failed to update document: ${error?.message}`,
      );
    }

    return data;
  }

  /**
   * Delete a document
   */
  async deleteDocument(documentId: string, userId: string): Promise<void> {
    const document = await this.getDocumentById(documentId);

    // Only the uploader or staff can delete
    if (document.uploaded_by !== userId) {
      throw new ForbiddenException('You cannot delete this document');
    }

    // Delete from storage
    const { error: storageError } = await this.supabase.storage
      .from(document.bucket_id)
      .remove([document.storage_path]);

    if (storageError) {
      throw new InternalServerErrorException(
        `Failed to delete file from storage: ${storageError.message}`,
      );
    }

    // Delete database record
    const { error: dbError } = await this.supabase
      .from('documents')
      .delete()
      .eq('id', documentId);

    if (dbError) {
      throw new InternalServerErrorException(
        `Failed to delete document record: ${dbError.message}`,
      );
    }
  }
}
