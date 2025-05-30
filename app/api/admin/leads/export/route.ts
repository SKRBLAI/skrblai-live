import { NextRequest, NextResponse } from 'next/server';
import { exportLeadsToCSV } from '@/lib/utils/leadExport';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const minScore = url.searchParams.get('minScore');
    
    const filters = {
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      minScore: minScore ? parseInt(minScore) : undefined
    };
    
    const csvContent = await exportLeadsToCSV(filters);
    
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="percy-leads-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
} 