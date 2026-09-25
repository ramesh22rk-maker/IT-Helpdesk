import React, { useState } from 'react';
import { User, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import logoImg from '../assets/logo.webp';

export default function AuthScreen({ onLoginSuccess }) {
  const [activeTab, setActiveTab] = useState('user'); // 'user' or 'admin'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!username.trim() || !password) {
      setErrorMsg('Please enter both Username and Password.');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (data.success) {
        onLoginSuccess(data.user);
      } else {
        setErrorMsg(data.message || 'Invalid credentials');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to connect to authentication server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      background: 'radial-gradient(circle at 50% 30%, rgba(79, 70, 229, 0.06) 0%, transparent 60%)'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '460px', padding: '2.5rem 2rem' }}>
        
        {/* Company Image Logo */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: '90px',
            height: '90px',
            borderRadius: '20px',
            margin: '0 auto 1rem auto',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 25px rgba(79, 70, 229, 0.2)',
            border: '2px solid #e2e8f0',
            background: '#ffffff'
          }}>
            <img 
              src={logoImg} 
              alt="IT Helpdesk Logo" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => { e.target.src = '/logo.webp'; }}
            />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>IT HELPDESK SYSTEM</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Company LAN Operations & User Support Portal
          </p>
        </div>

        {/* Tab Switcher (ONLY User Login and Admin Login) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.5rem',
          background: '#f8fafc',
          padding: '0.35rem',
          borderRadius: '12px',
          marginBottom: '1.5rem',
          border: '1px solid #e2e8f0'
        }}>
          <button
            onClick={() => { setActiveTab('user'); setErrorMsg(''); }}
            className={`btn ${activeTab === 'user' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.875rem', padding: '0.6rem', justifyContent: 'center' }}
          >
            User Login
          </button>
          <button
            onClick={() => { setActiveTab('admin'); setErrorMsg(''); }}
            className={`btn ${activeTab === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.875rem', padding: '0.6rem', justifyContent: 'center' }}
          >
            Admin Login
          </button>
        </div>

        {/* Login Credentials Notice Box */}
        <div style={{
          background: 'rgba(79, 70, 229, 0.08)',
          border: '1px solid rgba(79, 70, 229, 0.2)',
          borderRadius: '10px',
          padding: '0.85rem 1rem',
          marginBottom: '1.25rem',
          fontSize: '0.825rem',
          color: '#334155'
        }}>
          <div style={{ fontWeight: 700, color: '#4f46e5', marginBottom: '0.25rem' }}>
            🔑 System Login Credentials:
          </div>
          {activeTab === 'admin' ? (
            <div>
              <strong>Admin Username:</strong> <code style={{ background: '#e0e7ff', padding: '1px 5px', borderRadius: '4px', color: '#3730a3' }}>Admin.rk</code><br/>
              <strong>Password:</strong> <code style={{ background: '#e0e7ff', padding: '1px 5px', borderRadius: '4px', color: '#3730a3' }}>admin@rk06</code>
            </div>
          ) : (
            <div>
              <strong>Your Name:</strong> <span style={{ color: '#475569' }}>Any Name (e.g. Standard User)</span><br/>
              <strong>Password:</strong> <code style={{ background: '#e0e7ff', padding: '1px 5px', borderRadius: '4px', color: '#3730a3' }}>user@123</code>
            </div>
          )}
        </div>

        {/* Error Alert Box */}
        {errorMsg && (
          <div style={{
            background: '#ffe4e6',
            border: '1px solid #fecdd3',
            color: '#dc2626',
            borderRadius: '10px',
            padding: '0.85rem 1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* User / Admin Login Form */}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label><User size={15} /> {activeTab === 'admin' ? 'Admin Username' : 'Your Name'}</label>
            <input
              type="text"
              className="form-control"
              placeholder=""
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label><Lock size={15} /> Password</label>
            <input
              type="password"
              className="form-control"
              placeholder=""
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', fontSize: '1rem', justifyContent: 'center' }}
          >
            <span>{loading ? 'Authenticating...' : `Login as ${activeTab === 'admin' ? 'IT Admin' : 'User'}`}</span>
            <ArrowRight size={18} />
          </button>
        </form>

      </div>
    </div>
  );
}
