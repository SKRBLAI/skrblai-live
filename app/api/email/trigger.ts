import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { emailAutomation } from '@/lib/email/simpleAutomation';
import { EMAIL_SEQUENCES } from '@/lib/email/sequences';
import { systemLog } from '@/utils/systemLog';
import { getErrorMessage } from '@/utils/errorHandling';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { 
      triggerType, 
      userId, 
      userEmail, 
      userRole, 
      metadata = {} 
    } = await req.json();

    if (!triggerType || !userId || !userEmail) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Find applicable email sequences
    const applicableSequences = EMAIL_SEQUENCES.filter(seq => 
      seq.trigger === triggerType && 
      (seq.userRole === 'all' || seq.userRole === userRole) &&
      seq.active
    );

    if (applicableSequences.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No applicable sequences found' 
      });
    }

    const results = [];

    for (const sequence of applicableSequences) {
      // Check if user is already in this sequence
      const { data: existingSequence } = await supabase
        .from('email_sequences')
        .select('*')
        .eq('user_id', userId)
        .eq('sequence_id', sequence.id)
        .eq('active', true)
        .single();

      if (existingSequence) {
        continue; // Skip if already in sequence
      }

      // Create sequence record
      const { error: sequenceError } = await supabase
        .from('email_sequences')
        .insert([{
          user_id: userId,
          sequence_id: sequence.id,
          trigger_type: triggerType,
          user_role: userRole,
          metadata,
          active: true,
          created_at: new Date().toISOString()
        }]);

      if (sequenceError) {
        console.error('Failed to create sequence record:', sequenceError);
        continue;
      }

      // Trigger n8n workflow
      const triggerResult = await emailAutomation.triggerEmailSequence(sequence.id, {
        userId,
        userEmail,
        userRole,
        triggerType,
        sequenceId: sequence.id,
        templateData: {
          userName: metadata.userName || 'there',
          agentName: metadata.agentName,
          workflowName: metadata.workflowName,
          upgradeTarget: metadata.upgradeTarget
        },
        metadata: {
          ...metadata,
          analyticsSource: 'email_automation'
        }
      });

      results.push({
        sequenceId: sequence.id,
        sequenceName: sequence.name,
        triggered: triggerResult.success,
        workflowId: triggerResult.workflowId,
        error: triggerResult.error
      });

      await systemLog({ 
        type: 'info', 
        message: 'Email sequence triggered', 
        meta: { 
          userId, 
          sequenceId: sequence.id, 
          triggerType, 
          success: triggerResult.success 
        } 
      });
    }

    return NextResponse.json({ 
      success: true, 
      triggeredSequences: results.filter(r => r.triggered),
      failedSequences: results.filter(r => !r.triggered)
    });

  } catch (error) {
    await systemLog({ 
      type: 'error', 
      message: 'Email trigger API error', 
      meta: { error: getErrorMessage(error) } 
    });
    
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// GET endpoint to check user's email sequences
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const userId = url.searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  try {
    const { data: sequences, error } = await supabase
      .from('email_sequences')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ sequences });

  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to fetch sequences' 
    }, { status: 500 });
  }
} 