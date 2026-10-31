import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, Eye, RefreshCw, X } from 'lucide-react';

const statusColors = { pending:'#f59e0b', in_progress:'#3b82f6', completed:'#10b981', cancelled:'#ef4444', on_hold:'#8b5cf6' };
const priorityColors = { low:'#94a3b8', medium:'#f59e0b', high:'#ff6b35', urgent:'#ef4444' };

const AssignedOrders = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [selected, setSelected] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };
  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

  const fetchOrders = () => {
    setLoading(true);
    axios.get('/api/employee/orders', { headers })
      .then(r=>setOrders(r.data.data||[]))
      .catch(()=>showToast('Failed to load orders','error'))
      .finally(()=>setLoading(false));
  };

  useEffect(()=>{ fetchOrders(); },[]);

  const updateStatus = async (orderId, status) => {
    try {
      await axios.put(`/api/employee/orders/${orderId}/status`, { status }, { headers });
      showToast('Order status updated!');
      setSelected(null);
      fetchOrders();
    } catch(e) { showToast('Update failed','error'); }
  };

  const filtered = orders.filter(o=>{
    const matchSearch = o.order_number?.toLowerCase().includes(search.toLowerCase())||o.title?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter==='all'||o.status===filter;
    return matchSearch && matchFilter;
  });

  const card = { background:'#1a2332', border:'1px solid #1e3a5f', borderRadius:12, padding:24, marginBottom:20 };
  const inp = { background:'#0d1526', border:'1px solid #1e3a5f', borderRadius:8, padding:'10px 14px', color:'#fff', width:'100%', fontSize:14, boxSizing:'border-box' };
  const btn = { background:'linear-gradient(135deg,#00d4ff,#0099cc)', color:'#fff', border:'none', borderRadius:8, padding:'10px 20px', cursor:'pointer', fontWeight:600, display:'flex', alignItems:'center', gap:8 };

  return (
    <div style={{ padding:24, color:'#fff' }}>
      {toast && <div style={{ position:'fixed', top:20, right:20, background:toast.type==='success'?'#10b981':'#ef4444', color:'#fff', padding:'12px 20px', borderRadius:8, zIndex:9999, fontWeight:600 }}>{toast.msg}</div>}

      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
        <ShoppingCart size={28} color="#00d4ff"/>
        <div><h1 style={{ margin:0, fontSize:22, fontWeight:700 }}>My Assigned Orders</h1><p style={{ margin:0, color:'#94a3b8', fontSize:14 }}>View and update status of your manufacturing orders</p></div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:20 }}>
        {['pending','in_progress','completed','on_hold'].map(s=>(
          <div key={s} style={{ ...card, marginBottom:0, borderTop:`3px solid ${statusColors[s]}` }}>
            <div style={{ color:'#94a3b8', fontSize:12, textTransform:'uppercase', marginBottom:4 }}>{s.replace('_',' ')}</div>
            <div style={{ color:statusColors[s], fontSize:22, fontWeight:700 }}>{orders.filter(o=>o.status===s).length}</div>
          </div>
        ))}
      </div>

      <div style={card}>
        <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:20 }}>
          <input placeholder="🔍 Search orders..." value={search} onChange={e=>setSearch(e.target.value)} style={{ ...inp, flex:1, minWidth:200 }}/>
          <select value={filter} onChange={e=>setFilter(e.target.value)} style={{ ...inp, width:'auto', minWidth:160 }}>
            <option value="all">All Status</option>
            {['pending','in_progress','completed','on_hold','cancelled'].map(s=><option key={s} value={s}>{s.replace('_',' ')}</option>)}
          </select>
        </div>

        {loading ? <div style={{ textAlign:'center', padding:40, color:'#94a3b8' }}>Loading your orders...</div> : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ borderBottom:'1px solid #1e3a5f' }}>
                  {['Order #','Title','Customer','Priority','Due Date','Status','Actions'].map(h=>(
                    <th key={h} style={{ textAlign:'left', padding:'12px 10px', color:'#94a3b8', fontSize:13 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length===0 ? (
                  <tr><td colSpan={7} style={{ textAlign:'center', padding:40, color:'#94a3b8' }}>No orders assigned to you</td></tr>
                ) : filtered.map((o,i)=>(
                  <tr key={o.id} style={{ borderBottom:'1px solid #1e3a5f', background:i%2===0?'transparent':'rgba(255,255,255,0.02)' }}>
                    <td style={{ padding:'12px 10px', color:'#00d4ff', fontWeight:700 }}>{o.order_number}</td>
                    <td style={{ padding:'12px 10px' }}>
                      <div style={{ fontWeight:600 }}>{o.title}</div>
                      <div style={{ color:'#94a3b8', fontSize:12, marginTop:2 }}>{o.description?.slice(0,40)||''}</div>
                    </td>
                    <td style={{ padding:'12px 10px', color:'#94a3b8' }}>{o.customer_name||'—'}</td>
                    <td style={{ padding:'12px 10px' }}>
                      <span style={{ background:priorityColors[o.priority]+'22', color:priorityColors[o.priority], padding:'3px 8px', borderRadius:12, fontSize:12, fontWeight:600 }}>
                        {o.priority?.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding:'12px 10px', color: o.due_date&&new Date(o.due_date)<new Date()?'#ef4444':'#94a3b8' }}>{o.due_date||'—'}</td>
                    <td style={{ padding:'12px 10px' }}>
                      <span style={{ background:statusColors[o.status]+'22', color:statusColors[o.status], padding:'3px 10px', borderRadius:20, fontSize:12, fontWeight:600 }}>
                        {o.status?.replace('_',' ').toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding:'12px 10px' }}>
                      <button onClick={()=>{ setSelected(o); setNewStatus(o.status); }} style={{ background:'#1e3a5f', border:'none', borderRadius:6, padding:'6px 12px', cursor:'pointer', color:'#00d4ff', display:'flex', alignItems:'center', gap:6, fontSize:13 }}>
                        <RefreshCw size={13}/>Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div style={{ background:'#1a2332', border:'1px solid #1e3a5f', borderRadius:16, padding:32, width:'100%', maxWidth:420 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
              <h2 style={{ margin:0 }}>Update Order Status</h2>
              <button onClick={()=>setSelected(null)} style={{ background:'none', border:'none', color:'#94a3b8', cursor:'pointer' }}><X size={20}/></button>
            </div>
            <p style={{ color:'#94a3b8', marginBottom:20 }}>Order: <strong style={{ color:'#00d4ff' }}>{selected.order_number}</strong> — {selected.title}</p>
            <label style={{ color:'#94a3b8', fontSize:13, display:'block', marginBottom:8 }}>New Status</label>
            <select value={newStatus} onChange={e=>setNewStatus(e.target.value)} style={{ background:'#0d1526', border:'1px solid #1e3a5f', borderRadius:8, padding:'10px 14px', color:'#fff', width:'100%', fontSize:14, marginBottom:20 }}>
              {['pending','in_progress','completed','on_hold'].map(s=><option key={s} value={s}>{s.replace('_',' ')}</option>)}
            </select>
            <div style={{ display:'flex', gap:12, justifyContent:'flex-end' }}>
              <button onClick={()=>setSelected(null)} style={{ background:'#0d1526', border:'1px solid #1e3a5f', borderRadius:8, padding:'10px 20px', color:'#94a3b8', cursor:'pointer' }}>Cancel</button>
              <button onClick={()=>updateStatus(selected.id, newStatus)} style={btn}><RefreshCw size={14}/>Update Status</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignedOrders;
