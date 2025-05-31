import { NextRequest, NextResponse } from 'next/server';
import { processEmailQueue } from '@/lib/email/cronJobs';
import { getErrorMessage } from '@/utils/errorHandling';

export async function GET(req: NextRequest) {
  // Verify this is a legitimate cron job request
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || 'your-secret-key';
  
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await processEmailQueue();
    return NextResponse.json({ 
      success: true, 
      message: 'Email queue processed',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Cron job failed:', error);
    return NextResponse.json({ 
      error: 'Failed to process email queue',
      details: getErrorMessage(error)
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // Allow manual triggering for testing
  return GET(req);
} 