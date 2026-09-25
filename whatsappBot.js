import { processIncomingWhatsAppMessage, updateWhatsAppStatus, getWhatsAppStatus } from './whatsappService.js';

let client = null;

export async function initWhatsAppBot() {
  updateWhatsAppStatus({
    connected: false,
    statusMessage: 'Loading WhatsApp Bot module...'
  });

  try {
    // Dynamic import so server can start cleanly even if whatsapp-web.js is building
    const qrcodeMod = await import('qrcode-terminal').catch(() => null);
    const qrcode = qrcodeMod?.default || qrcodeMod;

    const wwebMod = await import('whatsapp-web.js').catch(() => null);
    const wweb = wwebMod?.default || wwebMod || {};
    const { Client, LocalAuth } = wweb;

    if (!Client) {
      console.log('[WhatsApp Bot] whatsapp-web.js package not detected yet. Operating in Webhook API mode.');
      updateWhatsAppStatus({
        connected: false,
        statusMessage: 'Ready for Webhook API mode (whatsapp-web.js package optional)'
      });
      return;
    }

    console.log('[WhatsApp Bot] Initializing WhatsApp Client with LocalAuth session persistence...');
    client = new Client({
      authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      }
    });

    client.on('qr', (qr) => {
      console.log('=============================================================');
      console.log(' 📱 IT HELPDESK WHATSAPP BOT - SCAN QR CODE TO PAIR PHONE');
      console.log('-------------------------------------------------------------');
      if (qrcode && qrcode.generate) {
        qrcode.generate(qr, { small: true });
      }
      console.log('=============================================================');

      updateWhatsAppStatus({
        connected: false,
        statusMessage: 'QR Code Generated - Ready for Scanning',
        qrCode: qr
      });
    });

    client.on('authenticated', () => {
      console.log('[WhatsApp Bot] Client Authenticated successfully!');
      updateWhatsAppStatus({
        connected: false,
        statusMessage: 'Authenticated. Connecting to WhatsApp network...',
        qrCode: null
      });
    });

    client.on('ready', () => {
      const info = client.info;
      const botNum = info && info.wid ? info.wid.user : 'Connected';
      console.log(`=============================================================`);
      console.log(` ✅ IT HELPDESK WHATSAPP BOT IS LIVE AND READY FOR MESSAGES!`);
      console.log(` 📞 Paired Phone Number: +${botNum}`);
      console.log(`=============================================================`);

      updateWhatsAppStatus({
        connected: true,
        statusMessage: `Active and Listening (+${botNum})`,
        botNumber: botNum,
        qrCode: null
      });
    });

    client.on('message', async (msg) => {
      // Ignore group chats or status updates
      if (msg.isGroupMsg || msg.from.includes('@g.us')) return;

      const senderId = msg.from;
      const contact = await msg.getContact().catch(() => null);
      const senderName = contact ? (contact.pushname || contact.name || senderId) : senderId;
      
      // Extract clicked button/list text or regular message body
      const messageText = msg.selectedRowId || msg.selectedButtonId || msg.body;

      console.log(`[WhatsApp Bot] Incoming message from ${senderName} (${senderId}): "${messageText}"`);

      try {
        const result = await processIncomingWhatsAppMessage({
          senderId,
          senderName,
          messageText
        });

        if (result) {
          const replyText = typeof result === 'object' ? (result.replyText || result.toString()) : result;

          // Dispatch formatted automated reply reliably to user/LID
          await msg.reply(replyText);
          console.log(`[WhatsApp Bot] Automated reply successfully dispatched to ${senderName}`);
        } else {
          console.log(`[WhatsApp Bot] Message ignored (Regular chat / No active IT session)`);
        }
      } catch (err) {
        console.error('[WhatsApp Bot] Error processing message:', err);
      }
    });

    client.on('disconnected', async (reason) => {
      console.log('[WhatsApp Bot] Client disconnected:', reason);
      updateWhatsAppStatus({
        connected: false,
        statusMessage: `Disconnected (${reason}).`,
        qrCode: null
      });
      try {
        await client.destroy().catch(() => {});
      } catch (_) {}
      // Re-initialize cleanly
      setTimeout(() => {
        initWhatsAppBot().catch(() => {});
      }, 3000);
    });

    client.initialize().catch(err => {
      console.warn('[WhatsApp Bot] Client initialization notice:', err.message);
      updateWhatsAppStatus({
        connected: false,
        statusMessage: `Initialization Notice: ${err.message}`
      });
    });

  } catch (err) {
    console.error('[WhatsApp Bot] Init exception:', err.message);
    updateWhatsAppStatus({
      connected: false,
      statusMessage: `Ready for Webhook API mode`
    });
  }
}
