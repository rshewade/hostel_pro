import { NextRequest, NextResponse } from 'next/server';

// Mock data
let mockExitRequest = {
  id: 'exit-123',
  reason: 'Course Completion',
  expectedExitDate: '2026-05-15',
  forwardingAddress: '123 Main St, Mumbai',
  bankDetails: {
    accountHolder: 'Rahul Sharma',
    accountNumber: '1234567890',
    ifscCode: 'HDFC0001234',
    bankName: 'HDFC Bank'
  }
};

let mockStatus = 'DRAFT';

export async function GET(request: NextRequest) {
  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // In a real app, we would fetch from DB based on user session
  return NextResponse.json({
    exitRequest: mockExitRequest,
    status: mockStatus,
    auditTrail: [
      {
        id: 'aud-1',
        action: 'CREATED',
        description: 'Exit request drafted',
        actor: 'Student',
        actorRole: 'Student',
        timestamp: new Date(Date.now() - 86400000).toISOString()
      }
    ],
    clearanceChecklist: null
  });
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Update mock data
    mockExitRequest = { ...mockExitRequest, ...data };
    mockStatus = 'SUBMITTED';

    return NextResponse.json({
      success: true,
      message: 'Exit request submitted successfully',
      data: mockExitRequest
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to submit request' },
      { status: 500 }
    );
  }
}
