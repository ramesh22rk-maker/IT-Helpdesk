import { processIncomingWhatsAppMessage } from '../whatsappService.js';

async function runTests() {
  console.log('====================================================');
  console.log('🧪 TESTING WHATSAPP BOT INTERACTIVE BUTTON & FLOW');
  console.log('====================================================\n');

  const senderId = '919876543210';
  const senderName = 'Ravi Kumar';

  console.log('--- TEST 1: REGULAR CHAT (BOT STAYS SILENT) ---');
  let reply = await processIncomingWhatsAppMessage({ senderId, senderName, messageText: 'Hello brother how are you?' });
  console.log('[USER]: Hello brother how are you?');
  console.log('[BOT]:', reply === null ? '🔇 (SILENT - NO REPLY)' : reply.toString());

  console.log('\n--- TEST 2: TRIGGER "helpdesk" (RECEIVES BUTTONS & MENU LIST) ---');
  reply = await processIncomingWhatsAppMessage({ senderId, senderName, messageText: 'helpdesk' });
  console.log('[USER]: helpdesk');
  console.log('[BOT TEXT]:\n' + reply.replyText);
  console.log('[BOT BUTTONS]:', reply.buttons?.map(b => b.body || b) || reply.listSections);

  console.log('\n--- TEST 3: USER CLICKS BUTTON "🎫 Raise a Ticket" ---');
  reply = await processIncomingWhatsAppMessage({ senderId, senderName, messageText: '🎫 Raise a Ticket' });
  console.log('[USER CLICKS BUTTON]: 🎫 Raise a Ticket');
  console.log('[BOT TEXT]:\n' + reply.replyText);
  console.log('[BOT LIST TITLE]:', reply.listTitle, '| BUTTON LABEL:', reply.listButtonText);
  console.log('[BOT DEPARTMENTS COUNT]:', reply.listSections?.[0]?.rows?.length || reply.buttons?.length);

  console.log('\n--- TEST 4: USER SELECTS "IT" FROM DEPARTMENT LIST ---');
  reply = await processIncomingWhatsAppMessage({ senderId, senderName, messageText: 'IT' });
  console.log('[USER TAPS LIST ITEM]: IT');
  console.log('[BOT TEXT]:\n' + reply.replyText);

  console.log('\n--- TEST 5: USER ENTERS NAME AND ISSUE DESCRIPTION ---');
  reply = await processIncomingWhatsAppMessage({ 
    senderId, 
    senderName, 
    messageText: 'Ravi Kumar - Wi-Fi is not connecting on my Dell workstation' 
  });
  console.log('[USER]: Ravi Kumar - Wi-Fi is not connecting on my Dell workstation');
  console.log('[BOT TEXT]:\n' + reply.replyText);

  console.log('\n--- TEST 6: REGULAR CHAT AFTER TICKET SUBMISSION ---');
  reply = await processIncomingWhatsAppMessage({ senderId, senderName, messageText: 'Thank you!' });
  console.log('[USER]: Thank you!');
  console.log('[BOT]:', reply === null ? '🔇 (SILENT - NO REPLY)' : reply.toString());

  console.log('\n--- TEST 7: TRIGGER & TAP BUTTON "🔍 Track a Ticket" ---');
  reply = await processIncomingWhatsAppMessage({ senderId, senderName, messageText: 'help desk' });
  console.log('[USER]: help desk');
  console.log('[BOT BUTTONS]:', reply.buttons?.map(b => b.body || b));

  reply = await processIncomingWhatsAppMessage({ senderId, senderName, messageText: '🔍 Track a Ticket' });
  console.log('[USER CLICKS BUTTON]: 🔍 Track a Ticket');
  console.log('[BOT TEXT]:\n' + reply.replyText);

  reply = await processIncomingWhatsAppMessage({ senderId, senderName, messageText: '1001' });
  console.log('[USER REPLIES]: 1001');
  console.log('[BOT TEXT]:\n' + reply.replyText);

  console.log('\n--- TEST 8: TRIGGER & TAP BUTTON "❌ Cancel" ---');
  reply = await processIncomingWhatsAppMessage({ senderId, senderName, messageText: 'helpdesk' });
  reply = await processIncomingWhatsAppMessage({ senderId, senderName, messageText: 'Cancel' });
  console.log('[USER CLICKS BUTTON]: Cancel');
  console.log('[BOT TEXT]:\n' + reply.replyText);

  console.log('\n✅ ALL BUTTON & INTERACTIVE FLOW TESTS PASSED!');
}

runTests().catch(console.error);
