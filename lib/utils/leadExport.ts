// Simple CSV export functionality for leads
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function exportLeadsToCSV(filters?: {
  startDate?: string;
  endDate?: string;
  minScore?: number;
}) {
  try {
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
    
    // Convert to CSV
    const csvHeaders = [
      'Email',
      'Phone', 
      'Company Size',
      'Problem',
      'Industry',
      'Timeline',
      'Qualification Score',
      'Created At',
      'Lead Source'
    ];
    
    const csvRows = leads.map(lead => [
      lead.email || '',
      lead.phone || '',
      lead.companySize || '',
      lead.problem || '',
      lead.industry || '',
      lead.timeline || '',
      lead.qualification_score || 0,
      new Date(lead.created_at).toLocaleDateString(),
      'Percy Conversation'
    ]);
    
    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');
    
    return csvContent;
  } catch (error) {
    console.error('Lead export failed:', error);
    throw error;
  }
}

// Quick API endpoint for lead export
export async function downloadLeadsCSV(filters?: any) {
  const csvContent = await exportLeadsToCSV(filters);
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `percy-leads-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  window.URL.revokeObjectURL(url);
} 