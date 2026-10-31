import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ClipboardList, CheckSquare, Activity, PackageSearch, History, TrendingUp, LogOut, Cog } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/employee', icon: Activity, label: 'Dashboard', end: true },
  { path: '/employee/orders', icon: ClipboardList, label: 'My Orders' },
  { path: '/employee/tasks', icon: CheckSquare, label: 'My Tasks' },
  { path: '/employee/inventory', icon: PackageSearch, label: 'Inventory Check' },
  { path: '/employee/history', icon: History, label: 'Work History' },
  { path: '/employee/production', icon: TrendingUp, label: 'Production Progress' },
];

const EmployeeSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div style={{
      position: 'fixed', left: 0, top: 0, bottom: 0, width: 260,
      background: '#0d1526',
      borderRight: '1px solid #1e3a5f',
      display: 'flex', flexDirection: 'column',
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: '20px', borderBottom: '1px solid #1e3a5f', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: '10px',
          background: 'linear-gradient(135deg, #00ff88, #00cc66)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, boxShadow: '0 0 15px rgba(0,255,136,0.4)',
        }}>
          <Cog size={22} color="#0a0e1a" />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#fff', letterSpacing: 1 }}>OrderCraft</div>
          <div style={{ fontSize: 10, color: '#00ff88', textTransform: 'uppercase', letterSpacing: 2 }}>Employee Portal</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
        {navItems.map(({ path, icon: Icon, label, end }) => (
          <NavLink
            key={path}
            to={path}
            end={end}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 20px',
              color: isActive ? '#00ff88' : '#94a3b8',
              textDecoration: 'none', fontSize: 14, fontWeight: 500,
              transition: 'all 0.2s',
              borderLeft: isActive ? '3px solid #00ff88' : '3px solid transparent',
              background: isActive ? 'rgba(0,255,136,0.08)' : 'transparent',
            })}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div style={{ padding: '16px', borderTop: '1px solid #1e3a5f' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'linear-gradient(135deg, #00ff88, #00cc66)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: '#0a0e1a',
          }}>
            {user?.name?.[0]?.toUpperCase() || 'E'}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{user?.name}</div>
            <div style={{ fontSize: 11, color: '#00ff88' }}>Employee</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            width: '100%', background: 'rgba(255,68,68,0.08)',
            border: '1px solid rgba(255,68,68,0.2)', color: '#ff4444',
            borderRadius: 8, padding: '8px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600,
          }}
        >
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default EmployeeSidebar;
