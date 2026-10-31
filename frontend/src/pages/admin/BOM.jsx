import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Plus, Search, Edit2, Trash2, X, AlertTriangle } from 'lucide-react';

const BOM = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState('');
  const [bomItems, setBomItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({ material_name:'', part_number:'', quantity:'', unit:'pcs', unit_cost:'', supplier_id:'', status:'required' });

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const showToast = (msg, type='success') => { setToast({ msg, type }); setTimeout(()=>setToast(null),3000); };

  useEffect(() => {
    axios.get('/api/admin/orders', { headers }).then(r => setOrders(r.data.data || [])).catch(()=>{});
  }, []);

  useEffect(() => {
    if (selectedOrder) fetchBOM();
  }, [selectedOrder]);

  const fetchBOM = () => {
    if (!selectedOrder) return;
    setLoading(true);
    axios.get(`/api/admin/bom/${selectedOrder}`, { headers })
      .then(r => setBomItems(r.data.data || []))
      .catch(() => showToast('Failed to load BOM','error'))
      .finally(() => setLoading(false));
  };

  const openAdd = () => { setEditing(null); setForm({ material_name:'', part_number:'', quantity:'', unit:'pcs', unit_cost:'', supplier_id:'', status:'required' }); setShowModal(true); };
  const openEdit = (item) => { setEditing(item); setForm({ material_name: item.material_name, part_number: item.part_number||'', quantity: item.quantity, unit: item.unit, unit_cost: item.unit_cost, supplier_id: item.supplier_id||'', status: item.status }); setShowModal(true); };

  const handleSave = async () => {
    if (!form.material_name || !form.quantity) { showToast('Fill required fields','error'); return; }
    if (!selectedOrder) { showToast('Select an order first','error'); return; }
    try {
      if (editing) {
        await axios.put(`/api/admin/bom/${editing.id}`, form, { headers });
        showToast('BOM item updated');
      } else {
        await axios.post(`/api/admin/bom/${selectedOrder}`, form, { headers });
        showToast('BOM item added');
      }
      setShowModal(false); fetchBOM();
    } catch(e) { showToast(e.response?.data?.message||'Error','error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this BOM item?')) return;
    try { await axios.delete(`/api/admin/bom/${id}`, { headers }); showToast('Deleted'); fetchBOM(); }
    catch(e) { showToast('Delete failed','error'); }
  };

  const totalCost = bomItems.reduce((s,i)=>s+(i.total_cost||0),0);
  const filtered = bomItems.filter(i=>i.material_name?.toLowerCase().includes(search.toLowerCase()));

  const card = { background:'#1a2332', border:'1px solid #1e3a5f', borderRadius:12, padding:24, marginBottom:20 };
  const inp = { background:'#0d1526', border:'1px solid #1e3a5f', borderRadius:8, padding:'10px 14px', color:'#fff', width:'100%', fontSize:14, boxSizing:'border-box' };
  const btn = { background:'linear-gradient(135deg,#00d4ff,#0099cc)', color:'#fff', border:'none', borderRadius:8, padding:'10px 20px', cursor:'pointer', fontWeight:600, display:'flex', alignItems:'center', gap:8 };

  const statusColor = { required:'#f59e0b', ordered:'#3b82f6', received:'#10b981', out_of_stock:'#ef4444' };

  return (
    <div style={{ padding:24, color:'#fff' }}>
      {toast && <div style={{ position:'fixed', top:20, right:20, background: toast.type==='success'?'#10b981':'#ef4444', color:'#fff', padding:'12px 20px', borderRadius:8, zIndex:9999, fontWeight:600 }}>{toast.msg}</div>}
      
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
        <Package size={28} color="#00d4ff"/>
        <div>
          <h1 style={{ margin:0, fontSize:22, fontWeight:700 }}>Bill of Materials (BOM)</h1>
          <p style={{ margin:0, color:'#94a3b8', fontSize:14 }}>Manage material lists for manufacturing orders</p>
        </div>
      </div>

      <div style={card}>
        <div style={{ display:'flex', gap:16, alignItems:'center', flexWrap:'wrap' }}>
          <select value={selectedOrder} onChange={e=>setSelectedOrder(e.target.value)} style={{ ...inp, maxWidth:320 }}>
            <option value="">— Select an Order —</option>
            {orders.map(o=><option key={o.id} value={o.id}>{o.order_number} — {o.title}</option>)}
          </select>
          {selectedOrder && (
            <>
              <div style={{ position:'relative', flex:1, minWidth:200 }}>
                <Search size={16} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#94a3b8' }}/>
                <input placeholder="Search materials..." value={search} onChange={e=>setSearch(e.target.value)} style={{ ...inp, paddingLeft:36 }}/>
              </div>
              <button onClick={openAdd} style={btn}><Plus size={16}/>Add Material</button>
            </>
          )}
        </div>
      </div>

      {selectedOrder && (
        <>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:20 }}>
            {[
              { label:'Total Materials', value: bomItems.length, color:'#00d4ff' },
              { label:'Total BOM Cost', value:`₹${totalCost.toLocaleString('en-IN',{minimumFractionDigits:2})}`, color:'#00ff88' },
              { label:'Pending Items', value: bomItems.filter(i=>i.status==='required').length, color:'#f59e0b' }
            ].map(s=>(
              <div key={s.label} style={{ ...card, marginBottom:0 }}>
                <div style={{ color:'#94a3b8', fontSize:13, marginBottom:6 }}>{s.label}</div>
                <div style={{ color:s.color, fontSize:24, fontWeight:700 }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div style={card}>
            {loading ? <div style={{ textAlign:'center', color:'#94a3b8', padding:40 }}>Loading BOM...</div> : (
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom:'1px solid #1e3a5f' }}>
                      {['Material Name','Part #','Qty','Unit','Unit Cost','Total Cost','Status','Actions'].map(h=>(
                        <th key={h} style={{ textAlign:'left', padding:'12px 10px', color:'#94a3b8', fontSize:13, fontWeight:600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length===0 ? (
                      <tr><td colSpan={8} style={{ textAlign:'center', padding:40, color:'#94a3b8' }}><AlertTriangle size={24} style={{ marginBottom:8, display:'block', margin:'0 auto 8px' }}/>No materials added yet. Click "Add Material" to begin.</td></tr>
                    ) : filtered.map((item,i)=>(
                      <tr key={item.id} style={{ borderBottom:'1px solid #1e3a5f', background: i%2===0?'transparent':'rgba(255,255,255,0.02)' }}>
                        <td style={{ padding:'12px 10px', fontWeight:600 }}>{item.material_name}</td>
                        <td style={{ padding:'12px 10px', color:'#94a3b8' }}>{item.part_number||'—'}</td>
                        <td style={{ padding:'12px 10px' }}>{item.quantity}</td>
                        <td style={{ padding:'12px 10px', color:'#94a3b8' }}>{item.unit}</td>
                        <td style={{ padding:'12px 10px' }}>₹{(item.unit_cost||0).toLocaleString('en-IN')}</td>
                        <td style={{ padding:'12px 10px', color:'#00ff88', fontWeight:600 }}>₹{(item.total_cost||0).toLocaleString('en-IN')}</td>
                        <td style={{ padding:'12px 10px' }}>
                          <span style={{ background: statusColor[item.status]+'22', color: statusColor[item.status], padding:'3px 10px', borderRadius:20, fontSize:12, fontWeight:600 }}>
                            {item.status?.replace('_',' ').toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding:'12px 10px' }}>
                          <div style={{ display:'flex', gap:8 }}>
                            <button onClick={()=>openEdit(item)} style={{ background:'#1e3a5f', border:'none', borderRadius:6, padding:'6px 10px', cursor:'pointer', color:'#00d4ff' }}><Edit2 size={14}/></button>
                            <button onClick={()=>handleDelete(item.id)} style={{ background:'#3d1a1a', border:'none', borderRadius:6, padding:'6px 10px', cursor:'pointer', color:'#ef4444' }}><Trash2 size={14}/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {filtered.length > 0 && (
                    <tfoot>
                      <tr style={{ borderTop:'2px solid #1e3a5f' }}>
                        <td colSpan={5} style={{ padding:'12px 10px', fontWeight:700, color:'#94a3b8' }}>TOTAL BOM COST</td>
                        <td style={{ padding:'12px 10px', fontWeight:700, color:'#00ff88', fontSize:16 }}>₹{totalCost.toLocaleString('en-IN',{minimumFractionDigits:2})}</td>
                        <td colSpan={2}/>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {!selectedOrder && (
        <div style={{ ...card, textAlign:'center', padding:60 }}>
          <Package size={48} color="#1e3a5f" style={{ marginBottom:16 }}/>
          <h3 style={{ color:'#94a3b8', margin:'0 0 8px' }}>Select an Order</h3>
          <p style={{ color:'#475569', margin:0 }}>Choose a manufacturing order above to view or manage its Bill of Materials</p>
        </div>
      )}

      {showModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div style={{ background:'#1a2332', border:'1px solid #1e3a5f', borderRadius:16, padding:32, width:'100%', maxWidth:500 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:24 }}>
              <h2 style={{ margin:0 }}>{editing?'Edit':'Add'} Material</h2>
              <button onClick={()=>setShowModal(false)} style={{ background:'none', border:'none', color:'#94a3b8', cursor:'pointer' }}><X size={20}/></button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              {[
                { label:'Material Name *', key:'material_name', type:'text', full:true },
                { label:'Part Number', key:'part_number', type:'text' },
                { label:'Quantity *', key:'quantity', type:'number' },
                { label:'Unit Cost (₹)', key:'unit_cost', type:'number' },
              ].map(f=>(
                <div key={f.key} style={f.full?{gridColumn:'1/-1'}:{}}>
                  <label style={{ color:'#94a3b8', fontSize:13, display:'block', marginBottom:6 }}>{f.label}</label>
                  <input type={f.type} value={form[f.key]} onChange={e=>setForm({...form,[f.key]:e.target.value})} style={inp}/>
                </div>
              ))}
              <div>
                <label style={{ color:'#94a3b8', fontSize:13, display:'block', marginBottom:6 }}>Unit</label>
                <select value={form.unit} onChange={e=>setForm({...form,unit:e.target.value})} style={inp}>
                  {['pcs','kg','m','litre','set','box','roll'].map(u=><option key={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label style={{ color:'#94a3b8', fontSize:13, display:'block', marginBottom:6 }}>Status</label>
                <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} style={inp}>
                  {['required','ordered','received','out_of_stock'].map(s=><option key={s} value={s}>{s.replace('_',' ')}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display:'flex', gap:12, marginTop:24, justifyContent:'flex-end' }}>
              <button onClick={()=>setShowModal(false)} style={{ background:'#0d1526', border:'1px solid #1e3a5f', borderRadius:8, padding:'10px 20px', color:'#94a3b8', cursor:'pointer' }}>Cancel</button>
              <button onClick={handleSave} style={btn}>{editing?'Update':'Add'} Material</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BOM;
