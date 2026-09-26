import React, { useState, useEffect } from 'react';
import { 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Mail, 
  Building, 
  ShieldAlert, 
  Database, 
  Wifi, 
  Cpu, 
  Sparkles, 
  RotateCcw,
  Check,
  Tag
} from 'lucide-react';

const SAVED_PROFILE_KEY = 'it_helpdesk_saved_profile';

export const COMMON_ISSUE_CARDS = [
  {
    id: 'Finsys issue',
    title: 'Finsys Issue',
    category: 'Finsys issue',
    desc: 'ERP, billing, vouchers & reports',
    icon: Database,
    color: '#4f46e5',
    iconBg: '#e0e7ff',
    iconColor: '#4338ca',
    cardBg: '#f5f3ff',
    cardGlow: 'rgba(79, 70, 229, 0.2)',
    defaultPriority: 'High',
    placeholder: 'e.g. Getting error while opening sales invoice or voucher entry in Finsys...',
    presets: [
      'Finsys voucher entry error',
      'Sales billing print issue',
      'Finsys login / authentication error',
      'Finsys report generation stuck',
      'Finsys client slow / crashing'
    ]
  },
  {
    id: 'Internet issue',
    title: 'Internet Issue',
    category: 'Internet issue',
    desc: 'Wi-Fi, LAN cable & slow browsing',
    icon: Wifi,
    color: '#0284c7',
    iconBg: '#e0f2fe',
    iconColor: '#0369a1',
    cardBg: '#f0f9ff',
    cardGlow: 'rgba(2, 132, 199, 0.2)',
    defaultPriority: 'High',
    placeholder: 'e.g. LAN cable connected but showing No Internet on workstation...',
    presets: [
      'Wi-Fi disconnected / Not connecting',
      'LAN cable not detecting network',
      'Extremely slow internet speed',
      'Cannot access company local server',
      'Frequent disconnection'
    ]
  },
  {
    id: 'E-mail issue',
    title: 'E-mail Issue',
    category: 'E-mail issue',
    desc: 'Outlook, mailbox full & sending',
    icon: Mail,
    color: '#059669',
    iconBg: '#d1fae5',
    iconColor: '#047857',
    cardBg: '#f0fdf4',
    cardGlow: 'rgba(5, 150, 105, 0.2)',
    defaultPriority: 'Medium',
    placeholder: 'e.g. Outlook repeatedly prompts for password and emails stuck in Outbox...',
    presets: [
      'Outlook crashing / Not opening',
      'Emails stuck in Outbox (Not sending)',
      'Mailbox storage full alert',
      'Outlook password prompt / Sync error',
      'Need new email ID or alias configuration'
    ]
  },
  {
    id: 'Hardware issue',
    title: 'Hardware Issue',
    category: 'Hardware issue',
    desc: 'PC, printer, monitor & accessories',
    icon: Cpu,
    color: '#d97706',
    iconBg: '#fef3c7',
    iconColor: '#b45309',
    cardBg: '#fffbeb',
    cardGlow: 'rgba(217, 119, 6, 0.2)',
    defaultPriority: 'Medium',
    placeholder: 'e.g. HP LaserJet printer showing paper jam / Monitor display flickering...',
    presets: [
      'Printer paper jam / Offline error',
      'Monitor display blank or flickering',
      'Keyboard / Mouse not working',
      'System hanging / Computer not turning ON',
      'UPS battery / Power supply issue'
    ]
  },
  {
    id: 'Others',
    title: 'Others',
    category: 'Others',
    desc: 'Software install, doubts & general IT',
    icon: Sparkles,
    color: '#7c3aed',
    iconBg: '#ede9fe',
    iconColor: '#6d28d9',
    cardBg: '#faf5ff',
    cardGlow: 'rgba(124, 58, 237, 0.2)',
    defaultPriority: 'Low',
    placeholder: 'e.g. Requesting installation of Adobe PDF reader or general IT query...',
    presets: [
      'Software installation request',
      'Antivirus / Security alert query',
      'Data backup assistance',
      'Folder / Share drive access request',
      'General IT doubt / Support'
    ]
  }
];

export const COMPANY_DEPARTMENTS = [
  'PRODUCTION AGM',
  'ACCOUNTS',
  'NPD',
  'PMD',
  'HRD',
  'QAD',
  'SALES',
  'PRODUCTION',
  'MIXING',
  'IT',
  'PURCHASE',
  'MARKETING',
  'MMD',
  'PPC',
  'SCM',
  'COO',
  'STORE'
];

