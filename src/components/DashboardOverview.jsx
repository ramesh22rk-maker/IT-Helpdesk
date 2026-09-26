import React from 'react';
import { 
  Headphones, 
  ListFilter, 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';

export default function DashboardOverview({ stats, tickets, activities, setActiveTab }) {
  if (!stats) return null;

  const recentTickets = tickets.slice(0, 5);
  const recentActivities = activities.slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Admin Hero Banner */}
      <div className="glass-panel" style={{
        padding: '2.25rem 2rem',
        background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.06) 0%, rgba(8, 145, 178, 0.06) 100%)',
        border: '1px solid #cbd5e1',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '750px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.3rem 0.8rem',
            background: '#e0e7ff',
            borderRadius: '999px',
            fontSize: '0.8rem',
            color: '#3730a3',
            fontWeight: 700,
            marginBottom: '0.85rem'
          }}>
            <ShieldCheck size={14} />
            <span>IT Support Administration Operations</span>
          </div>

          <h2 style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '0.5rem', color: '#0f172a' }}>
            SIHPL IT Operations & Management Overview
          </h2>

          <p style={{ color: '#64748b', fontSize: '0.975rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            Oversee user support requests, manage ticket resolutions, generate executive management reports, and track system activity logs.
          </p>

          {/* Admin Hero Buttons (NO Raise Ticket button) */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button onClick={() => setActiveTab('tickets')} className="btn btn-primary">
              <ListFilter size={18} />
              <span>Manage Ticket Queue ({stats.open} Open)</span>
            </button>
            <button onClick={() => setActiveTab('reports')} className="btn btn-secondary">
              <BarChart3 size={18} />
              <span>Management Reports & Analytics</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="metrics-grid">
        
        <div className="glass-panel metric-card" style={{ '--card-accent': '#4f46e5' }}>
          <div>
            <div className="metric-title">Total Tickets Registered</div>
            <div className="metric-value">{stats.total}</div>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Creation dates & times logged</span>
          </div>
          <div className="metric-icon"><Headphones size={24} /></div>
        </div>

        <div className="glass-panel metric-card" style={{ '--card-accent': '#059669' }}>
          <div>
            <div className="metric-title">Resolved & Solved</div>
            <div className="metric-value" style={{ color: '#059669' }}>{stats.resolved}</div>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{stats.resolutionRate}% resolution rate</span>
          </div>
          <div className="metric-icon" style={{ color: '#059669' }}><CheckCircle2 size={24} /></div>
        </div>

        <div className="glass-panel metric-card" style={{ '--card-accent': '#2563eb' }}>
          <div>
            <div className="metric-title">Open Tickets</div>
            <div className="metric-value" style={{ color: '#2563eb' }}>{stats.open}</div>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Pending assignment</span>
          </div>
          <div className="metric-icon" style={{ color: '#2563eb' }}><Clock size={24} /></div>
        </div>

        <div className="glass-panel metric-card" style={{ '--card-accent': '#7c3aed' }}>
          <div>
            <div className="metric-title">In Progress</div>
            <div className="metric-value" style={{ color: '#7c3aed' }}>{stats.inProgress}</div>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Agent active resolution</span>
          </div>
          <div className="metric-icon" style={{ color: '#7c3aed' }}><TrendingUp size={24} /></div>
        </div>

      </div>

      {/* Two Column Grid: Recent Tickets & Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem' }}>
        
        {/* Recent Tickets Card */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Recent Registered Tickets</h3>
            <button
              onClick={() => setActiveTab('tickets')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--accent-primary)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              Manage All <ArrowRight size={14} />
            </button>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Created At</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTickets.map(t => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{t.id}</td>
                    <td style={{ fontWeight: 600, fontSize: '0.85rem' }}>{t.title}</td>
                    <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{t.createdAt}</td>
                    <td>
                      <span className={`badge badge-${t.status.toLowerCase().replace(' ', '-')}`}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity Stream */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>System Audit Activity Stream</h3>
            <button
              onClick={() => setActiveTab('activity')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--accent-primary)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              Full Log <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {recentActivities.map(act => (
              <div
                key={act.id}
                style={{
                  background: '#f8fafc',
                  padding: '0.85rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>{act.details}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                    By {act.actor} • {act.timestamp}
                  </div>
                </div>

                <span className="badge badge-low" style={{ fontSize: '0.65rem' }}>
                  {act.action.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
