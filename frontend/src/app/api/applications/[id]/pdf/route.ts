import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dbPath = process.env.DB_FILE_PATH || path.join(process.cwd(), '../db.json');

async function readDb() {
  const data = await fs.readFile(dbPath, 'utf-8');
  return JSON.parse(data);
}

/**
 * GET /api/applications/[id]/pdf
 * Generate and download application PDF
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await readDb();

    // Find application by ID or tracking number
    const application = db.applications?.find(
      (app: any) => app.id === id || app.tracking_number === id || app.trackingNumber === id
    );

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Extract data with fallbacks for different field naming conventions
    const trackingNumber = application.tracking_number || application.trackingNumber || id;
    const vertical = application.vertical || 'N/A';
    const status = application.current_status || application.status || application.currentStatus || 'N/A';
    const submittedAt = application.submitted_at || application.submittedAt || application.createdAt || new Date().toISOString();

    // Personal info
    const personalInfo = application.data?.personal_info || {};
    const fullName = personalInfo.full_name ||
      `${application.firstName || ''} ${application.middleName || ''} ${application.lastName || ''}`.trim() ||
      application.applicantName || 'N/A';
    const age = personalInfo.age || application.age || 'N/A';
    const nativePlace = personalInfo.native_place || application.nativePlace ||
      `${application.city || ''}, ${application.state || ''}`.trim() || 'N/A';
    const mobile = personalInfo.mobile || application.applicant_mobile || application.applicantMobile || 'N/A';
    const email = personalInfo.email || application.applicantEmail || application.email || 'N/A';

    // Guardian info
    const guardianInfo = application.data?.guardian_info || {};
    const fatherName = guardianInfo.father_name || application.fatherName || 'N/A';
    const fatherMobile = guardianInfo.father_mobile || application.fatherMobile || 'N/A';
    const motherName = guardianInfo.mother_name || application.motherName || 'N/A';
    const motherMobile = guardianInfo.mother_mobile || application.motherMobile || 'N/A';
    const address = guardianInfo.address ||
      `${application.addressLine1 || ''} ${application.addressLine2 || ''}, ${application.city || ''}, ${application.state || ''} - ${application.pinCode || ''}`.trim() || 'N/A';

    // Education info
    const education = application.data?.education || {};
    const institution = education.institution || application.institution || 'N/A';
    const course = education.course || application.course || 'N/A';
    const year = education.year || application.year || 'N/A';

    // Generate HTML for PDF
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Application - ${trackingNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Times New Roman', serif;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
      line-height: 1.6;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #333;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 { font-size: 24px; margin-bottom: 5px; }
    .header h2 { font-size: 18px; font-weight: normal; color: #666; }
    .header p { font-size: 12px; color: #888; margin-top: 10px; }
    .tracking {
      background: #f5f5f5;
      padding: 15px;
      text-align: center;
      margin-bottom: 30px;
      border-radius: 5px;
    }
    .tracking strong { font-size: 20px; }
    .section { margin-bottom: 25px; }
    .section-title {
      font-size: 16px;
      font-weight: bold;
      background: #333;
      color: white;
      padding: 8px 15px;
      margin-bottom: 15px;
    }
    .row {
      display: flex;
      border-bottom: 1px solid #ddd;
      padding: 8px 0;
    }
    .label {
      width: 200px;
      font-weight: bold;
      color: #555;
    }
    .value { flex: 1; }
    .status {
      display: inline-block;
      padding: 5px 15px;
      border-radius: 20px;
      font-weight: bold;
      text-transform: uppercase;
      font-size: 12px;
    }
    .status-SUBMITTED { background: #dbeafe; color: #1e40af; }
    .status-REVIEW { background: #fef3c7; color: #92400e; }
    .status-APPROVED { background: #d1fae5; color: #065f46; }
    .status-REJECTED { background: #fee2e2; color: #991b1b; }
    .status-DRAFT { background: #f3f4f6; color: #374151; }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      font-size: 11px;
      color: #888;
      text-align: center;
    }
    @media print {
      body { padding: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Hirachand Gumanji Family Charitable Trust</h1>
    <h2>Hostel Application Form</h2>
    <p>Generated on ${new Date().toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })}</p>
  </div>

  <div class="tracking">
    <p>Application Tracking Number</p>
    <strong>${trackingNumber}</strong>
    <br><br>
    <span class="status status-${status}">${status}</span>
  </div>

  <div class="section">
    <div class="section-title">Application Details</div>
    <div class="row">
      <div class="label">Vertical</div>
      <div class="value">${vertical.replace(/_/g, ' ')}</div>
    </div>
    <div class="row">
      <div class="label">Submitted On</div>
      <div class="value">${new Date(submittedAt).toLocaleString('en-IN')}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Personal Information</div>
    <div class="row">
      <div class="label">Full Name</div>
      <div class="value">${fullName}</div>
    </div>
    <div class="row">
      <div class="label">Age</div>
      <div class="value">${age}</div>
    </div>
    <div class="row">
      <div class="label">Native Place</div>
      <div class="value">${nativePlace}</div>
    </div>
    <div class="row">
      <div class="label">Mobile Number</div>
      <div class="value">${mobile}</div>
    </div>
    <div class="row">
      <div class="label">Email</div>
      <div class="value">${email}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Guardian Information</div>
    <div class="row">
      <div class="label">Father's Name</div>
      <div class="value">${fatherName}</div>
    </div>
    <div class="row">
      <div class="label">Father's Mobile</div>
      <div class="value">${fatherMobile}</div>
    </div>
    <div class="row">
      <div class="label">Mother's Name</div>
      <div class="value">${motherName}</div>
    </div>
    <div class="row">
      <div class="label">Mother's Mobile</div>
      <div class="value">${motherMobile}</div>
    </div>
    <div class="row">
      <div class="label">Address</div>
      <div class="value">${address}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Education Details</div>
    <div class="row">
      <div class="label">Institution</div>
      <div class="value">${institution}</div>
    </div>
    <div class="row">
      <div class="label">Course</div>
      <div class="value">${course}</div>
    </div>
    <div class="row">
      <div class="label">Year</div>
      <div class="value">${year}</div>
    </div>
  </div>

  <div class="footer">
    <p>This is a computer-generated document. For official use, please contact the hostel administration.</p>
    <p>Hirachand Gumanji Family Charitable Trust | Contact: +91 22 2414 1234</p>
  </div>

  <script class="no-print">
    window.onload = function() { window.print(); }
  </script>
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `inline; filename="application-${trackingNumber}.html"`,
      },
    });
  } catch (error: any) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
