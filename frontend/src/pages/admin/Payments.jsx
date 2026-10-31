import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CreditCard, Plus, Search, X } from 'lucide-react';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({ invoice_id:'', amount:'', payment_method:'bank_transfer', transaction_id:'', payment_date: new Date().toISOString().split('T')[0], notes:'' });

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };
  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      axios.get('/api/admin/payments', { headers }),
      axios.get('/api/admin/invoices', { headers })
    ]).then(([p,inv]) => { setPayments(p.data.data||[]); setInvoices(inv.data.data||[]); })
    .catch(()=>showToast('Failed to load','error')).finally(()=>setLoading(false));
  };

  useEffect(()=>{ fetchAll(); },[]);

  const handleSave = async () => {
    if (!form.invoice_id || !form.amount) { showToast('Fill required fields','error'); return; }
    try {
      await axios.post('/api/admin/payments', form, { headers });
      showToast('Payment recorded successfully!');
      setShowModal(false); fetchAll();
    } catch(e) { showToast(e.response?.data?.message||'Error','error'); }
  };

  const methodColors = { bank_transfer:'#3b82f6', cash:'#10b981', cheque:'#f59e0b', upi:'#8b5cf6', credit_card:'#00d4ff' };
  const totalReceived = payments.reduce((s,p)=>s+(p.amount||0),0);
  const filtered = payments.filter(p=>p.invoice_number?.toLowerCase().includes(search.toLowerCase())||p.transaction_id?.toLowerCase().includes(search.toLowerCase())||p.payment_method?.toLowerCase().includes(search.toLowerCase()));

  const card = { background:'#1a2332', border:'1px solid #1e3a5f', borderRadius:12, padding:24, marginBottom:20 };
  const inp = { background:'#0d1526', border:'1px solid #1e3a5f', borderRadius:8, padding:'10px 14px', color:'#fff', width:'100%', fontSize:14, boxSizing:'border-box' };
  const btn = { background:'linear-gradient(135deg,#00d4ff,#0099cc)', color:'#fff', border:'none', borderRadius:8, padding:'10px 20px', cursor:'pointer', fontWeight:600, display:'flex', alignItems:'center', gap:8 };

  return (
    <div style={{ padding:24, color:'#fff' }}>
      {toast && <div style={{ position:'fixed', top:20, right:20, background:toast.type==='success'?'#10b981':'#ef4444', color:'#fff', padding:'12px 20px', borderRadius:8, zIndex:9999, fontWeight:600 }}>{toast.msg}</div>}

      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
        <CreditCard size={28} color="#00d4ff"/>
        <div><h1 style={{ margin:0, fontSize:22, fontWeight:700 }}>Payment Tracking</h1><p style={{ margin:0, color:'#94a3b8', fontSize:14 }}>Record and monitor all payment transactions</p></div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:20 }}>
        {[
          { label:'Total Payments', val:payments.length, color:'#00d4ff' },
          { label:'Total Received', val:`₹${totalReceived.toLocaleString('en-IN',{minimumFractionDigits:2})}`, color:'#10b981' },
          { label:'This Month', val:`₹${payments.filter(p=>p.payment_date?.startsWith(new Date().toISOString().slice(0,7))).reduce((s,p)=>s+(p.amount||0),0).toLocaleString('en-IN')}`, color:'#f59e0b' },
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
            <input placeholder="Search payments..." value={search} onChange={e=>setSearch(e.target.value)} style={{ ...inp, paddingLeft:36 }}/>
          </div>
          <button onClick={()=>setShowModal(true)} style={btn}><Plus size={16}/>Record Payment</button>
        </div>

        {loading ? <div style={{ textAlign:'center', padding:40, color:'#94a3b8' }}>Loading...</div> : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ borderBottom:'1px solid #1e3a5f' }}>
                  {['Invoice #','Amount','Method','Transaction ID','Date','Notes'].map(h=>(
                    <th key={h} style={{ textAlign:'left', padding:'12px 10px', color:'#94a3b8', fontSize:13 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length===0 ? (
                  <tr><td colSpan={6} style={{ textAlign:'center', padding:40, color:'#94a3b8' }}>No payments recorded</td></tr>
                ) : filtered.map((p,i)=>(
                  <tr key={p.id} style={{ borderBottom:'1px solid #1e3a5f', background:i%2===0?'transparent':'rgba(255,255,255,0.02)' }}>
                    <td style={{ padding:'12px 10px', color:'#00d4ff', fontWeight:600 }}>{p.invoice_number||'—'}</td>
                    <td style={{ padding:'12px 10px', color:'#00ff88', fontWeight:700 }}>₹{(p.amount||0).toLocaleString('en-IN')}</td>
                    <td style={{ padding:'12px 10px' }}>
                      <span style={{ background:methodColors[p.payment_method]+'22'||'#1e3a5f', color:methodColors[p.payment_method]||'#94a3b8', padding:'3px 10px', borderRadius:20, fontSize:12, fontWeight:600 }}>
                        {p.payment_method?.replace('_',' ').toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding:'12px 10px', color:'#94a3b8', fontFamily:'monospace' }}>{p.transaction_id||'—'}</td>
                    <td style={{ padding:'12px 10px', color:'#94a3b8' }}>{p.payment_date||'—'}</td>
                    <td style={{ padding:'12px 10px', color:'#94a3b8' }}>{p.notes||'—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div style={{ background:'#1a2332', border:'1px solid #1e3a5f', borderRadius:16, padding:32, width:'100%', maxWidth:460 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:24 }}>
              <h2 style={{ margin:0 }}>Record Payment</h2>
              <button onClick={()=>setShowModal(false)} style={{ background:'none', border:'none', color:'#94a3b8', cursor:'pointer' }}><X size={20}/></button>
            </div>
            <div style={{ display:'grid', gap:16 }}>
              <div>
                <label style={{ color:'#94a3b8', fontSize:13, display:'block', marginBottom:6 }}>Invoice *</label>
                <select value={form.invoice_id} onChange={e=>setForm({...form,invoice_id:e.target.value})} style={inp}>
                  <option value="">— Select Invoice —</option>
                  {invoices.filter(i=>i.status!=='paid'&&i.status!=='cancelled').map(i=><option key={i.id} value={i.id}>{i.invoice_number} — ₹{(i.total_amount||0).toLocaleString('en-IN')} ({i.customer_name})</option>)}
                </select>
              </div>
              <div>
                <label style={{ color:'#94a3b8', fontSize:13, display:'block', marginBottom:6 }}>Amount (₹) *</label>
                <input type="number" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} style={inp} placeholder="0.00"/>
              </div>
              <div>
                <label style={{ color:'#94a3b8', fontSize:13, display:'block', marginBottom:6 }}>Payment Method</label>
                <select value={form.payment_method} onChange={e=>setForm({...form,payment_method:e.target.value})} style={inp}>
                  {[['bank_transfer','Bank Transfer'],['cash','Cash'],['cheque','Cheque'],['upi','UPI'],['credit_card','Credit Card']].map(([v,l])=><option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label style={{ color:'#94a3b8', fontSize:13, display:'block', marginBottom:6 }}>Transaction ID</label>
                <input value={form.transaction_id} onChange={e=>setForm({...form,transaction_id:e.target.value})} style={inp} placeholder="TXN/REF number"/>
              </div>
              <div>
                <label style={{ color:'#94a3b8', fontSize:13, display:'block', marginBottom:6 }}>Payment Date</label>
                <input type="date" value={form.payment_date} onChange={e=>setForm({...form,payment_date:e.target.value})} style={inp}/>
              </div>
              <div>
                <label style={{ color:'#94a3b8', fontSize:13, display:'block', marginBottom:6 }}>Notes</label>
                <textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} style={{ ...inp, height:70, resize:'vertical' }}/>
              </div>
            </div>
            <div style={{ display:'flex', gap:12, marginTop:24, justifyContent:'flex-end' }}>
              <button onClick={()=>setShowModal(false)} style={{ background:'#0d1526', border:'1px solid #1e3a5f', borderRadius:8, padding:'10px 20px', color:'#94a3b8', cursor:'pointer' }}>Cancel</button>
              <button onClick={handleSave} style={btn}><CreditCard size={16}/>Record Payment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
