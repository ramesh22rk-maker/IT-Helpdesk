import { createTicket, getTicketById } from './db.js';
import { sendTicketNotificationEmail } from './mailer.js';

// In-memory conversation state machine per WhatsApp user (sender ID)
const userSessions = {};

// Current bot status & QR Code state for Web Admin view
let botStatus = {
  connected: false,
  statusMessage: 'Initializing WhatsApp service...',
  qrCode: null,
  botNumber: null,
  lastUpdated: new Date().toISOString()
};

// Company Department Options
export const DEPARTMENTS = [
  "PRODUCTION AGM",
  "ACCOUNTS",
  "NPD",
  "PMD",
  "HRD",
  "QAD",
  "SALES",
  "PRODUCTION",
  "MIXING",
  "IT",
  "PURCHASE",
  "MARKETING",
  "MMD",
  "PPC",
  "SCM",
  "COO",
  "STORE"
];

// Category Options
export const CATEGORIES = [
  "Hardware (PC, Laptop, Monitor, Keyboard)",
  "Software (Outlook, ERP, Windows, Office)",
  "Network (Wi-Fi, LAN, Internet connection)",
  "Access & Security (Password Reset, VPN)",
  "Printer & Scanner (Paper Jam, Toner, Network)",
  "General IT Support"
];

// Priority Options
export const PRIORITIES = [
  { label: "🟢 Low (General inquiry / non-blocking)", value: "Low" },
  { label: "🟡 Medium (Standard work issue)", value: "Medium" },
  { label: "🟠 High (Urgent issue stopping work)", value: "High" },
  { label: "🔴 Urgent (Critical system / server down)", value: "Urgent" }
];

/**
 * Helper to construct bot responses supporting both string coercion and structured button payload
 */
function makeResponse(replyText, meta = {}) {
  return {
    replyText,
    ...meta,
    toString() {
      return this.replyText;
    },
    valueOf() {
      return this.replyText;
    }
  };
}

/**
 * Format the department selection message
 */
function getDepartmentSelectionResponse() {
  const deptList = DEPARTMENTS.map((dept, index) => `${index + 1}. *${dept}*`).join('\n');
  const text = 
    `🏢 *Please Select Your Department:*\n\n` +
    `${deptList}\n\n` +
    `👉 _Reply with your Department Name or Number (e.g. *IT*, *Accounts*, *Sales*, or *10*)_`;

  return makeResponse(text, {
    step: 'SELECT_DEPARTMENT'
  });
}

/**
 * Main Welcome Menu Response
 */
function getWelcomeMenuResponse() {
  const text = 
    `👋 *Welcome to Company IT Helpdesk Support!*\n\n` +
    `How can we assist you today?\n\n` +
    `🎫 *1. Raise a Ticket*  _(or reply *Raise*)_\n` +
    `🔍 *2. Track a Ticket*  _(or reply *Track*)_\n` +
    `📞 *3. Contact IT Support*  _(or reply *Contact*)_\n` +
    `❌ *4. Cancel / Exit*  _(or reply *Cancel*)_\n\n` +
    `👉 _Reply with *1*, *2*, *3*, *4* or type *Raise* to proceed._`;

  return makeResponse(text, {
    step: 'MAIN_MENU'
  });
}

/**
 * Process an incoming message from any WhatsApp provider/client
 * @param {Object} param0 
 * @returns {Object|null} The automated reply object with text and buttons
 */
