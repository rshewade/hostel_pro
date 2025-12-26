import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dbPath = path.join(process.cwd(), 'db.json');

// Read db.json
async function readDb() {
  const data = await fs.readFile(dbPath, 'utf-8');
  return JSON.parse(data);
}

// Write db.json
async function writeDb(data: any) {
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf-8');
  return data;
}

// GET /api/applications - Get all applications
export async function GET() {
  const db = await readDb();
  return NextResponse.json(db.applications || []);
}

// POST /api/applications - Create new application
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = await readDb();
    
    // Initialize applications array if not exists
    if (!db.applications) {
      db.applications = [];
    }

    // Generate tracking number: HG + year + 5-digit sequential number
    const year = new Date().getFullYear();
    const lastApp = db.applications[db.applications.length - 1];
    let lastSeq = 0;
    
    if (lastApp && lastApp.trackingNumber) {
      const match = lastApp.trackingNumber.match(/HG-(\d+)-(\d+)/);
      if (match) {
        lastSeq = parseInt(match[2]);
      }
    }
    
    const newSeq = lastSeq + 1;
    const trackingNumber = `HG-${year}-${String(newSeq).padStart(5, '0')}`;
    
    // Create new application
    const newApplication = {
      id: Date.now().toString(),
      trackingNumber,
      ...body,
      status: body.status || 'DRAFT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add to applications array
    db.applications.push(newApplication);
    await writeDb(db);

    return NextResponse.json(newApplication, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create application' },
      { status: 500 }
    );
  }
}
