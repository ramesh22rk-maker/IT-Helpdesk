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
  Database,
  CheckCircle2,
  AlertTriangle,
  X,
  Copy,
  Check,
  Server,
  Lock
} from 'lucide-react';
import logoImg from '../assets/logo.webp';

export default function Navbar({ user, activeTab, setActiveTab, stats, onLogout, onOpenAdminLogin }) {
  const [dbStatus, setDbStatus] = useState(null);
  const [showDbModal, setShowDbModal] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  const fetchDbStatus = () => {
    fetch('/api/db-status')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setDbStatus(data.data);
        }
      })
      .catch(err => console.error('Error fetching DB status:', err));
  };

  useEffect(() => {
    fetchDbStatus();
    const interval = setInterval(fetchDbStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

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

          {/* DB Status Pill, User Profile & Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            
            {/* Database Persistence Status Badge */}
            <div 
              onClick={() => setShowDbModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.35rem 0.75rem',
                background: dbStatus?.isCloudPersistent ? '#ecfdf5' : '#fffbeb',
                border: dbStatus?.isCloudPersistent ? '1px solid #a7f3d0' : '1px solid #fde68a',
                borderRadius: '999px',
                fontSize: '0.75rem',
                color: dbStatus?.isCloudPersistent ? '#065f46' : '#92400e',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }} 
              title="Click to view Database Persistence Status"
            >
              <Database size={13} color={dbStatus?.isCloudPersistent ? '#059669' : '#d97706'} />
              <span>
                {dbStatus?.isCloudPersistent 
                  ? (dbStatus.engine === 'postgres' ? 'Cloud PostgreSQL Live' : (dbStatus.engine === 'mongodb' ? 'Cloud MongoDB Live' : 'Persistent Storage Live'))
                  : 'Storage Settings'}
              </span>
            </div>

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

      {/* Database Persistence Info Modal */}
      {showDbModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1.5rem'
        }}>
          <div className="glass-panel" style={{
            background: '#ffffff',
            borderRadius: '16px',
            maxWidth: '620px',
            width: '100%',
            padding: '2rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            border: '1px solid #e2e8f0',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowDbModal(false)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b'
              }}
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{
                background: dbStatus?.isCloudPersistent ? '#dcfce7' : '#fef3c7',
                padding: '0.6rem',
                borderRadius: '12px',
                color: dbStatus?.isCloudPersistent ? '#16a34a' : '#d97706'
              }}>
                <Server size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>Database & Data Persistence</h3>
                <div style={{ fontSize: '0.825rem', color: '#64748b', marginTop: '2px' }}>
                  Ensure your tickets and reports are preserved across all days and server restarts
                </div>
              </div>
            </div>

            {/* Current Engine Status */}
            <div style={{
              background: dbStatus?.isCloudPersistent ? '#f0fdf4' : '#fffbeb',
              border: `1px solid ${dbStatus?.isCloudPersistent ? '#bbf7d0' : '#fde68a'}`,
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '1.25rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                {dbStatus?.isCloudPersistent ? (
                  <CheckCircle2 size={18} color="#16a34a" />
                ) : (
                  <AlertTriangle size={18} color="#d97706" />
                )}
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: dbStatus?.isCloudPersistent ? '#15803d' : '#92400e' }}>
                  {dbStatus?.isCloudPersistent ? 'Cloud Persistent Storage Active' : 'Ephemeral Local Storage Detected'}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.825rem', color: '#475569', lineHeight: 1.5 }}>
                {dbStatus?.statusMessage}
              </p>
            </div>

            {/* Records Summary */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.75rem',
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}>
              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#4f46e5' }}>{dbStatus?.counts?.tickets || 0}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Tickets Saved</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#059669' }}>{dbStatus?.counts?.workItems || 0}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Work Items</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#d97706' }}>{dbStatus?.counts?.activity || 0}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Activity Logs</div>
              </div>
            </div>

            {/* How to ensure 100% Persistence on Render */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', marginBottom: '0.5rem' }}>
                💡 How to make all data permanent on Render:
              </div>
              <ol style={{ fontSize: '0.825rem', color: '#334155', paddingLeft: '1.25rem', margin: 0, lineHeight: 1.6 }}>
                <li>
                  Create a free cloud database on <strong>Neon.tech</strong> (PostgreSQL) or <strong>Render PostgreSQL</strong> or <strong>MongoDB Atlas</strong>.
                </li>
                <li>
                  Copy your Database Connection URI (e.g. <code>postgresql://...</code>).
                </li>
                <li>
                  In your Render Dashboard &rarr; Environment &rarr; add variable:
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem', marginBottom: '0.35rem' }}>
                    <code style={{ background: '#f1f5f9', padding: '0.25rem 0.5rem', borderRadius: '6px', fontWeight: 700, color: '#4f46e5' }}>
                      DATABASE_URL
                    </code>
                    <button
                      onClick={() => handleCopy('DATABASE_URL', 'key')}
                      style={{
                        padding: '0.2rem 0.5rem',
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      {copiedKey === 'key' ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
                      <span>{copiedKey === 'key' ? 'Copied' : 'Copy Key'}</span>
                    </button>
                  </div>
                </li>
                <li>
                  Save changes. Render will automatically link to PostgreSQL and permanently keep every ticket, work update, and report up-to-date forever!
                </li>
              </ol>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowDbModal(false)}
                className="btn btn-primary"
                style={{ padding: '0.55rem 1.25rem' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