export async function processIncomingWhatsAppMessage({ senderId, senderName, messageText }) {
  const text = (messageText || '').trim();
  const lowerText = text.toLowerCase();

  // Trigger keywords that activate the IT Helpdesk bot
  // Matches: "helpdesk", "help desk", "HELP DESK", "Help desk", "it helpdesk", "it help desk", "start", etc.
  const isTriggerKeyword = 
    lowerText === 'helpdesk' ||
    lowerText === 'help desk' ||
    lowerText === 'help-desk' ||
    lowerText.includes('helpdesk') ||
    lowerText.includes('help desk') ||
    lowerText.includes('it helpdesk') ||
    lowerText.includes('it help desk') ||
    lowerText === 'start' ||
    lowerText === 'menu';

  // If user does not have an active session
  if (!userSessions[senderId]) {
    // Only activate if message contains helpdesk / help desk trigger
    if (isTriggerKeyword) {
      userSessions[senderId] = {
        step: 'MAIN_MENU',
        senderName: senderName || 'WhatsApp User'
      };

      return getWelcomeMenuResponse();
    }

    // Return null for normal personal/work messages so bot stays completely silent
    return null;
  }

  // If user has an active session and requests reset/cancel/restart or sends trigger again
  if (['cancel', '4', 'cancel / normal chat'].includes(lowerText)) {
    delete userSessions[senderId];
    return makeResponse(`❌ IT Helpdesk session ended. Normal chat resumed.`, { step: 'CANCELLED' });
  }

  if (isTriggerKeyword || ['reset', 'restart', '0', 'menu'].includes(lowerText)) {
    userSessions[senderId] = {
      step: 'MAIN_MENU',
      senderName: senderName || 'WhatsApp User'
    };

    return getWelcomeMenuResponse();
  }

  const session = userSessions[senderId];

  // STEP 1: MAIN MENU SELECTION
  if (session.step === 'MAIN_MENU') {
    // 1. Raise a Ticket
    if (text === '1' || lowerText.includes('raise') || lowerText.includes('new ticket')) {
      session.step = 'SELECT_DEPARTMENT';
      return getDepartmentSelectionResponse();
    } 
    
    // 2. Track a Ticket
    if (text === '2' || lowerText.includes('track') || lowerText.includes('status')) {
      session.step = 'TRACK_TICKET';
      return makeResponse(
        `🔍 *Track a Ticket*\n\n` +
        `Please reply with your Ticket ID (e.g. *TK-1001* or *1001*):`,
        { step: 'TRACK_TICKET' }
      );
    } 

    // 3. Contact IT Support
    if (text === '3' || lowerText.includes('contact') || lowerText.includes('support')) {
      delete userSessions[senderId];
      return makeResponse(
        `📞 *Company IT Support Team Hotline*\n\n` +
        `👨‍💼 *Mr. Ramesh (IT HOD / Manager)*\n` +
        `   • Email: rk.ramesh@sujanindustries.com\n\n` +
        `👨‍💻 *Mr. Selvin (Junior IT Admin)*\n` +
        `   • Email: selvin.jr@sujanindustries.com\n\n` +
        `🏢 *IT Desk Office Extension*: 104 / 105\n\n` +
        `_Send *helpdesk* anytime to raise a ticket or return to menu._`,
        { step: 'CONTACT_INFO' }
      );
    }

    // 4. Cancel / Normal Chat
    if (text === '4' || lowerText.includes('cancel')) {
      delete userSessions[senderId];
      return makeResponse(`❌ IT Helpdesk session ended. Normal chat resumed.`, { step: 'CANCELLED' });
    }

    return makeResponse(
      `⚠️ *Please tap one of the buttons below to proceed:*\n\n` +
      `🎫 *Raise a Ticket*\n` +
      `🔍 *Track a Ticket*\n` +
      `📞 *Contact IT Support*\n` +
      `❌ *Cancel*`,
      {
        step: 'MAIN_MENU',
        buttonTitle: 'IT Helpdesk Support',
        buttonFooter: 'Tap a button to proceed',
        listButtonText: '📋 Select Option',
        listSections: [
          {
            title: 'IT Helpdesk Actions',
            rows: [
              { id: 'Raise a Ticket', title: '🎫 Raise a Ticket', description: 'Submit a new IT support request' },
              { id: 'Track a Ticket', title: '🔍 Track a Ticket', description: 'Check status of an existing ticket' },
              { id: 'Contact IT Support', title: '📞 Contact IT Support', description: 'View IT team contact details' },
              { id: 'Cancel', title: '❌ Cancel', description: 'Exit helpdesk session' }
            ]
          }
        ],
        buttons: [
          { id: 'Raise a Ticket', body: '🎫 Raise a Ticket' },
          { id: 'Track a Ticket', body: '🔍 Track a Ticket' },
          { id: 'Contact IT Support', body: '📞 Contact IT' }
        ]
      }
    );
  }

  // STEP 2: SELECT DEPARTMENT (Supports Button Click, List Selection, or Name)
  if (session.step === 'SELECT_DEPARTMENT') {
    let matchedDept = null;
    const deptNum = parseInt(text);

    if (!isNaN(deptNum) && deptNum >= 1 && deptNum <= DEPARTMENTS.length) {
      matchedDept = DEPARTMENTS[deptNum - 1];
    } else {
      for (const dept of DEPARTMENTS) {
        const regex = new RegExp(`\\b${dept.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
        if (regex.test(text) || lowerText === dept.toLowerCase() || lowerText.includes(dept.toLowerCase())) {
          matchedDept = dept;
          break;
        }
      }
    }

    if (!matchedDept) {
      return makeResponse(
        `⚠️ *Please select your Department using the button below:*\n\n` +
        `👉 Tap *Select Department* to choose:`,
        {
          step: 'SELECT_DEPARTMENT',
          listTitle: 'Company Departments',
          listButtonText: '🏢 Select Department',
          listSections: [
            {
              title: 'Company Departments',
              rows: DEPARTMENTS.map(dept => ({
                id: dept,
                title: dept,
                description: `Submit ticket for ${dept}`
              }))
            }
          ],
          buttons: DEPARTMENTS
        }
      );
    }

    // Save selected department into session and proceed to ask for Name and Issue
    session.department = matchedDept;
    session.step = 'ENTER_NAME_AND_ISSUE';

    return makeResponse(
      `🏢 *Selected Department:* ${matchedDept}\n\n` +
      `👤 *Please enter your Name and Issue description:*\n\n` +
      `_(Example: "John - Outlook not syncing emails" or "Sarah - Wi-Fi disconnecting")_`,
      { step: 'ENTER_NAME_AND_ISSUE', department: matchedDept }
    );
  }

  // STEP 3: ENTER NAME AND ISSUE -> RAISE TICKET
  if (session.step === 'ENTER_NAME_AND_ISSUE') {
    if (text.length < 3) {
      return makeResponse(`⚠️ Please enter your Name and describe what issue you have so our IT team can assist you.`, { step: 'ENTER_NAME_AND_ISSUE' });
    }

    let requesterName = session.senderName || senderId;
    let description = text;

    if (text.includes('-')) {
      const firstDash = text.indexOf('-');
      const possibleName = text.substring(0, firstDash).trim();
      const possibleDesc = text.substring(firstDash + 1).trim();
      if (possibleName && possibleDesc) {
        requesterName = possibleName;
        description = possibleDesc;
      }
    } else if (text.includes(',')) {
      const firstComma = text.indexOf(',');
      const possibleName = text.substring(0, firstComma).trim();
      const possibleDesc = text.substring(firstComma + 1).trim();
      if (possibleName && possibleDesc) {
        requesterName = possibleName;
        description = possibleDesc;
      }
    } else {
      // If user typed only the issue description without delimiter, use sender name if available
      if (session.senderName && session.senderName !== 'WhatsApp User' && session.senderName !== senderId) {
        requesterName = session.senderName;
        description = text;
      }
    }

    const title = description.length > 60 ? description.substring(0, 57) + '...' : description;

    // Create the ticket in DB
    const newTicket = createTicket({
      title,
      description,
      category: "General IT Support",
      priority: "Medium",
      requesterName,
      department: session.department,
      email: `${senderId.replace(/[^0-9]/g, '') || 'user'}@whatsapp.user`
    });

    // Send async email notification to IT team & HOD
    sendTicketNotificationEmail(newTicket).catch(err => {
      console.error('[WhatsApp Service] Notification email error:', err.message);
    });

    // Clear session so normal chat resumes
    delete userSessions[senderId];

    return makeResponse(
      `🎉 *Your Ticket is Raised Successfully!*\n\n` +
      `🎫 *Ticket ID*: *${newTicket.id}*\n` +
      `👤 *Requester*: ${newTicket.requesterName}\n` +
      `🏢 *Department*: ${newTicket.department}\n` +
      `📝 *Issue Description*: ${newTicket.description}\n` +
      `📅 *Date*: ${newTicket.createdAt}\n\n` +
      `👨‍💻 Our IT team (*Mr. Ramesh*) has been notified via email & dashboard and will address your issue shortly.\n\n` +
      `_Send *helpdesk* anytime if you need further IT assistance._`,
      { step: 'TICKET_CREATED', ticket: newTicket }
    );
  }

  // STEP: TRACK TICKET
  if (session.step === 'TRACK_TICKET') {
    let searchId = text.toUpperCase().trim();
    if (!searchId.startsWith('TK-') && !isNaN(parseInt(searchId))) {
      searchId = `TK-${searchId}`;
    }

    const ticket = getTicketById(searchId);
    delete userSessions[senderId];

    if (!ticket) {
      return makeResponse(
        `❌ Ticket ID *${searchId}* was not found in our system.\n\nPlease check your Ticket ID and send *helpdesk* to try again.`,
        { step: 'NOT_FOUND' }
      );
    }

    let statusEmoji = '🟡';
    if (ticket.status === 'Resolved' || ticket.status === 'Closed') statusEmoji = '✅';
    if (ticket.status === 'In Progress') statusEmoji = '🔵';

    return makeResponse(
      `🔍 *Ticket Status Details*\n\n` +
      `🎫 *Ticket ID*: *${ticket.id}*\n` +
      `${statusEmoji} *Status*: *${ticket.status}*\n` +
      `👤 *Requester*: ${ticket.requesterName}\n` +
      `🏢 *Department*: ${ticket.department}\n` +
      `🛠️ *Category*: ${ticket.category}\n` +
      `⚡ *Priority*: ${ticket.priority}\n` +
      `👤 *Assigned To*: ${ticket.assignedTo}\n` +
      `📝 *Title*: ${ticket.title}\n` +
      `📅 *Created*: ${ticket.createdAt}\n` +
      (ticket.resolutionNotes ? `💡 *Resolution Notes*: ${ticket.resolutionNotes}\n` : '') +
      `\n_Send *helpdesk* to return to the main menu._`,
      { step: 'STATUS_DISPLAYED', ticket }
    );
  }

  // Fallback
  delete userSessions[senderId];
  return makeResponse(`Send *helpdesk* to open the IT Helpdesk menu.`, { step: 'FALLBACK' });
}

// WhatsApp Service status getter & setter
export function getWhatsAppStatus() {
  return botStatus;
}

export function updateWhatsAppStatus(updates) {
  botStatus = {
    ...botStatus,
    ...updates,
    lastUpdated: new Date().toISOString()
  };
}
