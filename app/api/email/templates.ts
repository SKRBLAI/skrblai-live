import { NextRequest, NextResponse } from 'next/server';
import { getOptionalServerSupabase } from '@/lib/supabase/server';
import { getErrorMessage } from '../../../utils/errorHandling';

export async function GET(req: NextRequest) {
  
  const supabase = getOptionalServerSupabase();
  if (!supabase) {
    return NextResponse.json(
      { success: false, error: 'Database service unavailable' },
      { status: 503 }
    );
  }
const url = new URL(req.url);
  const category = url.searchParams.get('category');
  const templateId = url.searchParams.get('id');

  try {
    let query = supabase
      .from('email_templates')
      .select('*')
      .eq('active', true);

    let data, error;
    if (templateId) {
      ({ data, error } = await query.eq('id', templateId).single());
    } else if (category) {
      ({ data, error } = await query.eq('category', category));
    } else {
      ({ data, error } = await query);
    }

    if (error) {
      throw error;
    }

    return NextResponse.json({ templates: data });

  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to fetch templates' 
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  
  const supabase = getOptionalServerSupabase();
  if (!supabase) {
    return NextResponse.json(
      { success: false, error: 'Database service unavailable' },
      { status: 503 }
    );
  }
try {
    const template = await req.json();
    
    const { data, error } = await supabase
      .from('email_templates')
      .insert([{
        ...template,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ template: data });

  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to create template' 
    }, { status: 500 });
  }
} 