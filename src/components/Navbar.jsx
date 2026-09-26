import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  ListFilter, 
  BarChart3, 
  History, 
  LayoutDashboard, 
  LogOut,
  Search,
  Wifi,
  CheckSquare
} from 'lucide-react';
import logoImg from '../assets/logo.webp';

export default function Navbar({ user, activeTab, setActiveTab, stats, onLogout }) {
  const [lanInfo, setLanInfo] = useState({ lanIP: '', lanURL: '' });

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        if (data.lanIP) {
          setLanInfo({ lanIP: data.lanIP, lanURL: data.lanURL });
        }
      })
      .catch(err => console.error(err));
  }, []);

  const isAdmin = user?.role === 'admin';

  // Admin Navigation
  const adminNavItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'tickets', label: 'All Tickets Queue', icon: ListFilter, badge: stats?.open || 0 },
    { id: 'submit', label: 'Raise IT Ticket', icon: PlusCircle },
    { id: 'work-tracker', label: 'Work Tracker & Updates', icon: CheckSquare },
    { id: 'reports', label: 'Management Reports & Analytics', icon: BarChart3 },
    { id: 'activity', label: 'Activity Audit Log', icon: History }
  ];

  // User Navigation
  const userNavItems = [
    { id: 'submit', label: 'Raise IT Ticket', icon: PlusCircle },
    { id: 'my-tickets', label: 'Track & My Ticket History', icon: Search },
    { id: 'work-tracker', label: 'Work Tracker & Updates', icon: CheckSquare }
  ];

  const navItems = isAdmin ? adminNavItems : userNavItems;

  return (
    <header className="glass-panel" style={{ padding: '0.85rem 1.5rem', marginBottom: '1.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Brand Image Logo */}
        <div 
          onClick={() => setActiveTab(isAdmin ? 'dashboard' : 'submit')} 
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
        >
          <div style={{
            height: '44px',
            padding: '2px 8px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
            border: '1px solid #cbd5e1',
            background: '#ffffff'
          }}>
            <img 
              src={logoImg} 
              alt="Sujan Industries Logo" 
              style={{ height: '36px', maxWidth: '160px', objectFit: 'contain' }}
              onError={(e) => { e.target.src = '/logo.webp'; }}
            />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, lineHeight: 1.1, color: '#0f172a' }}>SIHPL Helpdesk</h1>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
              {isAdmin ? 'Company LAN Operations Portal' : 'User IT Support Portal'}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  padding: '0.55rem 0.95rem',
                  fontSize: '0.85rem',
                  borderRadius: '10px'
                }}
              >
                <Icon size={16} />
                <span>{item.label}</span>
                {item.badge > 0 && (
                  <span style={{
                    background: isActive ? 'rgba(255, 255, 255, 0.3)' : 'var(--accent-rose)',
                    color: 'white',
                    borderRadius: '999px',
                    padding: '0.1rem 0.45rem',
                    fontSize: '0.7rem',
                    fontWeight: 700
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* LAN IP Badge, User Profile & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          
          {lanInfo.lanIP && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.75rem',
              background: '#dcfce7',
              border: '1px solid #bbf7d0',
              borderRadius: '999px',
              fontSize: '0.75rem',
              color: '#15803d',
              fontWeight: 700
            }} title={`Share this link with your 50 LAN PCs: ${lanInfo.lanURL}`}>
              <Wifi size={13} />
              <span>LAN: {lanInfo.lanIP}:5000</span>
            </div>
          )}

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.75rem',
            background: '#f8fafc',
            borderRadius: '999px',
            border: '1px solid #e2e8f0',
            fontSize: '0.825rem'
          }}>
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: isAdmin ? '#7c3aed' : '#4f46e5',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 700
            }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontWeight: 600, color: '#0f172a' }}>{user.name}</span>
            <span className={`badge ${isAdmin ? 'badge-urgent' : 'badge-low'}`} style={{ fontSize: '0.65rem' }}>
              {isAdmin ? 'ADMIN' : 'USER'}
            </span>
          </div>

          <button
            onClick={onLogout}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.45rem 0.75rem', color: '#e11d48' }}
            title="Logout"
          >
            <LogOut size={15} />
            <span>Logout</span>
          </button>

        </div>

      </div>
    </header>
  );
}
