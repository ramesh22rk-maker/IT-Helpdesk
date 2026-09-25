import { processIncomingWhatsAppMessage } from '../whatsappService.js';
import { getAllTickets } from '../db.js';

async function testDeptValidation() {
  console.log('=== TEST 1: MISSING DEPARTMENT (User only types issue) ===');
  let senderId = 'user_test_1';
  let senderName = 'Ramesh User';

  // 1. Start session
  await processIncomingWhatsAppMessage({ senderId, senderName, messageText: 'IT HELP DESK' });
  // 2. Select option 1
  let reply = await processIncomingWhatsAppMessage({ senderId, senderName, messageText: '1' });
  console.log('[BOT PROMPT]:\n' + reply);

  // 3. User types issue without department
  reply = await processIncomingWhatsAppMessage({ senderId, senderName, messageText: 'Laptop screen flickering' });
  console.log('\n[USER]: Laptop screen flickering');
  console.log('[BOT REPLIED (VALIDATION ERROR)]:\n' + reply);

  console.log('\n=== TEST 2: VALID DEPARTMENT & NAME PROVIDED ===');
  // 4. User re-types with department (HRD) and name (Selvin)
  reply = await processIncomingWhatsAppMessage({ senderId, senderName, messageText: 'Selvin - HRD - Laptop screen flickering continuously' });
  console.log('[USER]: Selvin - HRD - Laptop screen flickering continuously');
  console.log('[BOT REPLIED (TICKET CREATED)]:\n' + reply);

  console.log('\n=== VERIFYING CREATED TICKET IN DB ===');
  const tickets = getAllTickets();
  const latest = tickets[0];
  console.log('Latest Ticket in DB:', {
    id: latest.id,
    title: latest.title,
    description: latest.description,
    requesterName: latest.requesterName,
    department: latest.department,
    status: latest.status
  });
}

testDeptValidation().catch(console.error);
