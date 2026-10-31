import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckSquare, X, RefreshCw } from 'lucide-react';

const statusColors = { pending:'#f59e0b', in_progress:'#3b82f6', completed:'#10b981' };
const priorityColors = { low:'#94a3b8', medium:'#f59e0b', high:'#ff6b35', urgent:'#ef4444' };

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [selected, setSelected] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };
  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

  const fetchTasks = () => {
    setLoading(true);
    axios.get('/api/employee/tasks', { headers })
      .then(r=>setTasks(r.data.data||[]))
      .catch(()=>showToast('Failed to load tasks','error'))
      .finally(()=>setLoading(false));
  };

  useEffect(()=>{ fetchTasks(); },[]);

  const updateStatus = async (taskId, status) => {
    try {
      await axios.put(`/api/employee/tasks/${taskId}/status`, { status }, { headers });
      showToast('Task updated!');
      setSelected(null);
      fetchTasks();
    } catch(e) { showToast('Update failed','error'); }
  };

  const filtered = tasks.filter(t=>{
    const matchSearch = t.title?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter==='all'||t.status===filter;
    return matchSearch && matchFilter;
  });

  const card = { background:'#1a2332', border:'1px solid #1e3a5f', borderRadius:12, padding:24, marginBottom:20 };
  const inp = { background:'#0d1526', border:'1px solid #1e3a5f', borderRadius:8, padding:'10px 14px', color:'#fff', width:'100%', fontSize:14, boxSizing:'border-box' };
  const btn = { background:'linear-gradient(135deg,#00d4ff,#0099cc)', color:'#fff', border:'none', borderRadius:8, padding:'10px 20px', cursor:'pointer', fontWeight:600, display:'flex', alignItems:'center', gap:8 };

  const completionRate = tasks.length ? Math.round(tasks.filter(t=>t.status==='completed').length/tasks.length*100) : 0;

  return (
    <div style={{ padding:24, color:'#fff' }}>
      {toast && <div style={{ position:'fixed', top:20, right:20, background:toast.type==='success'?'#10b981':'#ef4444', color:'#fff', padding:'12px 20px', borderRadius:8, zIndex:9999, fontWeight:600 }}>{toast.msg}</div>}

      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
        <CheckSquare size={28} color="#00d4ff"/>
        <div><h1 style={{ margin:0, fontSize:22, fontWeight:700 }}>My Tasks</h1><p style={{ margin:0, color:'#94a3b8', fontSize:14 }}>Track and update your assigned tasks</p></div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:20 }}>
        <div style={{ ...card, marginBottom:0 }}>
          <div style={{ color:'#94a3b8', fontSize:13, marginBottom:6 }}>Total Tasks</div>
          <div style={{ color:'#00d4ff', fontSize:22, fontWeight:700 }}>{tasks.length}</div>
        </div>
        <div style={{ ...card, marginBottom:0 }}>
          <div style={{ color:'#94a3b8', fontSize:13, marginBottom:6 }}>Pending</div>
          <div style={{ color:'#f59e0b', fontSize:22, fontWeight:700 }}>{tasks.filter(t=>t.status==='pending').length}</div>
        </div>
        <div style={{ ...card, marginBottom:0 }}>
          <div style={{ color:'#94a3b8', fontSize:13, marginBottom:6 }}>In Progress</div>
          <div style={{ color:'#3b82f6', fontSize:22, fontWeight:700 }}>{tasks.filter(t=>t.status==='in_progress').length}</div>
        </div>
        <div style={{ ...card, marginBottom:0 }}>
          <div style={{ color:'#94a3b8', fontSize:13, marginBottom:6 }}>Completion Rate</div>
          <div style={{ color:'#10b981', fontSize:22, fontWeight:700 }}>{completionRate}%</div>
          <div style={{ background:'#0d1526', borderRadius:4, height:4, marginTop:8, overflow:'hidden' }}>
            <div style={{ background:'#10b981', height:'100%', width:`${completionRate}%`, transition:'width 0.5s' }}/>
          </div>
        </div>
      </div>

      <div style={card}>
        <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:20 }}>
          <input placeholder="🔍 Search tasks..." value={search} onChange={e=>setSearch(e.target.value)} style={{ ...inp, flex:1, minWidth:200 }}/>
          <select value={filter} onChange={e=>setFilter(e.target.value)} style={{ ...inp, width:'auto', minWidth:160 }}>
            <option value="all">All Status</option>
            {['pending','in_progress','completed'].map(s=><option key={s} value={s}>{s.replace('_',' ')}</option>)}
          </select>
        </div>

        {loading ? <div style={{ textAlign:'center', padding:40, color:'#94a3b8' }}>Loading tasks...</div> : (
          <div>
            {filtered.length===0 ? (
              <div style={{ textAlign:'center', padding:40, color:'#94a3b8' }}>No tasks found</div>
            ) : filtered.map((task,i)=>(
              <div key={task.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px', background:i%2===0?'transparent':'rgba(255,255,255,0.02)', borderBottom:'1px solid #1e3a5f', borderLeft:`3px solid ${statusColors[task.status]||'#1e3a5f'}` }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                    <span style={{ fontWeight:700, fontSize:15 }}>{task.title}</span>
                    <span style={{ background:priorityColors[task.priority]+'22', color:priorityColors[task.priority], padding:'2px 8px', borderRadius:12, fontSize:11, fontWeight:600 }}>{task.priority?.toUpperCase()}</span>
                  </div>
                  {task.description && <div style={{ color:'#94a3b8', fontSize:13, marginBottom:4 }}>{task.description}</div>}
                  <div style={{ display:'flex', gap:16, fontSize:12, color:'#475569' }}>
                    {task.order_number && <span>📋 Order: {task.order_number}</span>}
                    {task.due_date && <span>📅 Due: {task.due_date}</span>}
                    {task.completed_at && <span>✅ Completed: {task.completed_at?.split('T')[0]}</span>}
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:12, marginLeft:16 }}>
                  <span style={{ background:statusColors[task.status]+'22', color:statusColors[task.status], padding:'4px 12px', borderRadius:20, fontSize:12, fontWeight:600 }}>
                    {task.status?.replace('_',' ').toUpperCase()}
                  </span>
                  {task.status !== 'completed' && (
                    <button onClick={()=>{ setSelected(task); setNewStatus(task.status); }} style={{ background:'#1e3a5f', border:'none', borderRadius:6, padding:'6px 12px', cursor:'pointer', color:'#00d4ff', display:'flex', alignItems:'center', gap:6, fontSize:13 }}>
                      <RefreshCw size={13}/>Update
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div style={{ background:'#1a2332', border:'1px solid #1e3a5f', borderRadius:16, padding:32, width:'100%', maxWidth:400 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
              <h2 style={{ margin:0 }}>Update Task</h2>
              <button onClick={()=>setSelected(null)} style={{ background:'none', border:'none', color:'#94a3b8', cursor:'pointer' }}><X size={20}/></button>
            </div>
            <p style={{ color:'#94a3b8', marginBottom:20 }}><strong style={{ color:'#fff' }}>{selected.title}</strong></p>
            <label style={{ color:'#94a3b8', fontSize:13, display:'block', marginBottom:8 }}>New Status</label>
            <select value={newStatus} onChange={e=>setNewStatus(e.target.value)} style={{ background:'#0d1526', border:'1px solid #1e3a5f', borderRadius:8, padding:'10px 14px', color:'#fff', width:'100%', marginBottom:20 }}>
              {['pending','in_progress','completed'].map(s=><option key={s} value={s}>{s.replace('_',' ')}</option>)}
            </select>
            <div style={{ display:'flex', gap:12, justifyContent:'flex-end' }}>
              <button onClick={()=>setSelected(null)} style={{ background:'#0d1526', border:'1px solid #1e3a5f', borderRadius:8, padding:'10px 20px', color:'#94a3b8', cursor:'pointer' }}>Cancel</button>
              <button onClick={()=>updateStatus(selected.id, newStatus)} style={btn}><CheckSquare size={14}/>Mark {newStatus.replace('_',' ')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
