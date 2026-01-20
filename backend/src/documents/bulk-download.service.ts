import {
  Injectable,
  Inject,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SUPABASE_CLIENT } from '../supabase/supabase.provider';
import { SupabaseClient } from '@supabase/supabase-js';
import { PDFDocument } from 'pdf-lib';
import * as archiver from 'archiver';
import { Document, StorageBucket } from './documents.types';

export interface BulkDownloadFilters {
  studentUserId?: string;
  applicationId?: string;
  documentType?: string;
  status?: string;
  vertical?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface BulkDownloadResult {
  signedUrl: string;
  expiresAt: string;
  fileName: string;
  fileSize?: number;
  documentCount: number;
}

export type OutputFormat = 'zip' | 'pdf';

@Injectable()
export class BulkDownloadService {
  private readonly logger = new Logger(BulkDownloadService.name);

  constructor(
    @Inject(SUPABASE_CLIENT) private supabase: SupabaseClient,
  ) {}

  /**
   * Bulk download documents as ZIP or merged PDF
   */
  async bulkDownload(
    filters: BulkDownloadFilters,
    format: OutputFormat = 'zip',
    userId: string,
  ): Promise<BulkDownloadResult> {
    // Fetch documents matching filters
    const documents = await this.fetchDocuments(filters);

    if (documents.length === 0) {
      throw new BadRequestException('No documents found matching the filters');
    }

    // Limit bulk downloads
    if (documents.length > 50) {
      throw new BadRequestException('Bulk download limited to 50 documents at a time');
    }

    // Download all files
    const files = await this.downloadFiles(documents);

    // Create output based on format
    let outputBuffer: Buffer;
    let fileName: string;
    let contentType: string;

    if (format === 'pdf') {
      // Only merge PDFs
      const pdfFiles = files.filter(f => f.mimeType === 'application/pdf');
      if (pdfFiles.length === 0) {
        throw new BadRequestException('No PDF documents found for merging');
      }
      outputBuffer = await this.mergePdfs(pdfFiles);
      fileName = `merged_documents_${Date.now()}.pdf`;
      contentType = 'application/pdf';
    } else {
      outputBuffer = await this.createZip(files);
      fileName = `documents_${Date.now()}.zip`;
      contentType = 'application/zip';
    }

    // Upload to system-generated bucket
    const storagePath = `bulk-downloads/${userId}/${fileName}`;
    const bucket: StorageBucket = 'system-generated';

    const { error: uploadError } = await this.supabase.storage
      .from(bucket)
      .upload(storagePath, outputBuffer, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      this.logger.error(`Failed to upload bulk download: ${uploadError.message}`);
      throw new InternalServerErrorException('Failed to create bulk download');
    }

    // Generate signed URL (valid for 24 hours)
    const { data: signedUrlData, error: signedUrlError } = await this.supabase.storage
      .from(bucket)
      .createSignedUrl(storagePath, 86400); // 24 hours

    if (signedUrlError || !signedUrlData) {
      throw new InternalServerErrorException('Failed to generate download URL');
    }

    // Log the bulk download
    await this.logBulkDownload(userId, documents.length, format, filters);

    return {
      signedUrl: signedUrlData.signedUrl,
      expiresAt: new Date(Date.now() + 86400 * 1000).toISOString(),
      fileName,
      fileSize: outputBuffer.length,
      documentCount: documents.length,
    };
  }

