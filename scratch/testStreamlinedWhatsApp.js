import { processIncomingWhatsAppMessage } from '../whatsappService.js';
import { getAllTickets } from '../db.js';

async function testStreamlinedFlow() {
  console.log('--- START 2-STEP WHATSAPP CHAT FLOW TEST ---');
  const senderId = '919876543210';
  const senderName = 'Ramesh User';

  // 1. User sends "IT HELP DESK"
  let reply = await processIncomingWhatsAppMessage({ senderId, senderName, messageText: 'IT HELP DESK' });
  console.log('\n[USER]: IT HELP DESK');
  console.log('[BOT]:\n' + reply);

  // 2. User selects "1" (Raise a New Ticket)
  reply = await processIncomingWhatsAppMessage({ senderId, senderName, messageText: '1' });
  console.log('\n[USER]: 1');
  console.log('[BOT]:\n' + reply);

  // 3. User types issue description directly!
  reply = await processIncomingWhatsAppMessage({ senderId, senderName, messageText: 'My desktop PC power supply fan is making loud noise and shutting down' });
  console.log('\n[USER]: My desktop PC power supply fan is making loud noise and shutting down');
  console.log('[BOT]:\n' + reply);

  // 4. Verify regular chat message afterwards
  reply = await processIncomingWhatsAppMessage({ senderId, senderName, messageText: 'Thanks' });
  console.log('\n[USER AFTER TICKET]: Thanks');
  console.log('[BOT REPLIED?]:', reply !== null ? reply : '❌ NO REPLY (NORMAL CHAT RESUMED CLEANLY)');

  console.log('\n--- VERIFYING CREATED TICKET IN DB ---');
  const tickets = getAllTickets();
  const latest = tickets[0];
  console.log('Latest Ticket in DB:', {
    id: latest.id,
    title: latest.title,
    description: latest.description,
    requesterName: latest.requesterName,
    status: latest.status
  });
}

testStreamlinedFlow().catch(console.error);
