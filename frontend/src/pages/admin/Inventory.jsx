import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Plus, Search, Edit2, Trash2, X, AlertTriangle } from 'lucide-react';

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({ material_name:'', part_number:'', category:'', quantity_in_stock:'', unit:'pcs', reorder_level:10, unit_cost:'', supplier_id:'', location:'' });

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };
  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      axios.get('/api/admin/inventory', { headers }),
      axios.get('/api/admin/suppliers', { headers })
    ]).then(([inv,sup]) => { setItems(inv.data.data||[]); setSuppliers(sup.data.data||[]); })
    .catch(()=>showToast('Failed to load','error')).finally(()=>setLoading(false));
  };

  useEffect(()=>{ fetchAll(); },[]);

  const openAdd = () => { setEditing(null); setForm({ material_name:'', part_number:'', category:'', quantity_in_stock:'', unit:'pcs', reorder_level:10, unit_cost:'', supplier_id:'', location:'' }); setShowModal(true); };
  const openEdit = (item) => { setEditing(item); setForm({ material_name:item.material_name, part_number:item.part_number||'', category:item.category||'', quantity_in_stock:item.quantity_in_stock, unit:item.unit, reorder_level:item.reorder_level, unit_cost:item.unit_cost||'', supplier_id:item.supplier_id||'', location:item.location||'' }); setShowModal(true); };

  const handleSave = async () => {
    if (!form.material_name) { showToast('Material name required','error'); return; }
    try {
      if (editing) { await axios.put(`/api/admin/inventory/${editing.id}`, form, { headers }); showToast('Item updated'); }
      else { await axios.post('/api/admin/inventory', form, { headers }); showToast('Item added'); }
      setShowModal(false); fetchAll();
    } catch(e) { showToast(e.response?.data?.message||'Error','error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this inventory item?')) return;
    try { await axios.delete(`/api/admin/inventory/${id}`, { headers }); showToast('Deleted'); fetchAll(); }
    catch(e) { showToast('Delete failed','error'); }
  };

  const categories = ['all', ...new Set(items.map(i=>i.category).filter(Boolean))];
  const filtered = items.filter(i => {
    const matchSearch = i.material_name?.toLowerCase().includes(search.toLowerCase()) || i.part_number?.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat==='all' || i.category===filterCat;
    return matchSearch && matchCat;
  });

  const lowStock = items.filter(i=>i.quantity_in_stock<=i.reorder_level);
  const totalValue = items.reduce((s,i)=>s+(i.quantity_in_stock||0)*(i.unit_cost||0),0);

  const card = { background:'#1a2332', border:'1px solid #1e3a5f', borderRadius:12, padding:24, marginBottom:20 };
  const inp = { background:'#0d1526', border:'1px solid #1e3a5f', borderRadius:8, padding:'10px 14px', color:'#fff', width:'100%', fontSize:14, boxSizing:'border-box' };
  const btn = { background:'linear-gradient(135deg,#00d4ff,#0099cc)', color:'#fff', border:'none', borderRadius:8, padding:'10px 20px', cursor:'pointer', fontWeight:600, display:'flex', alignItems:'center', gap:8 };

  return (
    <div style={{ padding:24, color:'#fff' }}>
      {toast && <div style={{ position:'fixed', top:20, right:20, background:toast.type==='success'?'#10b981':'#ef4444', color:'#fff', padding:'12px 20px', borderRadius:8, zIndex:9999, fontWeight:600 }}>{toast.msg}</div>}

      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
        <Package size={28} color="#00d4ff"/>
        <div><h1 style={{ margin:0, fontSize:22, fontWeight:700 }}>Inventory Management</h1><p style={{ margin:0, color:'#94a3b8', fontSize:14 }}>Track stock levels and material availability</p></div>
      </div>

      {lowStock.length > 0 && (
        <div style={{ background:'#2d1a0a', border:'1px solid #f59e0b', borderRadius:12, padding:16, marginBottom:20, display:'flex', alignItems:'center', gap:12 }}>
          <AlertTriangle size={20} color="#f59e0b"/>
          <span style={{ color:'#f59e0b', fontWeight:600 }}>{lowStock.length} item{lowStock.length>1?'s':''} below reorder level: {lowStock.map(i=>i.material_name).join(', ')}</span>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:20 }}>
        {[
          { label:'Total Items', val:items.length, color:'#00d4ff' },
          { label:'Low Stock Alerts', val:lowStock.length, color:'#f59e0b' },
          { label:'Out of Stock', val:items.filter(i=>i.quantity_in_stock===0).length, color:'#ef4444' },
          { label:'Total Value', val:`₹${totalValue.toLocaleString('en-IN',{minimumFractionDigits:0})}`, color:'#10b981' },
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
            <input placeholder="Search materials..." value={search} onChange={e=>setSearch(e.target.value)} style={{ ...inp, paddingLeft:36 }}/>
          </div>
          <select value={filterCat} onChange={e=>setFilterCat(e.target.value)} style={{ ...inp, width:'auto', minWidth:160 }}>
            {categories.map(c=><option key={c} value={c}>{c==='all'?'All Categories':c}</option>)}
          </select>
          <button onClick={openAdd} style={btn}><Plus size={16}/>Add Item</button>
        </div>

        {loading ? <div style={{ textAlign:'center', padding:40, color:'#94a3b8' }}>Loading...</div> : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ borderBottom:'1px solid #1e3a5f' }}>
                  {['Material','Part #','Category','In Stock','Unit','Reorder Lvl','Unit Cost','Location','Actions'].map(h=>(
                    <th key={h} style={{ textAlign:'left', padding:'12px 8px', color:'#94a3b8', fontSize:12, fontWeight:600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length===0 ? (
                  <tr><td colSpan={9} style={{ textAlign:'center', padding:40, color:'#94a3b8' }}>No inventory items found</td></tr>
                ) : filtered.map((item,i)=>{
                  const isLow = item.quantity_in_stock <= item.reorder_level;
                  const isOut = item.quantity_in_stock === 0;
                  return (
                    <tr key={item.id} style={{ borderBottom:'1px solid #1e3a5f', background:i%2===0?'transparent':'rgba(255,255,255,0.02)' }}>
                      <td style={{ padding:'12px 8px', fontWeight:600 }}>{item.material_name}</td>
                      <td style={{ padding:'12px 8px', color:'#94a3b8', fontFamily:'monospace', fontSize:13 }}>{item.part_number||'—'}</td>
                      <td style={{ padding:'12px 8px' }}><span style={{ background:'#1e3a5f', color:'#94a3b8', padding:'2px 8px', borderRadius:12, fontSize:12 }}>{item.category||'—'}</span></td>
                      <td style={{ padding:'12px 8px' }}>
                        <span style={{ color: isOut?'#ef4444':isLow?'#f59e0b':'#10b981', fontWeight:700 }}>{item.quantity_in_stock}</span>
                        {isLow&&!isOut&&<span style={{ color:'#f59e0b', fontSize:11, marginLeft:4 }}>⚠ Low</span>}
                        {isOut&&<span style={{ color:'#ef4444', fontSize:11, marginLeft:4 }}>✗ Out</span>}
                      </td>
                      <td style={{ padding:'12px 8px', color:'#94a3b8' }}>{item.unit}</td>
                      <td style={{ padding:'12px 8px', color:'#94a3b8' }}>{item.reorder_level}</td>
                      <td style={{ padding:'12px 8px' }}>₹{(item.unit_cost||0).toLocaleString('en-IN')}</td>
                      <td style={{ padding:'12px 8px', color:'#94a3b8' }}>{item.location||'—'}</td>
                      <td style={{ padding:'12px 8px' }}>
                        <div style={{ display:'flex', gap:6 }}>
                          <button onClick={()=>openEdit(item)} style={{ background:'#1e3a5f', border:'none', borderRadius:6, padding:'6px 8px', cursor:'pointer', color:'#00d4ff' }}><Edit2 size={14}/></button>
                          <button onClick={()=>handleDelete(item.id)} style={{ background:'#3d1a1a', border:'none', borderRadius:6, padding:'6px 8px', cursor:'pointer', color:'#ef4444' }}><Trash2 size={14}/></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div style={{ background:'#1a2332', border:'1px solid #1e3a5f', borderRadius:16, padding:32, width:'100%', maxWidth:560, maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:24 }}>
              <h2 style={{ margin:0 }}>{editing?'Edit':'Add'} Inventory Item</h2>
              <button onClick={()=>setShowModal(false)} style={{ background:'none', border:'none', color:'#94a3b8', cursor:'pointer' }}><X size={20}/></button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              {[
                { label:'Material Name *', key:'material_name', type:'text', full:true },
                { label:'Part Number', key:'part_number', type:'text' },
                { label:'Category', key:'category', type:'text' },
                { label:'Quantity in Stock', key:'quantity_in_stock', type:'number' },
                { label:'Reorder Level', key:'reorder_level', type:'number' },
                { label:'Unit Cost (₹)', key:'unit_cost', type:'number' },
                { label:'Location', key:'location', type:'text' },
              ].map(f=>(
                <div key={f.key} style={f.full?{gridColumn:'1/-1'}:{}}>
                  <label style={{ color:'#94a3b8', fontSize:13, display:'block', marginBottom:6 }}>{f.label}</label>
                  <input type={f.type} value={form[f.key]} onChange={e=>setForm({...form,[f.key]:e.target.value})} style={inp}/>
                </div>
              ))}
              <div>
                <label style={{ color:'#94a3b8', fontSize:13, display:'block', marginBottom:6 }}>Unit</label>
                <select value={form.unit} onChange={e=>setForm({...form,unit:e.target.value})} style={inp}>
                  {['pcs','kg','m','litre','set','box','roll','sheet'].map(u=><option key={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label style={{ color:'#94a3b8', fontSize:13, display:'block', marginBottom:6 }}>Supplier</label>
                <select value={form.supplier_id} onChange={e=>setForm({...form,supplier_id:e.target.value})} style={inp}>
                  <option value="">— None —</option>
                  {suppliers.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display:'flex', gap:12, marginTop:24, justifyContent:'flex-end' }}>
              <button onClick={()=>setShowModal(false)} style={{ background:'#0d1526', border:'1px solid #1e3a5f', borderRadius:8, padding:'10px 20px', color:'#94a3b8', cursor:'pointer' }}>Cancel</button>
              <button onClick={handleSave} style={btn}>{editing?'Update':'Add'} Item</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
