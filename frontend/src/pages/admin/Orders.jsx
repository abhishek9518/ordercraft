import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, Edit2, Trash2, Eye, X, Filter } from 'lucide-react';

const mockOrders = [
  { _id: '1', orderId: 'ORD-001', customer: 'Tata Steel Ltd', title: 'Steel Frame Assembly', description: 'Fabrication of 50 steel frames for industrial use', status: 'in-progress', priority: 'high', assignedTo: 'Arjun Mehta', dueDate: '2024-11-20', amount: 125000, createdAt: '2024-11-05' },
  { _id: '2', orderId: 'ORD-002', customer: 'Mahindra Corp', title: 'Hydraulic Press Parts', description: 'Manufacturing of hydraulic press components', status: 'pending', priority: 'medium', assignedTo: 'Kavya Reddy', dueDate: '2024-11-25', amount: 78500, createdAt: '2024-11-08' },
  { _id: '3', orderId: 'ORD-003', customer: 'L&T Industries', title: 'Conveyor Belt System', description: 'Complete conveyor belt installation kit', status: 'completed', priority: 'low', assignedTo: 'Rohit Verma', dueDate: '2024-11-10', amount: 245000, createdAt: '2024-10-28' },
  { _id: '4', orderId: 'ORD-004', customer: 'BHEL Ltd', title: 'Boiler Components', description: 'High pressure boiler component set', status: 'in-progress', priority: 'high', assignedTo: 'Manish Gupta', dueDate: '2024-11-28', amount: 189000, createdAt: '2024-11-06' },
  { _id: '5', orderId: 'ORD-005', customer: 'Reliance Ind', title: 'Pump Assembly Units', description: 'Industrial pump assembly x20', status: 'pending', priority: 'medium', assignedTo: 'Sneha Iyer', dueDate: '2024-12-01', amount: 67000, createdAt: '2024-11-10' },
  { _id: '6', orderId: 'ORD-006', customer: 'Siemens India', title: 'Electrical Panel Box', description: 'Custom electrical control panels', status: 'cancelled', priority: 'low', assignedTo: 'Arjun Mehta', dueDate: '2024-11-15', amount: 43000, createdAt: '2024-11-02' },
];

const emptyForm = { customer: '', title: '', description: '', priority: 'medium', assignedTo: '', dueDate: '', amount: '' };

const Toast = ({ message, type }) => (
  <div className={`toast toast-${type}`}><span>{type === 'success' ? '✓' : '✕'}</span>{message}</div>
);

const Modal = ({ title, onClose, children, wide }) => (
  <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
    <div className="modal-content" style={{ maxWidth: wide ? 700 : 600 }}>
      <div className="modal-header">
        <span className="modal-title">{title}</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
      </div>
      {children}
    </div>
  </div>
);

const statusBadge = (status) => {
  const map = { pending: 'badge-pending', 'in-progress': 'badge-active', completed: 'badge-completed', cancelled: 'badge-cancelled' };
  return <span className={`badge ${map[status] || ''}`} style={{ textTransform: 'capitalize' }}>{status.replace('-', ' ')}</span>;
};

