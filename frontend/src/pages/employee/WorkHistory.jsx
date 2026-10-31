import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { History, CheckCircle } from 'lucide-react';

const WorkHistory = () => {
  const [orders, setOrders] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [tab, setTab] = useState('orders');
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(()=>{
    Promise.all([
      axios.get('/api/employee/orders', { headers }),
      axios.get('/api/employee/tasks', { headers })
    ]).then(([o,t])=>{
      setOrders((o.data.data||[]).filter(o=>o.status==='completed'||o.status==='cancelled'));
      setTasks((t.data.data||[]).filter(t=>t.status==='completed'));
    }).catch(()=>{}).finally(()=>setLoading(false));
  },[]);

  const card = { background:'#1a2332', border:'1px solid #1e3a5f', borderRadius:12, padding:24, marginBottom:20 };

  return (
    <div style={{ padding:24, color:'#fff' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
        <History size={28} color="#00d4ff"/>
        <div><h1 style={{ margin:0, fontSize:22, fontWeight:700 }}>Work History</h1><p style={{ margin:0, color:'#94a3b8', fontSize:14 }}>Your completed orders and tasks</p></div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:20 }}>
        {[
          { label:'Completed Orders', val:orders.filter(o=>o.status==='completed').length, color:'#10b981' },
          { label:'Completed Tasks', val:tasks.length, color:'#00d4ff' },
          { label:'Total Work Done', val:orders.length+tasks.length, color:'#8b5cf6' },
        ].map(s=>(
          <div key={s.label} style={{ ...card, marginBottom:0 }}>
            <div style={{ color:'#94a3b8', fontSize:13, marginBottom:6 }}>{s.label}</div>
            <div style={{ color:s.color, fontSize:24, fontWeight:700 }}>{s.val}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'flex', gap:2, marginBottom:20, background:'#0d1526', borderRadius:10, padding:4, width:'fit-content' }}>
        {['orders','tasks'].map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{ background: tab===t?'#1a2332':'transparent', border:'none', color: tab===t?'#00d4ff':'#94a3b8', padding:'8px 20px', borderRadius:8, cursor:'pointer', fontWeight:600, fontSize:14 }}>
            {t==='orders'?'📋 Orders':'✅ Tasks'}
          </button>
        ))}
      </div>

      <div style={card}>
        {loading ? <div style={{ textAlign:'center', padding:40, color:'#94a3b8' }}>Loading history...</div> : (
          tab==='orders' ? (
            <div>
              {orders.length===0 ? <div style={{ textAlign:'center', padding:40, color:'#94a3b8' }}>No completed orders yet</div> : orders.map((o,i)=>(
                <div key={o.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 0', borderBottom:'1px solid #1e3a5f' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ width:36, height:36, borderRadius:'50%', background:'#10b98122', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <CheckCircle size={18} color="#10b981"/>
                    </div>
                    <div>
                      <div style={{ fontWeight:700, color:'#00d4ff' }}>{o.order_number}</div>
                      <div style={{ color:'#fff', fontSize:14, marginTop:2 }}>{o.title}</div>
                      <div style={{ color:'#94a3b8', fontSize:12, marginTop:2 }}>Customer: {o.customer_name||'—'}</div>
                    </div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <span style={{ background: o.status==='completed'?'#10b98122':'#ef444422', color: o.status==='completed'?'#10b981':'#ef4444', padding:'4px 12px', borderRadius:20, fontSize:12, fontWeight:600 }}>
                      {o.status?.toUpperCase()}
                    </span>
                    <div style={{ color:'#475569', fontSize:12, marginTop:4 }}>{o.due_date||'—'}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>
              {tasks.length===0 ? <div style={{ textAlign:'center', padding:40, color:'#94a3b8' }}>No completed tasks yet</div> : tasks.map((t,i)=>(
                <div key={t.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 0', borderBottom:'1px solid #1e3a5f' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ width:36, height:36, borderRadius:'50%', background:'#10b98122', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <CheckCircle size={18} color="#10b981"/>
                    </div>
                    <div>
                      <div style={{ fontWeight:600 }}>{t.title}</div>
                      {t.description && <div style={{ color:'#94a3b8', fontSize:13, marginTop:2 }}>{t.description}</div>}
                      {t.order_number && <div style={{ color:'#475569', fontSize:12, marginTop:2 }}>Order: {t.order_number}</div>}
                    </div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <span style={{ background:'#10b98122', color:'#10b981', padding:'4px 12px', borderRadius:20, fontSize:12, fontWeight:600 }}>COMPLETED</span>
                    <div style={{ color:'#475569', fontSize:12, marginTop:4 }}>{t.completed_at?.split('T')[0]||t.due_date||'—'}</div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default WorkHistory;
