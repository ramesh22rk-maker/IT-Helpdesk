import { sendTicketNotificationEmail, getTicketRecipients } from '../mailer.js';

async function testEmailNotification() {
  const sampleTicket = {
    id: "TK-1099",
    title: "Testing IT HOD Mail Notification",
    description: "Whenever a user raises a ticket, IT HOD receives a notification.",
    category: "Hardware",
    priority: "High",
    requesterName: "John Doe",
    department: "SALES",
    email: "john.sales@sujanindustries.com",
    createdAt: new Date().toISOString()
  };

  console.log('--- RECIPIENTS LIST ---');
  const recipients = getTicketRecipients(sampleTicket);
  console.log('Recipients:', recipients);

  console.log('\n--- SENDING NOTIFICATION ---');
  const result = await sendTicketNotificationEmail(sampleTicket);
  console.log('Result:', result);
}

testEmailNotification().catch(console.error);
