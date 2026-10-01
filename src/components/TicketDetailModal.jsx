import React, { useState } from 'react';
import { 
  X, 
  Clock, 
  User, 
  Building, 
  Mail, 
  CheckCircle, 
  UserCheck, 
  AlertCircle,
  FileText,
  Trash2,
  Paperclip,
  Download,
  Eye
} from 'lucide-react';

export default function TicketDetailModal({ ticket, onClose, onUpdateTicket, onDeleteTicket }) {
  const [status, setStatus] = useState(ticket.status);
  const [assignedTo, setAssignedTo] = useState(ticket.assignedTo || 'Unassigned');
  const [resolutionNotes, setResolutionNotes] = useState(ticket.resolutionNotes || '');
  const [agentName, setAgentName] = useState('Mr. Ramesh (HOD/Manager)');
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState('');

  // Company IT Team Members: Mr. Ramesh (HOD/Manager) & Mr. Selvin (Junior)
  const agents = [
    'Mr. Ramesh (HOD/Manager)',
    'Mr. Selvin (Junior)',
    'Unassigned'
  ];

  const handleSave = async () => {
    setIsSaving(true);
    setMsg('');

    try {
      const res = await fetch(`/api/tickets/${ticket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          assignedTo,
          resolutionNotes,
          actor: agentName
        })
      });
      const data = await res.json();

      if (data.success) {
        setMsg('Ticket updated successfully!');
        if (onUpdateTicket) onUpdateTicket(data.data);
        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        setMsg('Error: ' + data.message);
      }
    } catch (err) {
      console.error(err);
      setMsg('Failed to update ticket server error.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ticket ${ticket.id}?`)) return;

    try {
      const res = await fetch(`/api/tickets/${ticket.id}?actor=${encodeURIComponent(agentName)}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        if (onDeleteTicket) onDeleteTicket(ticket.id);
        onClose();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass-panel modal-content" onClick={e => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--accent-primary)' }}>
                {ticket.id}
              </span>
              <span className={`badge badge-${ticket.priority.toLowerCase()}`}>
                {ticket.priority} Priority
              </span>
              <span className={`badge badge-${ticket.status.toLowerCase().replace(' ', '-')}`}>
                {ticket.status}
              </span>
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>{ticket.title}</h2>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.25rem'
            }}
          >
            <X size={22} />
          </button>
        </div>

        {msg && (
          <div style={{
            background: '#dcfce7',
            color: '#15803d',
            border: '1px solid #bbf7d0',
            padding: '0.6rem 1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontSize: '0.85rem'
          }}>
            {msg}
          </div>
        )}

        {/* Info Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          background: '#f8fafc',
          padding: '1rem 1.25rem',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          marginBottom: '1.5rem',
          fontSize: '0.85rem'
        }}>
          <div>
            <span style={{ color: '#64748b', display: 'block' }}>Requester:</span>
            <strong style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
              <User size={14} /> {ticket.requesterName}
            </strong>
          </div>
          <div>
            <span style={{ color: '#64748b', display: 'block' }}>Department & Email:</span>
            <strong style={{ display: 'block', marginTop: '0.2rem' }}>
              {ticket.department} ({ticket.email || 'No email'})
            </strong>
          </div>
          <div>
            <span style={{ color: '#64748b', display: 'block' }}>Category:</span>
            <strong style={{ display: 'block', marginTop: '0.2rem' }}>{ticket.category}</strong>
          </div>
          <div>
            <span style={{ color: '#64748b', display: 'block' }}>Creation Date & Time:</span>
            <strong style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
              <Clock size={14} /> {ticket.createdAt}
            </strong>
          </div>
          {ticket.resolvedAt && (
            <div>
              <span style={{ color: '#64748b', display: 'block' }}>Resolved Date & Time:</span>
              <strong style={{ color: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                <CheckCircle size={14} /> {ticket.resolvedAt}
              </strong>
            </div>
          )}
        </div>

        {/* Description Box */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ fontWeight: 600, fontSize: '0.875rem', color: '#64748b', marginBottom: '0.4rem', display: 'block' }}>
            <FileText size={15} style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} />
            Ticket Description:
          </label>
          <div style={{
            background: '#ffffff',
            padding: '1rem',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            fontSize: '0.9rem',
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap'
          }}>
            {ticket.description || 'No detailed description provided.'}
          </div>
        </div>

        {/* Attachment Box (if present) */}
        {ticket.attachment && (
          <div style={{
            marginBottom: '1.5rem',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '0.85rem 1rem'
          }}>
            <label style={{ fontWeight: 600, fontSize: '0.825rem', color: '#475569', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Paperclip size={14} color="#4f46e5" /> Attached File / Screenshot:
            </label>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {ticket.attachment.type?.startsWith('image/') ? (
                  <a href={ticket.attachment.data} target="_blank" rel="noreferrer" title="Click to view full image">
                    <img 
                      src={ticket.attachment.data} 
                      alt="Attachment Preview" 
                      style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer' }}
                    />
                  </a>
                ) : (
                  <div style={{ width: '40px', height: '40px', borderRadius: '6px', background: '#e0e7ff', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={22} />
                  </div>
                )}
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>{ticket.attachment.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {ticket.attachment.size ? `${(ticket.attachment.size / 1024).toFixed(1)} KB` : 'Attached'}
                  </div>
                </div>
              </div>

              <a
                href={ticket.attachment.data}
                download={ticket.attachment.name || 'ticket_attachment'}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
              >
                <Download size={14} />
                <span>Download / View</span>
              </a>
            </div>
          </div>
        )}

        {/* Admin Controls Form */}
        <div style={{
          borderTop: '1px solid #e2e8f0',
          paddingTop: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>IT Operations & Resolution Management</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label><UserCheck size={14} /> Assign IT Team Member</label>
              <select
                className="form-control"
                value={assignedTo}
                onChange={e => setAssignedTo(e.target.value)}
              >
                {agents.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Update Ticket Status</label>
              <select
                className="form-control"
                value={status}
                onChange={e => setStatus(e.target.value)}
              >
                <option value="Open">Open (Red)</option>
                <option value="In Progress">In Progress (Blue)</option>
                <option value="Resolved">Resolved (Green)</option>
                <option value="Closed">Closed (Dark Green)</option>
              </select>
            </div>

          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Resolution Fix Notes (Visible to user immediately in real-time)</label>
            <textarea
              className="form-control"
              value={resolutionNotes}
              onChange={e => setResolutionNotes(e.target.value)}
              placeholder="Describe how the IT issue/doubt was resolved..."
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
            <button
              onClick={handleDelete}
              className="btn btn-danger btn-sm"
            >
              <Trash2 size={15} />
              <span>Delete Ticket</span>
            </button>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleSave} disabled={isSaving} className="btn btn-success">
                <CheckCircle size={16} />
                <span>{isSaving ? 'Saving...' : 'Save & Update Ticket'}</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
