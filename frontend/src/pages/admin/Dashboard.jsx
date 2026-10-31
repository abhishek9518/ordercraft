import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { ShoppingCart, Users, IndianRupee, AlertCircle, TrendingUp, ArrowUp, ArrowDown, Package } from 'lucide-react';

const COLORS = ['#00d4ff', '#00ff88', '#ff6b35', '#ff4444', '#ffc107'];

const mockOrdersByMonth = [
  { month: 'Jun', orders: 28 }, { month: 'Jul', orders: 35 },
  { month: 'Aug', orders: 42 }, { month: 'Sep', orders: 38 },
  { month: 'Oct', orders: 51 }, { month: 'Nov', orders: 47 },
];
const mockRevenue = [
  { month: 'Jun', revenue: 280000 }, { month: 'Jul', revenue: 350000 },
  { month: 'Aug', revenue: 420000 }, { month: 'Sep', revenue: 380000 },
  { month: 'Oct', revenue: 510000 }, { month: 'Nov', revenue: 470000 },
];
const mockStatusDist = [
  { name: 'Pending', value: 23 }, { name: 'In Progress', value: 18 },
  { name: 'Completed', value: 47 }, { name: 'Cancelled', value: 8 },
];
const mockRecentOrders = [
  { id: 'ORD-001', customer: 'Tata Steel Ltd', title: 'Steel Frame Assembly', status: 'in-progress', priority: 'high', amount: 125000, date: '2024-11-10' },
  { id: 'ORD-002', customer: 'Mahindra Corp', title: 'Hydraulic Press Parts', status: 'pending', priority: 'medium', amount: 78500, date: '2024-11-12' },
  { id: 'ORD-003', customer: 'L&T Industries', title: 'Conveyor Belt System', status: 'completed', priority: 'low', amount: 245000, date: '2024-11-08' },
  { id: 'ORD-004', customer: 'BHEL Ltd', title: 'Boiler Components', status: 'in-progress', priority: 'high', amount: 189000, date: '2024-11-11' },
  { id: 'ORD-005', customer: 'Reliance Ind', title: 'Pump Assembly Units', status: 'pending', priority: 'medium', amount: 67000, date: '2024-11-13' },
];
const mockLowInventory = [
  { name: 'Steel Rods (10mm)', stock: 45, reorder: 100 },
  { name: 'Hydraulic Fluid', stock: 12, reorder: 50 },
  { name: 'Bearing Seals', stock: 8, reorder: 30 },
];

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color, subtitle }) => (
  <div style={{
    background: '#1a2332', border: '1px solid #1e3a5f', borderRadius: 14, padding: 24,
    position: 'relative', overflow: 'hidden', transition: 'all 0.3s',
  }}>
    <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, borderRadius: '0 14px 0 80px', background: `${color}12` }} />
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div>
        <p style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{title}</p>
        <p style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: '6px 0' }}>{value}</p>
        {subtitle && <p style={{ fontSize: 12, color: '#94a3b8' }}>{subtitle}</p>}
        {trendValue && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
            {trend === 'up' ? <ArrowUp size={13} color="#00ff88" /> : <ArrowDown size={13} color="#ff4444" />}
            <span style={{ fontSize: 12, color: trend === 'up' ? '#00ff88' : '#ff4444', fontWeight: 600 }}>{trendValue}</span>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>vs last month</span>
          </div>
        )}
      </div>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}20`, border: `1px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={22} color={color} />
      </div>
    </div>
  </div>
);

