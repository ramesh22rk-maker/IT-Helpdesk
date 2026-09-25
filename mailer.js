import nodemailer from 'nodemailer';
import { EMAIL_CONFIG } from './emailConfig.js';

/**
 * Creates and returns an SMTP transporter for Outlook.
 */
function createTransporter() {
  const { host, port, secure, auth } = EMAIL_CONFIG.smtp;

  if (!auth.user || !auth.pass) {
    return null; // SMTP not configured yet
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: auth.user,
      pass: auth.pass
    },
    tls: {
      ciphers: 'SSLv3',
      rejectUnauthorized: false
    }
  });
}

/**
 * Get deduplicated list of email recipients for a new ticket.
 * Recipients include:
 * 1. Ticket Requester's Email
 * 2. Department HOD Email(s)
 * 3. IT HOD Email
 * 
 * If requester is an HOD, duplicates are automatically eliminated.
 */
export function getTicketRecipients(ticket) {
  const recipients = new Set();

  // 1. User Email (Requester)
  if (ticket.email && typeof ticket.email === 'string' && ticket.email.trim()) {
    recipients.add(ticket.email.trim().toLowerCase());
  }

  // 2. Department HOD Email(s)
  const deptKey = (ticket.department || '').trim().toUpperCase();
  const deptHODs = EMAIL_CONFIG.departmentHODs[deptKey] || [];
  deptHODs.forEach(email => {
    if (email && email.trim()) {
      recipients.add(email.trim().toLowerCase());
    }
  });

  // 3. IT HOD Email
  if (EMAIL_CONFIG.itHodEmail && EMAIL_CONFIG.itHodEmail.trim()) {
    recipients.add(EMAIL_CONFIG.itHodEmail.trim().toLowerCase());
  }

  return Array.from(recipients);
}

/**
 * Sends a notification email when a ticket is created.
 */
export async function sendTicketNotificationEmail(ticket) {
  const recipientsList = getTicketRecipients(ticket);

  if (recipientsList.length === 0) {
    console.log(`[Mailer] No recipients found for ticket ${ticket.id}`);
    return { success: false, reason: 'No recipients' };
  }

  const transporter = createTransporter();

  const deptKey = (ticket.department || '').trim().toUpperCase();
  const deptHODs = (EMAIL_CONFIG.departmentHODs[deptKey] || []).join(', ');

  const subject = `[IT HELPDESK] New Ticket Created: #${ticket.id} - ${ticket.title}`;

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 650px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background: #1e293b; color: #ffffff; padding: 20px; text-align: center;">
        <h2 style="margin: 0; font-size: 20px; font-weight: 700;">SUJAN INDUSTRIES - IT HELPDESK</h2>
        <p style="margin: 5px 0 0 0; color: #94a3b8; font-size: 14px;">New Ticket Notification System</p>
      </div>

      <div style="padding: 24px; background: #ffffff;">
        <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 12px 16px; margin-bottom: 20px; border-radius: 4px;">
          <h3 style="margin: 0 0 8px 0; color: #0f172a; font-size: 16px;">Ticket Details #${ticket.id}</h3>
          <p style="margin: 0; color: #64748b; font-size: 13px;"><strong>Raised At:</strong> ${ticket.createdAt || new Date().toLocaleString()}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold; width: 30%;">Requester Name:</td>
            <td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">${ticket.requesterName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold;">Requester Email:</td>
            <td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">${ticket.email || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold;">Department:</td>
            <td style="padding: 8px; border-bottom: 1px solid #f1f5f9;"><span style="background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 4px; font-weight: bold;">${ticket.department}</span></td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold;">Department HOD:</td>
            <td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">${deptHODs || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold;">IT HOD:</td>
            <td style="padding: 8px; border-bottom: 1px solid #f1f5f9;"><strong>${EMAIL_CONFIG.itHodEmail}</strong></td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold;">Category:</td>
            <td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">${ticket.category}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold;">Priority:</td>
            <td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">
              <span style="color: ${ticket.priority === 'Urgent' ? '#ef4444' : ticket.priority === 'High' ? '#f97316' : '#10b981'}; font-weight: bold;">
                ${ticket.priority}
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold;">Issue Summary:</td>
            <td style="padding: 8px; border-bottom: 1px solid #f1f5f9; font-weight: 600;">${ticket.title}</td>
          </tr>
        </table>

        <div style="background: #f8fafc; padding: 16px; border-radius: 6px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
          <h4 style="margin: 0 0 8px 0; color: #334155; font-size: 14px;">Detailed Description:</h4>
          <p style="margin: 0; color: #475569; font-size: 14px; white-space: pre-line;">${ticket.description || 'No additional description provided.'}</p>
        </div>

        <div style="font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px;">
          <p style="margin: 0;">This email was sent to: <strong>${recipientsList.join(', ')}</strong></p>
          <p style="margin: 4px 0 0 0;">(Duplicate recipient emails were automatically consolidated into a single message.)</p>
        </div>
      </div>
    </div>
  `;

  if (!transporter) {
    console.log(`\n=============================================================`);
    console.log(` 📧 [EMAIL NOTIFICATION LOGGED - OUTLOOK CREDENTIALS PENDING]`);
    console.log(` -------------------------------------------------------------`);
    console.log(` 🎟️ Ticket ID   : #${ticket.id}`);
    console.log(` 👤 Requester   : ${ticket.requesterName} (${ticket.email})`);
    console.log(` 🏢 Department  : ${ticket.department}`);
    console.log(` 📬 Recipients  : ${recipientsList.join(', ')}`);
    console.log(` 🕒 Raised At   : ${ticket.createdAt}`);
    console.log(` 📝 Summary     : ${ticket.title}`);
    console.log(`=============================================================\n`);
    return { success: true, mode: 'log_only', recipients: recipientsList };
  }

  try {
    const info = await transporter.sendMail({
      from: `"Sujan Industries IT Helpdesk" <${EMAIL_CONFIG.smtp.auth.user}>`,
      to: recipientsList,
      subject,
      html: htmlBody
    });

    console.log(`[Mailer] Email sent successfully for Ticket #${ticket.id} to: ${recipientsList.join(', ')}`);
    return { success: true, info, recipients: recipientsList };
  } catch (error) {
    console.error(`[Mailer] Error sending email for Ticket #${ticket.id}:`, error);
    return { success: false, error: error.message };
  }
}