  /**
   * Fetch documents matching filters
   */
  private async fetchDocuments(filters: BulkDownloadFilters): Promise<Document[]> {
    let query = this.supabase.from('documents').select('*');

    if (filters.studentUserId) {
      query = query.eq('student_user_id', filters.studentUserId);
    }

    if (filters.applicationId) {
      query = query.eq('application_id', filters.applicationId);
    }

    if (filters.documentType) {
      query = query.eq('document_type', filters.documentType);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.dateFrom) {
      query = query.gte('created_at', filters.dateFrom);
    }

    if (filters.dateTo) {
      query = query.lte('created_at', filters.dateTo);
    }

    query = query.order('created_at', { ascending: true });

    const { data, error } = await query;

    if (error) {
      this.logger.error(`Failed to fetch documents: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch documents');
    }

    // If vertical filter, need to join with users/applications
    if (filters.vertical && data) {
      const filteredDocs: Document[] = [];
      for (const doc of data) {
        if (doc.student_user_id) {
          const { data: user } = await this.supabase
            .from('users')
            .select('vertical')
            .eq('id', doc.student_user_id)
            .single();
          if (user?.vertical === filters.vertical) {
            filteredDocs.push(doc);
          }
        } else if (doc.application_id) {
          const { data: app } = await this.supabase
            .from('applications')
            .select('vertical')
            .eq('id', doc.application_id)
            .single();
          if (app?.vertical === filters.vertical) {
            filteredDocs.push(doc);
          }
        }
      }
      return filteredDocs;
    }

    return data || [];
  }

  /**
   * Download all document files from storage
   */
  private async downloadFiles(documents: Document[]): Promise<Array<{
    name: string;
    buffer: Buffer;
    mimeType: string;
  }>> {
    const files: Array<{ name: string; buffer: Buffer; mimeType: string }> = [];

    for (const doc of documents) {
      try {
        const { data, error } = await this.supabase.storage
          .from(doc.bucket_id)
          .download(doc.storage_path);

        if (error || !data) {
          this.logger.warn(`Failed to download ${doc.file_name}: ${error?.message}`);
          continue;
        }

        const buffer = Buffer.from(await data.arrayBuffer());
        files.push({
          name: doc.file_name,
          buffer,
          mimeType: doc.mime_type || 'application/octet-stream',
        });
      } catch (error) {
        this.logger.warn(`Error downloading ${doc.file_name}: ${error.message}`);
      }
    }

    return files;
  }

  /**
   * Create ZIP archive from files
   */
  private async createZip(files: Array<{
    name: string;
    buffer: Buffer;
    mimeType: string;
  }>): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const archive = archiver('zip', { zlib: { level: 9 } });

      archive.on('data', (chunk: Buffer) => chunks.push(chunk));
      archive.on('end', () => resolve(Buffer.concat(chunks)));
      archive.on('error', (err) => reject(err));

      // Add files with unique names to prevent conflicts
      const nameCount: Record<string, number> = {};
      for (const file of files) {
        let fileName = file.name;
        if (nameCount[fileName]) {
          const ext = fileName.split('.').pop() || '';
          const baseName = fileName.replace(/\.[^.]+$/, '');
          fileName = `${baseName}_${nameCount[fileName]}.${ext}`;
          nameCount[file.name]++;
        } else {
          nameCount[fileName] = 1;
        }
        archive.append(file.buffer, { name: fileName });
      }

      archive.finalize();
    });
  }

  /**
   * Merge multiple PDFs into one
   */
  private async mergePdfs(files: Array<{
    name: string;
    buffer: Buffer;
    mimeType: string;
  }>): Promise<Buffer> {
    try {
      const mergedPdf = await PDFDocument.create();

      for (const file of files) {
        try {
          const pdf = await PDFDocument.load(file.buffer);
          const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
          pages.forEach((page) => mergedPdf.addPage(page));
        } catch (error) {
          this.logger.warn(`Failed to merge ${file.name}: ${error.message}`);
        }
      }

      const mergedBytes = await mergedPdf.save();
      return Buffer.from(mergedBytes);
    } catch (error) {
      this.logger.error(`PDF merge failed: ${error.message}`);
      throw new InternalServerErrorException('Failed to merge PDFs');
    }
  }

  /**
   * Log bulk download to audit logs
   */
  private async logBulkDownload(
    userId: string,
    documentCount: number,
    format: OutputFormat,
    filters: BulkDownloadFilters,
  ): Promise<void> {
    try {
      await this.supabase.from('audit_logs').insert({
        entity_type: 'DOCUMENT',
        entity_id: null,
        action: 'BULK_DOWNLOAD',
        actor_id: userId,
        metadata: {
          document_count: documentCount,
          format,
          filters,
        },
      });
    } catch (error) {
      this.logger.warn(`Failed to log bulk download: ${error.message}`);
    }
  }

  /**
   * Create admission packet (merged PDF) for a student
   */
  async createAdmissionPacket(
    studentUserId: string,
    userId: string,
  ): Promise<BulkDownloadResult> {
    // Fetch all verified documents for the student
    const { data: documents, error } = await this.supabase
      .from('documents')
      .select('*')
      .eq('student_user_id', studentUserId)
      .eq('status', 'VERIFIED')
      .order('document_type', { ascending: true });

    if (error || !documents || documents.length === 0) {
      throw new BadRequestException('No verified documents found for this student');
    }

    // Filter only PDFs
    const pdfDocs = documents.filter((d: Document) => d.mime_type === 'application/pdf');
    if (pdfDocs.length === 0) {
      throw new BadRequestException('No PDF documents available for admission packet');
    }

    // Download and merge
    const files = await this.downloadFiles(pdfDocs);
    const mergedBuffer = await this.mergePdfs(files);

    // Upload to system-generated bucket
    const fileName = `admission_packet_${studentUserId}_${Date.now()}.pdf`;
    const storagePath = `admission-packets/${studentUserId}/${fileName}`;
    const bucket: StorageBucket = 'system-generated';

    const { error: uploadError } = await this.supabase.storage
      .from(bucket)
      .upload(storagePath, mergedBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      throw new InternalServerErrorException('Failed to create admission packet');
    }

    // Generate signed URL
    const { data: signedUrlData, error: signedUrlError } = await this.supabase.storage
      .from(bucket)
      .createSignedUrl(storagePath, 86400);

    if (signedUrlError || !signedUrlData) {
      throw new InternalServerErrorException('Failed to generate download URL');
    }

    // Log the creation
    await this.supabase.from('audit_logs').insert({
      entity_type: 'DOCUMENT',
      entity_id: studentUserId,
      action: 'CREATE_ADMISSION_PACKET',
      actor_id: userId,
      metadata: {
        document_count: pdfDocs.length,
        file_name: fileName,
      },
    });

    return {
      signedUrl: signedUrlData.signedUrl,
      expiresAt: new Date(Date.now() + 86400 * 1000).toISOString(),
      fileName,
      fileSize: mergedBuffer.length,
      documentCount: pdfDocs.length,
    };
  }
}
