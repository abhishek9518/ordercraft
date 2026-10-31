import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Receipt, Plus, Search, Edit2, CheckCircle, X, DollarSign } from 'lucide-react';

const statusColors = { draft:'#94a3b8', sent:'#3b82f6', paid:'#10b981', overdue:'#ef4444', cancelled:'#6b7280' };

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({ order_id:'', customer_id:'', subtotal:'', tax_rate:18, due_date:'', status:'draft', notes:'' });

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };
  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      axios.get('/api/admin/invoices', { headers }),
      axios.get('/api/admin/orders', { headers }),
      axios.get('/api/admin/customers', { headers })
    ]).then(([inv, ord, cust]) => {
      setInvoices(inv.data.data||[]); setOrders(ord.data.data||[]); setCustomers(cust.data.data||[]);
    }).catch(()=>showToast('Failed to load','error')).finally(()=>setLoading(false));
  };

  useEffect(()=>{ fetchAll(); },[]);

  const openAdd = () => { setEditing(null); setForm({ order_id:'', customer_id:'', subtotal:'', tax_rate:18, due_date:'', status:'draft', notes:'' }); setShowModal(true); };
  const openEdit = (inv) => { setEditing(inv); setForm({ order_id:inv.order_id||'', customer_id:inv.customer_id||'', subtotal:inv.subtotal||'', tax_rate:inv.tax_rate||18, due_date:inv.due_date||'', status:inv.status, notes:inv.notes||'' }); setShowModal(true); };

  const handleSave = async () => {
    if (!form.subtotal) { showToast('Enter subtotal','error'); return; }
    try {
      if (editing) { await axios.put(`/api/admin/invoices/${editing.id}`, form, { headers }); showToast('Invoice updated'); }
      else { await axios.post('/api/admin/invoices', form, { headers }); showToast('Invoice created'); }
      setShowModal(false); fetchAll();
    } catch(e) { showToast(e.response?.data?.message||'Error','error'); }
  };

  const markPaid = async (id) => {
    try {
      await axios.put(`/api/admin/invoices/${id}`, { status:'paid', payment_date: new Date().toISOString().split('T')[0] }, { headers });
      showToast('Invoice marked as paid!'); fetchAll();
    } catch(e) { showToast('Error','error'); }
  };

  const filtered = invoices.filter(inv => {
    const matchSearch = inv.invoice_number?.toLowerCase().includes(search.toLowerCase()) || inv.customer_name?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter==='all' || inv.status===filter;
    return matchSearch && matchFilter;
  });

  const totalRevenue = invoices.filter(i=>i.status==='paid').reduce((s,i)=>s+(i.total_amount||0),0);
  const totalPending = invoices.filter(i=>i.status!=='paid'&&i.status!=='cancelled').reduce((s,i)=>s+(i.total_amount||0),0);

  const card = { background:'#1a2332', border:'1px solid #1e3a5f', borderRadius:12, padding:24, marginBottom:20 };
  const inp = { background:'#0d1526', border:'1px solid #1e3a5f', borderRadius:8, padding:'10px 14px', color:'#fff', width:'100%', fontSize:14, boxSizing:'border-box' };
  const btn = { background:'linear-gradient(135deg,#00d4ff,#0099cc)', color:'#fff', border:'none', borderRadius:8, padding:'10px 20px', cursor:'pointer', fontWeight:600, display:'flex', alignItems:'center', gap:8 };

  return (
    <div style={{ padding:24, color:'#fff' }}>
      {toast && <div style={{ position:'fixed', top:20, right:20, background:toast.type==='success'?'#10b981':'#ef4444', color:'#fff', padding:'12px 20px', borderRadius:8, zIndex:9999, fontWeight:600 }}>{toast.msg}</div>}

      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
        <Receipt size={28} color="#00d4ff"/>
        <div><h1 style={{ margin:0, fontSize:22, fontWeight:700 }}>Invoices</h1><p style={{ margin:0, color:'#94a3b8', fontSize:14 }}>Generate and manage customer invoices</p></div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:20 }}>
        {[
          { label:'Total Invoices', val:invoices.length, color:'#00d4ff' },
          { label:'Revenue Collected', val:`₹${totalRevenue.toLocaleString('en-IN')}`, color:'#10b981' },
          { label:'Pending Amount', val:`₹${totalPending.toLocaleString('en-IN')}`, color:'#f59e0b' },
          { label:'Overdue', val:invoices.filter(i=>i.status==='overdue').length, color:'#ef4444' },
        ].map(s=>(
          <div key={s.label} style={{ ...card, marginBottom:0 }}>
            <div style={{ color:'#94a3b8', fontSize:13, marginBottom:6 }}>{s.label}</div>
            <div style={{ color:s.color, fontSize:22, fontWeight:700 }}>{s.val}</div>
          </div>
        ))}
      </div>

      <div style={card}>
        <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:20 }}>
          <div style={{ position:'relative', flex:1, minWidth:200 }}>
            <Search size={16} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#94a3b8' }}/>
            <input placeholder="Search invoices..." value={search} onChange={e=>setSearch(e.target.value)} style={{ ...inp, paddingLeft:36 }}/>
          </div>
          <select value={filter} onChange={e=>setFilter(e.target.value)} style={{ ...inp, width:'auto', minWidth:140 }}>
            <option value="all">All Status</option>
            {['draft','sent','paid','overdue','cancelled'].map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
          </select>
          <button onClick={openAdd} style={btn}><Plus size={16}/>New Invoice</button>
        </div>

        {loading ? <div style={{ textAlign:'center', padding:40, color:'#94a3b8' }}>Loading invoices...</div> : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ borderBottom:'1px solid #1e3a5f' }}>
                  {['Invoice #','Customer','Order','Subtotal','Tax','Total','Due Date','Status','Actions'].map(h=>(
                    <th key={h} style={{ textAlign:'left', padding:'12px 8px', color:'#94a3b8', fontSize:12, fontWeight:600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length===0 ? (
                  <tr><td colSpan={9} style={{ textAlign:'center', padding:40, color:'#94a3b8' }}>No invoices found</td></tr>
                ) : filtered.map((inv,i)=>(
                  <tr key={inv.id} style={{ borderBottom:'1px solid #1e3a5f', background:i%2===0?'transparent':'rgba(255,255,255,0.02)' }}>
                    <td style={{ padding:'12px 8px', color:'#00d4ff', fontWeight:700 }}>{inv.invoice_number}</td>
                    <td style={{ padding:'12px 8px' }}>{inv.customer_name||'—'}</td>
                    <td style={{ padding:'12px 8px', color:'#94a3b8' }}>{inv.order_number||'—'}</td>
                    <td style={{ padding:'12px 8px' }}>₹{(inv.subtotal||0).toLocaleString('en-IN')}</td>
                    <td style={{ padding:'12px 8px', color:'#94a3b8' }}>{inv.tax_rate}%</td>
                    <td style={{ padding:'12px 8px', color:'#00ff88', fontWeight:700 }}>₹{(inv.total_amount||0).toLocaleString('en-IN')}</td>
                    <td style={{ padding:'12px 8px', color: inv.status==='overdue'?'#ef4444':'#94a3b8' }}>{inv.due_date||'—'}</td>
                    <td style={{ padding:'12px 8px' }}>
                      <span style={{ background:statusColors[inv.status]+'22', color:statusColors[inv.status], padding:'3px 10px', borderRadius:20, fontSize:12, fontWeight:600 }}>
                        {inv.status?.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding:'12px 8px' }}>
                      <div style={{ display:'flex', gap:6 }}>
                        {inv.status !== 'paid' && inv.status !== 'cancelled' && (
                          <button onClick={()=>markPaid(inv.id)} title="Mark Paid" style={{ background:'#0a2e1a', border:'1px solid #10b981', borderRadius:6, padding:'6px 8px', cursor:'pointer', color:'#10b981' }}><CheckCircle size={14}/></button>
                        )}
                        <button onClick={()=>openEdit(inv)} style={{ background:'#1e3a5f', border:'none', borderRadius:6, padding:'6px 8px', cursor:'pointer', color:'#00d4ff' }}><Edit2 size={14}/></button>
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
          <div style={{ background:'#1a2332', border:'1px solid #1e3a5f', borderRadius:16, padding:32, width:'100%', maxWidth:500, maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:24 }}>
              <h2 style={{ margin:0 }}>{editing?'Edit':'Create'} Invoice</h2>
              <button onClick={()=>setShowModal(false)} style={{ background:'none', border:'none', color:'#94a3b8', cursor:'pointer' }}><X size={20}/></button>
            </div>
            <div style={{ display:'grid', gap:16 }}>
              <div>
                <label style={{ color:'#94a3b8', fontSize:13, display:'block', marginBottom:6 }}>Customer</label>
                <select value={form.customer_id} onChange={e=>setForm({...form,customer_id:e.target.value})} style={inp}>
                  <option value="">— Select Customer —</option>
                  {customers.map(c=><option key={c.id} value={c.id}>{c.name} ({c.company||''})</option>)}
                </select>
              </div>
              <div>
                <label style={{ color:'#94a3b8', fontSize:13, display:'block', marginBottom:6 }}>Linked Order</label>
                <select value={form.order_id} onChange={e=>setForm({...form,order_id:e.target.value})} style={inp}>
                  <option value="">— None —</option>
                  {orders.map(o=><option key={o.id} value={o.id}>{o.order_number} - {o.title}</option>)}
                </select>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                <div>
                  <label style={{ color:'#94a3b8', fontSize:13, display:'block', marginBottom:6 }}>Subtotal (₹) *</label>
                  <input type="number" value={form.subtotal} onChange={e=>setForm({...form,subtotal:e.target.value})} style={inp}/>
                </div>
                <div>
                  <label style={{ color:'#94a3b8', fontSize:13, display:'block', marginBottom:6 }}>Tax Rate (%)</label>
                  <input type="number" value={form.tax_rate} onChange={e=>setForm({...form,tax_rate:e.target.value})} style={inp}/>
                </div>
              </div>
              {form.subtotal && <div style={{ background:'#0d1526', borderRadius:8, padding:12, border:'1px solid #1e3a5f' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}><span style={{ color:'#94a3b8' }}>Subtotal:</span><span>₹{parseFloat(form.subtotal||0).toLocaleString('en-IN')}</span></div>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}><span style={{ color:'#94a3b8' }}>Tax ({form.tax_rate}%):</span><span>₹{(parseFloat(form.subtotal||0)*parseFloat(form.tax_rate||0)/100).toLocaleString('en-IN')}</span></div>
                <div style={{ display:'flex', justifyContent:'space-between', fontWeight:700, color:'#00ff88' }}><span>Total:</span><span>₹{(parseFloat(form.subtotal||0)*(1+parseFloat(form.tax_rate||0)/100)).toLocaleString('en-IN',{minimumFractionDigits:2})}</span></div>
              </div>}
              <div>
                <label style={{ color:'#94a3b8', fontSize:13, display:'block', marginBottom:6 }}>Due Date</label>
                <input type="date" value={form.due_date} onChange={e=>setForm({...form,due_date:e.target.value})} style={inp}/>
              </div>
              <div>
                <label style={{ color:'#94a3b8', fontSize:13, display:'block', marginBottom:6 }}>Status</label>
                <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} style={inp}>
                  {['draft','sent','paid','overdue','cancelled'].map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label style={{ color:'#94a3b8', fontSize:13, display:'block', marginBottom:6 }}>Notes</label>
                <textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} style={{ ...inp, height:70, resize:'vertical' }}/>
              </div>
            </div>
            <div style={{ display:'flex', gap:12, marginTop:24, justifyContent:'flex-end' }}>
              <button onClick={()=>setShowModal(false)} style={{ background:'#0d1526', border:'1px solid #1e3a5f', borderRadius:8, padding:'10px 20px', color:'#94a3b8', cursor:'pointer' }}>Cancel</button>
              <button onClick={handleSave} style={btn}><DollarSign size={16}/>{editing?'Update':'Create'} Invoice</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;
