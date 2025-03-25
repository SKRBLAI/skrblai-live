import { Resend } from 'resend';

const resend = new Resend('re_VyY82v68_NJdrDDpcP9Go6wAkKQKWseCN');

export const sendWelcomeEmail = async (email: string, name: string) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'SKRBL AI <contact@skrblai.io>',
      to: email,
      subject: 'Welcome to SKRBL AI!',
      text: `Hi ${name},\n\nThank you for reaching out to SKRBL AI! Percy AI has captured your request and one of our team members will reach out shortly.\n\nIn the meantime, you can check out our Pricing Page (https://skrblai.io/pricing) or Join Our Beta Program (https://skrblai.io#join-beta).\n\nLet's build something incredible together!\n\n- The SKRBL AI Team`
    });

    return { success: !error, data, error };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error };
  }
};

export const sendPaymentConfirmationEmail = async (email: string, name: string, plan: string, amount: string) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'SKRBL AI <billing@skrbl.ai>',
      to: email,
      subject: 'Payment Confirmation - SKRBL AI',
      html: `
        <div style="font-family: sans-serif; color: #333;">
          <h1 style="color: #1E90FF;">Payment Confirmation</h1>
          <p>Hello ${name},</p>
          <p>Thank you for your payment. Your subscription has been successfully processed.</p>
          <div style="margin: 20px 0; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
            <h2 style="margin-top: 0;">Receipt Details</h2>
            <p><strong>Plan:</strong> ${plan}</p>
            <p><strong>Amount:</strong> ${amount}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          <p>You can view your subscription details in your account settings.</p>
          <div style="margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/account" 
               style="background-color: #1E90FF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Go to Account
            </a>
          </div>
          <p>Thank you for choosing SKRBL AI!</p>
          <p>Best regards,<br>The SKRBL AI Team</p>
        </div>
      `,
    });

    return { success: !error, data, error };
  } catch (error) {
    console.error('Error sending payment confirmation email:', error);
    return { success: false, error };
  }
}; 