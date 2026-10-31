import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart2, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#00d4ff','#00ff88','#f59e0b','#ef4444','#8b5cf6'];

const Reports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(()=>{
    axios.get('/api/admin/reports', { headers })
      .then(r=>setData(r.data.data))
      .catch(()=>{})
      .finally(()=>setLoading(false));
  },[]);

  const card = { background:'#1a2332', border:'1px solid #1e3a5f', borderRadius:12, padding:24, marginBottom:20 };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background:'#1a2332', border:'1px solid #1e3a5f', borderRadius:8, padding:'10px 14px' }}>
          <p style={{ color:'#94a3b8', margin:'0 0 4px', fontSize:13 }}>{label}</p>
          {payload.map((p,i)=><p key={i} style={{ color:p.color, margin:'2px 0', fontWeight:600 }}>{p.name}: {typeof p.value==='number'&&p.name?.includes('₹') ? `₹${p.value.toLocaleString('en-IN')}` : p.value}</p>)}
        </div>
      );
    }
    return null;
  };

  if (loading) return <div style={{ padding:24, color:'#94a3b8', textAlign:'center', paddingTop:80 }}>Loading reports...</div>;

  const ordersByStatus = data?.ordersByStatus || [
    { name:'Pending', value:12 }, { name:'In Progress', value:8 }, { name:'Completed', value:24 }, { name:'Cancelled', value:3 }
  ];
  const monthlyOrders = data?.monthlyOrders || [
    { month:'Jun', orders:12, revenue:245000 },
    { month:'Jul', orders:18, revenue:312000 },
    { month:'Aug', orders:15, revenue:278000 },
    { month:'Sep', orders:22, revenue:456000 },
    { month:'Oct', orders:19, revenue:389000 },
    { month:'Nov', orders:25, revenue:512000 },
  ];
  const topCustomers = data?.topCustomers || [];
  const summary = data?.summary || {};

  return (
    <div style={{ padding:24, color:'#fff' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
        <BarChart2 size={28} color="#00d4ff"/>
        <div><h1 style={{ margin:0, fontSize:22, fontWeight:700 }}>Reports & Analytics</h1><p style={{ margin:0, color:'#94a3b8', fontSize:14 }}>Business intelligence and performance metrics</p></div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        {[
          { label:'Total Orders', val:summary.totalOrders||0, sub:'All time', color:'#00d4ff', icon:'📋' },
          { label:'Revenue', val:`₹${(summary.totalRevenue||0).toLocaleString('en-IN')}`, sub:'Paid invoices', color:'#10b981', icon:'💰' },
          { label:'Avg Order Value', val:`₹${(summary.avgOrderValue||0).toLocaleString('en-IN')}`, sub:'Per order', color:'#8b5cf6', icon:'📈' },
          { label:'Completion Rate', val:`${summary.completionRate||0}%`, sub:'Orders completed', color:'#f59e0b', icon:'✅' },
        ].map(s=>(
          <div key={s.label} style={{ ...card, marginBottom:0 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div>
                <div style={{ color:'#94a3b8', fontSize:13, marginBottom:8 }}>{s.label}</div>
                <div style={{ color:s.color, fontSize:22, fontWeight:700 }}>{s.val}</div>
                <div style={{ color:'#475569', fontSize:12, marginTop:4 }}>{s.sub}</div>
              </div>
              <span style={{ fontSize:28 }}>{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
        <div style={card}>
          <h3 style={{ margin:'0 0 20px', color:'#94a3b8', fontSize:15, fontWeight:600 }}>📊 Monthly Orders & Revenue</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyOrders}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f"/>
              <XAxis dataKey="month" stroke="#94a3b8" tick={{ fill:'#94a3b8', fontSize:12 }}/>
              <YAxis yAxisId="left" stroke="#94a3b8" tick={{ fill:'#94a3b8', fontSize:12 }}/>
              <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" tick={{ fill:'#94a3b8', fontSize:12 }}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Legend wrapperStyle={{ color:'#94a3b8' }}/>
              <Bar yAxisId="left" dataKey="orders" name="Orders" fill="#00d4ff" radius={[4,4,0,0]}/>
              <Bar yAxisId="right" dataKey="revenue" name="Revenue (₹)" fill="#00ff88" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={card}>
          <h3 style={{ margin:'0 0 20px', color:'#94a3b8', fontSize:15, fontWeight:600 }}>🍩 Order Status Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={ordersByStatus} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                {ordersByStatus.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]}/>)}
              </Pie>
              <Tooltip content={<CustomTooltip/>}/>
              <Legend wrapperStyle={{ color:'#94a3b8', fontSize:13 }}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={card}>
        <h3 style={{ margin:'0 0 20px', color:'#94a3b8', fontSize:15, fontWeight:600 }}>📈 Revenue Trend (Last 6 Months)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={monthlyOrders}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f"/>
            <XAxis dataKey="month" stroke="#94a3b8" tick={{ fill:'#94a3b8', fontSize:12 }}/>
            <YAxis stroke="#94a3b8" tick={{ fill:'#94a3b8', fontSize:12 }}/>
            <Tooltip content={<CustomTooltip/>}/>
            <Line type="monotone" dataKey="revenue" name="Revenue (₹)" stroke="#00ff88" strokeWidth={2.5} dot={{ fill:'#00ff88', r:4 }} activeDot={{ r:6 }}/>
          </LineChart>
        </ResponsiveContainer>
      </div>

      {topCustomers.length > 0 && (
        <div style={card}>
          <h3 style={{ margin:'0 0 20px', color:'#94a3b8', fontSize:15, fontWeight:600 }}>🏆 Top Customers by Orders</h3>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ borderBottom:'1px solid #1e3a5f' }}>
                  {['#','Customer','Company','Total Orders','Revenue'].map(h=>(
                    <th key={h} style={{ textAlign:'left', padding:'12px 10px', color:'#94a3b8', fontSize:13 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topCustomers.map((c,i)=>(
                  <tr key={c.id} style={{ borderBottom:'1px solid #1e3a5f' }}>
                    <td style={{ padding:'12px 10px', color: i===0?'#f59e0b':i===1?'#94a3b8':i===2?'#cd7c3d':'#475569', fontWeight:700 }}>#{i+1}</td>
                    <td style={{ padding:'12px 10px', fontWeight:600 }}>{c.name}</td>
                    <td style={{ padding:'12px 10px', color:'#94a3b8' }}>{c.company||'—'}</td>
                    <td style={{ padding:'12px 10px', color:'#00d4ff', fontWeight:700 }}>{c.order_count}</td>
                    <td style={{ padding:'12px 10px', color:'#10b981', fontWeight:700 }}>₹{(c.total_revenue||0).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
