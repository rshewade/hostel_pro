import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // In a real app, update status to WITHDRAWN
    
    return NextResponse.json({
      success: true,
      message: 'Request withdrawn successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to withdraw request' },
      { status: 500 }
    );
  }
}
