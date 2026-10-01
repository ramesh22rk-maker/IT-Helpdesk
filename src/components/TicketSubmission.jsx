import React, { useState, useEffect, useRef } from 'react';
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
  Tag,
  Paperclip,
  X,
  FileText,
  Image as ImageIcon
} from 'lucide-react';

const SAVED_PROFILE_KEY = 'it_helpdesk_saved_profile';

export const COMMON_ISSUE_CARDS = [
  {
    id: 'Finsys Related',
    title: 'Finsys Related',
    category: 'Finsys Related',
    icon: Database,
    color: '#4f46e5',
    iconBg: '#e0e7ff',
    iconColor: '#4338ca',
    cardBg: '#f5f3ff',
    cardGlow: 'rgba(79, 70, 229, 0.2)',
    defaultPriority: 'High',
    placeholder: 'Describe your Finsys related query or problem...'
  },
  {
    id: 'Internet Related',
    title: 'Internet Related',
    category: 'Internet Related',
    icon: Wifi,
    color: '#0284c7',
    iconBg: '#e0f2fe',
    iconColor: '#0369a1',
    cardBg: '#f0f9ff',
    cardGlow: 'rgba(2, 132, 199, 0.2)',
    defaultPriority: 'High',
    placeholder: 'Describe your Internet, Wi-Fi, or Network connection problem...'
  },
  {
    id: 'Hardware/Network Related',
    title: 'Hardware/Network Related',
    category: 'Hardware/Network Related',
    icon: Cpu,
    color: '#d97706',
    iconBg: '#fef3c7',
    iconColor: '#b45309',
    cardBg: '#fffbeb',
    cardGlow: 'rgba(217, 119, 6, 0.2)',
    defaultPriority: 'Medium',
    placeholder: 'Describe your PC, Laptop, Monitor, Printer, or Hardware problem...'
  },
  {
    id: 'Others',
    title: 'Others',
    category: 'Others',
    icon: Sparkles,
    color: '#7c3aed',
    iconBg: '#ede9fe',
    iconColor: '#6d28d9',
    cardBg: '#faf5ff',
    cardGlow: 'rgba(124, 58, 237, 0.2)',
    defaultPriority: 'Low',
    placeholder: 'Describe your request or other inquiry...'
  }
];

// Company Departments listing
export const COMPANY_DEPARTMENTS = [
  'ACCOUNTS',
  'HRD',
  'IT/Admin',
  'MARKETING',
  'MIXING',
  'MMD',
  'NPD',
  'PMD',
  'PPC',
  'PRODUCTION',
  'PURCHASE',
  'QAD',
  'SALES',
  'SCM',
  'STORE'
];

