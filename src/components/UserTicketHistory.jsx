import React, { useState, useEffect } from 'react';
import { Search, Clock, CheckCircle2, AlertCircle, RefreshCw, User, Mail, Tag, Filter } from 'lucide-react';

const SAVED_PROFILE_KEY = 'it_helpdesk_saved_profile';
const MY_TICKETS_KEY = 'it_helpdesk_my_tickets';

export default function UserTicketHistory({ user, onRaiseTicketClick }) {
  const [userTickets, setUserTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchId, setSearchId] = useState('');
  const [trackedTicket, setTrackedTicket] = useState(null);
  const [trackError, setTrackError] = useState('');
  
  // Requester Name / Email search filter
  const [nameFilter, setNameFilter] = useState(() => {
    try {
      const saved = localStorage.getItem(SAVED_PROFILE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.requesterName || user?.name || '';
      }
    } catch (e) {}
    return user?.name || '';
  });

  const fetchMyTickets = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const queryName = nameFilter.trim() || user?.name || '';
      const queryEmail = user?.email || '';

      // If we have a query name or email, fetch by name/email
      let res;
      if (queryName || queryEmail) {
        res = await fetch(`/api/tickets/my?name=${encodeURIComponent(queryName)}&email=${encodeURIComponent(queryEmail)}`);
      } else {
        // Otherwise check if we have saved local ticket IDs
        const savedIds = JSON.parse(localStorage.getItem(MY_TICKETS_KEY) || '[]');
        if (savedIds.length > 0) {
          // Fetch all and filter by saved IDs
          const allRes = await fetch('/api/tickets');
          const allData = await allRes.json();
          if (allData.success) {
            const filtered = allData.data.filter(t => savedIds.includes(t.id));
            setUserTickets(filtered);
            setLoading(false);
            return;
          }
        }
        res = await fetch(`/api/tickets/my?name=&email=`);
      }

      const data = await res.json();
      if (data.success) {
        setUserTickets(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Live real-time polling so user sees ticket updates instantly when admin saves status/resolution!
  useEffect(() => {
    fetchMyTickets(true);

    const timer = setInterval(() => {
      fetchMyTickets(false);
    }, 3500);

    return () => clearInterval(timer);
  }, [nameFilter, user]);

  const handleTrackSearch = async (e) => {
    e?.preventDefault();
    if (!searchId.trim()) return;

    setTrackError('');
    setTrackedTicket(null);

    try {
      const res = await fetch(`/api/tickets/${searchId.trim()}`);
      const data = await res.json();
      if (data.success) {
        setTrackedTicket(data.data);
      } else {
        setTrackError(`No ticket found matching ID '${searchId}'. Please check your ticket number.`);
      }
    } catch (err) {
      setTrackError('Error connecting to ticket tracking server.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Search / Track Ticket Card */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Search size={22} color="var(--accent-primary)" />
          <span>Track Ticket Status by Ticket ID</span>
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
          Enter your unique Ticket ID (e.g. <code>TK-1001</code>) to check live real-time status, assigned IT agent, and resolution fix notes.
        </p>

        <form onSubmit={handleTrackSearch} style={{ display: 'flex', gap: '0.75rem', maxWidth: '600px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '2.25rem' }}
              placeholder="Enter Ticket ID (e.g. TK-1001)..."
              value={searchId}
              onChange={e => setSearchId(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Track Ticket
          </button>
        </form>

        {trackError && (
          <div style={{
            background: '#ffe4e6',
            color: '#dc2626',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            marginTop: '1rem',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={16} />
            <span>{trackError}</span>
          </div>
        )}

        {/* Tracked Ticket Detail Result */}
        {trackedTicket && (
          <div style={{
            marginTop: '1.5rem',
            background: '#f8fafc',
            borderRadius: '12px',
            padding: '1.25rem',
            border: '1px solid var(--accent-primary)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontWeight: 800, color: 'var(--accent-primary)', fontSize: '1.1rem' }}>
                  {trackedTicket.id}
                </span>
                <span className={`badge badge-${trackedTicket.status.toLowerCase().replace(' ', '-')}`}>
                  {trackedTicket.status}
                </span>
                <span className={`badge badge-${trackedTicket.priority.toLowerCase()}`}>
                  {trackedTicket.priority} Priority
                </span>
              </div>

              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Category: <strong>{trackedTicket.category}</strong>
              </span>
            </div>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{trackedTicket.title}</h3>

            <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.75rem' }}>
              Created Date & Time: <strong>{trackedTicket.createdAt}</strong> • Requester: <strong>{trackedTicket.requesterName} ({trackedTicket.department})</strong>
            </div>

            {trackedTicket.assignedTo && trackedTicket.assignedTo !== 'Unassigned' && (
              <div style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 600, marginBottom: '0.75rem' }}>
                Assigned IT Support: <strong>{trackedTicket.assignedTo}</strong>
              </div>
            )}

            {trackedTicket.resolutionNotes && (
              <div style={{
                background: '#dcfce7',
                border: '1px solid #bbf7d0',
                color: '#15803d',
                borderRadius: '8px',
                padding: '0.85rem',
                fontSize: '0.875rem',
                marginTop: '0.75rem'
              }}>
                <div style={{ fontWeight: 700, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <CheckCircle2 size={16} /> IT Fix Resolution Notes:
                </div>
                <div>{trackedTicket.resolutionNotes}</div>
                {trackedTicket.resolvedAt && (
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>
                    Resolved date & time: {trackedTicket.resolvedAt}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* My Submitted Ticket History List */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>My Ticket History (Live Real-Time Updates)</h2>
            <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>
              Showing tickets submitted {nameFilter ? `under "${nameFilter}"` : 'from this browser session'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button onClick={() => fetchMyTickets(true)} className="btn btn-secondary btn-sm">
              <RefreshCw size={14} />
              <span>Refresh</span>
            </button>
            <button onClick={onRaiseTicketClick} className="btn btn-primary btn-sm">
              <span>+ Raise New IT Ticket</span>
            </button>
          </div>
        </div>

        {/* Filter by Requester Name Box */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: '#f8fafc',
          padding: '0.75rem 1rem',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          marginBottom: '1.25rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#475569', fontSize: '0.85rem', fontWeight: 600 }}>
            <User size={15} /> Filter by Your Name:
          </div>
          <div style={{ flex: 1, minWidth: '220px' }}>
            <input
              type="text"
              className="form-control"
              style={{ fontSize: '0.85rem', padding: '0.4rem 0.75rem', height: 'auto' }}
              placeholder="Type your name to view your tickets..."
              value={nameFilter}
              onChange={e => setNameFilter(e.target.value)}
            />
          </div>
          {nameFilter && (
            <button
              onClick={() => setNameFilter('')}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
            >
              Clear Filter
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
            Loading ticket history...
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Creation Date & Time</th>
                  <th>Requester</th>
                  <th>Issue Summary</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Assigned Agent</th>
                  <th>IT Fix Resolution Notes</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {userTickets.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                      {nameFilter 
                        ? `No tickets found under name "${nameFilter}". You can raise a new ticket or search by Ticket ID above.`
                        : 'No submitted tickets recorded yet. Click "+ Raise New IT Ticket" or enter your Name above to load your tickets.'}
                    </td>
                  </tr>
                ) : (
                  userTickets.map(t => (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{t.id}</td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.825rem', color: '#64748b' }}>
                          <Clock size={13} />
                          <span>{t.createdAt}</span>
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{t.requesterName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{t.department}</div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 600 }}>{t.title}</div>
                        <div style={{ fontSize: '0.775rem', color: '#64748b' }}>{t.description}</div>
                      </td>

                      <td>
                        <span style={{ background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', color: '#334155' }}>
                          {t.category}
                        </span>
                      </td>

                      <td>
                        <span className={`badge badge-${t.priority.toLowerCase()}`}>
                          {t.priority}
                        </span>
                      </td>

                      <td style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                        {t.assignedTo}
                      </td>

                      <td style={{ fontSize: '0.825rem', maxWidth: '280px' }}>
                        {t.resolutionNotes ? (
                          <div style={{ color: '#16a34a', fontWeight: 600 }}>
                            {t.resolutionNotes}
                          </div>
                        ) : (
                          <span style={{ color: '#64748b', fontStyle: 'italic' }}>
                            {t.status === 'Open' ? 'Pending IT agent pickup' : 'Being worked on'}
                          </span>
                        )}
                      </td>

                      <td>
                        <span className={`badge badge-${t.status.toLowerCase().replace(' ', '-')}`}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