const statusBadge = (status) => {
  const map = { pending: 'badge-pending', 'in-progress': 'badge-active', completed: 'badge-completed', cancelled: 'badge-cancelled' };
  return <span className={`badge ${map[status] || 'badge-pending'}`}>{status}</span>;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#131d2e', border: '1px solid #1e3a5f', borderRadius: 8, padding: '10px 14px' }}>
        <p style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color, fontSize: 14, fontWeight: 600 }}>
            {p.name}: {typeof p.value === 'number' && p.name.toLowerCase().includes('revenue') ? `₹${p.value.toLocaleString()}` : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const [stats, setStats] = useState({ totalOrders: 96, activeCustomers: 34, revenue: 2410000, pendingPayments: 8 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/api/dashboard/stats');
        if (res.data) setStats(res.data);
      } catch {
        // use mock data
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 className="page-title">Manufacturing Dashboard</h1>
        <p className="page-subtitle">Real-time overview of your manufacturing operations</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard title="Total Orders" value={stats.totalOrders} icon={ShoppingCart} trend="up" trendValue="+12%" color="#00d4ff" subtitle="This month: 51 orders" />
        <StatCard title="Active Customers" value={stats.activeCustomers} icon={Users} trend="up" trendValue="+5" color="#00ff88" subtitle="3 new this week" />
        <StatCard title="Revenue" value={`₹${(stats.revenue / 100000).toFixed(1)}L`} icon={IndianRupee} trend="up" trendValue="+18%" color="#ffc107" subtitle="₹24.1 Lakhs total" />
        <StatCard title="Pending Payments" value={stats.pendingPayments} icon={AlertCircle} trend="down" trendValue="-3" color="#ff6b35" subtitle="₹3.2L outstanding" />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Bar chart */}
        <div style={{ background: '#1a2332', border: '1px solid #1e3a5f', borderRadius: 14, padding: 24 }}>
          <h3 style={{ color: '#fff', fontWeight: 700, marginBottom: 20, fontSize: 15 }}>Orders by Month</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={mockOrdersByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="orders" fill="#00d4ff" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div style={{ background: '#1a2332', border: '1px solid #1e3a5f', borderRadius: 14, padding: 24 }}>
          <h3 style={{ color: '#fff', fontWeight: 700, marginBottom: 20, fontSize: 15 }}>Order Status Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={mockStatusDist} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                {mockStatusDist.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue Line Chart */}
      <div style={{ background: '#1a2332', border: '1px solid #1e3a5f', borderRadius: 14, padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Revenue Trend</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <TrendingUp size={16} color="#00ff88" />
            <span style={{ fontSize: 13, color: '#00ff88', fontWeight: 600 }}>+18.2% this month</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={mockRevenue}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
            <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickFormatter={v => `₹${(v/100000).toFixed(0)}L`} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="revenue" stroke="#00ff88" strokeWidth={2.5} dot={{ fill: '#00ff88', r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        {/* Recent Orders */}
        <div style={{ background: '#1a2332', border: '1px solid #1e3a5f', borderRadius: 14, padding: 24 }}>
          <h3 style={{ color: '#fff', fontWeight: 700, marginBottom: 20, fontSize: 15 }}>Recent Orders</h3>
          <table className="data-table">
            <thead>
              <tr><th>Order#</th><th>Customer</th><th>Status</th><th>Priority</th><th>Amount</th></tr>
            </thead>
            <tbody>
              {mockRecentOrders.map(o => (
                <tr key={o.id}>
                  <td><span style={{ color: '#00d4ff', fontWeight: 600 }}>{o.id}</span></td>
                  <td style={{ color: '#e2e8f0' }}>{o.customer}</td>
                  <td>{statusBadge(o.status)}</td>
                  <td><span className={`badge badge-${o.priority}`}>{o.priority}</span></td>
                  <td style={{ color: '#00ff88', fontWeight: 600 }}>₹{o.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Low Inventory Alerts */}
        <div style={{ background: '#1a2332', border: '1px solid #1e3a5f', borderRadius: 14, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <Package size={18} color="#ff6b35" />
            <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Low Inventory Alerts</h3>
          </div>
          {mockLowInventory.map((item, i) => (
            <div key={i} style={{ marginBottom: 16, padding: 14, background: 'rgba(255,107,53,0.06)', border: '1px solid rgba(255,107,53,0.2)', borderRadius: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{item.name}</span>
                <span style={{ fontSize: 12, color: '#ff6b35', fontWeight: 700 }}>{item.stock} left</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${(item.stock / item.reorder) * 100}%`, background: 'linear-gradient(90deg, #ff4444, #ff6b35)' }} />
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Reorder at: {item.reorder} units</div>
            </div>
          ))}

          {/* Quick Actions */}
          <div style={{ marginTop: 20 }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Quick Actions</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button className="btn-primary btn-sm" style={{ textAlign: 'left', borderRadius: 8 }}>+ New Order</button>
              <button className="btn-secondary btn-sm" style={{ textAlign: 'left', borderRadius: 8 }}>Generate Invoice</button>
              <button className="btn-secondary btn-sm" style={{ textAlign: 'left', borderRadius: 8, borderColor: '#ff6b35', color: '#ff6b35' }}>Reorder Inventory</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
