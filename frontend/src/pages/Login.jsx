import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Cog, Eye, EyeOff, Zap } from 'lucide-react';

const Toast = ({ message, type }) => (
  <div className={`toast toast-${type}`}>
    <span>{type === 'success' ? '✓' : '✕'}</span>
    {message}
  </div>
);

const Login = () => {
  const [role, setRole] = useState('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const showToast = (message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fillDemo = () => {
    if (role === 'admin') {
      setEmail('admin@ordercraft.com');
      setPassword('Admin@123');
    } else {
      setEmail('emp1@ordercraft.com');
      setPassword('Emp@123');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) { showToast('Please fill in all fields'); return; }
    setLoading(true);
    try {
      const user = await login(email, password);
      showToast('Login successful! Redirecting...', 'success');
      setTimeout(() => navigate(user.role === 'admin' ? '/admin' : '/employee'), 800);
    } catch (err) {
      showToast(err.response?.data?.message || (err.message?.includes('Network') ? 'Cannot connect to server. Please make sure backend is running!' : 'Login failed. Check credentials.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0e1a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      {toast && <Toast {...toast} />}

      {/* Animated background */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        {/* Grid pattern */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(rgba(0,212,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,212,255,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }} />
        {/* Gradient blobs */}
        <div style={{ position: 'absolute', top: '15%', left: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,255,0.07) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,255,136,0.05) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 800, height: 800, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,153,204,0.04) 0%, transparent 70%)' }} />
        
        {/* Floating particles */}
        {[...Array(12)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${(i * 8.3) % 100}%`,
            bottom: '-20px',
            width: i % 3 === 0 ? 4 : 2,
            height: i % 3 === 0 ? 4 : 2,
            borderRadius: '50%',
            background: i % 2 === 0 ? '#00d4ff' : '#00ff88',
            animation: `moveParticle ${6 + i * 1.2}s linear ${i * 0.5}s infinite`,
            opacity: 0.6,
          }} />
        ))}

        {/* Industrial elements */}
        <div style={{ position: 'absolute', top: 40, left: 40, opacity: 0.15, animation: 'rotate 20s linear infinite' }}>
          <Cog size={80} color="#00d4ff" />
        </div>
        <div style={{ position: 'absolute', bottom: 60, right: 60, opacity: 0.1, animation: 'rotate 15s linear infinite reverse' }}>
          <Cog size={120} color="#00ff88" />
        </div>
        <div style={{ position: 'absolute', top: '40%', right: '8%', opacity: 0.08, animation: 'rotate 25s linear infinite' }}>
          <Cog size={60} color="#00d4ff" />
        </div>
      </div>

      {/* Login card */}
      <div style={{
        background: 'rgba(17, 24, 39, 0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(0,212,255,0.2)',
        borderRadius: 20,
        padding: 40,
        width: '100%', maxWidth: 440,
        boxShadow: '0 30px 80px rgba(0,0,0,0.6), 0 0 40px rgba(0,212,255,0.08)',
        position: 'relative',
        zIndex: 10,
        animation: 'slideIn 0.4s ease',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: 'linear-gradient(135deg, #00d4ff, #0099cc)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 0 30px rgba(0,212,255,0.5)',
            animation: 'float 3s ease-in-out infinite',
          }}>
            <Cog size={32} color="#fff" style={{ animation: 'rotate 4s linear infinite' }} />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: 1 }}>OrderCraft</h1>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>Manufacturing Order Management System</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8 }}>
            <Zap size={12} color="#00ff88" />
            <span style={{ fontSize: 11, color: '#00ff88', letterSpacing: 2, textTransform: 'uppercase' }}>Industrial Grade Platform</span>
          </div>
        </div>

        {/* Role tabs */}
        <div style={{
          display: 'flex', background: 'rgba(10,14,26,0.6)',
          borderRadius: 10, padding: 4, marginBottom: 24,
          border: '1px solid #1e3a5f',
        }}>
          {['admin', 'employee'].map(r => (
            <button
              key={r}
              onClick={() => setRole(r)}
              style={{
                flex: 1, padding: '9px', borderRadius: 8,
                border: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: 13, textTransform: 'capitalize',
                transition: 'all 0.3s',
                background: role === r ? 'linear-gradient(135deg, #00d4ff, #0099cc)' : 'transparent',
                color: role === r ? '#fff' : '#94a3b8',
                boxShadow: role === r ? '0 0 15px rgba(0,212,255,0.4)' : 'none',
              }}
            >
              {r === 'admin' ? '🛡 Admin' : '👷 Employee'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@ordercraft.com"
              style={{
                width: '100%', background: 'rgba(10,14,26,0.8)',
                border: '1px solid #1e3a5f', color: '#fff',
                padding: '11px 14px', borderRadius: 10, fontSize: 14, outline: 'none',
                transition: 'border-color 0.3s',
              }}
              onFocus={e => e.target.style.borderColor = '#00d4ff'}
              onBlur={e => e.target.style.borderColor = '#1e3a5f'}
            />
          </div>
          <div style={{ marginBottom: 24, position: 'relative' }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Password</label>
            <input
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%', background: 'rgba(10,14,26,0.8)',
                border: '1px solid #1e3a5f', color: '#fff',
                padding: '11px 44px 11px 14px', borderRadius: 10, fontSize: 14, outline: 'none',
                transition: 'border-color 0.3s',
              }}
              onFocus={e => e.target.style.borderColor = '#00d4ff'}
              onBlur={e => e.target.style.borderColor = '#1e3a5f'}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              style={{ position: 'absolute', right: 12, top: 34, background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '13px',
              background: loading ? '#1e3a5f' : 'linear-gradient(135deg, #00d4ff, #0099cc)',
              color: '#fff', border: 'none', borderRadius: 10,
              fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 0 25px rgba(0,212,255,0.5)',
              transition: 'all 0.3s',
              letterSpacing: 1,
            }}
          >
            {loading ? 'Authenticating...' : '⚡ Login to OrderCraft'}
          </button>
        </form>

        {/* Demo credentials */}
        <div style={{
          marginTop: 16, padding: 12,
          background: 'rgba(0,212,255,0.05)', borderRadius: 8,
          border: '1px solid rgba(0,212,255,0.15)',
          textAlign: 'center',
        }}>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>Demo: </span>
          <button onClick={fillDemo} style={{ background: 'none', border: 'none', color: '#00d4ff', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
            Fill {role} credentials
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#94a3b8' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#00d4ff', textDecoration: 'none', fontWeight: 600 }}>Register here</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

