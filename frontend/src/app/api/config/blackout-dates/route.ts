import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import {
  successResponse,
  createdResponse,
  badRequestResponse,
  serverErrorResponse,
  notFoundResponse,
} from '@/lib/api/responses';
import { requireAuth } from '@/lib/authorize';

/**
 * GET /api/config/blackout-dates
 * List all blackout dates
 * Auth: any authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const vertical = searchParams.get('vertical');

    let sql = 'SELECT * FROM blackout_dates';
    const params: any[] = [];

    if (vertical) {
      sql += ' WHERE verticals @> $1';
      params.push(JSON.stringify([vertical]));
    }

    sql += ' ORDER BY start_date';

    const { rows: blackoutDates } = await query(sql, params);

    // Transform to frontend format
    const transformed = (blackoutDates || []).map((bd: any) => ({
      id: bd.id,
      name: bd.name,
      startDate: bd.start_date,
      endDate: bd.end_date,
      verticals: bd.verticals || [],
      reason: bd.reason || '',
    }));

    return successResponse(transformed);
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    console.error('Error in GET /api/config/blackout-dates:', error);
    return serverErrorResponse('Failed to fetch blackout dates', error);
  }
}

/**
 * POST /api/config/blackout-dates
 * Create a new blackout date
 * Auth: SUPERINTENDENT only
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request, ['SUPERINTENDENT']);
    const body = await request.json();

    const { name, startDate, endDate, verticals, reason } = body;

    if (!name || name.trim() === '') {
      return badRequestResponse('Name is required');
    }
    if (!startDate) {
      return badRequestResponse('Start date is required');
    }
    if (!endDate) {
      return badRequestResponse('End date is required');
    }
    if (new Date(endDate) < new Date(startDate)) {
      return badRequestResponse('End date must be after start date');
    }

    const { rows } = await query(
      `INSERT INTO blackout_dates (name, start_date, end_date, verticals, reason)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        name.trim(),
        startDate,
        endDate,
        JSON.stringify(verticals || ['BOYS', 'GIRLS', 'DHARAMSHALA']),
        reason || '',
      ]
    );

    if (rows.length === 0) {
      return serverErrorResponse('Failed to create blackout date');
    }

    const newBlackoutDate = rows[0];

    // Transform to frontend format
    const transformed = {
      id: newBlackoutDate.id,
      name: newBlackoutDate.name,
      startDate: newBlackoutDate.start_date,
      endDate: newBlackoutDate.end_date,
      verticals: newBlackoutDate.verticals || [],
      reason: newBlackoutDate.reason || '',
    };

    return createdResponse(transformed, 'Blackout date created successfully');
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    console.error('Error in POST /api/config/blackout-dates:', error);
    return serverErrorResponse('Failed to create blackout date', error);
  }
}

/**
 * PUT /api/config/blackout-dates
 * Update a blackout date
 * Auth: SUPERINTENDENT only
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(request, ['SUPERINTENDENT']);
    const body = await request.json();

    const { id, name, startDate, endDate, verticals, reason } = body;

    if (!id) {
      return badRequestResponse('ID is required');
    }

    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      return badRequestResponse('End date must be after start date');
    }

    const setClauses: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (name !== undefined) {
      setClauses.push(`name = $${paramIndex++}`);
      params.push(name.trim());
    }
    if (startDate !== undefined) {
      setClauses.push(`start_date = $${paramIndex++}`);
      params.push(startDate);
    }
    if (endDate !== undefined) {
      setClauses.push(`end_date = $${paramIndex++}`);
      params.push(endDate);
    }
    if (verticals !== undefined) {
      setClauses.push(`verticals = $${paramIndex++}`);
      params.push(JSON.stringify(verticals));
    }
    if (reason !== undefined) {
      setClauses.push(`reason = $${paramIndex++}`);
      params.push(reason);
    }

    if (setClauses.length === 0) {
      return badRequestResponse('No fields to update');
    }

    params.push(id);
    const sql = `UPDATE blackout_dates SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

    const { rows } = await query(sql, params);

    if (rows.length === 0) {
      return notFoundResponse('Blackout date not found');
    }

    const updatedBlackoutDate = rows[0];

    // Transform to frontend format
    const transformed = {
      id: updatedBlackoutDate.id,
      name: updatedBlackoutDate.name,
      startDate: updatedBlackoutDate.start_date,
      endDate: updatedBlackoutDate.end_date,
      verticals: updatedBlackoutDate.verticals || [],
      reason: updatedBlackoutDate.reason || '',
    };

    return successResponse(transformed);
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    console.error('Error in PUT /api/config/blackout-dates:', error);
    return serverErrorResponse('Failed to update blackout date', error);
  }
}

/**
 * DELETE /api/config/blackout-dates
 * Delete a blackout date
 * Auth: SUPERINTENDENT only
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth(request, ['SUPERINTENDENT']);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return badRequestResponse('ID is required');
    }

    await query('DELETE FROM blackout_dates WHERE id = $1', [id]);

    return successResponse({ message: 'Blackout date deleted successfully' });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    console.error('Error in DELETE /api/config/blackout-dates:', error);
    return serverErrorResponse('Failed to delete blackout date', error);
  }
}