export default function TicketSubmission({ currentUser, onTicketSubmitted, setActiveTab }) {
  const isAdmin = currentUser?.role === 'admin';
  const [selectedCardId, setSelectedCardId] = useState('Finsys Related');
  const [rememberProfile, setRememberProfile] = useState(true);
  const [hasSavedProfile, setHasSavedProfile] = useState(false);

  const [formData, setFormData] = useState({
    requesterName: '',
    department: '',
    email: '',
    category: 'Finsys Related',
    priority: 'High',
    title: '',
    description: ''
  });

  const [attachment, setAttachment] = useState(null);
  const [attachmentError, setAttachmentError] = useState('');
  const fileInputRef = useRef(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Load saved Name, Department & Email from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SAVED_PROFILE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setHasSavedProfile(true);
        setFormData(prev => ({
          ...prev,
          requesterName: parsed.requesterName || prev.requesterName || (currentUser?.role !== 'admin' ? currentUser?.name : '') || '',
          department: parsed.department === 'IT' ? 'IT/Admin' : (parsed.department || prev.department || (currentUser?.role !== 'admin' ? currentUser?.department : '') || ''),
          email: parsed.email || prev.email || currentUser?.email || ''
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
        department: currentUser.department === 'IT' ? 'IT/Admin' : (currentUser.department || ''),
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'category') {
      const matchedCard = COMMON_ISSUE_CARDS.find(c => c.category === value);
      if (matchedCard) {
        setSelectedCardId(matchedCard.id);
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setAttachmentError('');
    if (!file) return;

    // Max 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      setAttachmentError('File size exceeds 10MB limit. Please choose a smaller file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAttachment({
        name: file.name,
        size: file.size,
        type: file.type,
        data: reader.result
      });
    };
    reader.onerror = () => {
      setAttachmentError('Failed to read attached file.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAttachment = () => {
    setAttachment(null);
    setAttachmentError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
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

    const reqName = formData.requesterName.trim() || currentUser?.name || 'Anonymous User';
    const dept = formData.department || currentUser?.department || 'General';
    const email = formData.email.trim();
    const title = formData.title.trim();
    const desc = formData.description.trim();

    if (!isAdmin && !email) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    if (!title && !desc) {
      setErrorMsg('Please enter a brief Subject or Problem Description before submitting.');
      return;
    }

    setIsSubmitting(true);

    // Save Name, Department AND Email to localStorage so it auto-fills next time!
    if (rememberProfile) {
      try {
        const profileToSave = {
          requesterName: reqName,
          department: dept,
          email: email
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
      email: email,
      category: formData.category || 'Others',
      priority: formData.priority || 'Medium',
      title: title || `${formData.category} reported by ${reqName}`,
      description: desc || title,
      attachment: attachment || null
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
        try {
          const savedIds = JSON.parse(localStorage.getItem('it_helpdesk_my_tickets') || '[]');
          if (data.data?.id) {
            const updated = [data.data.id, ...savedIds.filter(id => id !== data.data.id)].slice(0, 50);
            localStorage.setItem('it_helpdesk_my_tickets', JSON.stringify(updated));
          }
        } catch (e) {
          console.warn('Could not save my tickets history:', e);
        }
        // Reset issue-specific fields while keeping name, dept, and email autofilled!
        setFormData(prev => ({
          ...prev,
          title: '',
          description: ''
        }));
        setAttachment(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (onTicketSubmitted) onTicketSubmitted();
      } else {
        setErrorMsg(data.message || 'Failed to submit ticket');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Error connecting to SIHPL Helpdesk backend server.');
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
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Ticket Number:</span>
                <span style={{ fontWeight: 800, color: 'var(--accent-primary)', fontSize: '1.15rem' }}>
                  {submittedTicket.id}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Category:</span>
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
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Email:</span>
                <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#4f46e5' }}>
                  {submittedTicket.email || 'N/A'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Priority:</span>
                <span className={`badge badge-${(submittedTicket.priority || 'medium').toLowerCase()}`}>
                  {submittedTicket.priority}
                </span>
              </div>
              {submittedTicket.attachment && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Attachment:</span>
                  <span style={{ fontWeight: 600, fontSize: '0.825rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Paperclip size={13} /> {submittedTicket.attachment.name}
                  </span>
                </div>
              )}
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
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a' }}>Raise IT Support Ticket</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
            Select your category below to quickly submit your request to IT Support.
          </p>
        </div>

        {/* Profile Auto-Save Memory Bar */}
        {hasSavedProfile && (
          <div className="profile-memory-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Check size={16} color="#16a34a" />
              <span>
                Auto-filled: <strong>{formData.requesterName || 'User'}</strong> ({formData.department || 'General'}) • <span style={{ color: '#16a34a' }}>{formData.email || 'Email saved'}</span>
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
              <RotateCcw size={12} /> Clear
            </button>
          </div>
        )}

        {/* Select Category Quick Cards */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            fontSize: '0.875rem',
            fontWeight: 700,
            color: '#334155',
            display: 'block',
            marginBottom: '0.65rem'
          }}>
            Select Category
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
                    '--icon-color': card.iconColor,
                    padding: '0.85rem 0.65rem'
                  }}
                >
                  {isSelected && (
                    <div className="quick-card-badge">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                  <div className="quick-card-icon-box" style={{ width: '40px', height: '40px', marginBottom: '0.45rem' }}>
                    <Icon size={20} />
                  </div>
                  <div className="quick-card-title" style={{ fontSize: '0.875rem', marginBottom: 0 }}>{card.title}</div>
                </div>
              );
            })}
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
                <option value="">-- Select Department --</option>
                {COMPANY_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Email is COMPULSORY for users, Optional for Admin */}
            <div className="form-group">
              <label>
                <Mail size={15} /> Email Address {isAdmin ? (
                  <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 500 }}>(Optional for Admin)</span>
                ) : (
                  <span style={{ color: '#dc2626' }}>*</span>
                )}
              </label>
              <input
                type="email"
                name="email"
                required={!isAdmin}
                value={formData.email}
                onChange={handleChange}
                placeholder={isAdmin ? "e.g. name@sujanindustries.com (Optional)" : "e.g. name@sujanindustries.com"}
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

            {/* Urgency Level */}
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
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

          </div>

          {/* Subject */}
          <div className="form-group" style={{ marginTop: '0.25rem' }}>
            <label>
              Subject / Short Summary <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Wi-Fi disconnected / Finsys voucher error"
              className="form-control"
            />
          </div>

          {/* Detailed Problem Description */}
          <div className="form-group">
            <label>
              Detailed Description of IT Request <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>(Optional)</span>
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

          {/* Attachment Option Near Description */}
          <div className="form-group" style={{ marginTop: '0.5rem', marginBottom: '1.25rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
              <Paperclip size={15} color="#4f46e5" />
              <span>Attach File / Screenshot (Optional)</span>
            </label>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
              style={{ display: 'none' }}
              id="ticketFileInput"
            />

            {!attachment ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed #cbd5e1',
                  borderRadius: '10px',
                  padding: '1rem',
                  textAlign: 'center',
                  background: '#f8fafc',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#4f46e5';
                  e.currentTarget.style.background = '#f5f3ff';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#cbd5e1';
                  e.currentTarget.style.background = '#f8fafc';
                }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: '#e0e7ff',
                  color: '#4f46e5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Paperclip size={18} />
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>
                  Click to browse screenshot or document
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Supports PNG, JPG, PDF, Word, Excel, Text (up to 10MB)
                </div>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                  {attachment.type?.startsWith('image/') ? (
                    <img 
                      src={attachment.data} 
                      alt="preview" 
                      style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #cbd5e1' }} 
                    />
                  ) : (
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '6px',
                      background: '#dcfce7',
                      color: '#16a34a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <FileText size={20} />
                    </div>
                  )}
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                      {attachment.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>
                      {formatFileSize(attachment.size)} • Ready to upload
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveAttachment}
                  style={{
                    background: '#fee2e2',
                    border: 'none',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#dc2626',
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                  title="Remove attachment"
                >
                  <X size={15} />
                </button>
              </div>
            )}

            {attachmentError && (
              <div style={{ color: '#dc2626', fontSize: '0.775rem', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <AlertCircle size={13} /> {attachmentError}
              </div>
            )}
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
              Remember my Name, Department, and Email on this computer for next time
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
