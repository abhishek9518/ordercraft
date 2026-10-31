import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, Edit2, Trash2, X } from 'lucide-react';

const mockEmployees = [
  { _id: '1', name: 'Arjun Mehta', email: 'arjun@ordercraft.com', phone: '+91 9876543210', department: 'Production', role: 'employee', status: 'active', joinDate: '2023-01-15' },
  { _id: '2', name: 'Kavya Reddy', email: 'kavya@ordercraft.com', phone: '+91 9234567890', department: 'Assembly', role: 'employee', status: 'active', joinDate: '2023-03-20' },
  { _id: '3', name: 'Rohit Verma', email: 'rohit@ordercraft.com', phone: '+91 9345678901', department: 'Quality Control', role: 'employee', status: 'active', joinDate: '2022-11-08' },
  { _id: '4', name: 'Sneha Iyer', email: 'sneha@ordercraft.com', phone: '+91 9456789012', department: 'Logistics', role: 'employee', status: 'inactive', joinDate: '2023-06-01' },
  { _id: '5', name: 'Manish Gupta', email: 'manish@ordercraft.com', phone: '+91 9567890123', department: 'Maintenance', role: 'employee', status: 'active', joinDate: '2022-08-14' },
];

const emptyForm = { name: '', email: '', phone: '', department: 'Production', role: 'employee', status: 'active' };

const Toast = ({ message, type }) => (
  <div className={`toast toast-${type}`}><span>{type === 'success' ? '✓' : '✕'}</span>{message}</div>
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

const Employees = () => {
  const [employees, setEmployees] = useState(mockEmployees);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get('/api/employees').then(r => { if (r.data?.length) setEmployees(r.data); }).catch(() => {});
  }, []);

  const showToast = (msg, type = 'success') => { setToast({ message: msg, type }); setTimeout(() => setToast(null), 3000); };

  const openAdd = () => { setEditData(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (e) => { setEditData(e); setForm({ name: e.name, email: e.email, phone: e.phone, department: e.department, role: e.role, status: e.status }); setShowModal(true); };

  const handleSave = async () => {
    if (!form.name || !form.email) { showToast('Name and email required', 'error'); return; }
    setLoading(true);
    try {
      if (editData) {
        await axios.put(`/api/employees/${editData._id}`, form).catch(() => {});
        setEmployees(es => es.map(e => e._id === editData._id ? { ...e, ...form } : e));
      } else {
        const res = await axios.post('/api/employees', form).catch(() => ({ data: null }));
        setEmployees(es => [...es, res.data || { ...form, _id: Date.now().toString(), joinDate: new Date().toISOString().split('T')[0] }]);
      }
      showToast(editData ? 'Employee updated' : 'Employee added');
      setShowModal(false);
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this employee?')) return;
    await axios.delete(`/api/employees/${id}`).catch(() => {});
    setEmployees(es => es.filter(e => e._id !== id));
    showToast('Employee deleted');
  };

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.department.toLowerCase().includes(search.toLowerCase()) ||
    e.email.toLowerCase().includes(search.toLowerCase())
  );

  const deptColor = { Production: '#00d4ff', Assembly: '#00ff88', 'Quality Control': '#ffc107', Logistics: '#ff6b35', Maintenance: '#94a3b8' };

  return (
    <div>
      {toast && <Toast {...toast} />}
      {showModal && (
        <Modal title={editData ? 'Edit Employee' : 'Add Employee'} onClose={() => setShowModal(false)}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Arjun Mehta" />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="arjun@ordercraft.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 9876543210" />
            </div>
            <div className="form-group">
              <label className="form-label">Department</label>
              <select className="form-select" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>
                {['Production', 'Assembly', 'Quality Control', 'Logistics', 'Maintenance'].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-select" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
            <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : (editData ? 'Update' : 'Add Employee')}</button>
          </div>
        </Modal>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Employees</h1>
          <p className="page-subtitle">{employees.filter(e => e.status === 'active').length} active employees</p>
        </div>
        <button className="btn-primary" onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={16} /> Add Employee
        </button>
      </div>

      <div style={{ background: '#1a2332', border: '1px solid #1e3a5f', borderRadius: 14, padding: 24 }}>
        <div style={{ marginBottom: 20 }}>
          <div className="search-bar" style={{ maxWidth: 340 }}>
            <Search size={15} color="#94a3b8" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search employees..." />
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Phone</th><th>Department</th><th>Role</th><th>Joined</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map(emp => (
              <tr key={emp._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #00d4ff, #0099cc)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                      {emp.name[0]}
                    </div>
                    <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{emp.name}</span>
                  </div>
                </td>
                <td style={{ color: '#94a3b8' }}>{emp.email}</td>
                <td style={{ color: '#94a3b8' }}>{emp.phone}</td>
                <td><span style={{ color: deptColor[emp.department] || '#94a3b8', fontWeight: 600, fontSize: 13 }}>{emp.department}</span></td>
                <td><span className="badge badge-active" style={{ textTransform: 'capitalize' }}>{emp.role}</span></td>
                <td style={{ color: '#94a3b8', fontSize: 13 }}>{emp.joinDate}</td>
                <td><span className={`badge badge-${emp.status}`}>{emp.status}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => openEdit(emp)} style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff', borderRadius: 7, padding: '5px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                      <Edit2 size={13} />Edit
                    </button>
                    <button onClick={() => handleDelete(emp._id)} style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.2)', color: '#ff4444', borderRadius: 7, padding: '5px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                      <Trash2 size={13} />Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Employees;
