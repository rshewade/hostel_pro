import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifySignedSessionToken } from '@/lib/auth';

/**
 * GET /api/parent/student
 *
 * Read-only endpoint for parent to view their ward's student information.
 * Looks up students by matching parent mobile number.
 *
 * Query Parameters:
 * - sessionToken: string - Parent session token from OTP login
 *
 * Response:
 * - Success: 200 with { success: true, data: StudentData }
 * - Error: 400/401/405 with { message: string }
 *
 * Permissions: READ-ONLY - No mutation allowed
 * Auth: PARENT only
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionToken = searchParams.get('sessionToken');

    // Validate session token
    if (!sessionToken) {
      return NextResponse.json(
        { message: 'Authentication required. Please login again.' },
        { status: 401 }
      );
    }

    // Verify signed session token
    const tokenData = verifySignedSessionToken(sessionToken);
    if (!tokenData) {
      return NextResponse.json(
        { message: 'Invalid or expired session token. Please login again.' },
        { status: 401 }
      );
    }

    // Verify role is parent
    if (tokenData.vertical !== 'parent') {
      return NextResponse.json(
        { message: 'Access denied. Parent access required.' },
        { status: 403 }
      );
    }

    // Get parent's mobile number from token
    const parentMobile = tokenData.contact as string;

    // Normalize mobile number for comparison (remove +91, spaces, etc.)
    const normalizePhone = (phone: string) => phone?.replace(/[\s+\-]/g, '').slice(-10);
    const normalizedParentMobile = normalizePhone(parentMobile);

    const students: any[] = [];
    const verticalMap: Record<string, string> = {
      'BOYS_HOSTEL': 'Boys Hostel',
      'GIRLS_ASHRAM': 'Girls Ashram',
      'DHARAMSHALA': 'Dharamshala',
    };

    // Helper to get room allocation for a student
    const getRoomAllocation = async (studentId: string) => {
      const { rows } = await query(
        `SELECT ra.*, r.room_number, r.vertical AS room_vertical
         FROM room_allocations ra
         LEFT JOIN rooms r ON ra.room_id = r.id
         WHERE ra.student_id = $1 AND ra.status = 'ACTIVE'`,
        [studentId]
      );
      return rows.length > 0 ? rows[0] : null;
    };

    // 1. Find parent user and linked students via parent_user table
    //    Check if this parent mobile belongs to a PARENT user with linked students
    const { rows: parentUsers } = await query(
      `SELECT * FROM users WHERE role = 'PARENT' AND mobile LIKE $1`,
      [`%${normalizedParentMobile}`]
    );

    if (parentUsers.length > 0) {
      // Find student users — match via applications where guardian mobile matches
      const { rows: linkedApps } = await query(
        `SELECT DISTINCT student_user_id FROM applications
         WHERE student_user_id IS NOT NULL
         AND (data->'guardian_info'->>'father_mobile' LIKE $1
              OR data->'guardian_info'->>'mother_mobile' LIKE $1)`,
        [`%${normalizedParentMobile}`]
      );

      for (const app of linkedApps) {
        const { rows: userRows } = await query(
          `SELECT * FROM users WHERE id = $1 AND role = 'STUDENT'`,
          [app.student_user_id]
        );
        if (userRows.length > 0) {
          const user = userRows[0];
          const allocation = await getRoomAllocation(user.id);
          students.push({
            id: user.id,
            name: user.full_name,
            photo: null,
            vertical: verticalMap[user.vertical] || user.vertical || 'N/A',
            room: allocation?.room_number ? `Room ${allocation.room_number}` : 'Not Allocated',
            joiningDate: user.created_at,
            status: allocation?.check_in_confirmed ? 'CHECKED_IN' : allocation ? 'ALLOCATED' : 'PENDING',
          });
        }
      }
    }

    // 2. Fallback: Find students directly by matching all student users
    if (students.length === 0) {
      const { rows: allStudents } = await query(
        `SELECT * FROM users WHERE role = 'STUDENT'`
      );

      // Check each student's applications for parent mobile match
      for (const student of allStudents) {
        const { rows: apps } = await query(
          `SELECT data FROM applications WHERE student_user_id = $1
           OR applicant_name = $2`,
          [student.id, student.full_name]
        );

        const isLinked = apps.some((app: any) => {
          const fatherMobile = normalizePhone(app.data?.guardian_info?.father_mobile || '');
          const motherMobile = normalizePhone(app.data?.guardian_info?.mother_mobile || '');
          return fatherMobile === normalizedParentMobile || motherMobile === normalizedParentMobile;
        });

        if (isLinked) {
          const allocation = await getRoomAllocation(student.id);
          students.push({
            id: student.id,
            name: student.full_name,
            photo: null,
            vertical: verticalMap[student.vertical] || student.vertical || 'N/A',
            room: allocation?.room_number ? `Room ${allocation.room_number}` : 'Not Allocated',
            joiningDate: student.created_at,
            status: allocation?.check_in_confirmed ? 'CHECKED_IN' : allocation ? 'ALLOCATED' : 'PENDING',
          });
        }
      }
    }

    // 3. Also check applications where parent mobile matches (for pending applications)
    const { rows: applications } = await query('SELECT * FROM applications');

    if (applications) {
      for (const app of applications) {
        const fatherMobile = normalizePhone(app.data?.guardian_info?.father_mobile || '');
        const motherMobile = normalizePhone(app.data?.guardian_info?.mother_mobile || '');

        if (fatherMobile === normalizedParentMobile || motherMobile === normalizedParentMobile) {
          // Skip if already added (approved students should be in users table)
          const applicantName = app.applicant_name || app.data?.personal_info?.full_name || 'Unknown';
          if (students.some(s => s.name?.toLowerCase() === applicantName?.toLowerCase())) continue;

          // Skip approved applications that have a student_user_id (they're in users table)
          if (app.student_user_id && app.current_status === 'APPROVED') continue;

          const verticalMap: Record<string, string> = {
            'BOYS_HOSTEL': 'Boys Hostel',
            'GIRLS_ASHRAM': 'Girls Ashram',
            'DHARAMSHALA': 'Dharamshala',
          };

          students.push({
            id: app.id,
            name: applicantName,
            photo: null,
            vertical: verticalMap[app.vertical] || app.vertical,
            room: 'Not Allocated',
            joiningDate: app.submitted_at || app.created_at,
            status: app.current_status,
            trackingNumber: app.tracking_number,
          });
        }
      }
    }

    // If no students found, return appropriate message
    if (students.length === 0) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'No student records found for this mobile number. Make sure you are using the mobile number registered as parent/guardian contact.',
      });
    }

    // Return first student (or array if multiple children)
    return NextResponse.json({
      success: true,
      data: students.length === 1 ? students[0] : students,
    });

  } catch (error) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST, PUT, DELETE - Disallowed mutations
 * This endpoint is READ-ONLY
 */
export async function POST() {
  return NextResponse.json(
    { message: 'Method not allowed. This endpoint is read-only.' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { message: 'Method not allowed. This endpoint is read-only.' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { message: 'Method not allowed. This endpoint is read-only.' },
    { status: 405 }
  );
}

export async function PATCH() {
  return NextResponse.json(
    { message: 'Method not allowed. This endpoint is read-only.' },
    { status: 405 }
  );
}
