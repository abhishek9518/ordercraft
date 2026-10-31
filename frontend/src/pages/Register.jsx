import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Cog, Eye, EyeOff } from 'lucide-react';

const Toast = ({ message, type }) => (
  <div className={`toast toast-${type}`}>
    <span>{type === 'success' ? '✓' : '✕'}</span>
    {message}
  </div>
);

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'employee', department: '', phone: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { showToast('Please fill in all required fields'); return; }
    if (form.password !== form.confirmPassword) { showToast('Passwords do not match'); return; }
    if (form.password.length < 6) { showToast('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await axios.post('/api/auth/register', form);
      showToast('Account created successfully! Redirecting to login...', 'success');
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      showToast(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', background: 'rgba(10,14,26,0.8)',
    border: '1px solid #1e3a5f', color: '#fff',
    padding: '11px 14px', borderRadius: 10, fontSize: 14, outline: 'none',
  };
  const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0e1a', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', padding: 20 }}>
      {toast && <Toast {...toast} />}

      {/* Background */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0,212,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.04) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div style={{ position: 'absolute', top: '20%', right: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,255,136,0.06) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '15%', left: '10%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', top: 30, right: 30, opacity: 0.1, animation: 'rotate 18s linear infinite' }}>
          <Cog size={90} color="#00ff88" />
        </div>
        <div style={{ position: 'absolute', bottom: 30, left: 30, opacity: 0.08, animation: 'rotate 22s linear infinite reverse' }}>
          <Cog size={70} color="#00d4ff" />
        </div>
      </div>

      <div style={{
        background: 'rgba(17,24,39,0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(0,212,255,0.2)',
        borderRadius: 20, padding: 40,
        width: '100%', maxWidth: 500,
        boxShadow: '0 30px 80px rgba(0,0,0,0.6), 0 0 40px rgba(0,212,255,0.08)',
        position: 'relative', zIndex: 10,
        animation: 'slideIn 0.4s ease',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg, #00ff88, #00cc66)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 0 25px rgba(0,255,136,0.5)' }}>
            <Cog size={28} color="#0a0e1a" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>Create Account</h1>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>Join OrderCraft Manufacturing Platform</p>
        </div>

        <form onSubmit={handleRegister}>
          <div className="grid-2" style={{ marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Full Name *</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="John Doe" style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#00d4ff'} onBlur={e => e.target.style.borderColor = '#1e3a5f'} />
            </div>
            <div>
              <label style={labelStyle}>Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 9876543210" style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#00d4ff'} onBlur={e => e.target.style.borderColor = '#1e3a5f'} />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Email Address *</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="john@company.com" style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#00d4ff'} onBlur={e => e.target.style.borderColor = '#1e3a5f'} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Role *</label>
            <select name="role" value={form.role} onChange={handleChange} style={{ ...inputStyle }}>
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {form.role === 'employee' && (
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Department</label>
              <select name="department" value={form.department} onChange={handleChange} style={{ ...inputStyle }}>
                <option value="">Select Department</option>
                <option value="production">Production</option>
                <option value="assembly">Assembly</option>
                <option value="quality">Quality Control</option>
                <option value="logistics">Logistics</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          )}

          <div className="grid-2" style={{ marginBottom: 24 }}>
            <div>
              <label style={labelStyle}>Password *</label>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange}
                  placeholder="Min 6 chars" style={{ ...inputStyle, paddingRight: 40 }}
                  onFocus={e => e.target.style.borderColor = '#00d4ff'} onBlur={e => e.target.style.borderColor = '#1e3a5f'} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 10, top: 12, background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Confirm Password *</label>
              <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange}
                placeholder="Repeat password" style={{ ...inputStyle }}
                onFocus={e => e.target.style.borderColor = '#00d4ff'} onBlur={e => e.target.style.borderColor = '#1e3a5f'} />
            </div>
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: 13,
            background: loading ? '#1e3a5f' : 'linear-gradient(135deg, #00ff88, #00cc66)',
            color: loading ? '#94a3b8' : '#0a0e1a', border: 'none', borderRadius: 10,
            fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? 'none' : '0 0 25px rgba(0,255,136,0.4)',
            letterSpacing: 1,
          }}>
            {loading ? 'Creating Account...' : '🚀 Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#94a3b8' }}>
          Already have an account?{' '}
          <Link to="/" style={{ color: '#00d4ff', textDecoration: 'none', fontWeight: 600 }}>Login here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
