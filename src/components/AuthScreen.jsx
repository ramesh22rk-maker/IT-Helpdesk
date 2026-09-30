import React, { useState } from 'react';
import { Lock, User, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';
import logoImg from '../assets/logo.webp';

export default function AuthScreen({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!username.trim() || !password) {
      setErrorMsg('Please enter both Admin Username and Password.');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password: password.trim() })
      });
      const data = await res.json();

      if (data.success && data.user) {
        onLoginSuccess(data.user);
      } else {
        setErrorMsg(data.message || 'Invalid admin credentials');
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
      <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem 2rem' }}>
        
        {/* Company Image Logo */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: '220px',
            height: '70px',
            borderRadius: '14px',
            margin: '0 auto 1.25rem auto',
            padding: '6px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
            border: '1px solid #e2e8f0',
            background: '#ffffff'
          }}>
            <img 
              src={logoImg} 
              alt="Sujan Industries Logo" 
              style={{ maxHeight: '55px', maxWidth: '100%', objectFit: 'contain' }}
              onError={(e) => { e.target.src = '/logo.webp'; }}
            />
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0f172a', letterSpacing: '0.04em', margin: 0 }}>SIHPL</h1>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#4f46e5', marginTop: '0.2rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            IT Admin Portal
          </div>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.35rem' }}>
            Administrator Access & Helpdesk Management
          </p>
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

        {/* Admin Login Form */}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label><User size={15} /> Admin Username</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter Admin Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label><Lock size={15} /> Admin Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
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
            <span>{loading ? 'Authenticating...' : 'Login as IT Admin'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

      </div>
    </div>
  );
}
