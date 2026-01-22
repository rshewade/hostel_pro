import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import {
  successResponse,
  createdResponse,
  badRequestResponse,
  serverErrorResponse,
  notFoundResponse,
} from '@/lib/api/responses';

/**
 * GET /api/config/blackout-dates
 * List all blackout dates
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const vertical = searchParams.get('vertical');

    let query = supabase
      .from('blackout_dates')
      .select('*')
      .order('start_date');

    // Filter by vertical if specified
    if (vertical) {
      query = query.contains('verticals', [vertical]);
    }

    const { data: blackoutDates, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return serverErrorResponse('Failed to fetch blackout dates', error);
    }

    // Transform to frontend format
    const transformed = blackoutDates?.map(bd => ({
      id: bd.id,
      name: bd.name,
      startDate: bd.start_date,
      endDate: bd.end_date,
      verticals: bd.verticals || [],
      reason: bd.reason || '',
    })) || [];

    return successResponse(transformed);
  } catch (error: any) {
    console.error('Error in GET /api/config/blackout-dates:', error);
    return serverErrorResponse('Failed to fetch blackout dates', error);
  }
}

/**
 * POST /api/config/blackout-dates
 * Create a new blackout date
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
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

    const { data: newBlackoutDate, error } = await supabase
      .from('blackout_dates')
      .insert({
        name: name.trim(),
        start_date: startDate,
        end_date: endDate,
        verticals: verticals || ['BOYS', 'GIRLS', 'DHARAMSHALA'],
        reason: reason || '',
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return serverErrorResponse('Failed to create blackout date', error);
    }

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
    console.error('Error in POST /api/config/blackout-dates:', error);
    return serverErrorResponse('Failed to create blackout date', error);
  }
}

/**
 * PUT /api/config/blackout-dates
 * Update a blackout date
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const body = await request.json();

    const { id, name, startDate, endDate, verticals, reason } = body;

    if (!id) {
      return badRequestResponse('ID is required');
    }

    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      return badRequestResponse('End date must be after start date');
    }

    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (startDate !== undefined) updateData.start_date = startDate;
    if (endDate !== undefined) updateData.end_date = endDate;
    if (verticals !== undefined) updateData.verticals = verticals;
    if (reason !== undefined) updateData.reason = reason;

    const { data: updatedBlackoutDate, error } = await supabase
      .from('blackout_dates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      if (error.code === 'PGRST116') {
        return notFoundResponse('Blackout date not found');
      }
      return serverErrorResponse('Failed to update blackout date', error);
    }

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
    console.error('Error in PUT /api/config/blackout-dates:', error);
    return serverErrorResponse('Failed to update blackout date', error);
  }
}

/**
 * DELETE /api/config/blackout-dates
 * Delete a blackout date
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return badRequestResponse('ID is required');
    }

    const { error } = await supabase
      .from('blackout_dates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase delete error:', error);
      return serverErrorResponse('Failed to delete blackout date', error);
    }

    return successResponse({ message: 'Blackout date deleted successfully' });
  } catch (error: any) {
    console.error('Error in DELETE /api/config/blackout-dates:', error);
    return serverErrorResponse('Failed to delete blackout date', error);
  }
}
