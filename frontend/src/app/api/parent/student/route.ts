import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

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
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const sessionToken = searchParams.get('sessionToken');

    // Validate session token
    if (!sessionToken) {
      return NextResponse.json(
        { message: 'Authentication required. Please login again.' },
        { status: 401 }
      );
    }

    // Decode and verify session token
    let tokenData;
    try {
      const decoded = Buffer.from(sessionToken, 'base64').toString('utf-8');
      tokenData = JSON.parse(decoded);
    } catch {
      return NextResponse.json(
        { message: 'Invalid session token' },
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

    // Check token expiration (24 hours)
    const tokenAge = Date.now() - tokenData.timestamp;
    const maxAge = 86400000; // 24 hours in milliseconds

    if (tokenAge > maxAge) {
      return NextResponse.json(
        { message: 'Session expired. Please login again.' },
        { status: 401 }
      );
    }

    // Get parent's mobile number from token
    const parentMobile = tokenData.contact;

    // Normalize mobile number for comparison (remove +91, spaces, etc.)
    const normalizePhone = (phone: string) => phone?.replace(/[\s+\-]/g, '').slice(-10);
    const normalizedParentMobile = normalizePhone(parentMobile);

    const students: any[] = [];

    // 1. Find students from students table where father/mother mobile matches
    const { data: studentRecords, error: studentError } = await supabase
      .from('students')
      .select('*, users!inner(id, full_name, email, mobile)')
      .or(`father_mobile.eq.${normalizedParentMobile},mother_mobile.eq.${normalizedParentMobile}`);

    if (!studentError && studentRecords) {
      for (const student of studentRecords) {
        // Get room allocation for this student
        const { data: allocation } = await supabase
          .from('room_allocations')
          .select('*, rooms(*)')
          .eq('student_user_id', student.user_id)
          .eq('status', 'ACTIVE')
          .single();

        const verticalMap: Record<string, string> = {
          'BOYS_HOSTEL': 'Boys Hostel',
          'GIRLS_ASHRAM': 'Girls Ashram',
          'DHARAMSHALA': 'Dharamshala',
        };

        students.push({
          id: student.user_id,
          name: student.users?.full_name || 'Unknown',
          photo: null,
          vertical: verticalMap[student.vertical] || student.vertical || 'N/A',
          room: allocation?.rooms?.room_number ? `Room ${allocation.rooms.room_number}` : 'Not Allocated',
          joiningDate: student.joining_date || student.created_at,
          status: student.status || (allocation ? 'CHECKED_IN' : 'PENDING'),
          institution: student.institution,
          course: student.course,
          year: student.year_of_study,
        });
      }
    }

    // 2. Fallback: Check users table parent_mobile (for backwards compatibility)
    if (students.length === 0) {
      const { data: studentUsers } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'STUDENT');

      if (studentUsers) {
        for (const user of studentUsers) {
          const userParentMobile = normalizePhone(user.parent_mobile || '');
          if (userParentMobile === normalizedParentMobile) {
            const { data: allocation } = await supabase
              .from('room_allocations')
              .select('*, rooms(*)')
              .eq('student_user_id', user.id)
              .eq('status', 'ACTIVE')
              .single();

            const verticalMap: Record<string, string> = {
              'BOYS_HOSTEL': 'Boys Hostel',
              'GIRLS_ASHRAM': 'Girls Ashram',
              'DHARAMSHALA': 'Dharamshala',
            };

            students.push({
              id: user.id,
              name: user.full_name,
              photo: null,
              vertical: verticalMap[user.vertical] || user.vertical || 'N/A',
              room: allocation?.rooms?.room_number ? `Room ${allocation.rooms.room_number}` : 'Not Allocated',
              joiningDate: user.created_at,
              status: allocation ? 'CHECKED_IN' : 'PENDING',
            });
          }
        }
      }
    }

    // 2. Also check applications where parent mobile matches (for pending applications)
    const { data: applications, error: appError } = await supabase
      .from('applications')
      .select('*');

    if (!appError && applications) {
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

    // Mock logging
    console.log('\n========================================');
    console.log('PARENT DATA ACCESS');
    console.log('========================================');
    console.log('Endpoint: /api/parent/student');
    console.log('Parent Mobile:', parentMobile);
    console.log('Students Found:', students.length);
    console.log('Access Type: READ-ONLY');
    console.log('========================================\n');

    // Return first student (or array if multiple children)
    return NextResponse.json({
      success: true,
      data: students.length === 1 ? students[0] : students,
    });

  } catch (error) {
    console.error('Error in /api/parent/student:', error);
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
