import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, HelpCircle, User, Mail, Building, Tag, ShieldAlert } from 'lucide-react';

export default function TicketSubmission({ currentUser, onTicketSubmitted, setActiveTab }) {
  const [formData, setFormData] = useState({
    requesterName: '',
    department: '',
    email: '',
    category: '',
    priority: 'Medium',
    title: '',
    description: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const categories = [
    'Software',
    'Hardware',
    'Network',
    'Access & Security',
    'Email & Services',
    'General IT Doubt'
  ];

  const departments = [
    'PMD',
    'MARKETING',
    'ACCOUNTS',
    'PURCHASE',
    'MIXING',
    'SCM',
    'HRD',
    'NPD',
    'MMD'
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    const payload = {
      requesterName: formData.requesterName.trim() || currentUser?.name || 'Anonymous User',
      department: formData.department || currentUser?.department || 'General',
      email: formData.email.trim() || currentUser?.email || '',
      category: formData.category || 'General IT Doubt',
      priority: formData.priority || 'Medium',
      title: formData.title.trim() || 'General Ticket / Issue',
      description: formData.description.trim() || ''
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
        setFormData({
          requesterName: '',
          department: '',
          email: '',
          category: '',
          priority: 'Medium',
          title: '',
          description: ''
        });
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
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      
      {/* Submitted Ticket Confirmation Modal */}
      {submittedTicket && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content" style={{ textCenter: 'center', maxWidth: '520px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto'
            }}>
              <CheckCircle2 size={36} />
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', textAlign: 'center' }}>
              Ticket Successfully Submitted!
            </h2>
            
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', textAlign: 'center' }}>
              Your IT doubt/issue has been registered and assigned a unique tracking number.
            </p>

            <div style={{
              background: 'var(--bg-secondary)',
              borderRadius: '12px',
              padding: '1.25rem',
              border: '1px dashed var(--border-color)',
              marginBottom: '1.5rem',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Ticket Number:</span>
                <span style={{ fontWeight: 800, color: 'var(--accent-primary)', fontSize: '1.1rem' }}>
                  {submittedTicket.id}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Date & Time Created:</span>
                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                  {submittedTicket.createdAt}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Requester:</span>
                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                  {submittedTicket.requesterName} ({submittedTicket.department})
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Priority:</span>
                <span className={`badge badge-${submittedTicket.priority.toLowerCase()}`}>
                  {submittedTicket.priority}
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
                View Ticket History
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
        
        <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              background: 'rgba(99, 102, 241, 0.15)',
              color: 'var(--accent-primary)',
              padding: '0.5rem',
              borderRadius: '10px'
            }}>
              <HelpCircle size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Submit IT Issue / Doubt Ticket</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                All fields below are optional. Fill in what you wish and submit your ticket directly.
              </p>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: '#f87171',
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
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            
            <div className="form-group">
              <label><User size={15} /> Your Full Name <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>(Optional)</span></label>
              <input
                type="text"
                name="requesterName"
                value={formData.requesterName}
                onChange={handleChange}
                placeholder="e.g. John Doe (Optional)"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label><Building size={15} /> Department <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>(Optional)</span></label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="form-control"
              >
                <option value="">-- Select Department (Optional) --</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label><Mail size={15} /> Email Address <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>(Optional)</span></label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@company.com (Optional)"
                className="form-control"
              />
            </div>

          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
            
            <div className="form-group">
              <label><Tag size={15} /> Issue Category <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>(Optional)</span></label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="form-control"
              >
                <option value="">-- Select Category (Optional) --</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label><ShieldAlert size={15} /> Urgency / Priority Level <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>(Optional)</span></label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="form-control"
              >
                <option value="Low">Low - General query, non-urgent</option>
                <option value="Medium">Medium - Standard operational issue</option>
                <option value="High">High - Impairing work performance</option>
                <option value="Urgent">Urgent - Work blocked / System down</option>
              </select>
            </div>

          </div>

          <div className="form-group" style={{ marginTop: '0.5rem' }}>
            <label>Subject / Issue Summary <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>(Optional)</span></label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. General ticket or Wi-Fi issue (Optional)"
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label>Detailed Description of IT Doubt or Problem <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>(Optional)</span></label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide any details (Optional)..."
              className="form-control"
            />
          </div>

          <div style={{ marginTop: '1.75rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}
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
