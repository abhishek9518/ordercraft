import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, ChevronRight, Wifi, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const breadcrumbMap = {
  '/admin': 'Dashboard',
  '/admin/customers': 'Customers',
  '/admin/employees': 'Employees',
  '/admin/orders': 'Orders',
  '/admin/bom': 'Bill of Materials',
  '/admin/purchase-orders': 'Purchase Orders',
  '/admin/invoices': 'Invoices',
  '/admin/payments': 'Payments',
  '/admin/inventory': 'Inventory',
  '/admin/suppliers': 'Suppliers',
  '/admin/reports': 'Reports',
  '/employee': 'Dashboard',
  '/employee/orders': 'My Orders',
  '/employee/tasks': 'My Tasks',
  '/employee/inventory': 'Inventory Check',
  '/employee/history': 'Work History',
  '/employee/production': 'Production Progress',
};

const Header = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);

  const currentPage = breadcrumbMap[location.pathname] || 'Overview';
  const section = location.pathname.startsWith('/admin') ? 'Admin' : 'Employee';

  return (
    <div style={{
      position: 'sticky', top: 0,
      background: 'rgba(10,14,26,0.92)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid #1e3a5f',
      padding: '0 24px',
      height: 64,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      zIndex: 50,
    }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: '#94a3b8', fontSize: 13 }}>OrderCraft</span>
        <ChevronRight size={14} color="#4a5568" />
        <span style={{ color: '#94a3b8', fontSize: 13 }}>{section}</span>
        <ChevronRight size={14} color="#4a5568" />
        <span style={{ color: '#00d4ff', fontSize: 13, fontWeight: 600 }}>{currentPage}</span>
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {/* System Status */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(0,255,136,0.08)',
          border: '1px solid rgba(0,255,136,0.2)',
          borderRadius: 20, padding: '4px 12px',
        }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#00ff88', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: 11, color: '#00ff88', fontWeight: 700, letterSpacing: 1 }}>SYSTEM OPTIMAL</span>
        </div>

        {/* OMS Live Tracing */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Wifi size={14} color="#00d4ff" style={{ animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: 11, color: '#00d4ff', fontWeight: 600 }}>OMS LIVE</span>
        </div>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              background: 'rgba(0,212,255,0.08)',
              border: '1px solid rgba(0,212,255,0.2)',
              color: '#94a3b8', borderRadius: 8,
              padding: '7px 9px', cursor: 'pointer',
              position: 'relative', display: 'flex', alignItems: 'center',
            }}
          >
            <Bell size={16} />
            <div style={{
              position: 'absolute', top: 4, right: 4,
              width: 8, height: 8, borderRadius: '50%',
              background: '#ff6b35',
            }} />
          </button>

          {showNotifications && (
            <div style={{
              position: 'absolute', top: '110%', right: 0,
              background: '#131d2e', border: '1px solid #1e3a5f',
              borderRadius: 12, width: 300, padding: 16,
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              zIndex: 200, animation: 'slideIn 0.2s ease',
            }}>
              <div style={{ fontWeight: 700, marginBottom: 12, color: '#fff', fontSize: 14 }}>Notifications</div>
              {[
                { msg: 'Order #ORD-001 completed', time: '2m ago', color: '#00ff88' },
                { msg: 'Low stock: Steel Rods', time: '15m ago', color: '#ff6b35' },
                { msg: 'Invoice #INV-042 overdue', time: '1h ago', color: '#ff4444' },
              ].map((n, i) => (
                <div key={i} style={{ padding: '10px 0', borderBottom: i < 2 ? '1px solid #1e3a5f' : 'none', display: 'flex', gap: 10 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: n.color, marginTop: 6, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 13, color: '#e2e8f0' }}>{n.msg}</div>
                    <div style={{ fontSize: 11, color: '#4a5568', marginTop: 2 }}>{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg, #00d4ff, #0099cc)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: '#fff',
          }}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', lineHeight: 1 }}>{user?.name}</div>
            <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'capitalize' }}>{user?.role}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
