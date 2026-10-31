import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, Edit2, Trash2, X } from 'lucide-react';

const mockCustomers = [
  { _id: '1', name: 'Rajesh Sharma', company: 'Tata Steel Ltd', email: 'rajesh@tatasteel.com', phone: '+91 9876543210', city: 'Mumbai', status: 'active' },
  { _id: '2', name: 'Priya Singh', company: 'Mahindra Corp', email: 'priya@mahindra.com', phone: '+91 9123456789', city: 'Pune', status: 'active' },
  { _id: '3', name: 'Amit Kumar', company: 'L&T Industries', email: 'amit@lnt.com', phone: '+91 9876501234', city: 'Chennai', status: 'active' },
  { _id: '4', name: 'Sunita Patel', company: 'BHEL Ltd', email: 'sunita@bhel.com', phone: '+91 9012345678', city: 'Hyderabad', status: 'inactive' },
  { _id: '5', name: 'Vikram Nair', company: 'Reliance Industries', email: 'vikram@ril.com', phone: '+91 9345678901', city: 'Delhi', status: 'active' },
];

const emptyForm = { name: '', company: '', email: '', phone: '', city: '', address: '', status: 'active' };

const Toast = ({ message, type, onClose }) => (
  <div className={`toast toast-${type}`} onClick={onClose} style={{ cursor: 'pointer' }}>
    <span>{type === 'success' ? '✓' : '✕'}</span>{message}
  </div>
);

const Modal = ({ title, onClose, children }) => (
  <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
    <div className="modal-content">
      <div className="modal-header">
        <span className="modal-title">{title}</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
      </div>
      {children}
    </div>
  </div>
);

const Customers = () => {
  const [customers, setCustomers] = useState(mockCustomers);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get('/api/customers');
      if (res.data?.length) setCustomers(res.data);
    } catch { /* use mock */ }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openAdd = () => { setEditData(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (c) => { setEditData(c); setForm({ name: c.name, company: c.company, email: c.email, phone: c.phone, city: c.city, address: c.address || '', status: c.status }); setShowModal(true); };

  const handleSave = async () => {
    if (!form.name || !form.email) { showToast('Name and email are required', 'error'); return; }
    setLoading(true);
    try {
      if (editData) {
        await axios.put(`/api/customers/${editData._id}`, form);
        setCustomers(cs => cs.map(c => c._id === editData._id ? { ...c, ...form } : c));
        showToast('Customer updated successfully');
      } else {
        const res = await axios.post('/api/customers', form);
        setCustomers(cs => [...cs, res.data || { ...form, _id: Date.now().toString() }]);
        showToast('Customer added successfully');
      }
      setShowModal(false);
    } catch {
      if (editData) {
        setCustomers(cs => cs.map(c => c._id === editData._id ? { ...c, ...form } : c));
      } else {
        setCustomers(cs => [...cs, { ...form, _id: Date.now().toString() }]);
      }
      showToast(editData ? 'Customer updated' : 'Customer added');
      setShowModal(false);
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this customer?')) return;
    try { await axios.delete(`/api/customers/${id}`); } catch { }
    setCustomers(cs => cs.filter(c => c._id !== id));
    showToast('Customer deleted');
  };

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.company.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      {showModal && (
        <Modal title={editData ? 'Edit Customer' : 'Add New Customer'} onClose={() => setShowModal(false)}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="John Doe" />
            </div>
            <div className="form-group">
              <label className="form-label">Company</label>
              <input className="form-input" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="Company Ltd" />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="john@company.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 9876543210" />
            </div>
            <div className="form-group">
              <label className="form-label">City</label>
              <input className="form-input" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="Mumbai" />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea className="form-textarea" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Full address..." />
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
            <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : (editData ? 'Update Customer' : 'Add Customer')}</button>
          </div>
        </Modal>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">{customers.length} total customers registered</p>
        </div>
        <button className="btn-primary" onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={16} /> Add Customer
        </button>
      </div>

      <div style={{ background: '#1a2332', border: '1px solid #1e3a5f', borderRadius: 14, padding: 24 }}>
        <div style={{ marginBottom: 20 }}>
          <div className="search-bar" style={{ maxWidth: 340 }}>
            <Search size={15} color="#94a3b8" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers..." />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr><th>Name</th><th>Company</th><th>Email</th><th>Phone</th><th>City</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: '#94a3b8', padding: 40 }}>No customers found</td></tr>
              ) : filtered.map(c => (
                <tr key={c._id}>
                  <td style={{ fontWeight: 600, color: '#e2e8f0' }}>{c.name}</td>
                  <td style={{ color: '#94a3b8' }}>{c.company}</td>
                  <td style={{ color: '#94a3b8' }}>{c.email}</td>
                  <td style={{ color: '#94a3b8' }}>{c.phone}</td>
                  <td style={{ color: '#94a3b8' }}>{c.city}</td>
                  <td><span className={`badge badge-${c.status}`}>{c.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => openEdit(c)} style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff', borderRadius: 7, padding: '5px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                        <Edit2 size={13} /> Edit
                      </button>
                      <button onClick={() => handleDelete(c._id)} style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.2)', color: '#ff4444', borderRadius: 7, padding: '5px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Customers;
