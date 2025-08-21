// Client-safe CSV export trigger for leads (uses API route)

// Client-safe lead export - NO SERVICE KEY
export async function downloadLeadsCSV(filters?: any) {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`/api/admin/leads/export?${queryParams}`);
    
    if (!response.ok) {
      throw new Error('Export failed');
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `percy-leads-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Lead export failed:', error);
    throw error;
  }
}