const express = require('express');
const router = express.Router();
const { db, findOne, find, update } = require('../db/database');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

const now = () => new Date().toISOString();

// ──────────────────────────────────────────────────────────────────────
// EMPLOYEE DASHBOARD
// ──────────────────────────────────────────────────────────────────────
router.get('/dashboard', async (req, res) => {
  try {
    const empId = req.user.id;
    const [allMyOrders, allMyTasks] = await Promise.all([
      find(db.orders, { assigned_to: empId }),
      find(db.tasks, { assigned_to: empId })
    ]);

    return res.json({ success: true, data: {
      assignedOrders: allMyOrders.length,
      pendingOrders: allMyOrders.filter(o => o.status === 'pending').length,
      inProgress: allMyOrders.filter(o => o.status === 'in_progress').length,
      completedOrders: allMyOrders.filter(o => o.status === 'completed').length,
      pendingTasks: allMyTasks.filter(t => t.status === 'pending').length,
      completedToday: allMyTasks.filter(t => t.status === 'completed').length,
    }});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ──────────────────────────────────────────────────────────────────────
// ASSIGNED ORDERS
// ──────────────────────────────────────────────────────────────────────
router.get('/orders', async (req, res) => {
  try {
    const orders = await find(db.orders, { assigned_to: req.user.id }, { created_at: -1 });
    const enriched = await Promise.all(orders.map(async o => {
      const customer = o.customer_id ? await findOne(db.customers, { id: o.customer_id }) : null;
      return { ...o, customer_name: customer?.name || '' };
    }));
    return res.json({ success: true, data: enriched });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/orders/:id/status', async (req, res) => {
  try {
    const { status, notes } = req.body;
    const order = await findOne(db.orders, { id: req.params.id, assigned_to: req.user.id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found or not assigned to you' });
    const setObj = { status, updated_at: now() };
    if (notes) setObj.notes = notes;
    await update(db.orders, { id: req.params.id }, { $set: setObj });
    const updated = await findOne(db.orders, { id: req.params.id });
    return res.json({ success: true, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ──────────────────────────────────────────────────────────────────────
// TASKS
// ──────────────────────────────────────────────────────────────────────
router.get('/tasks', async (req, res) => {
  try {
    const tasks = await find(db.tasks, { assigned_to: req.user.id }, { due_date: 1 });
    const enriched = await Promise.all(tasks.map(async t => {
      const order = t.order_id ? await findOne(db.orders, { id: t.order_id }) : null;
      return { ...t, order_number: order?.order_number || '' };
    }));
    return res.json({ success: true, data: enriched });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/tasks/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const task = await findOne(db.tasks, { id: req.params.id, assigned_to: req.user.id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found or not assigned to you' });
    const setObj = { status, updated_at: now() };
    if (status === 'completed') setObj.completed_at = now();
    await update(db.tasks, { id: req.params.id }, { $set: setObj });
    const updated = await findOne(db.tasks, { id: req.params.id });
    return res.json({ success: true, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ──────────────────────────────────────────────────────────────────────
// INVENTORY (Read-only for employees)
// ──────────────────────────────────────────────────────────────────────
router.get('/inventory', async (req, res) => {
  try {
    const items = await find(db.inventory, {}, { material_name: 1 });
    return res.json({ success: true, data: items });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
