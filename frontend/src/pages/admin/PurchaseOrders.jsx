import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, Plus, Search, Edit2, Trash2, X } from 'lucide-react';

const statusColors = { draft:'#94a3b8', sent:'#3b82f6', confirmed:'#8b5cf6', received:'#10b981', cancelled:'#ef4444' };

const PurchaseOrders = () => {
  const [pos, setPOs] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({ supplier_id:'', order_id:'', total_amount:'', expected_date:'', status:'draft', notes:'' });

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };
  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      axios.get('/api/admin/purchase-orders', { headers }),
      axios.get('/api/admin/suppliers', { headers }),
      axios.get('/api/admin/orders', { headers })
    ]).then(([p,s,o]) => {
      setPOs(p.data.data||[]); setSuppliers(s.data.data||[]); setOrders(o.data.data||[]);
    }).catch(()=>showToast('Failed to load data','error')).finally(()=>setLoading(false));
  };

  useEffect(()=>{ fetchAll(); },[]);

  const openAdd = () => { setEditing(null); setForm({ supplier_id:'', order_id:'', total_amount:'', expected_date:'', status:'draft', notes:'' }); setShowModal(true); };
  const openEdit = (p) => { setEditing(p); setForm({ supplier_id:p.supplier_id||'', order_id:p.order_id||'', total_amount:p.total_amount||'', expected_date:p.expected_date||'', status:p.status, notes:p.notes||'' }); setShowModal(true); };

  const handleSave = async () => {
    if (!form.supplier_id) { showToast('Select a supplier','error'); return; }
    try {
      if (editing) { await axios.put(`/api/admin/purchase-orders/${editing.id}`, form, { headers }); showToast('PO updated'); }
      else { await axios.post('/api/admin/purchase-orders', form, { headers }); showToast('PO created'); }
      setShowModal(false); fetchAll();
    } catch(e) { showToast(e.response?.data?.message||'Error','error'); }
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Delete this Purchase Order?')) return;
    try { await axios.delete(`/api/admin/purchase-orders/${id}`, { headers }); showToast('Deleted'); fetchAll(); }
    catch(e) { showToast('Delete failed','error'); }
  };

  const filtered = pos.filter(p=>{
    const matchSearch = p.po_number?.toLowerCase().includes(search.toLowerCase()) || p.supplier_name?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter==='all' || p.status===filter;
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
        <div><h1 style={{ margin:0, fontSize:22, fontWeight:700 }}>Purchase Orders</h1><p style={{ margin:0, color:'#94a3b8', fontSize:14 }}>Manage supplier purchase orders</p></div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:20 }}>
        {['draft','sent','confirmed','received'].map(s=>(
          <div key={s} style={{ ...card, marginBottom:0, borderTop:`3px solid ${statusColors[s]}` }}>
            <div style={{ color:'#94a3b8', fontSize:12, textTransform:'uppercase', marginBottom:6 }}>{s}</div>
            <div style={{ color:statusColors[s], fontSize:24, fontWeight:700 }}>{pos.filter(p=>p.status===s).length}</div>
          </div>
        ))}
      </div>

      <div style={card}>
        <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:20 }}>
          <div style={{ position:'relative', flex:1, minWidth:200 }}>
            <Search size={16} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#94a3b8' }}/>
            <input placeholder="Search POs..." value={search} onChange={e=>setSearch(e.target.value)} style={{ ...inp, paddingLeft:36 }}/>
          </div>
          <select value={filter} onChange={e=>setFilter(e.target.value)} style={{ ...inp, width:'auto', minWidth:140 }}>
            <option value="all">All Status</option>
            {['draft','sent','confirmed','received','cancelled'].map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
          </select>
          <button onClick={openAdd} style={btn}><Plus size={16}/>New Purchase Order</button>
        </div>

        {loading ? <div style={{ textAlign:'center', padding:40, color:'#94a3b8' }}>Loading...</div> : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ borderBottom:'1px solid #1e3a5f' }}>
                  {['PO Number','Supplier','Linked Order','Amount','Expected Date','Status','Actions'].map(h=>(
                    <th key={h} style={{ textAlign:'left', padding:'12px 10px', color:'#94a3b8', fontSize:13 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length===0 ? (
                  <tr><td colSpan={7} style={{ textAlign:'center', padding:40, color:'#94a3b8' }}>No purchase orders found</td></tr>
                ) : filtered.map((p,i)=>(
                  <tr key={p.id} style={{ borderBottom:'1px solid #1e3a5f', background:i%2===0?'transparent':'rgba(255,255,255,0.02)' }}>
                    <td style={{ padding:'12px 10px', color:'#00d4ff', fontWeight:700 }}>{p.po_number}</td>
                    <td style={{ padding:'12px 10px' }}>{p.supplier_name||'—'}</td>
                    <td style={{ padding:'12px 10px', color:'#94a3b8' }}>{p.order_number||'—'}</td>
                    <td style={{ padding:'12px 10px', color:'#00ff88', fontWeight:600 }}>₹{(p.total_amount||0).toLocaleString('en-IN')}</td>
                    <td style={{ padding:'12px 10px', color:'#94a3b8' }}>{p.expected_date||'—'}</td>
                    <td style={{ padding:'12px 10px' }}>
                      <span style={{ background:statusColors[p.status]+'22', color:statusColors[p.status], padding:'3px 10px', borderRadius:20, fontSize:12, fontWeight:600 }}>
                        {p.status?.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding:'12px 10px' }}>
                      <div style={{ display:'flex', gap:8 }}>
                        <button onClick={()=>openEdit(p)} style={{ background:'#1e3a5f', border:'none', borderRadius:6, padding:'6px 10px', cursor:'pointer', color:'#00d4ff' }}><Edit2 size={14}/></button>
                        <button onClick={()=>handleDelete(p.id)} style={{ background:'#3d1a1a', border:'none', borderRadius:6, padding:'6px 10px', cursor:'pointer', color:'#ef4444' }}><Trash2 size={14}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div style={{ background:'#1a2332', border:'1px solid #1e3a5f', borderRadius:16, padding:32, width:'100%', maxWidth:500 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:24 }}>
              <h2 style={{ margin:0 }}>{editing?'Edit':'Create'} Purchase Order</h2>
              <button onClick={()=>setShowModal(false)} style={{ background:'none', border:'none', color:'#94a3b8', cursor:'pointer' }}><X size={20}/></button>
            </div>
            <div style={{ display:'grid', gap:16 }}>
              {[
                { label:'Supplier *', key:'supplier_id', type:'select', opts: suppliers.map(s=>({ v:s.id, l:s.name })) },
                { label:'Linked Order', key:'order_id', type:'select', opts: [{ v:'', l:'— None —' }, ...orders.map(o=>({ v:o.id, l:`${o.order_number} - ${o.title}` }))] },
                { label:'Total Amount (₹)', key:'total_amount', type:'number' },
                { label:'Expected Date', key:'expected_date', type:'date' },
                { label:'Status', key:'status', type:'select', opts:['draft','sent','confirmed','received','cancelled'].map(s=>({ v:s, l:s.charAt(0).toUpperCase()+s.slice(1) })) },
                { label:'Notes', key:'notes', type:'textarea' },
              ].map(f=>(
                <div key={f.key}>
                  <label style={{ color:'#94a3b8', fontSize:13, display:'block', marginBottom:6 }}>{f.label}</label>
                  {f.type==='select' ? (
                    <select value={form[f.key]} onChange={e=>setForm({...form,[f.key]:e.target.value})} style={inp}>
                      {f.opts.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
                    </select>
                  ) : f.type==='textarea' ? (
                    <textarea value={form[f.key]} onChange={e=>setForm({...form,[f.key]:e.target.value})} style={{ ...inp, height:80, resize:'vertical' }}/>
                  ) : (
                    <input type={f.type} value={form[f.key]} onChange={e=>setForm({...form,[f.key]:e.target.value})} style={inp}/>
                  )}
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:12, marginTop:24, justifyContent:'flex-end' }}>
              <button onClick={()=>setShowModal(false)} style={{ background:'#0d1526', border:'1px solid #1e3a5f', borderRadius:8, padding:'10px 20px', color:'#94a3b8', cursor:'pointer' }}>Cancel</button>
              <button onClick={handleSave} style={btn}>{editing?'Update':'Create'} PO</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrders;
