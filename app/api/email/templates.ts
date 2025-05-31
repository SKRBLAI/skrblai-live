import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getErrorMessage } from '@/utils/errorHandling';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
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