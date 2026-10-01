import React, { useState } from 'react';
import { Search, Download, Clock, Filter, CheckCircle2, ChevronRight, AlertCircle, Paperclip } from 'lucide-react';
import TicketDetailModal from './TicketDetailModal';
import { downloadTicketsCSV } from '../utils/csvExporter';
import { downloadTicketsWord } from '../utils/wordExporter';
import { FileText } from 'lucide-react';

export default function TicketQueue({ tickets, onRefreshTickets }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);

  const categories = ['All', 'Finsys Related', 'Internet Related', 'Hardware/Network Related', 'Others'];
  const priorities = ['All', 'Low', 'Medium', 'High', 'Urgent'];
  const statuses = ['All', 'Open', 'In Progress', 'Resolved', 'Closed'];

  const filteredTickets = tickets.filter(t => {
    if (!t) return false;
    const s = (search || '').toLowerCase().trim();
    const matchesSearch = !s ||
      (t.id || '').toLowerCase().includes(s) ||
      (t.title || '').toLowerCase().includes(s) ||
      (t.description || '').toLowerCase().includes(s) ||
      (t.requesterName || '').toLowerCase().includes(s) ||
      (t.department || '').toLowerCase().includes(s) ||
      (t.email || '').toLowerCase().includes(s);

    const matchesStatus = statusFilter === 'All' || (t.status || '').toLowerCase() === statusFilter.toLowerCase();
    const matchesPriority = priorityFilter === 'All' || (t.priority || '').toLowerCase() === priorityFilter.toLowerCase();
    
    const cat = (t.category || '').toLowerCase();
    const matchesCategory = categoryFilter === 'All' || 
      cat === categoryFilter.toLowerCase() ||
      (categoryFilter === 'Finsys Related' && cat.includes('finsys')) ||
      (categoryFilter === 'Internet Related' && (cat.includes('internet') || cat.includes('wifi') || cat.includes('wi-fi'))) ||
      (categoryFilter === 'Hardware/Network Related' && (cat.includes('hardware') || cat.includes('network') || cat.includes('pc') || cat.includes('printer'))) ||
      (categoryFilter === 'Others' && (cat === 'others' || (!cat.includes('finsys') && !cat.includes('internet') && !cat.includes('hardware') && !cat.includes('network'))));

    const ticketDate = t.createdAt ? t.createdAt.slice(0, 10) : '';
    const matchesStartDate = !startDate || ticketDate >= startDate;
    const matchesEndDate = !endDate || ticketDate <= endDate;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesStartDate && matchesEndDate;
  });

  const handleExportCSV = () => {
    const dateLabel = (startDate || endDate) ? `_${startDate || 'Start'}_to_${endDate || 'End'}` : '';
    downloadTicketsCSV(filteredTickets, `IT_Tickets_${statusFilter}${dateLabel}.csv`);
  };

  const handleExportWord = () => {
    const dateLabel = (startDate || endDate) ? `_${startDate || 'Start'}_to_${endDate || 'End'}` : '';
    downloadTicketsWord(filteredTickets, `IT_Tickets_Report_${statusFilter}${dateLabel}.doc`);
  };

  return (
    <div className="glass-panel" style={{ padding: '1.75rem' }}>
      
      {/* Top Header & Export */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>IT Ticket Operations Queue</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
            Showing {filteredTickets.length} of {tickets.length} total registered tickets
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button onClick={handleExportWord} className="btn btn-primary btn-sm" style={{ background: '#2b579a', borderColor: '#2b579a' }}>
            <FileText size={15} />
            <span>Export Word Report (.doc)</span>
          </button>
          <button onClick={handleExportCSV} className="btn btn-secondary btn-sm">
            <Download size={15} />
            <span>Export Filtered CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem',
        background: '#f8fafc',
        padding: '1rem',
        borderRadius: '12px',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '2.25rem' }}
            placeholder="Search tickets..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <select
          className="form-control"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="All">Status: All</option>
          {statuses.filter(s => s !== 'All').map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select
          className="form-control"
          value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value)}
        >
          <option value="All">Priority: All</option>
          {priorities.filter(p => p !== 'All').map(p => <option key={p} value={p}>{p}</option>)}
        </select>

        <select
          className="form-control"
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
        >
          <option value="All">Category: All</option>
          {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <input
          type="date"
          className="form-control"
          placeholder="From Date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          title="From Date Filter"
        />

        <input
          type="date"
          className="form-control"
          placeholder="To Date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
          title="To Date Filter"
        />
      </div>

      {/* Tickets Table (Reordered: Status column after Action column) */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>Creation Date & Time</th>
              <th>Issue Title / Requester</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Assigned Agent</th>
              <th>Action</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                  No tickets found matching your filter criteria.
                </td>
              </tr>
            ) : (
              filteredTickets.map(t => {
                const isOpen = t.status === 'Open';

                return (
                  <tr key={t.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedTicket(t)}>
                    
                    {/* Ticket ID with Red Open Ticket Indicator */}
                    <td style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        {isOpen && (
                          <span 
                            title="OPEN TICKET - Requires Action"
                            style={{
                              width: '10px',
                              height: '10px',
                              borderRadius: '50%',
                              background: '#dc2626',
                              display: 'inline-block',
                              boxShadow: '0 0 8px #dc2626',
                              animation: 'pulse-border 1.5s infinite'
                            }}
                          />
                        )}
                        <span>{t.id}</span>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.825rem', color: '#64748b' }}>
                        <Clock size={13} />
                        <span>{t.createdAt}</span>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontWeight: 600 }}>{t.title}</span>
                        {t.attachment && (
                          <span title={`Attached: ${t.attachment.name || 'File'}`} style={{ color: '#4f46e5', display: 'inline-flex', alignItems: 'center' }}>
                            <Paperclip size={13} />
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.775rem', color: '#64748b' }}>
                        By {t.requesterName} ({t.department}) {t.email && `• ${t.email}`}
                      </div>
                    </td>

                    <td>
                      <span style={{
                        background: '#f1f5f9',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        color: '#334155'
                      }}>
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

                    {/* Action Column */}
                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTicket(t);
                        }}
                      >
                        <span>Manage</span>
                        <ChevronRight size={14} />
                      </button>
                    </td>

                    {/* Status Column AFTER Action Column as requested */}
                    <td>
                      <span className={`badge badge-${t.status.toLowerCase().replace(' ', '-')}`}>
                        {t.status}
                      </span>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdateTicket={() => {
            onRefreshTickets();
          }}
          onDeleteTicket={() => {
            onRefreshTickets();
          }}
        />
      )}

    </div>
  );
}
