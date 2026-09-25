import { processIncomingWhatsAppMessage } from '../whatsappService.js';

async function testTrigger() {
  console.log('--- TEST 1: REGULAR CHAT MESSAGES ---');
  let reply = await processIncomingWhatsAppMessage({ senderId: 'user_1', senderName: 'Alice', messageText: 'Good morning Ramesh Sir' });
  console.log('[USER]: Good morning Ramesh Sir');
  console.log('[BOT REPLIED?]:', reply !== null ? reply : '❌ NO REPLY (SILENT - REGULAR CHAT)');

  reply = await processIncomingWhatsAppMessage({ senderId: 'user_1', senderName: 'Alice', messageText: 'Did you get the invoice copy?' });
  console.log('\n[USER]: Did you get the invoice copy?');
  console.log('[BOT REPLIED?]:', reply !== null ? reply : '❌ NO REPLY (SILENT - REGULAR CHAT)');

  console.log('\n--- TEST 2: USER SENDS "IT HELP DESK" ---');
  reply = await processIncomingWhatsAppMessage({ senderId: 'user_1', senderName: 'Alice', messageText: 'IT HELP DESK' });
  console.log('[USER]: IT HELP DESK');
  console.log('[BOT REPLIED?]:\n' + reply);

  console.log('\n--- TEST 3: USER SELECTS "1" TO RAISE TICKET ---');
  reply = await processIncomingWhatsAppMessage({ senderId: 'user_1', senderName: 'Alice', messageText: '1' });
  console.log('[USER]: 1');
  console.log('[BOT REPLIED?]:\n' + reply);
}

testTrigger().catch(console.error);
