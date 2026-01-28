import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import {
  successResponse,
  createdResponse,
  badRequestResponse,
  serverErrorResponse,
} from '@/lib/api/responses';

/**
 * GET /api/applications
 * Get all applications or filter by tracking_number, vertical, or status
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const trackingNumber = searchParams.get('tracking_number');
    const vertical = searchParams.get('vertical');
    const status = searchParams.get('status');

    let query = supabase.from('applications').select('*');

    // Filter by tracking number if provided
    if (trackingNumber) {
      query = query.eq('tracking_number', trackingNumber);
    }

    // Filter by vertical if provided
    if (vertical) {
      query = query.eq('vertical', vertical);
    }

    // Filter by status if provided
    if (status) {
      query = query.eq('current_status', status);
    }

    const { data: applications, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching applications:', error);
      return serverErrorResponse('Failed to fetch applications', error);
    }

    return successResponse(applications || []);
  } catch (error: any) {
    console.error('Error in GET /api/applications:', error);
    return serverErrorResponse('Failed to fetch applications', error);
  }
}

/**
 * POST /api/applications
 * Create a new application
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const body = await request.json();

    // Map frontend vertical to database enum
    const verticalMap: Record<string, string> = {
      'boys-hostel': 'BOYS_HOSTEL',
      'girls-ashram': 'GIRLS_ASHRAM',
      'dharamshala': 'DHARAMSHALA',
      'BOYS_HOSTEL': 'BOYS_HOSTEL',
      'GIRLS_ASHRAM': 'GIRLS_ASHRAM',
      'DHARAMSHALA': 'DHARAMSHALA',
    };
    const vertical = verticalMap[body.vertical] || 'BOYS_HOSTEL';

    // Generate tracking number based on vertical
    const prefix = vertical === 'BOYS_HOSTEL' ? 'BH' : vertical === 'GIRLS_ASHRAM' ? 'GA' : 'DH';
    const year = new Date().getFullYear();

    // Get count of applications this year for this vertical to generate sequence
    const { count } = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .like('tracking_number', `${prefix}-${year}%`);

    const sequence = String((count || 0) + 1).padStart(5, '0');
    const trackingNumber = `${prefix}-${year}-${sequence}`;

    // Construct applicant name from firstName, middleName, lastName
    const applicantName = body.applicant_name || body.applicantName ||
      [body.firstName, body.middleName, body.lastName].filter(Boolean).join(' ').trim();

    // Get applicant mobile - use fatherMobile as primary contact if not provided
    const applicantMobile = body.applicant_mobile || body.applicantMobile ||
      body.fatherMobile || body.father_mobile || '';

    // Get applicant email
    const applicantEmail = body.applicant_email || body.applicantEmail ||
      body.fatherEmail || body.father_email || null;

    // Map date of birth
    const dateOfBirth = body.date_of_birth || body.dateOfBirth || body.dob || null;

    // Map gender - capitalize first letter for consistency
    let gender = body.gender || '';
    if (gender) {
      gender = gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
    }

    // Validate required fields
    if (!applicantName) {
      return badRequestResponse('Applicant name is required');
    }
    if (!applicantMobile) {
      return badRequestResponse('Mobile number is required');
    }
    if (!dateOfBirth) {
      return badRequestResponse('Date of birth is required');
    }
    if (!gender) {
      return badRequestResponse('Gender is required');
    }

    // Create new application - store all form data in the data JSONB column
    const newApplication = {
      tracking_number: trackingNumber,
      type: body.type || 'NEW',
      applicant_name: applicantName,
      applicant_mobile: applicantMobile,
      applicant_email: applicantEmail,
      date_of_birth: dateOfBirth,
      gender: gender,
      vertical: vertical,
      current_status: body.status || 'DRAFT',
      data: {
        // Personal info
        personal_info: {
          full_name: applicantName,
          first_name: body.firstName,
          middle_name: body.middleName,
          last_name: body.lastName,
          date_of_birth: dateOfBirth,
          gender: gender,
          blood_group: body.bloodGroup,
        },
        // Address
        address: {
          line1: body.addressLine1,
          line2: body.addressLine2,
          city: body.city,
          state: body.state,
          pin_code: body.pinCode,
        },
        // Guardian info
        guardian_info: {
          father_name: body.fatherName,
          father_mobile: body.fatherMobile,
          father_occupation: body.fatherOccupation,
          father_email: body.fatherEmail,
          mother_name: body.motherName,
          mother_mobile: body.motherMobile,
          mother_occupation: body.motherOccupation,
          mother_email: body.motherEmail,
          guardian_name: body.guardianName,
          guardian_relationship: body.guardianRelationship,
          guardian_mobile: body.guardianMobile,
        },
        // Emergency contact
        emergency_contact: {
          name: body.emergencyContactPerson,
          mobile: body.emergencyMobile,
          relationship: body.emergencyRelationship,
        },
        // Academic info
        academic_info: {
          institution: body.institution,
          course: body.course,
          year: body.year,
          percentage: body.percentage,
          qualification: body.qualification,
          board: body.board,
          passing_year: body.passingYear,
        },
        // Hostel preferences
        hostel_preferences: {
          vertical: vertical,
          room_type: body.roomType,
          duration: body.duration,
          joining_date: body.joiningDate,
          special_requirements: body.specialRequirements,
        },
        // References
        references: [
          {
            name: body.ref1Name,
            mobile: body.ref1Mobile,
            year_of_stay: body.ref1Year,
            relationship: body.ref1Relationship,
          },
          body.ref2Name ? {
            name: body.ref2Name,
            mobile: body.ref2Mobile,
            year_of_stay: body.ref2Year,
            relationship: body.ref2Relationship,
          } : null,
        ].filter(Boolean),
        // Declaration
        declaration_accepted: body.declarationAccepted,
        declaration_timestamp: body.declarationAccepted ? new Date().toISOString() : null,
        // Documents (uploaded to Supabase Storage)
        documents: body.documents || [],
      },
      submitted_at: body.status === 'SUBMITTED' ? new Date().toISOString() : null,
    };

    console.log('Creating application with data:', JSON.stringify(newApplication, null, 2));

    const { data: application, error } = await supabase
      .from('applications')
      .insert(newApplication)
      .select()
      .single();

    if (error) {
      console.error('Error creating application:', error);
      return serverErrorResponse('Failed to create application', error);
    }

    // Return with trackingNumber in root for frontend compatibility
    return createdResponse({
      ...application,
      trackingNumber: application.tracking_number,
    });
  } catch (error: any) {
    console.error('Error in POST /api/applications:', error);
    return serverErrorResponse('Failed to create application', error);
  }
}
