// Outlook SMTP & Department HOD Configuration for Sujan Industries
export const EMAIL_CONFIG = {
  // Outlook SMTP Settings (Fill in OUTLOOK_USER and OUTLOOK_PASS when ready)
  smtp: {
    host: process.env.OUTLOOK_SMTP_HOST || 'smtp.office365.com',
    port: parseInt(process.env.OUTLOOK_SMTP_PORT || '587', 10),
    secure: false, // false for STARTTLS (587)
    auth: {
      user: process.env.OUTLOOK_USER || 'rk.ramesh@sujanindustries.com', // Your Outlook sender email
      pass: process.env.OUTLOOK_PASS || ''  // Your Outlook password / App Password
    }
  },

  // IT HOD Email Address
  itHodEmail: 'rk.ramesh@sujanindustries.com',

  // Company Department HOD Email Mapping for Sujan Industries
  departmentHODs: {
    'ACCOUNTS': ['gopalanprasad@sujanindustries.com'],
    'NPD': ['sigamani.s@sujanindustries.com', 'venkatesan.n@sujanindustries.com'],
    'PMD': ['annamalai.n@sujanindustries.com'],
    'HRD': ['sanjay.anand@sujanindustries.com'],
    'QAD': ['qad@sujanindustries.com'],
    'SALES': ['sales@sujanindustries.com'],
    'PRODUCTION': ['production@sujanindustries.com'],
    'MIXING': ['head.rnd@sujanindustries.com'],
    'IT': ['rk.ramesh@sujanindustries.com'],
    'PURCHASE': ['joseph.c@sujanindustries.com'],
    'MARKETING': ['marketing3.hosur@sujanindustries.com'],
    'MMD': ['vignesh.n@sujanindustries.com'],
    'PPC': ['ppc@sujanindustries.com'],
    'PRODUCTION AGM': ['production.agm@sujanindustries.com'],
    'SCM': ['scm@sujanindustries.com'],
    'COO': ['coo@sujanindustries.com'],
    'STORE': ['store@sujanindustries.com']
  }
};
