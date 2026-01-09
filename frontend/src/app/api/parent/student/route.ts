import { NextRequest, NextResponse } from 'next/server';
import { find, findOne } from '@/lib/api/db';

/**
 * GET /api/parent/student
 *
 * Read-only endpoint for parent to view their ward's student information.
 * Looks up students by matching parent mobile number in applications/profiles.
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

    // Verify role is PARENT
    if (tokenData.vertical !== 'parent' && tokenData.role !== 'parent') {
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

    // First, look up parent user by mobile to get linked_student_id
    const parentUser = await findOne('users', (u: any) => 
      u.role === 'parent' && normalizePhone(u.mobile_no) === normalizedParentMobile
    );

    // Also check applications where parent mobile matches
    const applications = await find('applications', (app: any) => {
      const fatherMobile = normalizePhone(app.data?.guardian_info?.father_mobile || '');
      const motherMobile = normalizePhone(app.data?.guardian_info?.mother_mobile || '');
      return fatherMobile === normalizedParentMobile || motherMobile === normalizedParentMobile;
    });

    // Check profiles for existing students
    const profiles = await find('profiles', (profile: any) => {
      const fatherMobile = normalizePhone(profile.details?.father_mobile || '');
      const motherMobile = normalizePhone(profile.details?.mother_mobile || '');
      return fatherMobile === normalizedParentMobile || motherMobile === normalizedParentMobile;
    });

    // Combine and deduplicate students
    const students = [];

    // If parent user has linked_student_id, look up the student directly
    if (parentUser?.linked_student_id) {
      const student = await findOne('students', (s: any) => s.id === parentUser.linked_student_id);
      if (student) {
        const verticalMap: Record<string, string> = {
          'BOYS_HOSTEL': 'Boys Hostel',
          'GIRLS_ASHRAM': 'Girls Ashram',
          'DHARAMSHALA': 'Dharamshala',
        };

        let room = 'Not Allocated';
        let status = student.status || 'UNKNOWN';

        if (student.user_id) {
          const allocation = await findOne('allocations', (a: any) =>
            a.student_id === student.user_id && a.status === 'ACTIVE'
          );
          if (allocation) {
            const roomData = await findOne('rooms', (r: any) => r.id === allocation.room_id);
            room = roomData ? `Room ${roomData.room_number}` : 'Allocated';
            status = 'CHECKED_IN';
          }
        }

        students.push({
          id: student.id,
          name: student.name,
          photo: null,
          vertical: verticalMap[student.vertical] || student.vertical || 'N/A',
          room,
          joiningDate: student.joiningDate || 'N/A',
          status,
          academicYear: student.academicYear || '2024-25',
          currentPeriod: student.currentPeriod || 'SEMESTER_2',
        });
      }
    }

    // Add students from applications
    for (const app of applications) {
      const applicantName = app.data?.personal_info?.full_name || 'Unknown';
      
      // Skip if already added by name (avoid duplicates like Amit Shah in both app and students)
      if (students.some(s => s.name.toLowerCase() === applicantName.toLowerCase())) continue;

      const verticalMap: Record<string, string> = {
        'BOYS_HOSTEL': 'Boys Hostel',
        'GIRLS_ASHRAM': 'Girls Ashram',
        'DHARAMSHALA': 'Dharamshala',
      };

      let room = 'Not Allocated';
      let status = app.current_status;

      if (app.student_user_id) {
        const allocation = await findOne('allocations', (a: any) =>
          a.student_id === app.student_user_id && a.status === 'ACTIVE'
        );
        if (allocation) {
          const roomData = await findOne('rooms', (r: any) => r.id === allocation.room_id);
          room = roomData ? `Room ${roomData.room_number}` : 'Allocated';
          status = 'CHECKED_IN';
        }
      }

      // Only add application if it's not an approved/checked-in student
      // (Approved students should be in the students collection)
      if (['APPROVED', 'CHECKED_IN'].includes(status) && room !== 'Not Allocated') {
        continue; // Skip - this student should be in students collection
      }

      students.push({
        id: app.id,
        name: applicantName,
        photo: null,
        vertical: verticalMap[app.vertical] || app.vertical,
        room,
        joiningDate: app.submitted_at || app.created_at,
        status,
        academicYear: '2024-25',
        currentPeriod: 'SEMESTER_2',
        trackingNumber: app.tracking_number,
      });
    }

    // Add students from profiles (existing residents)
    for (const profile of profiles) {
      // Skip if already added by user_id
      if (students.some(s => s.id === profile.user_id)) continue;

      const allocation = await findOne('allocations', (a: any) =>
        a.student_id === profile.user_id && a.status === 'ACTIVE'
      );

      let room = 'Not Allocated';
      let vertical = 'N/A';

      if (allocation) {
        const roomData = await findOne('rooms', (r: any) => r.id === allocation.room_id);
        if (roomData) {
          room = `Room ${roomData.room_number}`;
          const verticalMap: Record<string, string> = {
            'BOYS_HOSTEL': 'Boys Hostel',
            'GIRLS_ASHRAM': 'Girls Ashram',
            'DHARAMSHALA': 'Dharamshala',
          };
          vertical = verticalMap[roomData.vertical] || roomData.vertical;
        }
      }

      students.push({
        id: profile.user_id,
        name: profile.full_name,
        photo: null,
        vertical,
        room,
        joiningDate: allocation?.allocated_at || 'N/A',
        status: allocation ? 'CHECKED_IN' : 'PENDING',
        academicYear: '2024-25',
        currentPeriod: 'SEMESTER_2',
      });
    }

    // If no students found, return appropriate message
    if (students.length === 0) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'No student records found for this mobile number.',
      });
    }

    // Mock logging
    console.log('\n========================================');
    console.log('👨‍👩‍👧 PARENT DATA ACCESS');
    console.log('========================================');
    console.log('Endpoint: /api/parent/student');
    console.log('Parent Mobile:', parentMobile);
    console.log('Students Found:', students.length);
    console.log('Access Type: READ-ONLY');
    console.log('========================================\n');

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));

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
