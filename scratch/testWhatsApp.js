import { processIncomingWhatsAppMessage } from '../whatsappService.js';
import { getAllTickets } from '../db.js';

async function testFlow() {
  console.log('--- START TEST WHATSAPP CHAT FLOW ---');
  const senderId = 'test_user_99';
  const senderName = 'John Doe (Marketing)';

  // 1. User sends "start"
  let reply = await processIncomingWhatsAppMessage({ senderId, senderName, messageText: 'start' });
  console.log('\n[USER]: start');
  console.log('[BOT]:\n' + reply);

  // 2. User selects "1" (Raise Ticket)
  reply = await processIncomingWhatsAppMessage({ senderId, senderName, messageText: '1' });
  console.log('\n[USER]: 1');
  console.log('[BOT]:\n' + reply);

  // 3. User selects department "1" (Marketing)
  reply = await processIncomingWhatsAppMessage({ senderId, senderName, messageText: '1' });
  console.log('\n[USER]: 1 (Marketing)');
  console.log('[BOT]:\n' + reply);

  // 4. User selects category "3" (Network)
  reply = await processIncomingWhatsAppMessage({ senderId, senderName, messageText: '3' });
  console.log('\n[USER]: 3 (Network)');
  console.log('[BOT]:\n' + reply);

  // 5. User selects priority "3" (High)
  reply = await processIncomingWhatsAppMessage({ senderId, senderName, messageText: '3' });
  console.log('\n[USER]: 3 (High)');
  console.log('[BOT]:\n' + reply);

  // 6. User enters description
  reply = await processIncomingWhatsAppMessage({ senderId, senderName, messageText: 'Wireless internet dropping every 5 mins in Marketing conference room' });
  console.log('\n[USER]: Wireless internet dropping every 5 mins in Marketing conference room');
  console.log('[BOT]:\n' + reply);

  console.log('\n--- VERIFYING TICKET CREATION IN DB ---');
  const tickets = getAllTickets();
  const latest = tickets[0];
  console.log('Latest Ticket in DB:', {
    id: latest.id,
    title: latest.title,
    requesterName: latest.requesterName,
    department: latest.department,
    category: latest.category,
    priority: latest.priority,
    status: latest.status
  });
}

testFlow().catch(console.error);
