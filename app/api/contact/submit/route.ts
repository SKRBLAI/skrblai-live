import { NextRequest, NextResponse } from 'next/server';
import { getOptionalServerSupabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  
  const supabase = getOptionalServerSupabase();
  if (!supabase) {
    return NextResponse.json(
      { success: false, error: 'Database service unavailable' },
      { status: 503 }
    );
  }
try {
    const body = await request.json();
    const { name, email, message, company, subject, contactType } = body;

    // Validate required fields
    if (!name || !email || !message || !subject) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Insert into database
    const { data, error } = await supabase
      .from('contact_submissions')
      .insert([
        {
          name,
          email,
          message,
          company: company || null,
          subject,
          contact_type: contactType || 'general',
          status: 'pending',
          submitted_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to save contact submission' },
        { status: 500 }
      );
    }

    // Send notification email (optional)
    try {
      await sendNotificationEmail({
        name,
        email,
        message,
        company,
        subject,
        contactType,
        submissionId: data.id
      });
    } catch (emailError) {
      console.error('Email notification error:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Contact submission received successfully',
      submissionId: data.id
    });

  } catch (error) {
    console.error('Contact submission error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function sendNotificationEmail(submission: any) {
  // This would integrate with your email service (SendGrid, Postmark, etc.)
  // For now, we'll just log it
  console.log('📧 New contact submission:', {
    id: submission.submissionId,
    type: submission.contactType,
    from: submission.email,
    subject: submission.subject
  });
  
  // TODO: Implement actual email sending
  // Example with SendGrid:
  /*
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  
  const msg = {
    to: 'contact@skrblai.io',
    from: 'noreply@skrblai.io',
    subject: `New Contact: ${submission.subject}`,
    html: `
      <h2>New Contact Submission</h2>
      <p><strong>Name:</strong> ${submission.name}</p>
      <p><strong>Email:</strong> ${submission.email}</p>
      <p><strong>Company:</strong> ${submission.company || 'Not provided'}</p>
      <p><strong>Type:</strong> ${submission.contactType}</p>
      <p><strong>Subject:</strong> ${submission.subject}</p>
      <p><strong>Message:</strong></p>
      <p>${submission.message}</p>
    `
  };
  
  await sgMail.send(msg);
  */
} 