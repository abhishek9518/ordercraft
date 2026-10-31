import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LayoutDashboard, CheckCircle, Clock, AlertTriangle, TrendingUp } from 'lucide-react';

const EmployeeDashboard = () => {
  const [stats, setStats] = useState({ assignedOrders:0, pendingTasks:0, completedToday:0, inProgress:0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(()=>{
    Promise.all([
      axios.get('/api/employee/dashboard', { headers }),
      axios.get('/api/employee/orders', { headers }),
      axios.get('/api/employee/tasks', { headers })
    ]).then(([dash, ord, tasks])=>{
      setStats(dash.data.data || {});
      setRecentOrders((ord.data.data||[]).slice(0,5));
      setRecentTasks((tasks.data.data||[]).slice(0,5));
    }).catch(()=>{}).finally(()=>setLoading(false));
  },[]);

  const card = { background:'#1a2332', border:'1px solid #1e3a5f', borderRadius:12, padding:24, marginBottom:20 };
  const statusColor = { pending:'#f59e0b', in_progress:'#3b82f6', completed:'#10b981', cancelled:'#ef4444', on_hold:'#8b5cf6' };

  if (loading) return <div style={{ padding:40, textAlign:'center', color:'#94a3b8' }}>Loading dashboard...</div>;

  return (
    <div style={{ padding:24, color:'#fff' }}>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ margin:0, fontSize:22, fontWeight:700 }}>Welcome back, {user.name || 'Employee'}! 👷</h1>
        <p style={{ margin:'4px 0 0', color:'#94a3b8' }}>Here's your work summary for today</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        {[
          { label:'Assigned Orders', val:stats.assignedOrders||recentOrders.length, icon:<LayoutDashboard size={22}/>, color:'#00d4ff', bg:'#001a2e' },
          { label:'Pending Tasks', val:stats.pendingTasks||recentTasks.filter(t=>t.status==='pending').length, icon:<Clock size={22}/>, color:'#f59e0b', bg:'#2d1a0a' },
          { label:'In Progress', val:stats.inProgress||recentOrders.filter(o=>o.status==='in_progress').length, icon:<TrendingUp size={22}/>, color:'#3b82f6', bg:'#0a1a2e' },
          { label:'Completed', val:stats.completedToday||recentTasks.filter(t=>t.status==='completed').length, icon:<CheckCircle size={22}/>, color:'#10b981', bg:'#0a2e1a' },
        ].map(s=>(
          <div key={s.label} style={{ ...card, marginBottom:0, background:s.bg, border:`1px solid ${s.color}33` }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <div style={{ color:s.color }}>{s.icon}</div>
              <div style={{ color:s.color, fontSize:28, fontWeight:700 }}>{s.val}</div>
            </div>
            <div style={{ color:'#94a3b8', fontSize:13 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        <div style={card}>
          <h3 style={{ margin:'0 0 16px', fontSize:15, color:'#94a3b8', fontWeight:600 }}>📋 My Assigned Orders</h3>
          {recentOrders.length === 0 ? <p style={{ color:'#475569', textAlign:'center', padding:20 }}>No orders assigned yet</p> : (
            <div>
              {recentOrders.map(o=>(
                <div key={o.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:'1px solid #1e3a5f' }}>
                  <div>
                    <div style={{ fontWeight:600, fontSize:14 }}>{o.order_number}</div>
                    <div style={{ color:'#94a3b8', fontSize:12, marginTop:2 }}>{o.title}</div>
                  </div>
                  <span style={{ background:statusColor[o.status]+'22', color:statusColor[o.status], padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600 }}>
                    {o.status?.replace('_',' ').toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={card}>
          <h3 style={{ margin:'0 0 16px', fontSize:15, color:'#94a3b8', fontWeight:600 }}>✅ My Tasks</h3>
          {recentTasks.length === 0 ? <p style={{ color:'#475569', textAlign:'center', padding:20 }}>No tasks assigned</p> : (
            <div>
              {recentTasks.map(t=>(
                <div key={t.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:'1px solid #1e3a5f' }}>
                  <div>
                    <div style={{ fontWeight:600, fontSize:14 }}>{t.title}</div>
                    <div style={{ color:'#94a3b8', fontSize:12, marginTop:2 }}>Due: {t.due_date||'No deadline'}</div>
                  </div>
                  <span style={{ background:statusColor[t.status]+'22', color:statusColor[t.status], padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600 }}>
                    {t.status?.replace('_',' ').toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
