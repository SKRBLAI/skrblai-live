import { NextRequest, NextResponse } from 'next/server';
import { getBoostClientAdmin } from '@/lib/supabase';

// Webhook verification using svix
async function verifyWebhook(request: NextRequest): Promise<boolean> {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    console.error('[CLERK-WEBHOOK] CLERK_WEBHOOK_SECRET not configured');
    return false;
  }

  try {
    // Import svix dynamically to avoid build-time issues
    const { Webhook } = await import('svix');
    const webhook = new Webhook(webhookSecret);
    
    const payload = await request.text();
    const headers = Object.fromEntries(request.headers.entries());
    
    // Verify the webhook signature
    webhook.verify(payload, headers);
    return true;
  } catch (error) {
    console.error('[CLERK-WEBHOOK] Webhook verification failed:', error);
    return false;
  }
}

// Sync user data to Boost Supabase
async function syncUserToBoost(userData: any, eventType: string): Promise<boolean> {
  try {
    const supabase = getBoostClientAdmin();
    
    if (!supabase) {
      console.error('[CLERK-WEBHOOK] Boost Supabase not configured');
      return false;
    }

    const { id, email_addresses, first_name, last_name, created_at, updated_at } = userData;
    const primaryEmail = email_addresses?.find((email: any) => email.id === userData.primary_email_address_id)?.email_address;

    if (!primaryEmail) {
      console.error('[CLERK-WEBHOOK] No primary email found for user:', id);
      return false;
    }

    if (eventType === 'user.created' || eventType === 'user.updated') {
      // Upsert user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          clerk_id: id,
          email: primaryEmail,
          full_name: `${first_name || ''} ${last_name || ''}`.trim() || null,
          first_name: first_name || null,
          last_name: last_name || null,
          created_at: created_at ? new Date(created_at).toISOString() : null,
          updated_at: updated_at ? new Date(updated_at).toISOString() : null,
          provider: 'clerk'
        }, {
          onConflict: 'clerk_id'
        });

      if (profileError) {
        console.error('[CLERK-WEBHOOK] Profile upsert error:', profileError);
        return false;
      }

      // Upsert user role (default to 'user')
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: id, // Using Clerk ID as user_id for Boost
          role: 'user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (roleError) {
        console.error('[CLERK-WEBHOOK] Role upsert error:', roleError);
        return false;
      }

      console.log(`[CLERK-WEBHOOK] Successfully synced user ${id} to Boost`);
      return true;
    }

    if (eventType === 'user.deleted') {
      // Delete user data
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('clerk_id', id);

      if (profileError) {
        console.error('[CLERK-WEBHOOK] Profile deletion error:', profileError);
        return false;
      }

      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', id);

      if (roleError) {
        console.error('[CLERK-WEBHOOK] Role deletion error:', roleError);
        return false;
      }

      console.log(`[CLERK-WEBHOOK] Successfully deleted user ${id} from Boost`);
      return true;
    }

    return true;
  } catch (error) {
    console.error('[CLERK-WEBHOOK] Sync error:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature
    const isValid = await verifyWebhook(request);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
    }

    // Parse webhook payload
    const payload = await request.json();
    const { type, data } = payload;

    console.log(`[CLERK-WEBHOOK] Received webhook: ${type}`);

    // Handle supported events
    const supportedEvents = ['user.created', 'user.updated', 'user.deleted'];
    if (!supportedEvents.includes(type)) {
      console.log(`[CLERK-WEBHOOK] Unsupported event type: ${type}`);
      return NextResponse.json({ message: 'Event type not supported' }, { status: 200 });
    }

    // Sync user data to Boost Supabase
    const syncSuccess = await syncUserToBoost(data, type);
    
    if (!syncSuccess) {
      console.error(`[CLERK-WEBHOOK] Failed to sync user data for event: ${type}`);
      return NextResponse.json({ error: 'Failed to sync user data' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Webhook processed successfully' }, { status: 200 });

  } catch (error) {
    console.error('[CLERK-WEBHOOK] Webhook processing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Handle HEAD requests for webhook health checks
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}