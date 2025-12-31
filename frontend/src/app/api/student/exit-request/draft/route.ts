import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // In a real app, update draft in DB
    
    return NextResponse.json({
      success: true,
      message: 'Draft saved successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save draft' },
      { status: 500 }
    );
  }
}
