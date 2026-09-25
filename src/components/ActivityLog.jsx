import React, { useState } from 'react';
import { History, Download, Search, Clock, ShieldCheck, Tag, FileText } from 'lucide-react';
import { downloadActivityCSV } from '../utils/csvExporter';

export default function ActivityLog({ activities }) {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('All');

  const actionTypes = [
    'All',
    'TICKET_CREATED',
    'STATUS_UPDATED',
    'AGENT_ASSIGNED',
    'TICKET_RESOLVED',
    'TICKET_DELETED',
    'REPORT_DOWNLOADED'
  ];

  const filteredActivities = activities.filter(a => {
    const matchesSearch = 
      a.id.toLowerCase().includes(search.toLowerCase()) ||
      a.actor.toLowerCase().includes(search.toLowerCase()) ||
      a.details.toLowerCase().includes(search.toLowerCase()) ||
      a.ticketId.toLowerCase().includes(search.toLowerCase());

    const matchesAction = actionFilter === 'All' || a.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  const handleExportCSV = () => {
    downloadActivityCSV(filteredActivities, `IT_Helpdesk_Activity_Log_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const getActionBadgeClass = (action) => {
    switch (action) {
      case 'TICKET_CREATED': return 'badge-open';
      case 'TICKET_RESOLVED': return 'badge-resolved';
      case 'STATUS_UPDATED': return 'badge-in-progress';
      case 'AGENT_ASSIGNED': return 'badge-medium';
      case 'REPORT_DOWNLOADED': return 'badge-closed';
      case 'TICKET_DELETED': return 'badge-urgent';
      default: return 'badge-low';
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1.75rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <History size={22} color="var(--accent-primary)" />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>System Activity Audit Log</h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Timestamped record of every ticket submission, agent assignment, resolution update, and management export.
          </p>
        </div>

        <button onClick={handleExportCSV} className="btn btn-secondary btn-sm">
          <Download size={15} />
          <span>Export Audit Log CSV</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem',
        background: 'var(--bg-secondary)',
        padding: '1rem',
        borderRadius: '12px',
        border: '1px solid var(--border-color)'
      }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '2.25rem' }}
            placeholder="Search activity log..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <select
          className="form-control"
          value={actionFilter}
          onChange={e => setActionFilter(e.target.value)}
        >
          {actionTypes.map(type => (
            <option key={type} value={type}>
              Action: {type.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      {/* Activity Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Log ID</th>
              <th>Timestamp (Date & Time)</th>
              <th>Ticket Ref</th>
              <th>Action Type</th>
              <th>User / Actor</th>
              <th>Activity Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredActivities.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No activity log entries found.
                </td>
              </tr>
            ) : (
              filteredActivities.map(act => (
                <tr key={act.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.825rem' }}>
                    {act.id}
                  </td>

                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}>
                      <Clock size={13} color="var(--accent-cyan)" />
                      <span>{act.timestamp}</span>
                    </div>
                  </td>

                  <td style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>
                    {act.ticketId}
                  </td>

                  <td>
                    <span className={`badge ${getActionBadgeClass(act.action)}`}>
                      {act.action.replace('_', ' ')}
                    </span>
                  </td>

                  <td style={{ fontWeight: 600 }}>
                    {act.actor}
                  </td>

                  <td style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>
                    {act.details}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
