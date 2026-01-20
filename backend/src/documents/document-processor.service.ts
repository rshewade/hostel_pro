import {
  Injectable,
  Inject,
  Logger,
} from '@nestjs/common';
import { SUPABASE_CLIENT } from '../supabase/supabase.provider';
import { SupabaseClient } from '@supabase/supabase-js';
import * as sharp from 'sharp';
import { PDFDocument } from 'pdf-lib';
import { StorageBucket } from './documents.types';

export interface ProcessingResult {
  thumbnailPath?: string;
  watermarkedPath?: string;
  thumbnailUrl?: string;
}

export interface ProcessingOptions {
  generateThumbnail?: boolean;
  addWatermark?: boolean;
  watermarkText?: string;
  thumbnailWidth?: number;
  thumbnailHeight?: number;
}

const DEFAULT_OPTIONS: ProcessingOptions = {
  generateThumbnail: true,
  addWatermark: false,
  watermarkText: 'HOSTEL PRO',
  thumbnailWidth: 200,
  thumbnailHeight: 200,
};

@Injectable()
export class DocumentProcessorService {
  private readonly logger = new Logger(DocumentProcessorService.name);

  constructor(
    @Inject(SUPABASE_CLIENT) private supabase: SupabaseClient,
  ) {}

  /**
   * Process uploaded document - generate thumbnail and/or watermark
   */
  async processDocument(
    bucket: StorageBucket,
    storagePath: string,
    mimeType: string,
    options: ProcessingOptions = {},
  ): Promise<ProcessingResult> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const result: ProcessingResult = {};

    try {
      // Download the original file
      const { data: fileData, error: downloadError } = await this.supabase.storage
        .from(bucket)
        .download(storagePath);

      if (downloadError || !fileData) {
        this.logger.error(`Failed to download file for processing: ${downloadError?.message}`);
        return result;
      }

      const buffer = Buffer.from(await fileData.arrayBuffer());

      // Process based on file type
      if (mimeType === 'application/pdf') {
        if (opts.generateThumbnail) {
          const thumbnailResult = await this.generatePdfThumbnail(
            buffer,
            bucket,
            storagePath,
            opts,
          );
          if (thumbnailResult) {
            result.thumbnailPath = thumbnailResult.path;
            result.thumbnailUrl = thumbnailResult.url;
          }
        }

        if (opts.addWatermark) {
          const watermarkedResult = await this.addPdfWatermark(
            buffer,
            bucket,
            storagePath,
            opts.watermarkText || 'HOSTEL PRO',
          );
          if (watermarkedResult) {
            result.watermarkedPath = watermarkedResult;
          }
        }
      } else if (mimeType.startsWith('image/')) {
        if (opts.generateThumbnail) {
          const thumbnailResult = await this.generateImageThumbnail(
            buffer,
            bucket,
            storagePath,
            opts,
          );
          if (thumbnailResult) {
            result.thumbnailPath = thumbnailResult.path;
            result.thumbnailUrl = thumbnailResult.url;
          }
        }

        if (opts.addWatermark) {
          const watermarkedResult = await this.addImageWatermark(
            buffer,
            bucket,
            storagePath,
            opts.watermarkText || 'HOSTEL PRO',
          );
          if (watermarkedResult) {
            result.watermarkedPath = watermarkedResult;
          }
        }
      }
    } catch (error) {
      this.logger.error(`Document processing failed: ${error.message}`, error.stack);
      // Don't throw - processing failure should not block upload
    }

