import { NextRequest, NextResponse } from 'next/server';
import { query, withTransaction } from '@/lib/db';
import {
  successResponse,
  notFoundResponse,
  badRequestResponse,
  serverErrorResponse,
} from '@/lib/api/responses';
import type { ApplicationAPI } from '@/types/api';
import { requireAuth } from '@/lib/authorize';

/**
 * GET /api/applications/[id]
 * Get a single application by ID
 * Auth: SUPERINTENDENT, TRUSTEE, ACCOUNTS (staff only)
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(_request, ['SUPERINTENDENT', 'TRUSTEE', 'ACCOUNTS']);
    const { id } = await params;

    const { rows } = await query(
      'SELECT * FROM applications WHERE id = $1',
      [id]
    );

    if (rows.length === 0) {
      return notFoundResponse('Application not found');
    }

    return successResponse({ data: rows[0] } as ApplicationAPI.GetResponse);
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    console.error('Error in GET /api/applications/[id]:', error);
    return serverErrorResponse('Failed to fetch application', error);
  }
}

/**
 * PUT /api/applications/[id]
 * Update an application
 * Auth: SUPERINTENDENT, TRUSTEE, ACCOUNTS (staff only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request, ['SUPERINTENDENT', 'TRUSTEE', 'ACCOUNTS']);
    const { id } = await params;
    const body = await request.json() as any;

    // Get existing application
    const { rows: existingRows } = await query(
      'SELECT * FROM applications WHERE id = $1',
      [id]
    );

    if (existingRows.length === 0) {
      return notFoundResponse('Application not found');
    }

    const application = existingRows[0];

    // Only allow updates if application is in DRAFT status (for data changes)
    if (application.current_status !== 'DRAFT' && body.data) {
      return badRequestResponse(
        'Cannot modify application data after submission. Only status updates are allowed.'
      );
    }

    // Build update object with only valid database columns
    const updateData: Record<string, any> = {};

    // Map status fields (frontend may send 'status' or 'current_status')
    const newStatus = body.current_status || body.status;
    if (newStatus) {
      updateData.current_status = newStatus;

      // Set appropriate timestamp fields based on status transition
      const now = new Date().toISOString();
      switch (newStatus) {
        case 'SUBMITTED':
          if (!application.submitted_at) {
            updateData.submitted_at = now;
          }
          break;
        case 'REVIEW':
          if (!application.reviewed_at) {
            updateData.reviewed_at = now;
          }
          break;
        case 'APPROVED':
          updateData.approved_at = now;
          break;
        case 'REJECTED':
          updateData.rejected_at = now;
          if (body.remarks) {
            updateData.rejection_reason = body.remarks;
          }
          break;
      }
    }

    // Map other valid columns
    if (body.data !== undefined) updateData.data = body.data;
    if (body.applicant_name !== undefined) updateData.applicant_name = body.applicant_name;
    if (body.applicant_mobile !== undefined) updateData.applicant_mobile = body.applicant_mobile;
    if (body.applicant_email !== undefined) updateData.applicant_email = body.applicant_email;
    if (body.vertical !== undefined) updateData.vertical = body.vertical;
    if (body.interview_scheduled_at !== undefined) updateData.interview_scheduled_at = body.interview_scheduled_at;
    if (body.interview_completed_at !== undefined) updateData.interview_completed_at = body.interview_completed_at;
    if (body.student_user_id !== undefined) updateData.student_user_id = body.student_user_id;

    // Store remarks in the data JSON if provided (for all status changes)
    if (body.remarks) {
      updateData.data = {
        ...(application.data || {}),
        status_remarks: body.remarks,
        last_status_update: new Date().toISOString(),
      };
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return badRequestResponse('No valid fields to update');
    }

    // Build dynamic UPDATE query
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updateData)) {
      setClauses.push(`${key} = $${paramIndex++}`);
      values.push(key === 'data' ? JSON.stringify(value) : value);
    }

    values.push(id);
    const updateSql = `UPDATE applications SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

    // Run all writes in a single transaction
    const updatedApplication = await withTransaction(async (client) => {
      const { rows: updatedRows } = await client.query(updateSql, values);

      if (updatedRows.length === 0) {
        throw new Error('Failed to update application');
      }

      let result = updatedRows[0];

      // Log status change if status was updated
      if (updateData.current_status && updateData.current_status !== application.current_status) {
        await client.query(
          `INSERT INTO audit_logs (entity_type, entity_id, action, actor_id, metadata)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            'APPLICATION',
            id,
            'STATUS_CHANGE',
            application.student_user_id || null,
            JSON.stringify({
              tracking_number: application.tracking_number,
              old_status: application.current_status,
              new_status: updateData.current_status,
              remarks: body.remarks || null,
            }),
          ]
        );
      }

      // Create student user when application is approved
      if (updateData.current_status === 'APPROVED' && !application.student_user_id) {
        const parentMobile = application.data?.guardian_info?.father_mobile ||
                            application.data?.guardian_info?.mother_mobile ||
                            application.data?.emergency_contact?.mobile || null;

        const { rows: userRows } = await client.query(
          `INSERT INTO users (
            role, vertical, full_name, email, mobile, date_of_birth,
            parent_mobile, is_active, requires_password_change, metadata
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          RETURNING *`,
          [
            'STUDENT',
            application.vertical,
            application.applicant_name,
            application.applicant_email,
            application.applicant_mobile,
            application.date_of_birth,
            parentMobile,
            true,
            true,
            JSON.stringify({
              application_id: id,
              tracking_number: application.tracking_number,
              approved_at: new Date().toISOString(),
              password_pending: true,
            }),
          ]
        );

        if (userRows.length === 0) {
          throw new Error('Failed to create user record');
        }

        const newUser = userRows[0];

        // Link the new user to the application
        await client.query(
          'UPDATE applications SET student_user_id = $1 WHERE id = $2',
          [newUser.id, id]
        );

        // Create students table record
        const personalInfo = application.data?.personal_info || {};
        const guardianInfo = application.data?.guardian_info || {};
        const academicInfo = application.data?.academic_info || {};
        const emergencyContact = application.data?.emergency_contact || {};

        await client.query(
          `INSERT INTO students (
            user_id, vertical, status, gender, date_of_birth, aadhar_number,
            native_place, permanent_address, father_name, father_mobile,
            mother_name, mother_mobile, guardian_name, guardian_mobile,
            guardian_relation, institution, course, year_of_study,
            enrollment_number, joining_date, academic_year,
            emergency_contact_name, emergency_contact_phone,
            emergency_contact_relation, blood_group, medical_conditions,
            allergies, metadata
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
            $21, $22, $23, $24, $25, $26, $27, $28
          )`,
          [
            newUser.id,
            application.vertical,
            'PENDING',
            personalInfo.gender || null,
            personalInfo.date_of_birth || null,
            personalInfo.aadhar_number || null,
            personalInfo.native_place || null,
            personalInfo.permanent_address || personalInfo.address || null,
            guardianInfo.father_name || null,
            guardianInfo.father_mobile || null,
            guardianInfo.mother_name || null,
            guardianInfo.mother_mobile || null,
            guardianInfo.guardian_name || null,
            guardianInfo.guardian_mobile || null,
            guardianInfo.guardian_relation || null,
            academicInfo.institution || academicInfo.college || null,
            academicInfo.course || null,
            academicInfo.year_of_study || academicInfo.year || null,
            academicInfo.enrollment_number || null,
            new Date().toISOString().split('T')[0],
            academicInfo.academic_year || '2025-26',
            emergencyContact.name || guardianInfo.father_name || null,
            emergencyContact.mobile || guardianInfo.father_mobile || null,
            emergencyContact.relation || 'Father',
            personalInfo.blood_group || null,
            personalInfo.medical_conditions || null,
            personalInfo.allergies || null,
            JSON.stringify({
              application_id: id,
              tracking_number: application.tracking_number,
              created_from_application: true,
            }),
          ]
        );

        // Log user creation
        await client.query(
          `INSERT INTO audit_logs (entity_type, entity_id, action, metadata)
           VALUES ($1, $2, $3, $4)`,
          [
            'USER',
            newUser.id,
            'CREATE',
            JSON.stringify({
              application_id: id,
              tracking_number: application.tracking_number,
              reason: 'Application approved - student account created',
            }),
          ]
        );

        result.student_user_id = newUser.id;
        result.student_user = newUser;
      }

      return result;
    });

    return successResponse({
      data: updatedApplication,
    } as ApplicationAPI.UpdateResponse);
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    console.error('Error in PUT /api/applications/[id]:', error);
    return serverErrorResponse('Failed to update application', error);
  }
}

/**
 * DELETE /api/applications/[id]
 * Delete an application (soft delete - mark as ARCHIVED)
 * Auth: SUPERINTENDENT, TRUSTEE, ACCOUNTS (staff only)
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(_request, ['SUPERINTENDENT', 'TRUSTEE', 'ACCOUNTS']);
    const { id } = await params;

    // Get application
    const { rows } = await query(
      'SELECT * FROM applications WHERE id = $1',
      [id]
    );

    if (rows.length === 0) {
      return notFoundResponse('Application not found');
    }

    const application = rows[0];

    // Only allow deletion if application is in DRAFT status
    if (application.current_status !== 'DRAFT') {
      return badRequestResponse(
        'Cannot delete application after submission. Contact administration for withdrawal.'
      );
    }

    // Soft delete by marking as ARCHIVED
    await query(
      "UPDATE applications SET current_status = 'ARCHIVED' WHERE id = $1",
      [id]
    );

    // Log deletion
    await query(
      `INSERT INTO audit_logs (entity_type, entity_id, action, actor_id, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        'APPLICATION',
        id,
        'DELETE',
        application.student_user_id,
        JSON.stringify({
          tracking_number: application.tracking_number,
          old_status: application.current_status,
          new_status: 'ARCHIVED',
        }),
      ]
    );

    return successResponse({ success: true, message: 'Application deleted successfully' });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    console.error('Error in DELETE /api/applications/[id]:', error);
    return serverErrorResponse('Failed to delete application', error);
  }
}
