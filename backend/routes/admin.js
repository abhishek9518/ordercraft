const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { db, findOne, find, insert, update, remove, count } = require('../db/database');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('admin'));

// ──────────────────────────────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────────────────────────────
const genOrderNum = () => `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
const genPoNum    = () => `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
const genInvNum   = () => `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
const now = () => new Date().toISOString();

async function enrichOrders(orders) {
  return Promise.all(orders.map(async o => {
    const customer = o.customer_id ? await findOne(db.customers, { id: o.customer_id }) : null;
    const assigned = o.assigned_to  ? await findOne(db.users, { id: o.assigned_to })    : null;
    return { ...o, customer_name: customer?.name || '', assigned_name: assigned?.name || '' };
  }));
}

// ──────────────────────────────────────────────────────────────────────
// DASHBOARD
// ──────────────────────────────────────────────────────────────────────
router.get('/dashboard', async (req, res) => {
  try {
    const [allOrders, allCustomers, allInvoices, allInventory, allEmployees] = await Promise.all([
      find(db.orders, {}),
      find(db.customers, { status: 'active' }),
      find(db.invoices, {}),
      find(db.inventory, {}),
      find(db.users, { role: 'employee', status: 'active' })
    ]);

    const totalRevenue = allInvoices.filter(i => i.status === 'paid').reduce((s, i) => s + (i.total_amount || 0), 0);
    const pendingRevenue = allInvoices.filter(i => ['sent','overdue'].includes(i.status)).reduce((s, i) => s + (i.total_amount - (i.paid_amount || 0)), 0);
    const lowStock = allInventory.filter(i => i.quantity_in_stock <= i.reorder_level);

    const recentOrders = await enrichOrders(allOrders.sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5));

    return res.json({ success: true, data: {
      totalOrders: allOrders.length,
      pendingOrders: allOrders.filter(o => o.status === 'pending').length,
      inProgressOrders: allOrders.filter(o => o.status === 'in_progress').length,
      completedOrders: allOrders.filter(o => o.status === 'completed').length,
      totalCustomers: allCustomers.length,
      totalEmployees: allEmployees.length,
      totalRevenue, pendingRevenue,
      lowStockCount: lowStock.length,
      lowStockItems: lowStock.slice(0, 5),
      recentOrders
    }});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ──────────────────────────────────────────────────────────────────────
// REPORTS
// ──────────────────────────────────────────────────────────────────────
router.get('/reports', async (req, res) => {
  try {
    const [allOrders, allInvoices, allCustomers] = await Promise.all([
      find(db.orders, {}),
      find(db.invoices, {}),
      find(db.customers, {})
    ]);

    const totalRevenue = allInvoices.filter(i => i.status === 'paid').reduce((s,i) => s+(i.total_amount||0), 0);
    const completionRate = allOrders.length ? Math.round(allOrders.filter(o=>o.status==='completed').length/allOrders.length*100) : 0;
    const avgOrderValue = allOrders.length ? Math.round(allOrders.reduce((s,o)=>s+(o.total_amount||0),0)/allOrders.length) : 0;

    const statusMap = {};
    allOrders.forEach(o => { statusMap[o.status] = (statusMap[o.status]||0) + 1; });
    const ordersByStatus = Object.entries(statusMap).map(([name, value]) => ({ name: name.replace('_',' '), value }));

    // Monthly data (last 6 months)
    const monthlyOrders = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      const monthOrders = allOrders.filter(o => o.created_at?.startsWith(monthKey));
      const monthRevenue = allInvoices.filter(iv => iv.status==='paid' && iv.created_at?.startsWith(monthKey)).reduce((s,iv)=>s+(iv.total_amount||0),0);
      monthlyOrders.push({ month: d.toLocaleString('default',{month:'short'}), orders: monthOrders.length, revenue: monthRevenue });
    }

    // Top customers
    const custOrderMap = {};
    allOrders.forEach(o => { if (o.customer_id) custOrderMap[o.customer_id] = (custOrderMap[o.customer_id]||0) + 1; });
    const topCustomers = await Promise.all(
      Object.entries(custOrderMap).sort((a,b)=>b[1]-a[1]).slice(0,5).map(async ([cid, cnt]) => {
        const c = await findOne(db.customers, { id: cid });
        const rev = allInvoices.filter(i=>i.customer_id===cid&&i.status==='paid').reduce((s,i)=>s+(i.total_amount||0),0);
        return { id: cid, name: c?.name||'Unknown', company: c?.company||'', order_count: cnt, total_revenue: rev };
      })
    );

    return res.json({ success: true, data: {
      summary: { totalOrders: allOrders.length, totalRevenue, completionRate, avgOrderValue },
      ordersByStatus, monthlyOrders, topCustomers
    }});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ──────────────────────────────────────────────────────────────────────
// CUSTOMERS CRUD
// ──────────────────────────────────────────────────────────────────────
router.get('/customers', async (req, res) => {
  try {
    const customers = await find(db.customers, {}, { created_at: -1 });
    return res.json({ success: true, data: customers });
  } catch (err) { return res.status(500).json({ success: false, message: 'Server error' }); }
});

router.post('/customers', async (req, res) => {
  try {
    const { name, email, phone, company, address, city } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Customer name required' });
    const id = uuidv4();
    const customer = { _id: id, id, name, email: email||'', phone: phone||'', company: company||'', address: address||'', city: city||'', status: 'active', created_at: now() };
    await insert(db.customers, customer);
    return res.status(201).json({ success: true, data: customer });
  } catch (err) { return res.status(500).json({ success: false, message: 'Server error' }); }
});

router.put('/customers/:id', async (req, res) => {
  try {
    const { name, email, phone, company, address, city, status } = req.body;
    await update(db.customers, { id: req.params.id }, { $set: { name, email, phone, company, address, city, status, updated_at: now() } });
    const updated = await findOne(db.customers, { id: req.params.id });
    return res.json({ success: true, data: updated });
  } catch (err) { return res.status(500).json({ success: false, message: 'Server error' }); }
});

router.delete('/customers/:id', async (req, res) => {
  try {
    await remove(db.customers, { id: req.params.id });
    return res.json({ success: true, message: 'Customer deleted' });
  } catch (err) { return res.status(500).json({ success: false, message: 'Server error' }); }
});

// ──────────────────────────────────────────────────────────────────────
// EMPLOYEES CRUD
// ──────────────────────────────────────────────────────────────────────
router.get('/employees', async (req, res) => {
  try {
    const employees = await find(db.users, { role: 'employee' }, { created_at: -1 });
    const safe = employees.map(({ password, ...e }) => e);
    return res.json({ success: true, data: safe });
  } catch (err) { return res.status(500).json({ success: false, message: 'Server error' }); }
});

router.post('/employees', async (req, res) => {
  try {
    const { name, email, password, department, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Name, email, and password required' });
    const existing = await findOne(db.users, { email: email.toLowerCase() });
    if (existing) return res.status(409).json({ success: false, message: 'Email already in use' });
    const bcrypt = require('bcryptjs');
    const hashed = await bcrypt.hash(password, 10);
    const id = uuidv4();
    const emp = { _id: id, id, name, email: email.toLowerCase(), password: hashed, role: 'employee', department: department||'', phone: phone||'', status: 'active', created_at: now() };
    await insert(db.users, emp);
    const { password: _, ...safe } = emp;
    return res.status(201).json({ success: true, data: safe });
  } catch (err) { return res.status(500).json({ success: false, message: 'Server error' }); }
});

router.put('/employees/:id', async (req, res) => {
  try {
    const { name, department, phone, status } = req.body;
    await update(db.users, { id: req.params.id, role: 'employee' }, { $set: { name, department, phone, status, updated_at: now() } });
    const emp = await findOne(db.users, { id: req.params.id });
    const { password, ...safe } = emp;
    return res.json({ success: true, data: safe });
  } catch (err) { return res.status(500).json({ success: false, message: 'Server error' }); }
});

router.delete('/employees/:id', async (req, res) => {
  try {
    await update(db.users, { id: req.params.id }, { $set: { status: 'inactive' } });
    return res.json({ success: true, message: 'Employee deactivated' });
  } catch (err) { return res.status(500).json({ success: false, message: 'Server error' }); }
});

// ──────────────────────────────────────────────────────────────────────
// ORDERS CRUD
// ──────────────────────────────────────────────────────────────────────
router.get('/orders', async (req, res) => {
  try {
    const orders = await find(db.orders, {}, { created_at: -1 });
    const enriched = await enrichOrders(orders);
    return res.json({ success: true, data: enriched });
  } catch (err) { return res.status(500).json({ success: false, message: 'Server error' }); }
});

router.post('/orders', async (req, res) => {
  try {
    const { customer_id, title, description, priority, assigned_to, due_date, total_amount, notes } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Order title required' });
    const id = uuidv4();
    const order_number = genOrderNum();
    const order = { _id: id, id, order_number, customer_id: customer_id||'', title, description: description||'', status: 'pending', priority: priority||'medium', assigned_to: assigned_to||'', due_date: due_date||'', total_amount: parseFloat(total_amount||0), notes: notes||'', created_at: now(), updated_at: now() };
    await insert(db.orders, order);
    return res.status(201).json({ success: true, data: order });
  } catch (err) { return res.status(500).json({ success: false, message: 'Server error' }); }
});

router.put('/orders/:id', async (req, res) => {
  try {
    const { customer_id, title, description, status, priority, assigned_to, due_date, total_amount, notes } = req.body;
    await update(db.orders, { id: req.params.id }, { $set: { customer_id, title, description, status, priority, assigned_to, due_date, total_amount: parseFloat(total_amount||0), notes, updated_at: now() } });
    const updated = await findOne(db.orders, { id: req.params.id });
    return res.json({ success: true, data: updated });
  } catch (err) { return res.status(500).json({ success: false, message: 'Server error' }); }
});

router.delete('/orders/:id', async (req, res) => {
  try {
    await remove(db.orders, { id: req.params.id });
    return res.json({ success: true, message: 'Order deleted' });
  } catch (err) { return res.status(500).json({ success: false, message: 'Server error' }); }
});

// ──────────────────────────────────────────────────────────────────────
// BOM (Bill of Materials)
// ──────────────────────────────────────────────────────────────────────
router.get('/bom/:orderId', async (req, res) => {
  try {
    const items = await find(db.bom, { order_id: req.params.orderId }, { created_at: 1 });
    return res.json({ success: true, data: items });
  } catch (err) { return res.status(500).json({ success: false, message: 'Server error' }); }
});

router.post('/bom/:orderId', async (req, res) => {
  try {
    const { material_name, part_number, quantity, unit, unit_cost, supplier_id, status } = req.body;
    if (!material_name || !quantity) return res.status(400).json({ success: false, message: 'Material name and quantity required' });
    const id = uuidv4();
    const qty = parseFloat(quantity||0), cost = parseFloat(unit_cost||0);
    const item = { _id: id, id, order_id: req.params.orderId, material_name, part_number: part_number||'', quantity: qty, unit: unit||'pcs', unit_cost: cost, total_cost: qty*cost, supplier_id: supplier_id||'', status: status||'required', created_at: now() };
    await insert(db.bom, item);
    return res.status(201).json({ success: true, data: item });
  } catch (err) { return res.status(500).json({ success: false, message: 'Server error' }); }
});

router.put('/bom/:id', async (req, res) => {
  try {
    const { material_name, part_number, quantity, unit, unit_cost, supplier_id, status } = req.body;
    const qty = parseFloat(quantity||0), cost = parseFloat(unit_cost||0);
    await update(db.bom, { id: req.params.id }, { $set: { material_name, part_number, quantity: qty, unit, unit_cost: cost, total_cost: qty*cost, supplier_id, status } });
    const updated = await findOne(db.bom, { id: req.params.id });
    return res.json({ success: true, data: updated });
  } catch (err) { return res.status(500).json({ success: false, message: 'Server error' }); }
});

router.delete('/bom/:id', async (req, res) => {
  try {
    await remove(db.bom, { id: req.params.id });
    return res.json({ success: true, message: 'BOM item deleted' });
  } catch (err) { return res.status(500).json({ success: false, message: 'Server error' }); }
});

// ──────────────────────────────────────────────────────────────────────
// PURCHASE ORDERS
// ──────────────────────────────────────────────────────────────────────
router.get('/purchase-orders', async (req, res) => {
  try {
    const pos = await find(db.purchase_orders, {}, { created_at: -1 });
    const enriched = await Promise.all(pos.map(async p => {
      const supplier = p.supplier_id ? await findOne(db.suppliers, { id: p.supplier_id }) : null;
      const order = p.order_id ? await findOne(db.orders, { id: p.order_id }) : null;
      return { ...p, supplier_name: supplier?.name||'', order_number: order?.order_number||'' };
    }));
    return res.json({ success: true, data: enriched });
  } catch (err) { return res.status(500).json({ success: false, message: 'Server error' }); }
});

router.post('/purchase-orders', async (req, res) => {
  try {
    const { supplier_id, order_id, total_amount, expected_date, status, notes } = req.body;
    if (!supplier_id) return res.status(400).json({ success: false, message: 'Supplier required' });
    const id = uuidv4();
    const po = { _id: id, id, po_number: genPoNum(), supplier_id, order_id: order_id||'', total_amount: parseFloat(total_amount||0), expected_date: expected_date||'', status: status||'draft', notes: notes||'', created_at: now() };
    await insert(db.purchase_orders, po);
    return res.status(201).json({ success: true, data: po });
  } catch (err) { return res.status(500).json({ success: false, message: 'Server error' }); }
});

router.put('/purchase-orders/:id', async (req, res) => {
  try {
    const { supplier_id, order_id, total_amount, expected_date, status, notes } = req.body;
    await update(db.purchase_orders, { id: req.params.id }, { $set: { supplier_id, order_id, total_amount: parseFloat(total_amount||0), expected_date, status, notes, updated_at: now() } });
    const updated = await findOne(db.purchase_orders, { id: req.params.id });
    return res.json({ success: true, data: updated });
  } catch (err) { return res.status(500).json({ success: false, message: 'Server error' }); }
});

router.delete('/purchase-orders/:id', async (req, res) => {
  try {
    await remove(db.purchase_orders, { id: req.params.id });
    return res.json({ success: true, message: 'Purchase order deleted' });
  } catch (err) { return res.status(500).json({ success: false, message: 'Server error' }); }
});

// ──────────────────────────────────────────────────────────────────────
// INVOICES
// ──────────────────────────────────────────────────────────────────────
router.get('/invoices', async (req, res) => {
  try {
    const invoices = await find(db.invoices, {}, { created_at: -1 });
    const enriched = await Promise.all(invoices.map(async inv => {
      const customer = inv.customer_id ? await findOne(db.customers, { id: inv.customer_id }) : null;
      const order = inv.order_id ? await findOne(db.orders, { id: inv.order_id }) : null;
      return { ...inv, customer_name: customer?.name||'', order_number: order?.order_number||'' };
    }));
    return res.json({ success: true, data: enriched });
  } catch (err) { return res.status(500).json({ success: false, message: 'Server error' }); }
});

router.post('/invoices', async (req, res) => {
  try {
    const { order_id, customer_id, subtotal, tax_rate, due_date, status, notes } = req.body;
    if (!subtotal) return res.status(400).json({ success: false, message: 'Subtotal required' });
    const sub = parseFloat(subtotal||0), taxR = parseFloat(tax_rate||18);
    const taxAmt = sub * taxR / 100;
    const id = uuidv4();
    const inv = { _id: id, id, invoice_number: genInvNum(), order_id: order_id||'', customer_id: customer_id||'', subtotal: sub, tax_rate: taxR, tax_amount: taxAmt, total_amount: sub + taxAmt, status: status||'draft', due_date: due_date||'', paid_amount: 0, notes: notes||'', created_at: now() };
    await insert(db.invoices, inv);
    return res.status(201).json({ success: true, data: inv });
  } catch (err) { return res.status(500).json({ success: false, message: 'Server error' }); }
});

router.put('/invoices/:id', async (req, res) => {
  try {
    const { subtotal, tax_rate, due_date, status, notes, paid_amount, payment_date, order_id, customer_id } = req.body;
    const sub = parseFloat(subtotal||0), taxR = parseFloat(tax_rate||18);
    const setObj = { status, due_date, notes, updated_at: now() };
    if (subtotal !== undefined) { setObj.subtotal = sub; setObj.tax_rate = taxR; setObj.tax_amount = sub*taxR/100; setObj.total_amount = sub*(1+taxR/100); }
    if (status === 'paid') { setObj.paid_amount = setObj.total_amount; setObj.payment_date = payment_date || new Date().toISOString().split('T')[0]; }
    if (order_id !== undefined) setObj.order_id = order_id;
    if (customer_id !== undefined) setObj.customer_id = customer_id;
    await update(db.invoices, { id: req.params.id }, { $set: setObj });
    const updated = await findOne(db.invoices, { id: req.params.id });
    return res.json({ success: true, data: updated });
  } catch (err) { return res.status(500).json({ success: false, message: 'Server error' }); }
});

// ──────────────────────────────────────────────────────────────────────
// PAYMENTS
// ──────────────────────────────────────────────────────────────────────
router.get('/payments', async (req, res) => {
  try {
    const payments = await find(db.payments, {}, { created_at: -1 });
    const enriched = await Promise.all(payments.map(async p => {
      const inv = p.invoice_id ? await findOne(db.invoices, { id: p.invoice_id }) : null;
      return { ...p, invoice_number: inv?.invoice_number||'' };
    }));
    return res.json({ success: true, data: enriched });
  } catch (err) { return res.status(500).json({ success: false, message: 'Server error' }); }
});

router.post('/payments', async (req, res) => {
  try {
    const { invoice_id, amount, payment_method, transaction_id, payment_date, notes } = req.body;
    if (!invoice_id || !amount) return res.status(400).json({ success: false, message: 'Invoice and amount required' });
    const id = uuidv4();
    const payment = { _id: id, id, invoice_id, amount: parseFloat(amount), payment_method: payment_method||'bank_transfer', transaction_id: transaction_id||'', payment_date: payment_date||new Date().toISOString().split('T')[0], notes: notes||'', created_at: now() };
    await insert(db.payments, payment);
    // Mark invoice paid
    const inv = await findOne(db.invoices, { id: invoice_id });
    if (inv) {
      const newPaid = (inv.paid_amount||0) + parseFloat(amount);
      const newStatus = newPaid >= inv.total_amount ? 'paid' : 'sent';
      await update(db.invoices, { id: invoice_id }, { $set: { paid_amount: newPaid, status: newStatus, payment_date: payment.payment_date } });
    }
    return res.status(201).json({ success: true, data: payment });
  } catch (err) { return res.status(500).json({ success: false, message: 'Server error' }); }
});

// ──────────────────────────────────────────────────────────────────────
// SUPPLIERS
// ──────────────────────────────────────────────────────────────────────
router.get('/suppliers', async (req, res) => {
  try {
    const suppliers = await find(db.suppliers, {}, { created_at: -1 });
    return res.json({ success: true, data: suppliers });
  } catch (err) { return res.status(500).json({ success: false, message: 'Server error' }); }
});

router.post('/suppliers', async (req, res) => {
  try {
    const { name, contact_person, email, phone, address, city, material_category, rating, status } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Supplier name required' });
    const id = uuidv4();
    const supplier = { _id: id, id, name, contact_person: contact_person||'', email: email||'', phone: phone||'', address: address||'', city: city||'', material_category: material_category||'', rating: parseInt(rating||3), status: status||'active', created_at: now() };
    await insert(db.suppliers, supplier);
    return res.status(201).json({ success: true, data: supplier });
  } catch (err) { return res.status(500).json({ success: false, message: 'Server error' }); }
});

router.put('/suppliers/:id', async (req, res) => {
  try {
    const { name, contact_person, email, phone, address, city, material_category, rating, status } = req.body;
    await update(db.suppliers, { id: req.params.id }, { $set: { name, contact_person, email, phone, address, city, material_category, rating: parseInt(rating||3), status, updated_at: now() } });
    const updated = await findOne(db.suppliers, { id: req.params.id });
    return res.json({ success: true, data: updated });
  } catch (err) { return res.status(500).json({ success: false, message: 'Server error' }); }
});

router.delete('/suppliers/:id', async (req, res) => {
  try {
    await remove(db.suppliers, { id: req.params.id });
    return res.json({ success: true, message: 'Supplier deleted' });
  } catch (err) { return res.status(500).json({ success: false, message: 'Server error' }); }
});

// ──────────────────────────────────────────────────────────────────────
// INVENTORY
// ──────────────────────────────────────────────────────────────────────
router.get('/inventory', async (req, res) => {
  try {
    const items = await find(db.inventory, {}, { material_name: 1 });
    return res.json({ success: true, data: items });
  } catch (err) { return res.status(500).json({ success: false, message: 'Server error' }); }
});

router.post('/inventory', async (req, res) => {
  try {
    const { material_name, part_number, category, quantity_in_stock, unit, reorder_level, unit_cost, supplier_id, location } = req.body;
    if (!material_name) return res.status(400).json({ success: false, message: 'Material name required' });
    const id = uuidv4();
    const item = { _id: id, id, material_name, part_number: part_number||'', category: category||'', quantity_in_stock: parseFloat(quantity_in_stock||0), unit: unit||'pcs', reorder_level: parseFloat(reorder_level||10), unit_cost: parseFloat(unit_cost||0), supplier_id: supplier_id||'', location: location||'', last_updated: now() };
    await insert(db.inventory, item);
    return res.status(201).json({ success: true, data: item });
  } catch (err) { return res.status(500).json({ success: false, message: 'Server error' }); }
});

router.put('/inventory/:id', async (req, res) => {
  try {
    const { material_name, part_number, category, quantity_in_stock, unit, reorder_level, unit_cost, supplier_id, location } = req.body;
    await update(db.inventory, { id: req.params.id }, { $set: { material_name, part_number, category, quantity_in_stock: parseFloat(quantity_in_stock||0), unit, reorder_level: parseFloat(reorder_level||10), unit_cost: parseFloat(unit_cost||0), supplier_id, location, last_updated: now() } });
    const updated = await findOne(db.inventory, { id: req.params.id });
    return res.json({ success: true, data: updated });
  } catch (err) { return res.status(500).json({ success: false, message: 'Server error' }); }
});

router.delete('/inventory/:id', async (req, res) => {
  try {
    await remove(db.inventory, { id: req.params.id });
    return res.json({ success: true, message: 'Item deleted' });
  } catch (err) { return res.status(500).json({ success: false, message: 'Server error' }); }
});

module.exports = router;
