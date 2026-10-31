import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Cog, Eye, EyeOff, CheckCircle, XCircle, Loader } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: 'employee', department: '', phone: ''
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { showToast('Please enter your full name'); return; }
    if (!form.email.trim()) { showToast('Please enter your email address'); return; }
    if (!form.password) { showToast('Please enter a password'); return; }
    if (form.password.length < 6) { showToast('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirmPassword) { showToast('Passwords do not match!'); return; }

    setLoading(true);
    try {
      const res = await axios.post('/api/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        department: form.department,
        phone: form.phone,
      });
      showToast('Account created successfully! Redirecting to login...', 'success');
      setTimeout(() => navigate('/'), 1800);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Cannot connect to server. Make sure backend is running on port 5000.';
      showToast(msg);
    } finally {
      setLoading(false);
    }
  };

  const inp = {
    width: '100%', background: 'rgba(10,14,26,0.8)',
    border: '1px solid #1e3a5f', color: '#fff',
    padding: '11px 14px', borderRadius: 10, fontSize: 14,
    outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  };
  const lbl = {
    display: 'block', fontSize: 11, fontWeight: 700,
    color: '#94a3b8', marginBottom: 6,
    textTransform: 'uppercase', letterSpacing: 1,
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0e1a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden', padding: 20,
    }}>
      {/* Background grid */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0,212,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.04) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      <div style={{ position: 'absolute', top: '20%', right: '8%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,255,136,0.07) 0%, transparent 70%)' }} />
      <div style={{ position: 'absolute', bottom: '10%', left: '8%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)' }} />
      <div style={{ position: 'absolute', top: 30, right: 30, opacity: 0.1, animation: 'rotate 18s linear infinite' }}><Cog size={90} color="#00ff88" /></div>
      <div style={{ position: 'absolute', bottom: 30, left: 30, opacity: 0.08, animation: 'rotate 22s linear infinite reverse' }}><Cog size={70} color="#00d4ff" /></div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          background: toast.type === 'success' ? '#065f46' : '#7f1d1d',
          border: `1px solid ${toast.type === 'success' ? '#10b981' : '#ef4444'}`,
          color: '#fff', padding: '14px 20px', borderRadius: 12,
          display: 'flex', alignItems: 'center', gap: 10,
          maxWidth: 360, boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
          animation: 'slideIn 0.3s ease',
          fontSize: 14, fontWeight: 600,
        }}>
          {toast.type === 'success'
            ? <CheckCircle size={18} color="#10b981" />
            : <XCircle size={18} color="#ef4444" />}
          {toast.message}
        </div>
      )}

      {/* Card */}
      <div style={{
        background: 'rgba(17,24,39,0.90)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(0,212,255,0.2)',
        borderRadius: 20, padding: '36px 40px',
        width: '100%', maxWidth: 520,
        boxShadow: '0 30px 80px rgba(0,0,0,0.6), 0 0 40px rgba(0,212,255,0.08)',
        position: 'relative', zIndex: 10,
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 60, height: 60, borderRadius: 16,
            background: 'linear-gradient(135deg, #00ff88, #00cc66)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px', boxShadow: '0 0 25px rgba(0,255,136,0.4)',
          }}>
            <Cog size={28} color="#0a0e1a" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: 0 }}>Create Account</h1>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4, marginBottom: 0 }}>
            Join OrderCraft Manufacturing Platform
          </p>
        </div>

        <form onSubmit={handleRegister}>
          {/* Name + Phone */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
            <div>
              <label style={lbl}>Full Name *</label>
              <input name="name" value={form.name} onChange={handleChange}
                placeholder="John Doe" style={inp}
                onFocus={e => e.target.style.borderColor = '#00d4ff'}
                onBlur={e => e.target.style.borderColor = '#1e3a5f'} />
            </div>
            <div>
              <label style={lbl}>Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange}
                placeholder="+91 9876543210" style={inp}
                onFocus={e => e.target.style.borderColor = '#00d4ff'}
                onBlur={e => e.target.style.borderColor = '#1e3a5f'} />
            </div>
          </div>

          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>Email Address *</label>
            <input type="email" name="email" value={form.email} onChange={handleChange}
              placeholder="john@company.com" style={inp}
              onFocus={e => e.target.style.borderColor = '#00d4ff'}
              onBlur={e => e.target.style.borderColor = '#1e3a5f'} />
          </div>

          {/* Role */}
          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>Role *</label>
            <select name="role" value={form.role} onChange={handleChange}
              style={{ ...inp, cursor: 'pointer' }}>
              <option value="employee">Employee / Staff</option>
              <option value="admin">Admin / Manager</option>
            </select>
          </div>

          {/* Department (employee only) */}
          {form.role === 'employee' && (
            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>Department</label>
              <select name="department" value={form.department} onChange={handleChange}
                style={{ ...inp, cursor: 'pointer' }}>
                <option value="">— Select Department —</option>
                <option value="Production">Production</option>
                <option value="Assembly">Assembly</option>
                <option value="Quality Control">Quality Control</option>
                <option value="Logistics">Logistics</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Procurement">Procurement</option>
              </select>
            </div>
          )}

          {/* Password + Confirm */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 26 }}>
            <div>
              <label style={lbl}>Password *</label>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} name="password"
                  value={form.password} onChange={handleChange}
                  placeholder="Min 6 chars" style={{ ...inp, paddingRight: 40 }}
                  onFocus={e => e.target.style.borderColor = '#00d4ff'}
                  onBlur={e => e.target.style.borderColor = '#1e3a5f'} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0,
                }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div>
              <label style={lbl}>Confirm Password *</label>
              <div style={{ position: 'relative' }}>
                <input type={showConfirm ? 'text' : 'password'} name="confirmPassword"
                  value={form.confirmPassword} onChange={handleChange}
                  placeholder="Repeat password" style={{ ...inp, paddingRight: 40 }}
                  onFocus={e => e.target.style.borderColor = '#00d4ff'}
                  onBlur={e => e.target.style.borderColor = '#1e3a5f'} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0,
                }}>
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {/* Password match indicator */}
              {form.confirmPassword && (
                <div style={{ marginTop: 6, fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                  {form.password === form.confirmPassword
                    ? <><CheckCircle size={12} color="#10b981" /><span style={{ color: '#10b981' }}>Passwords match</span></>
                    : <><XCircle size={12} color="#ef4444" /><span style={{ color: '#ef4444' }}>No match</span></>}
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '13px',
            background: loading ? '#1e3a5f' : 'linear-gradient(135deg, #00ff88, #00cc66)',
            color: loading ? '#94a3b8' : '#0a0e1a',
            border: 'none', borderRadius: 10,
            fontSize: 15, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? 'none' : '0 0 25px rgba(0,255,136,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            letterSpacing: 0.5,
          }}>
            {loading ? (
              <><Loader size={18} style={{ animation: 'rotate 1s linear infinite' }} />Creating Account...</>
            ) : '🚀 Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#94a3b8' }}>
          Already have an account?{' '}
          <Link to="/" style={{ color: '#00d4ff', textDecoration: 'none', fontWeight: 700 }}>Login here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