export default function TicketSubmission({ currentUser, onTicketSubmitted, setActiveTab }) {
  const [selectedCardId, setSelectedCardId] = useState('Finsys issue');
  const [rememberProfile, setRememberProfile] = useState(true);
  const [hasSavedProfile, setHasSavedProfile] = useState(false);

  const [formData, setFormData] = useState({
    requesterName: '',
    department: '',
    email: '',
    category: 'Finsys issue',
    priority: 'High',
    title: '',
    description: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Step 1 - C: Load saved profile from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SAVED_PROFILE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setHasSavedProfile(true);
        setFormData(prev => ({
          ...prev,
          requesterName: parsed.requesterName || prev.requesterName || (currentUser?.role !== 'admin' ? currentUser?.name : '') || '',
          department: parsed.department || prev.department || (currentUser?.role !== 'admin' ? currentUser?.department : '') || '',
          email: parsed.email || prev.email || (currentUser?.role !== 'admin' ? currentUser?.email : '') || ''
        }));
        return;
      }
    } catch (e) {
      console.warn('Could not read saved profile:', e);
    }

    if (currentUser && currentUser.role !== 'admin') {
      setFormData(prev => ({
        ...prev,
        requesterName: currentUser.name || '',
        department: currentUser.department || '',
        email: currentUser.email || ''
      }));
    }
  }, [currentUser]);

  const handleCardClick = (card) => {
    setSelectedCardId(card.id);
    setFormData(prev => ({
      ...prev,
      category: card.category,
      priority: card.defaultPriority
    }));
  };

  const handlePresetClick = (presetTitle) => {
    setFormData(prev => ({
      ...prev,
      title: presetTitle
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // If user changes category dropdown manually, sync selectedCardId
    if (name === 'category') {
      const matchedCard = COMMON_ISSUE_CARDS.find(c => c.category === value);
      if (matchedCard) {
        setSelectedCardId(matchedCard.id);
      }
    }
  };

  const handleClearSavedProfile = () => {
    try {
      localStorage.removeItem(SAVED_PROFILE_KEY);
      setHasSavedProfile(false);
      setFormData(prev => ({
        ...prev,
        requesterName: '',
        department: '',
        email: ''
      }));
    } catch (e) {
      console.error(e);
    }
  };

  const currentCard = COMMON_ISSUE_CARDS.find(c => c.id === selectedCardId) || COMMON_ISSUE_CARDS[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Basic required check to ensure IT gets actionable info
    const reqName = formData.requesterName.trim() || currentUser?.name || 'Anonymous User';
    const dept = formData.department || currentUser?.department || 'General';
    const title = formData.title.trim();
    const desc = formData.description.trim();

    if (!title && !desc) {
      setErrorMsg('Please enter a brief Issue Summary or Description before submitting.');
      return;
    }

    setIsSubmitting(true);

    // Save profile to localStorage if remember is enabled
    if (rememberProfile) {
      try {
        const profileToSave = {
          requesterName: reqName,
          department: dept,
          email: formData.email.trim()
        };
        localStorage.setItem(SAVED_PROFILE_KEY, JSON.stringify(profileToSave));
        setHasSavedProfile(true);
      } catch (e) {
        console.warn('Could not save profile:', e);
      }
    }

    const payload = {
      requesterName: reqName,
      department: dept,
      email: formData.email.trim() || currentUser?.email || '',
      category: formData.category || 'Others',
      priority: formData.priority || 'Medium',
      title: title || `${formData.category} reported by ${reqName}`,
      description: desc || title
    };

    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        setSubmittedTicket(data.data);
        // Retain user profile details for subsequent tickets while resetting issue-specific fields
        setFormData(prev => ({
          ...prev,
          title: '',
          description: ''
        }));
        if (onTicketSubmitted) onTicketSubmitted();
      } else {
        setErrorMsg(data.message || 'Failed to submit ticket');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Error connecting to IT Helpdesk backend server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '920px', margin: '0 auto' }}>
      
      {/* Submitted Ticket Confirmation Modal */}
      {submittedTicket && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content" style={{ textAlign: 'center', maxWidth: '520px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto'
            }}>
              <CheckCircle2 size={36} />
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.4rem', textAlign: 'center' }}>
              Ticket Successfully Submitted!
            </h2>
            
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem', textAlign: 'center' }}>
              Your IT request has been registered and dispatched to the IT Support Team.
            </p>

            <div style={{
              background: '#f8fafc',
              borderRadius: '12px',
              padding: '1.25rem',
              border: '1px dashed var(--border-color)',
              marginBottom: '1.5rem',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Ticket Tracking Number:</span>
                <span style={{ fontWeight: 800, color: 'var(--accent-primary)', fontSize: '1.15rem' }}>
                  {submittedTicket.id}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Issue Category:</span>
                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e293b' }}>
                  {submittedTicket.category}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Requester:</span>
                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                  {submittedTicket.requesterName} ({submittedTicket.department})
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Priority:</span>
                <span className={`badge badge-${(submittedTicket.priority || 'medium').toLowerCase()}`}>
                  {submittedTicket.priority}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Created At:</span>
                <span style={{ fontWeight: 500, fontSize: '0.825rem', color: '#64748b' }}>
                  {submittedTicket.createdAt}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setSubmittedTicket(null);
                  setActiveTab(currentUser?.role === 'admin' ? 'tickets' : 'my-tickets');
                }}
              >
                Track Ticket Status
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setSubmittedTicket(null)}
              >
                Raise Another Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Submission Card */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        
        {/* Header */}
        <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a' }}>Raise IT Support Ticket</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
                Select your issue type below to quickly submit your problem to IT Support.
              </p>
            </div>
          </div>
        </div>

        {/* Step 1 - C: Profile Auto-Save Memory Bar */}
        {hasSavedProfile && (
          <div className="profile-memory-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Check size={16} color="#16a34a" />
              <span>
                Your profile is remembered (<strong>{formData.requesterName || 'User'}</strong> • {formData.department || 'General'}).
              </span>
            </div>
            <button
              type="button"
              onClick={handleClearSavedProfile}
              style={{
                background: 'none',
                border: 'none',
                color: '#15803d',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontSize: '0.775rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              <RotateCcw size={12} /> Clear saved info
            </button>
          </div>
        )}

        {/* Step 1 - A: 1-Click Common Issue Quick Cards */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            fontSize: '0.875rem',
            fontWeight: 700,
            color: '#334155',
            display: 'block',
            marginBottom: '0.65rem'
          }}>
            1. Select Issue Type (1-Click Selection)
          </label>

          <div className="quick-issue-grid">
            {COMMON_ISSUE_CARDS.map(card => {
              const Icon = card.icon;
              const isSelected = selectedCardId === card.id;

              return (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(card)}
                  className={`quick-issue-card ${isSelected ? 'active' : ''}`}
                  style={{
                    '--card-color': card.color,
                    '--card-bg': card.cardBg,
                    '--card-glow': card.cardGlow,
                    '--icon-bg': card.iconBg,
                    '--icon-color': card.iconColor
                  }}
                >
                  {isSelected && (
                    <div className="quick-card-badge">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                  <div className="quick-card-icon-box">
                    <Icon size={22} />
                  </div>
                  <div className="quick-card-title">{card.title}</div>
                  <div className="quick-card-desc">{card.desc}</div>
                </div>
              );
            })}
          </div>

          {/* Quick Preset Subject Chips for the Selected Issue */}
          <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.775rem', fontWeight: 600, color: '#475569' }}>
              💡 Common {currentCard.title} presets (Click to auto-fill subject):
            </span>
            <div className="quick-preset-chips" style={{ marginBottom: 0 }}>
              {currentCard.presets.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handlePresetClick(preset)}
                  className={`quick-chip ${formData.title === preset ? 'active-chip' : ''}`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </div>

        {errorMsg && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: '#dc2626',
            borderRadius: '10px',
            padding: '0.85rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem'
          }}>
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          {/* User Details Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            
            <div className="form-group">
              <label>
                <User size={15} /> Your Full Name <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="text"
                name="requesterName"
                required
                value={formData.requesterName}
                onChange={handleChange}
                placeholder="e.g. Ramesh Kumar"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label>
                <Building size={15} /> Department <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <select
                name="department"
                required
                value={formData.department}
                onChange={handleChange}
                className="form-control"
              >
                <option value="">-- Select Your Department --</option>
                {COMPANY_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>
                <Mail size={15} /> Email Address <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>(For notifications)</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. user@sujanindustries.com"
                className="form-control"
              />
            </div>

          </div>

          {/* Category & Urgency Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginTop: '0.25rem' }}>
            
            <div className="form-group">
              <label>
                <Tag size={15} /> Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="form-control"
              >
                {COMMON_ISSUE_CARDS.map(c => (
                  <option key={c.category} value={c.category}>{c.title}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>
                <ShieldAlert size={15} /> Urgency Level
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="form-control"
              >
                <option value="Low">Low - General inquiry / Non-urgent</option>
                <option value="Medium">Medium - Standard operational issue</option>
                <option value="High">High - Impairing work performance</option>
                <option value="Urgent">Urgent - Work completely stopped</option>
              </select>
            </div>

          </div>

          {/* Subject / Issue Title */}
          <div className="form-group" style={{ marginTop: '0.25rem' }}>
            <label>
              Subject / Short Summary <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder={currentCard.presets[0] || 'Brief summary of the problem'}
              className="form-control"
            />
          </div>

          {/* Detailed Problem Description */}
          <div className="form-group">
            <label>
              Detailed Description of IT Problem <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>(Optional details)</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder={currentCard.placeholder}
              className="form-control"
              rows={3}
            />
          </div>

          {/* Remember Profile Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.85rem', color: '#475569' }}>
            <input
              type="checkbox"
              id="rememberProfileCheckbox"
              checked={rememberProfile}
              onChange={e => setRememberProfile(e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--accent-primary)' }}
            />
            <label htmlFor="rememberProfileCheckbox" style={{ cursor: 'pointer', margin: 0, fontWeight: 500 }}>
              Remember my Name and Department on this computer for faster submissions
            </label>
          </div>

          {/* Submit Action Button */}
          <div style={{ marginTop: '1.75rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{ padding: '0.85rem 2.25rem', fontSize: '1rem', borderRadius: '10px' }}
            >
              <Send size={18} />
              <span>{isSubmitting ? 'Submitting Ticket...' : 'Submit IT Ticket'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
