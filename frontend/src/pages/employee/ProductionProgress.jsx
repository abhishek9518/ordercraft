import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, RefreshCw, X } from 'lucide-react';

const ProductionProgress = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [selected, setSelected] = useState(null);
  const [progressNote, setProgressNote] = useState('');
  const [newStatus, setNewStatus] = useState('');

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };
  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

  const fetchOrders = () => {
    setLoading(true);
    axios.get('/api/employee/orders', { headers })
      .then(r=>setOrders((r.data.data||[]).filter(o=>o.status!=='completed'&&o.status!=='cancelled')))
      .catch(()=>showToast('Failed to load','error')).finally(()=>setLoading(false));
  };

  useEffect(()=>{ fetchOrders(); },[]);

  const updateProgress = async () => {
    try {
      await axios.put(`/api/employee/orders/${selected.id}/status`, { status: newStatus, notes: progressNote }, { headers });
      showToast('Production progress updated!');
      setSelected(null); setProgressNote(''); fetchOrders();
    } catch(e) { showToast('Update failed','error'); }
  };

  const statusColors = { pending:'#f59e0b', in_progress:'#3b82f6', on_hold:'#8b5cf6' };
  const progressMap = { pending:15, in_progress:55, on_hold:35 };
  const card = { background:'#1a2332', border:'1px solid #1e3a5f', borderRadius:12, padding:24, marginBottom:20 };
  const inp = { background:'#0d1526', border:'1px solid #1e3a5f', borderRadius:8, padding:'10px 14px', color:'#fff', width:'100%', fontSize:14, boxSizing:'border-box' };
  const btn = { background:'linear-gradient(135deg,#00d4ff,#0099cc)', color:'#fff', border:'none', borderRadius:8, padding:'10px 20px', cursor:'pointer', fontWeight:600, display:'flex', alignItems:'center', gap:8 };

  return (
    <div style={{ padding:24, color:'#fff' }}>
      {toast && <div style={{ position:'fixed', top:20, right:20, background:toast.type==='success'?'#10b981':'#ef4444', color:'#fff', padding:'12px 20px', borderRadius:8, zIndex:9999, fontWeight:600 }}>{toast.msg}</div>}

      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
        <Activity size={28} color="#00d4ff"/>
        <div><h1 style={{ margin:0, fontSize:22, fontWeight:700 }}>Production Progress</h1><p style={{ margin:0, color:'#94a3b8', fontSize:14 }}>Update manufacturing progress on your active orders</p></div>
      </div>

      {loading ? <div style={{ textAlign:'center', padding:60, color:'#94a3b8' }}>Loading active orders...</div> : (
        orders.length === 0 ? (
          <div style={{ ...card, textAlign:'center', padding:60 }}>
            <Activity size={48} color="#1e3a5f" style={{ marginBottom:16 }}/>
            <h3 style={{ color:'#94a3b8' }}>No active orders</h3>
            <p style={{ color:'#475569' }}>All your orders are completed or you have no assignments yet.</p>
          </div>
        ) : (
          <div style={{ display:'grid', gap:16 }}>
            {orders.map(order=>{
              const progress = progressMap[order.status] || 20;
              return (
                <div key={order.id} style={card}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
                    <div>
                      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
                        <span style={{ color:'#00d4ff', fontWeight:700, fontSize:16 }}>{order.order_number}</span>
                        <span style={{ background:statusColors[order.status]+'22', color:statusColors[order.status], padding:'3px 10px', borderRadius:20, fontSize:12, fontWeight:600 }}>
                          {order.status?.replace('_',' ').toUpperCase()}
                        </span>
                      </div>
                      <h3 style={{ margin:'0 0 4px', fontWeight:600 }}>{order.title}</h3>
                      <div style={{ color:'#94a3b8', fontSize:13 }}>Customer: {order.customer_name||'—'} | Due: {order.due_date||'No deadline'}</div>
                    </div>
                    <button onClick={()=>{ setSelected(order); setNewStatus(order.status); setProgressNote(''); }} style={{ background:'#1e3a5f', border:'1px solid #00d4ff33', borderRadius:8, padding:'8px 16px', cursor:'pointer', color:'#00d4ff', display:'flex', alignItems:'center', gap:6, fontWeight:600 }}>
                      <RefreshCw size={14}/>Update Progress
                    </button>
                  </div>

                  <div style={{ marginBottom:8, display:'flex', justifyContent:'space-between' }}>
                    <span style={{ color:'#94a3b8', fontSize:13 }}>Manufacturing Progress</span>
                    <span style={{ color:statusColors[order.status]||'#94a3b8', fontWeight:700 }}>{progress}%</span>
                  </div>
                  <div style={{ background:'#0d1526', borderRadius:8, height:10, overflow:'hidden', border:'1px solid #1e3a5f' }}>
                    <div style={{ background:`linear-gradient(90deg, ${statusColors[order.status]||'#00d4ff'}, ${statusColors[order.status]||'#00d4ff'}88)`, height:'100%', width:`${progress}%`, transition:'width 0.5s', borderRadius:8 }}/>
                  </div>

                  {order.notes && (
                    <div style={{ marginTop:12, background:'#0d1526', borderRadius:8, padding:'10px 14px', border:'1px solid #1e3a5f' }}>
                      <span style={{ color:'#94a3b8', fontSize:13 }}>📝 Notes: </span>
                      <span style={{ fontSize:13, color:'#cbd5e1' }}>{order.notes}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}

      {selected && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div style={{ background:'#1a2332', border:'1px solid #1e3a5f', borderRadius:16, padding:32, width:'100%', maxWidth:460 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
              <h2 style={{ margin:0 }}>Update Production Progress</h2>
              <button onClick={()=>setSelected(null)} style={{ background:'none', border:'none', color:'#94a3b8', cursor:'pointer' }}><X size={20}/></button>
            </div>
            <p style={{ color:'#94a3b8', marginBottom:20 }}>Order: <strong style={{ color:'#00d4ff' }}>{selected.order_number}</strong> — {selected.title}</p>
            <div style={{ marginBottom:16 }}>
              <label style={{ color:'#94a3b8', fontSize:13, display:'block', marginBottom:8 }}>Update Status</label>
              <select value={newStatus} onChange={e=>setNewStatus(e.target.value)} style={inp}>
                <option value="pending">Pending — Not Started</option>
                <option value="in_progress">In Progress — Currently Manufacturing</option>
                <option value="on_hold">On Hold — Paused</option>
                <option value="completed">Completed — Ready for Delivery</option>
              </select>
            </div>
            <div style={{ marginBottom:20 }}>
              <label style={{ color:'#94a3b8', fontSize:13, display:'block', marginBottom:8 }}>Progress Notes</label>
              <textarea value={progressNote} onChange={e=>setProgressNote(e.target.value)} placeholder="Describe current production progress, any issues, materials used..." style={{ ...inp, height:100, resize:'vertical' }}/>
            </div>
            <div style={{ display:'flex', gap:12, justifyContent:'flex-end' }}>
              <button onClick={()=>setSelected(null)} style={{ background:'#0d1526', border:'1px solid #1e3a5f', borderRadius:8, padding:'10px 20px', color:'#94a3b8', cursor:'pointer' }}>Cancel</button>
              <button onClick={updateProgress} style={btn}><Activity size={14}/>Update Progress</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionProgress;