const Orders = () => {
  const [orders, setOrders] = useState(mockOrders);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get('/api/orders').then(r => { if (r.data?.length) setOrders(r.data); }).catch(() => {});
  }, []);

  const showToast = (msg, type = 'success') => { setToast({ message: msg, type }); setTimeout(() => setToast(null), 3000); };

  const openAdd = () => { setEditData(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (o) => {
    setEditData(o);
    setForm({ customer: o.customer, title: o.title, description: o.description, priority: o.priority, assignedTo: o.assignedTo, dueDate: o.dueDate, amount: o.amount });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.customer || !form.title) { showToast('Customer and title required', 'error'); return; }
    setLoading(true);
    try {
      if (editData) {
        await axios.put(`/api/orders/${editData._id}`, form).catch(() => {});
        setOrders(os => os.map(o => o._id === editData._id ? { ...o, ...form } : o));
        showToast('Order updated');
      } else {
        const newOrder = { ...form, _id: Date.now().toString(), orderId: `ORD-${String(orders.length + 1).padStart(3, '0')}`, status: 'pending', createdAt: new Date().toISOString().split('T')[0] };
        const res = await axios.post('/api/orders', form).catch(() => ({ data: null }));
        setOrders(os => [...os, res.data || newOrder]);
        showToast('Order created');
      }
      setShowModal(false);
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this order?')) return;
    await axios.delete(`/api/orders/${id}`).catch(() => {});
    setOrders(os => os.filter(o => o._id !== id));
    showToast('Order deleted');
  };

  const handleStatusChange = async (id, newStatus) => {
    await axios.put(`/api/orders/${id}`, { status: newStatus }).catch(() => {});
    setOrders(os => os.map(o => o._id === id ? { ...o, status: newStatus } : o));
    showToast(`Status updated to ${newStatus}`);
  };

  const filtered = orders.filter(o => {
    const matchSearch = o.title.toLowerCase().includes(search.toLowerCase()) || o.customer.toLowerCase().includes(search.toLowerCase()) || o.orderId.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || o.status === filter;
    return matchSearch && matchFilter;
  });

  const statusCounts = { all: orders.length, pending: orders.filter(o => o.status === 'pending').length, 'in-progress': orders.filter(o => o.status === 'in-progress').length, completed: orders.filter(o => o.status === 'completed').length, cancelled: orders.filter(o => o.status === 'cancelled').length };

  return (
    <div>
      {toast && <Toast {...toast} />}

      {showModal && (
        <Modal title={editData ? 'Edit Order' : 'Create New Order'} onClose={() => setShowModal(false)}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Customer *</label>
              <input className="form-input" value={form.customer} onChange={e => setForm({ ...form, customer: e.target.value })} placeholder="Customer name / company" />
            </div>
            <div className="form-group">
              <label className="form-label">Order Title *</label>
              <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Steel Frame Assembly" />
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-select" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Assigned To</label>
              <input className="form-input" value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })} placeholder="Employee name" />
            </div>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input className="form-input" type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Amount (₹)</label>
              <input className="form-input" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="125000" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Order description and specifications..." />
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
            <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : (editData ? 'Update Order' : 'Create Order')}</button>
          </div>
        </Modal>
      )}

      {viewOrder && (
        <Modal title={`Order Details - ${viewOrder.orderId}`} onClose={() => setViewOrder(null)} wide>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              ['Customer', viewOrder.customer],
              ['Title', viewOrder.title],
              ['Assigned To', viewOrder.assignedTo],
              ['Due Date', viewOrder.dueDate],
              ['Amount', `₹${Number(viewOrder.amount).toLocaleString()}`],
              ['Created', viewOrder.createdAt],
            ].map(([label, value]) => (
              <div key={label} style={{ background: 'rgba(10,14,26,0.5)', borderRadius: 8, padding: 14 }}>
                <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>{value}</div>
              </div>
            ))}
          </div>
          <div style={{ background: 'rgba(10,14,26,0.5)', borderRadius: 8, padding: 14, marginTop: 16 }}>
            <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Description</div>
            <div style={{ fontSize: 14, color: '#e2e8f0' }}>{viewOrder.description}</div>
          </div>
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>Update Status:</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['pending', 'in-progress', 'completed', 'cancelled'].map(s => (
                <button key={s} onClick={() => { handleStatusChange(viewOrder._id, s); setViewOrder({ ...viewOrder, status: s }); }}
                  style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid', cursor: 'pointer', fontSize: 12, fontWeight: 600, textTransform: 'capitalize', background: viewOrder.status === s ? '#00d4ff' : 'transparent', color: viewOrder.status === s ? '#fff' : '#94a3b8', borderColor: viewOrder.status === s ? '#00d4ff' : '#1e3a5f' }}>
                  {s.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>
        </Modal>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">{orders.length} total manufacturing orders</p>
        </div>
        <button className="btn-primary" onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={16} /> New Order
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {Object.entries(statusCounts).map(([key, count]) => (
          <button key={key} onClick={() => setFilter(key)} style={{
            padding: '7px 16px', borderRadius: 20, border: '1px solid',
            cursor: 'pointer', fontSize: 13, fontWeight: 600, textTransform: 'capitalize',
            background: filter === key ? 'rgba(0,212,255,0.15)' : 'transparent',
            color: filter === key ? '#00d4ff' : '#94a3b8',
            borderColor: filter === key ? '#00d4ff' : '#1e3a5f',
            transition: 'all 0.2s',
          }}>
            {key.replace('-', ' ')} <span style={{ opacity: 0.7 }}>({count})</span>
          </button>
        ))}
      </div>

      <div style={{ background: '#1a2332', border: '1px solid #1e3a5f', borderRadius: 14, padding: 24 }}>
        <div style={{ marginBottom: 20 }}>
          <div className="search-bar" style={{ maxWidth: 380 }}>
            <Search size={15} color="#94a3b8" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders..." />
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr><th>Order#</th><th>Customer</th><th>Title</th><th>Status</th><th>Priority</th><th>Assigned To</th><th>Due Date</th><th>Amount</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o._id}>
                  <td><span style={{ color: '#00d4ff', fontWeight: 700 }}>{o.orderId}</span></td>
                  <td style={{ color: '#e2e8f0' }}>{o.customer}</td>
                  <td style={{ color: '#94a3b8', maxWidth: 180 }}><div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.title}</div></td>
                  <td>{statusBadge(o.status)}</td>
                  <td><span className={`badge badge-${o.priority}`}>{o.priority}</span></td>
                  <td style={{ color: '#94a3b8' }}>{o.assignedTo}</td>
                  <td style={{ color: '#94a3b8', fontSize: 13 }}>{o.dueDate}</td>
                  <td style={{ color: '#00ff88', fontWeight: 600 }}>₹{Number(o.amount).toLocaleString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => setViewOrder(o)} style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.2)', color: '#00ff88', borderRadius: 7, padding: '5px 9px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                        <Eye size={12} />View
                      </button>
                      <button onClick={() => openEdit(o)} style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff', borderRadius: 7, padding: '5px 9px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                        <Edit2 size={12} />Edit
                      </button>
                      <button onClick={() => handleDelete(o._id)} style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.2)', color: '#ff4444', borderRadius: 7, padding: '5px 9px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={9} style={{ textAlign: 'center', color: '#94a3b8', padding: 40 }}>No orders found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Orders;
