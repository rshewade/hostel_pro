import { NextRequest } from 'next/server';
import { findById, updateById, deleteById, insert } from '@/lib/api/db';
import {
  successResponse,
  notFoundResponse,
  badRequestResponse,
  serverErrorResponse,
} from '@/lib/api/responses';
import { ApplicationAPI } from '@/types/api';

/**
 * GET /api/applications/[id]
 * Get a single application by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const application = await findById('applications', id);

    if (!application) {
      return notFoundResponse('Application not found');
    }

    return successResponse({ data: application } as ApplicationAPI.GetResponse);
  } catch (error: any) {
    console.error('Error in GET /api/applications/[id]:', error);
    return serverErrorResponse('Failed to fetch application', error);
  }
}

/**
 * PUT /api/applications/[id]
 * Update an application
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: ApplicationAPI.UpdateRequest = await request.json();

    const application = await findById('applications', id);

    if (!application) {
      return notFoundResponse('Application not found');
    }

    // Only allow updates if application is in DRAFT status
    if (application.current_status !== 'DRAFT' && body.data) {
      return badRequestResponse(
        'Cannot modify application data after submission. Only status updates are allowed.'
      );
    }

    const updatedApplication = await updateById('applications', id, body);

    // Log status change if status was updated
    if (body.current_status && body.current_status !== application.current_status) {
      await insert('auditLogs', {
        id: `audit${Date.now()}`,
        entity_type: 'APPLICATION',
        entity_id: id,
        action: 'STATUS_CHANGE',
        old_value: application.current_status,
        new_value: body.current_status,
        performed_by: application.student_user_id || null,
        performed_at: new Date().toISOString(),
        metadata: {
          tracking_number: application.tracking_number,
        },
      });
    }

    return successResponse({
      data: updatedApplication,
    } as ApplicationAPI.UpdateResponse);
  } catch (error: any) {
    console.error('Error in PUT /api/applications/[id]:', error);
    return serverErrorResponse('Failed to update application', error);
  }
}

/**
 * DELETE /api/applications/[id]
 * Delete an application (soft delete - mark as ARCHIVED)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const application = await findById('applications', id);

    if (!application) {
      return notFoundResponse('Application not found');
    }

    // Only allow deletion if application is in DRAFT status
    if (application.current_status !== 'DRAFT') {
      return badRequestResponse(
        'Cannot delete application after submission. Contact administration for withdrawal.'
      );
    }

    // Soft delete by marking as ARCHIVED
    await updateById('applications', id, {
      current_status: 'ARCHIVED',
    });

    // Log deletion
    await insert('auditLogs', {
      id: `audit${Date.now()}`,
      entity_type: 'APPLICATION',
      entity_id: id,
      action: 'DELETE',
      old_value: application.current_status,
      new_value: 'ARCHIVED',
      performed_by: application.student_user_id || null,
      performed_at: new Date().toISOString(),
      metadata: {
        tracking_number: application.tracking_number,
      },
    });

    return successResponse({ success: true, message: 'Application deleted successfully' });
  } catch (error: any) {
    console.error('Error in DELETE /api/applications/[id]:', error);
    return serverErrorResponse('Failed to delete application', error);
  }
}
