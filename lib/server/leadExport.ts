import { getOptionalServerSupabase } from '@/lib/supabase';

export async function exportLeadsToCSV(filters?: {
  startDate?: string;
  endDate?: string;
  minScore?: number;
}) {
  const supabase = getOptionalServerSupabase();
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  let query = supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.startDate) {
    query = query.gte('created_at', filters.startDate);
  }
  if (filters?.endDate) {
    query = query.lte('created_at', filters.endDate);
  }
  if (filters?.minScore) {
    query = query.gte('qualification_score', filters.minScore);
  }

  const { data: leads, error } = await query;
  if (error) throw error;

  const csvHeaders = [
    'Email',
    'Phone',
    'Company Size',
    'Problem',
    'Industry',
    'Timeline',
    'Qualification Score',
    'Created At',
    'Lead Source',
  ];

  const csvRows = (leads || []).map((lead: any) => [
    lead.email || '',
    lead.phone || '',
    lead.companySize || '',
    lead.problem || '',
    lead.industry || '',
    lead.timeline || '',
    lead.qualification_score || 0,
    new Date(lead.created_at).toLocaleDateString(),
    'Percy Conversation',
  ]);

  const csvContent = [
    csvHeaders.join(','),
    ...csvRows.map((row) => row.map((field) => `"${field}"`).join(',')),
  ].join('\n');

  return csvContent;
}
