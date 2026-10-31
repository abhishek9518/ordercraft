import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Search, AlertTriangle } from 'lucide-react';

const InventoryCheck = () => {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(()=>{
    axios.get('/api/employee/inventory', { headers })
      .then(r=>setItems(r.data.data||[])).catch(()=>{}).finally(()=>setLoading(false));
  },[]);

  const filtered = items.filter(i=>i.material_name?.toLowerCase().includes(search.toLowerCase())||i.category?.toLowerCase().includes(search.toLowerCase()));
  const card = { background:'#1a2332', border:'1px solid #1e3a5f', borderRadius:12, padding:24, marginBottom:20 };
  const inp = { background:'#0d1526', border:'1px solid #1e3a5f', borderRadius:8, padding:'10px 14px', color:'#fff', width:'100%', fontSize:14, boxSizing:'border-box' };

  return (
    <div style={{ padding:24, color:'#fff' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
        <Package size={28} color="#00d4ff"/>
        <div><h1 style={{ margin:0, fontSize:22, fontWeight:700 }}>Inventory Check</h1><p style={{ margin:0, color:'#94a3b8', fontSize:14 }}>Check material availability for your production needs</p></div>
      </div>

      {items.filter(i=>i.quantity_in_stock<=i.reorder_level).length > 0 && (
        <div style={{ background:'#2d1a0a', border:'1px solid #f59e0b', borderRadius:12, padding:16, marginBottom:20, display:'flex', gap:12, alignItems:'center' }}>
          <AlertTriangle size={20} color="#f59e0b"/>
          <span style={{ color:'#f59e0b', fontWeight:600 }}>{items.filter(i=>i.quantity_in_stock<=i.reorder_level).length} materials have low stock — check with admin</span>
        </div>
      )}

      <div style={card}>
        <div style={{ position:'relative', marginBottom:20 }}>
          <Search size={16} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#94a3b8' }}/>
          <input placeholder="Search materials..." value={search} onChange={e=>setSearch(e.target.value)} style={{ ...inp, paddingLeft:36 }}/>
        </div>

        {loading ? <div style={{ textAlign:'center', padding:40, color:'#94a3b8' }}>Loading inventory...</div> : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ borderBottom:'1px solid #1e3a5f' }}>
                  {['Material','Part #','Category','Available Stock','Unit','Reorder Level','Status','Location'].map(h=>(
                    <th key={h} style={{ textAlign:'left', padding:'12px 10px', color:'#94a3b8', fontSize:13 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length===0 ? (
                  <tr><td colSpan={8} style={{ textAlign:'center', padding:40, color:'#94a3b8' }}>No inventory found</td></tr>
                ) : filtered.map((item,i)=>{
                  const isLow = item.quantity_in_stock<=item.reorder_level;
                  const isOut = item.quantity_in_stock===0;
                  return (
                    <tr key={item.id} style={{ borderBottom:'1px solid #1e3a5f', background:i%2===0?'transparent':'rgba(255,255,255,0.02)' }}>
                      <td style={{ padding:'12px 10px', fontWeight:600 }}>{item.material_name}</td>
                      <td style={{ padding:'12px 10px', color:'#94a3b8', fontFamily:'monospace', fontSize:12 }}>{item.part_number||'—'}</td>
                      <td style={{ padding:'12px 10px' }}><span style={{ background:'#1e3a5f', color:'#94a3b8', padding:'2px 8px', borderRadius:12, fontSize:12 }}>{item.category||'—'}</span></td>
                      <td style={{ padding:'12px 10px' }}>
                        <span style={{ color: isOut?'#ef4444':isLow?'#f59e0b':'#10b981', fontWeight:700, fontSize:16 }}>{item.quantity_in_stock}</span>
                      </td>
                      <td style={{ padding:'12px 10px', color:'#94a3b8' }}>{item.unit}</td>
                      <td style={{ padding:'12px 10px', color:'#94a3b8' }}>{item.reorder_level}</td>
                      <td style={{ padding:'12px 10px' }}>
                        <span style={{ background: isOut?'#ef444422':isLow?'#f59e0b22':'#10b98122', color: isOut?'#ef4444':isLow?'#f59e0b':'#10b981', padding:'3px 10px', borderRadius:20, fontSize:12, fontWeight:600 }}>
                          {isOut?'OUT OF STOCK':isLow?'LOW STOCK':'AVAILABLE'}
                        </span>
                      </td>
                      <td style={{ padding:'12px 10px', color:'#94a3b8' }}>{item.location||'—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryCheck;
