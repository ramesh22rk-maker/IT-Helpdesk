import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  ListFilter, 
  BarChart3, 
  History, 
  LayoutDashboard, 
  LogOut, 
  Search, 
  Globe, 
  CheckSquare,
  Lock
} from 'lucide-react';
import logoImg from '../assets/logo.webp';

export default function Navbar({ user, activeTab, setActiveTab, stats, onLogout, onOpenAdminLogin }) {


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
    <>
      <header className="glass-panel" style={{ padding: '0.85rem 1.5rem', marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          
          {/* Brand Image Logo & Title Section */}
          <div 
            onClick={() => setActiveTab(isAdmin ? 'dashboard' : 'submit')} 
            className="brand-container"
            style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', cursor: 'pointer', userSelect: 'none' }}
            title="SIHPL IT Helpdesk"
          >
            <div className="brand-logo-box" style={{
              height: '46px',
              padding: '3px 10px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              transition: 'all 0.2s ease'
            }}>
              <img 
                src={logoImg} 
                alt="Sujan Industries Logo" 
                style={{ height: '36px', maxWidth: '165px', objectFit: 'contain' }}
                onError={(e) => { e.target.src = '/logo.webp'; }}
              />
            </div>

            {/* Elegant Divider */}
            <div style={{
              height: '30px',
              width: '1.5px',
              background: '#cbd5e1',
              borderRadius: '999px',
              opacity: 0.8
            }} />

            {/* Titles: SIHPL on top, IT Helpdesk below */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h1 style={{ 
                fontSize: '1.35rem', 
                fontWeight: 900, 
                lineHeight: 1.05, 
                color: '#0f172a',
                letterSpacing: '0.04em',
                margin: 0
              }}>
                SIHPL
              </h1>
              <div style={{ 
                fontSize: '0.8rem', 
                fontWeight: 700, 
                color: '#4f46e5',
                letterSpacing: '0.05em',
                lineHeight: 1.2,
                marginTop: '2px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}>
                <span>IT Helpdesk</span>
                <span style={{
                  display: 'inline-block',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#10b981'
                }} />
              </div>
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

          {/* User Profile & Login/Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            
            {isAdmin ? (
              <>
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
                    background: '#7c3aed',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}>
                    {user?.name?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{user?.name || 'IT Admin'}</span>
                  <span className="badge badge-urgent" style={{ fontSize: '0.65rem' }}>
                    ADMIN
                  </span>
                </div>

                <button
                  onClick={onLogout}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '0.45rem 0.75rem', color: '#e11d48' }}
                  title="Logout from Admin Mode"
                >
                  <LogOut size={15} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <button
                onClick={onOpenAdminLogin}
                className="btn btn-primary btn-sm"
                style={{
                  padding: '0.45rem 0.95rem',
                  borderRadius: '999px',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)'
                }}
                title="IT Admin Login"
              >
                <Lock size={14} />
                <span>Admin Login</span>
              </button>
            )}

          </div>

        </div>
      </header>
    </>
  );
}
