import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserCheck, ShoppingCart, Layers,
  FileText, Receipt, CreditCard, Package, Truck, BarChart2,
  LogOut, Settings, ChevronLeft, ChevronRight, Cog
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { path: '/admin/customers', icon: Users, label: 'Customers' },
  { path: '/admin/employees', icon: UserCheck, label: 'Employees' },
  { path: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
  { path: '/admin/bom', icon: Layers, label: 'Bill of Materials' },
  { path: '/admin/purchase-orders', icon: FileText, label: 'Purchase Orders' },
  { path: '/admin/invoices', icon: Receipt, label: 'Invoices' },
  { path: '/admin/payments', icon: CreditCard, label: 'Payments' },
  { path: '/admin/inventory', icon: Package, label: 'Inventory' },
  { path: '/admin/suppliers', icon: Truck, label: 'Suppliers' },
  { path: '/admin/reports', icon: BarChart2, label: 'Reports' },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const width = collapsed ? '72px' : '260px';

  return (
    <div style={{
      position: 'fixed', left: 0, top: 0, bottom: 0, width,
      background: '#0d1526',
      borderRight: '1px solid #1e3a5f',
      display: 'flex', flexDirection: 'column',
      zIndex: 100,
      transition: 'width 0.3s ease',
      overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{
        padding: '20px 16px',
        borderBottom: '1px solid #1e3a5f',
        display: 'flex', alignItems: 'center', gap: 12,
        minHeight: 72,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: '10px',
          background: 'linear-gradient(135deg, #00d4ff, #0099cc)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 0 15px rgba(0,212,255,0.4)',
          animation: 'glow-pulse 2s infinite',
        }}>
          <Cog size={22} color="#fff" style={{ animation: 'rotate 4s linear infinite' }} />
        </div>
        {!collapsed && (
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#fff', letterSpacing: 1 }}>OrderCraft</div>
            <div style={{ fontSize: 10, color: '#00d4ff', textTransform: 'uppercase', letterSpacing: 2 }}>Admin Panel</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto', overflowX: 'hidden' }}>
        {navItems.map(({ path, icon: Icon, label, end }) => (
          <NavLink
            key={path}
            to={path}
            end={end}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12,
              padding: collapsed ? '13px 16px' : '12px 20px',
              color: isActive ? '#00d4ff' : '#94a3b8',
              textDecoration: 'none', fontSize: 14, fontWeight: 500,
              transition: 'all 0.2s',
              borderLeft: isActive ? '3px solid #00d4ff' : '3px solid transparent',
              background: isActive ? 'rgba(0,212,255,0.08)' : 'transparent',
              whiteSpace: 'nowrap',
            })}
          >
            <Icon size={18} style={{ flexShrink: 0 }} />
            {!collapsed && label}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          margin: '8px 12px',
          background: 'rgba(0,212,255,0.08)',
          border: '1px solid rgba(0,212,255,0.2)',
          color: '#00d4ff', borderRadius: 8, cursor: 'pointer',
          padding: '8px', display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: 8, fontSize: 13,
        }}
      >
        {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /><span>Collapse</span></>}
      </button>

      {/* User footer */}
      <div style={{ padding: '16px', borderTop: '1px solid #1e3a5f' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #00d4ff, #0099cc)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: '#fff',
          }}>
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
              <div style={{ fontSize: 11, color: '#00ff88', textTransform: 'capitalize' }}>{user?.role}</div>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          style={{
            width: '100%', background: 'rgba(255,68,68,0.08)',
            border: '1px solid rgba(255,68,68,0.2)', color: '#ff4444',
            borderRadius: 8, padding: '8px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start',
            gap: 8, fontSize: 13, fontWeight: 600,
          }}
        >
          <LogOut size={15} />
          {!collapsed && 'Logout'}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
