import { getTicketRecipients } from '../mailer.js';

console.log('=== VERIFYING EMAIL ROUTING FOR DEPARTMENTS ===');

const testCases = [
  { department: 'HRD', expectedHOD: 'sanjay.anand@sujanindustries.com' },
  { department: 'MARKETING', expectedHOD: 'marketing3.hosur@sujanindustries.com' },
  { department: 'ACCOUNTS', expectedHOD: 'gopalanprasad@sujanindustries.com' },
  { department: 'NPD', expectedHOD: 'sigamani.s@sujanindustries.com' },
  { department: 'PURCHASE', expectedHOD: 'joseph.c@sujanindustries.com' },
  { department: 'PRODUCTION', expectedHOD: 'production@sujanindustries.com' }
];

testCases.forEach(tc => {
  const ticket = {
    id: 'TK-TEST',
    title: 'Test Issue',
    requesterName: 'Test User',
    department: tc.department,
    email: 'user@whatsapp.user'
  };

  const recipients = getTicketRecipients(ticket);
  console.log(`\n🏢 Department: [${tc.department}]`);
  console.log(`📬 Recipients List (${recipients.length}):`);
  recipients.forEach(r => console.log(`   - ${r}`));
  
  const hasDeptHOD = recipients.some(r => r.includes(tc.expectedHOD.split('@')[0]));
  const hasITHOD = recipients.includes('rk.ramesh@sujanindustries.com');
  console.log(`✅ Department HOD included: ${hasDeptHOD}`);
  console.log(`✅ IT Department Manager included: ${hasITHOD}`);
});