    return result;
  }

  /**
   * Generate thumbnail for PDF (first page as image)
   */
  private async generatePdfThumbnail(
    pdfBuffer: Buffer,
    bucket: StorageBucket,
    originalPath: string,
    options: ProcessingOptions,
  ): Promise<{ path: string; url: string } | null> {
    try {
      // Load the PDF
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const pages = pdfDoc.getPages();

      if (pages.length === 0) {
        this.logger.warn('PDF has no pages, cannot generate thumbnail');
        return null;
      }

      // For PDF thumbnails, we create a simple placeholder image
      // since pdf-lib doesn't render to images directly
      // In production, you might use pdf2pic or puppeteer for actual rendering
      const thumbnailBuffer = await this.createPdfPlaceholderThumbnail(
        options.thumbnailWidth || 200,
        options.thumbnailHeight || 200,
      );

      const thumbnailPath = this.getThumbnailPath(originalPath);

      const { error: uploadError } = await this.supabase.storage
        .from(bucket)
        .upload(thumbnailPath, thumbnailBuffer, {
          contentType: 'image/png',
          upsert: true,
        });

      if (uploadError) {
        this.logger.error(`Failed to upload PDF thumbnail: ${uploadError.message}`);
        return null;
      }

      // Generate signed URL for thumbnail
      const { data: signedUrlData } = await this.supabase.storage
        .from(bucket)
        .createSignedUrl(thumbnailPath, 86400); // 24 hours

      return {
        path: thumbnailPath,
        url: signedUrlData?.signedUrl || '',
      };
    } catch (error) {
      this.logger.error(`PDF thumbnail generation failed: ${error.message}`);
      return null;
    }
  }

  /**
   * Create a placeholder thumbnail for PDF files
   */
  private async createPdfPlaceholderThumbnail(
    width: number,
    height: number,
  ): Promise<Buffer> {
    // Create a simple gray placeholder with "PDF" text overlay
    const svgImage = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f0f0f0"/>
        <rect x="10%" y="10%" width="80%" height="80%" fill="#e0e0e0" rx="5"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24"
              fill="#666" text-anchor="middle" dominant-baseline="middle">PDF</text>
      </svg>
    `;

    return sharp(Buffer.from(svgImage))
      .png()
      .toBuffer();
  }

  /**
   * Generate thumbnail for images
   */
  private async generateImageThumbnail(
    imageBuffer: Buffer,
    bucket: StorageBucket,
    originalPath: string,
    options: ProcessingOptions,
  ): Promise<{ path: string; url: string } | null> {
    try {
      const thumbnailBuffer = await sharp(imageBuffer)
        .resize(options.thumbnailWidth || 200, options.thumbnailHeight || 200, {
          fit: 'cover',
          position: 'center',
        })
        .png()
        .toBuffer();

      const thumbnailPath = this.getThumbnailPath(originalPath);

      const { error: uploadError } = await this.supabase.storage
        .from(bucket)
        .upload(thumbnailPath, thumbnailBuffer, {
          contentType: 'image/png',
          upsert: true,
        });

      if (uploadError) {
        this.logger.error(`Failed to upload image thumbnail: ${uploadError.message}`);
        return null;
      }

      // Generate signed URL for thumbnail
      const { data: signedUrlData } = await this.supabase.storage
        .from(bucket)
        .createSignedUrl(thumbnailPath, 86400); // 24 hours

      return {
        path: thumbnailPath,
        url: signedUrlData?.signedUrl || '',
      };
    } catch (error) {
      this.logger.error(`Image thumbnail generation failed: ${error.message}`);
      return null;
    }
  }

  /**
   * Add watermark to PDF
   */
  private async addPdfWatermark(
    pdfBuffer: Buffer,
    bucket: StorageBucket,
    originalPath: string,
    watermarkText: string,
  ): Promise<string | null> {
    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const pages = pdfDoc.getPages();

      // Add watermark to each page
      for (const page of pages) {
        const { width, height } = page.getSize();

        // Draw diagonal watermark text
        page.drawText(watermarkText, {
          x: width / 4,
          y: height / 2,
          size: 50,
          opacity: 0.2,
          rotate: { angle: 45, type: 'degrees' } as any,
        });
      }

      const watermarkedBuffer = await pdfDoc.save();
      const watermarkedPath = this.getWatermarkedPath(originalPath);

      const { error: uploadError } = await this.supabase.storage
        .from(bucket)
        .upload(watermarkedPath, Buffer.from(watermarkedBuffer), {
          contentType: 'application/pdf',
          upsert: true,
        });

      if (uploadError) {
        this.logger.error(`Failed to upload watermarked PDF: ${uploadError.message}`);
        return null;
      }

      return watermarkedPath;
    } catch (error) {
      this.logger.error(`PDF watermark failed: ${error.message}`);
      return null;
    }
  }

  /**
   * Add watermark to image
   */
  private async addImageWatermark(
    imageBuffer: Buffer,
    bucket: StorageBucket,
    originalPath: string,
    watermarkText: string,
  ): Promise<string | null> {
    try {
      // Get image dimensions
      const metadata = await sharp(imageBuffer).metadata();
      const width = metadata.width || 800;
      const height = metadata.height || 600;

      // Create watermark SVG overlay
      const watermarkSvg = Buffer.from(`
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${Math.min(width, height) / 10}"
                fill="rgba(0,0,0,0.2)" text-anchor="middle" dominant-baseline="middle"
                transform="rotate(-45, ${width / 2}, ${height / 2})">${watermarkText}</text>
        </svg>
      `);

      const watermarkedBuffer = await sharp(imageBuffer)
        .composite([
          {
            input: watermarkSvg,
            blend: 'over',
          },
        ])
        .toBuffer();

      const watermarkedPath = this.getWatermarkedPath(originalPath);

      // Determine content type from original path
      const ext = originalPath.split('.').pop()?.toLowerCase();
      let contentType = 'image/jpeg';
      if (ext === 'png') contentType = 'image/png';
      else if (ext === 'jpg' || ext === 'jpeg') contentType = 'image/jpeg';

      const { error: uploadError } = await this.supabase.storage
        .from(bucket)
        .upload(watermarkedPath, watermarkedBuffer, {
          contentType,
          upsert: true,
        });

      if (uploadError) {
        this.logger.error(`Failed to upload watermarked image: ${uploadError.message}`);
        return null;
      }

      return watermarkedPath;
    } catch (error) {
      this.logger.error(`Image watermark failed: ${error.message}`);
      return null;
    }
  }

  /**
   * Generate thumbnail path from original path
   */
  private getThumbnailPath(originalPath: string): string {
    const parts = originalPath.split('/');
    const filename = parts.pop() || '';
    const filenameWithoutExt = filename.replace(/\.[^.]+$/, '');
    return [...parts, 'thumbnails', `${filenameWithoutExt}_thumb.png`].join('/');
  }

  /**
   * Generate watermarked path from original path
   */
  private getWatermarkedPath(originalPath: string): string {
    const parts = originalPath.split('/');
    const filename = parts.pop() || '';
    const ext = filename.split('.').pop();
    const filenameWithoutExt = filename.replace(/\.[^.]+$/, '');
    return [...parts, 'watermarked', `${filenameWithoutExt}_wm.${ext}`].join('/');
  }
}
