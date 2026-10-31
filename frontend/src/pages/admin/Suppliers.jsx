import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Truck, Plus, Search, Edit2, Trash2, X, Star } from 'lucide-react';

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({ name:'', contact_person:'', email:'', phone:'', address:'', city:'', material_category:'', rating:3, status:'active' });

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };
  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

  const fetchSuppliers = () => {
    setLoading(true);
    axios.get('/api/admin/suppliers', { headers })
      .then(r=>setSuppliers(r.data.data||[])).catch(()=>showToast('Failed to load','error')).finally(()=>setLoading(false));
  };

  useEffect(()=>{ fetchSuppliers(); },[]);

  const openAdd = () => { setEditing(null); setForm({ name:'', contact_person:'', email:'', phone:'', address:'', city:'', material_category:'', rating:3, status:'active' }); setShowModal(true); };
  const openEdit = (s) => { setEditing(s); setForm({ name:s.name, contact_person:s.contact_person||'', email:s.email||'', phone:s.phone||'', address:s.address||'', city:s.city||'', material_category:s.material_category||'', rating:s.rating||3, status:s.status }); setShowModal(true); };

  const handleSave = async () => {
    if (!form.name) { showToast('Supplier name required','error'); return; }
    try {
      if (editing) { await axios.put(`/api/admin/suppliers/${editing.id}`, form, { headers }); showToast('Supplier updated'); }
      else { await axios.post('/api/admin/suppliers', form, { headers }); showToast('Supplier added'); }
      setShowModal(false); fetchSuppliers();
    } catch(e) { showToast(e.response?.data?.message||'Error','error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this supplier?')) return;
    try { await axios.delete(`/api/admin/suppliers/${id}`, { headers }); showToast('Deleted'); fetchSuppliers(); }
    catch(e) { showToast('Delete failed','error'); }
  };

  const filtered = suppliers.filter(s=>s.name?.toLowerCase().includes(search.toLowerCase())||s.city?.toLowerCase().includes(search.toLowerCase())||s.material_category?.toLowerCase().includes(search.toLowerCase()));

  const card = { background:'#1a2332', border:'1px solid #1e3a5f', borderRadius:12, padding:24, marginBottom:20 };
  const inp = { background:'#0d1526', border:'1px solid #1e3a5f', borderRadius:8, padding:'10px 14px', color:'#fff', width:'100%', fontSize:14, boxSizing:'border-box' };
  const btn = { background:'linear-gradient(135deg,#00d4ff,#0099cc)', color:'#fff', border:'none', borderRadius:8, padding:'10px 20px', cursor:'pointer', fontWeight:600, display:'flex', alignItems:'center', gap:8 };

  const renderStars = (n) => Array.from({length:5},(_, i)=><Star key={i} size={14} fill={i<n?'#f59e0b':'none'} color={i<n?'#f59e0b':'#475569'}/>);

  return (
    <div style={{ padding:24, color:'#fff' }}>
      {toast && <div style={{ position:'fixed', top:20, right:20, background:toast.type==='success'?'#10b981':'#ef4444', color:'#fff', padding:'12px 20px', borderRadius:8, zIndex:9999, fontWeight:600 }}>{toast.msg}</div>}

      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
        <Truck size={28} color="#00d4ff"/>
        <div><h1 style={{ margin:0, fontSize:22, fontWeight:700 }}>Suppliers</h1><p style={{ margin:0, color:'#94a3b8', fontSize:14 }}>Manage your material suppliers and vendors</p></div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:20 }}>
        {[
          { label:'Total Suppliers', val:suppliers.length, color:'#00d4ff' },
          { label:'Active', val:suppliers.filter(s=>s.status==='active').length, color:'#10b981' },
          { label:'Categories', val:new Set(suppliers.map(s=>s.material_category).filter(Boolean)).size, color:'#8b5cf6' },
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
            <input placeholder="Search suppliers..." value={search} onChange={e=>setSearch(e.target.value)} style={{ ...inp, paddingLeft:36 }}/>
          </div>
          <button onClick={openAdd} style={btn}><Plus size={16}/>Add Supplier</button>
        </div>

        {loading ? <div style={{ textAlign:'center', padding:40, color:'#94a3b8' }}>Loading...</div> : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ borderBottom:'1px solid #1e3a5f' }}>
                  {['Supplier Name','Contact','Email','Phone','City','Category','Rating','Status','Actions'].map(h=>(
                    <th key={h} style={{ textAlign:'left', padding:'12px 8px', color:'#94a3b8', fontSize:12, fontWeight:600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length===0 ? (
                  <tr><td colSpan={9} style={{ textAlign:'center', padding:40, color:'#94a3b8' }}>No suppliers found</td></tr>
                ) : filtered.map((s,i)=>(
                  <tr key={s.id} style={{ borderBottom:'1px solid #1e3a5f', background:i%2===0?'transparent':'rgba(255,255,255,0.02)' }}>
                    <td style={{ padding:'12px 8px', fontWeight:700 }}>{s.name}</td>
                    <td style={{ padding:'12px 8px', color:'#94a3b8' }}>{s.contact_person||'—'}</td>
                    <td style={{ padding:'12px 8px', color:'#00d4ff' }}>{s.email||'—'}</td>
                    <td style={{ padding:'12px 8px', color:'#94a3b8' }}>{s.phone||'—'}</td>
                    <td style={{ padding:'12px 8px', color:'#94a3b8' }}>{s.city||'—'}</td>
                    <td style={{ padding:'12px 8px' }}><span style={{ background:'#1e3a5f', color:'#94a3b8', padding:'2px 8px', borderRadius:12, fontSize:12 }}>{s.material_category||'—'}</span></td>
                    <td style={{ padding:'12px 8px' }}><div style={{ display:'flex', gap:2 }}>{renderStars(s.rating||3)}</div></td>
                    <td style={{ padding:'12px 8px' }}><span style={{ background:s.status==='active'?'#10b98122':'#ef444422', color:s.status==='active'?'#10b981':'#ef4444', padding:'3px 10px', borderRadius:20, fontSize:12, fontWeight:600 }}>{s.status?.toUpperCase()}</span></td>
                    <td style={{ padding:'12px 8px' }}>
                      <div style={{ display:'flex', gap:6 }}>
                        <button onClick={()=>openEdit(s)} style={{ background:'#1e3a5f', border:'none', borderRadius:6, padding:'6px 8px', cursor:'pointer', color:'#00d4ff' }}><Edit2 size={14}/></button>
                        <button onClick={()=>handleDelete(s.id)} style={{ background:'#3d1a1a', border:'none', borderRadius:6, padding:'6px 8px', cursor:'pointer', color:'#ef4444' }}><Trash2 size={14}/></button>
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
          <div style={{ background:'#1a2332', border:'1px solid #1e3a5f', borderRadius:16, padding:32, width:'100%', maxWidth:560, maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:24 }}>
              <h2 style={{ margin:0 }}>{editing?'Edit':'Add'} Supplier</h2>
              <button onClick={()=>setShowModal(false)} style={{ background:'none', border:'none', color:'#94a3b8', cursor:'pointer' }}><X size={20}/></button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              {[
                { label:'Supplier Name *', key:'name', type:'text', full:true },
                { label:'Contact Person', key:'contact_person', type:'text' },
                { label:'Email', key:'email', type:'email' },
                { label:'Phone', key:'phone', type:'text' },
                { label:'City', key:'city', type:'text' },
                { label:'Material Category', key:'material_category', type:'text' },
                { label:'Address', key:'address', type:'text', full:true },
              ].map(f=>(
                <div key={f.key} style={f.full?{gridColumn:'1/-1'}:{}}>
                  <label style={{ color:'#94a3b8', fontSize:13, display:'block', marginBottom:6 }}>{f.label}</label>
                  <input type={f.type} value={form[f.key]} onChange={e=>setForm({...form,[f.key]:e.target.value})} style={inp}/>
                </div>
              ))}
              <div>
                <label style={{ color:'#94a3b8', fontSize:13, display:'block', marginBottom:6 }}>Rating</label>
                <select value={form.rating} onChange={e=>setForm({...form,rating:parseInt(e.target.value)})} style={inp}>
                  {[1,2,3,4,5].map(n=><option key={n} value={n}>{'★'.repeat(n)} ({n}/5)</option>)}
                </select>
              </div>
              <div>
                <label style={{ color:'#94a3b8', fontSize:13, display:'block', marginBottom:6 }}>Status</label>
                <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} style={inp}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div style={{ display:'flex', gap:12, marginTop:24, justifyContent:'flex-end' }}>
              <button onClick={()=>setShowModal(false)} style={{ background:'#0d1526', border:'1px solid #1e3a5f', borderRadius:8, padding:'10px 20px', color:'#94a3b8', cursor:'pointer' }}>Cancel</button>
              <button onClick={handleSave} style={btn}>{editing?'Update':'Add'} Supplier</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;
