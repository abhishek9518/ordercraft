const Datastore = require('@seald-io/nedb');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// Create all datastores
const db = {
  users:          new Datastore({ filename: path.join(dataDir, 'users.db'),          autoload: true }),
  customers:      new Datastore({ filename: path.join(dataDir, 'customers.db'),      autoload: true }),
  orders:         new Datastore({ filename: path.join(dataDir, 'orders.db'),         autoload: true }),
  bom:            new Datastore({ filename: path.join(dataDir, 'bom.db'),            autoload: true }),
  purchase_orders:new Datastore({ filename: path.join(dataDir, 'purchase_orders.db'),autoload: true }),
  invoices:       new Datastore({ filename: path.join(dataDir, 'invoices.db'),       autoload: true }),
  payments:       new Datastore({ filename: path.join(dataDir, 'payments.db'),       autoload: true }),
  suppliers:      new Datastore({ filename: path.join(dataDir, 'suppliers.db'),      autoload: true }),
  inventory:      new Datastore({ filename: path.join(dataDir, 'inventory.db'),      autoload: true }),
  tasks:          new Datastore({ filename: path.join(dataDir, 'tasks.db'),          autoload: true }),
};

// Promisify helpers
const findOne = (ds, query) => new Promise((res, rej) => ds.findOne(query, (err, doc) => err ? rej(err) : res(doc)));
const find = (ds, query, sort) => new Promise((res, rej) => {
  let cursor = ds.find(query);
  if (sort) cursor = cursor.sort(sort);
  cursor.exec((err, docs) => err ? rej(err) : res(docs));
});
const insert = (ds, doc) => new Promise((res, rej) => ds.insert(doc, (err, d) => err ? rej(err) : res(d)));
const update = (ds, query, upd, opts = {}) => new Promise((res, rej) => ds.update(query, upd, opts, (err, n) => err ? rej(err) : res(n)));
const remove = (ds, query, opts = {}) => new Promise((res, rej) => ds.remove(query, opts, (err, n) => err ? rej(err) : res(n)));
const count = (ds, query) => new Promise((res, rej) => ds.count(query, (err, n) => err ? rej(err) : res(n)));

function getDb() { return db; }

function now() { return new Date().toISOString(); }
function today() { return new Date().toISOString().split('T')[0]; }

async function initializeDatabase() {
  // Check if admin user already exists
  const existing = await findOne(db.users, { email: 'admin@ordercraft.com' });
  if (existing) {
    console.log('✅ Database already seeded');
    return;
  }

  console.log('🌱 Seeding database with initial data...');

  // ── Users ──────────────────────────────────────────────────────────
  const adminPass = await bcrypt.hash('Admin@123', 10);
  const emp1Pass  = await bcrypt.hash('Emp@123', 10);
  const emp2Pass  = await bcrypt.hash('Emp@123', 10);

  const adminId = uuidv4();
  const emp1Id  = uuidv4();
  const emp2Id  = uuidv4();

  await insert(db.users, { _id: adminId, id: adminId, name: 'Admin Manager', email: 'admin@ordercraft.com', password: adminPass, role: 'admin', department: 'Management', phone: '+91-9000000001', status: 'active', created_at: now() });
  await insert(db.users, { _id: emp1Id,  id: emp1Id,  name: 'Rahul Kumar',   email: 'emp1@ordercraft.com', password: emp1Pass,  role: 'employee', department: 'Production', phone: '+91-9000000002', status: 'active', created_at: now() });
  await insert(db.users, { _id: emp2Id,  id: emp2Id,  name: 'Priya Singh',   email: 'emp2@ordercraft.com', password: emp2Pass,  role: 'employee', department: 'Assembly',   phone: '+91-9000000003', status: 'active', created_at: now() });

  // ── Customers ──────────────────────────────────────────────────────
  const cust1Id = uuidv4(), cust2Id = uuidv4(), cust3Id = uuidv4();
  await insert(db.customers, { _id: cust1Id, id: cust1Id, name: 'Rajesh Patel', email: 'rajesh@techcorp.com', phone: '+91-9100000001', company: 'TechCorp Industries', address: '12 MG Road', city: 'Ahmedabad', status: 'active', created_at: now() });
  await insert(db.customers, { _id: cust2Id, id: cust2Id, name: 'Sunita Sharma', email: 'sunita@buildwell.in', phone: '+91-9100000002', company: 'BuildWell Ltd', address: '45 Industrial Area', city: 'Pune', status: 'active', created_at: now() });
  await insert(db.customers, { _id: cust3Id, id: cust3Id, name: 'Vikram Mehta', email: 'vikram@autoparts.co', phone: '+91-9100000003', company: 'AutoParts Co', address: '78 Sector 5', city: 'Gurugram', status: 'active', created_at: now() });

  // ── Suppliers ──────────────────────────────────────────────────────
  const sup1Id = uuidv4(), sup2Id = uuidv4(), sup3Id = uuidv4();
  await insert(db.suppliers, { _id: sup1Id, id: sup1Id, name: 'SteelMart India', contact_person: 'Arun Gupta', email: 'arun@steelmart.in', phone: '+91-8000000001', city: 'Mumbai', material_category: 'Steel & Metals', rating: 5, status: 'active', created_at: now() });
  await insert(db.suppliers, { _id: sup2Id, id: sup2Id, name: 'ElectroSupply', contact_person: 'Meera Joshi', email: 'meera@electrosupply.com', phone: '+91-8000000002', city: 'Bengaluru', material_category: 'Electronics', rating: 4, status: 'active', created_at: now() });
  await insert(db.suppliers, { _id: sup3Id, id: sup3Id, name: 'PlastiCo', contact_person: 'Suresh Nair', email: 'suresh@plastico.co', phone: '+91-8000000003', city: 'Chennai', material_category: 'Plastics & Polymers', rating: 3, status: 'active', created_at: now() });

  // ── Orders ─────────────────────────────────────────────────────────
  const ord1Id = uuidv4(), ord2Id = uuidv4(), ord3Id = uuidv4(), ord4Id = uuidv4(), ord5Id = uuidv4();
  const orders = [
    { _id: ord1Id, id: ord1Id, order_number: 'ORD-2026-1001', customer_id: cust1Id, title: 'CNC Machine Parts Batch', description: 'Manufacturing 200 units of precision CNC machine parts', status: 'in_progress', priority: 'high', assigned_to: emp1Id, due_date: '2026-11-15', total_amount: 485000, created_at: now(), updated_at: now() },
    { _id: ord2Id, id: ord2Id, order_number: 'ORD-2026-1002', customer_id: cust2Id, title: 'Steel Frame Assembly', description: 'Custom steel frames for construction equipment', status: 'pending', priority: 'medium', assigned_to: emp2Id, due_date: '2026-11-30', total_amount: 320000, created_at: now(), updated_at: now() },
    { _id: ord3Id, id: ord3Id, order_number: 'ORD-2026-1003', customer_id: cust3Id, title: 'Automotive Gear Set', description: 'Precision gear set for automotive transmission', status: 'completed', priority: 'urgent', assigned_to: emp1Id, due_date: '2026-10-20', total_amount: 750000, created_at: now(), updated_at: now() },
    { _id: ord4Id, id: ord4Id, order_number: 'ORD-2026-1004', customer_id: cust1Id, title: 'Electronic Control Panels', description: 'Industrial control panels with custom wiring', status: 'in_progress', priority: 'high', assigned_to: emp2Id, due_date: '2026-12-05', total_amount: 210000, created_at: now(), updated_at: now() },
    { _id: ord5Id, id: ord5Id, order_number: 'ORD-2026-1005', customer_id: cust2Id, title: 'Hydraulic Pump Components', description: 'Hydraulic pump body and piston assembly', status: 'pending', priority: 'low', assigned_to: emp1Id, due_date: '2026-12-20', total_amount: 165000, created_at: now(), updated_at: now() },
  ];
  for (const o of orders) await insert(db.orders, o);

  // ── BOM Items ──────────────────────────────────────────────────────
  const bomItems = [
    { id: uuidv4(), order_id: ord1Id, material_name: 'Steel Rod 50mm', part_number: 'SR-50-01', quantity: 100, unit: 'pcs', unit_cost: 850, total_cost: 85000, supplier_id: sup1Id, status: 'received', created_at: now() },
    { id: uuidv4(), order_id: ord1Id, material_name: 'Cutting Fluid', part_number: 'CF-001', quantity: 20, unit: 'litre', unit_cost: 450, total_cost: 9000, supplier_id: sup2Id, status: 'received', created_at: now() },
    { id: uuidv4(), order_id: ord2Id, material_name: 'MS Steel Plate 10mm', part_number: 'MSP-10', quantity: 50, unit: 'kg', unit_cost: 95, total_cost: 4750, supplier_id: sup1Id, status: 'ordered', created_at: now() },
    { id: uuidv4(), order_id: ord4Id, material_name: 'Control Board PCB', part_number: 'PCB-CTRL-01', quantity: 10, unit: 'pcs', unit_cost: 3200, total_cost: 32000, supplier_id: sup2Id, status: 'required', created_at: now() },
  ];
  for (const b of bomItems) await insert(db.bom, { ...b, _id: b.id });

  // ── Purchase Orders ────────────────────────────────────────────────
  const po1Id = uuidv4(), po2Id = uuidv4();
  await insert(db.purchase_orders, { _id: po1Id, id: po1Id, po_number: 'PO-2026-3001', supplier_id: sup1Id, order_id: ord1Id, status: 'received', total_amount: 94000, expected_date: '2026-10-25', created_at: now() });
  await insert(db.purchase_orders, { _id: po2Id, id: po2Id, po_number: 'PO-2026-3002', supplier_id: sup2Id, order_id: ord4Id, status: 'sent', total_amount: 32000, expected_date: '2026-11-10', created_at: now() });

  // ── Invoices ───────────────────────────────────────────────────────
  const inv1Id = uuidv4(), inv2Id = uuidv4(), inv3Id = uuidv4();
  const inv1Sub = 750000, inv1Tax = 750000 * 0.18;
  const inv2Sub = 485000, inv2Tax = 485000 * 0.18;
  const inv3Sub = 320000, inv3Tax = 320000 * 0.18;
  await insert(db.invoices, { _id: inv1Id, id: inv1Id, invoice_number: 'INV-2026-2001', order_id: ord3Id, customer_id: cust3Id, subtotal: inv1Sub, tax_rate: 18, tax_amount: inv1Tax, total_amount: inv1Sub + inv1Tax, status: 'paid', due_date: '2026-10-30', paid_amount: inv1Sub + inv1Tax, payment_date: '2026-10-22', created_at: now() });
  await insert(db.invoices, { _id: inv2Id, id: inv2Id, invoice_number: 'INV-2026-2002', order_id: ord1Id, customer_id: cust1Id, subtotal: inv2Sub, tax_rate: 18, tax_amount: inv2Tax, total_amount: inv2Sub + inv2Tax, status: 'sent', due_date: '2026-11-20', paid_amount: 0, created_at: now() });
  await insert(db.invoices, { _id: inv3Id, id: inv3Id, invoice_number: 'INV-2026-2003', order_id: ord2Id, customer_id: cust2Id, subtotal: inv3Sub, tax_rate: 18, tax_amount: inv3Tax, total_amount: inv3Sub + inv3Tax, status: 'draft', due_date: '2026-12-10', paid_amount: 0, created_at: now() });

  // ── Payments ───────────────────────────────────────────────────────
  const pay1Id = uuidv4();
  await insert(db.payments, { _id: pay1Id, id: pay1Id, invoice_id: inv1Id, amount: inv1Sub + inv1Tax, payment_method: 'bank_transfer', transaction_id: 'TXN-OCT-001', payment_date: '2026-10-22', created_at: now() });

  // ── Inventory ──────────────────────────────────────────────────────
  const invItems = [
    { id: uuidv4(), material_name: 'Steel Rod 50mm', part_number: 'SR-50-01', category: 'Metals', quantity_in_stock: 250, unit: 'pcs', reorder_level: 50, unit_cost: 850, supplier_id: sup1Id, location: 'Rack A-1' },
    { id: uuidv4(), material_name: 'MS Steel Plate 10mm', part_number: 'MSP-10', category: 'Metals', quantity_in_stock: 8, unit: 'kg', reorder_level: 20, unit_cost: 95, supplier_id: sup1Id, location: 'Rack A-2' },
    { id: uuidv4(), material_name: 'Control Board PCB', part_number: 'PCB-CTRL-01', category: 'Electronics', quantity_in_stock: 0, unit: 'pcs', reorder_level: 5, unit_cost: 3200, supplier_id: sup2Id, location: 'Cabinet B-1' },
    { id: uuidv4(), material_name: 'Hydraulic Seal Kit', part_number: 'HSK-100', category: 'Hydraulics', quantity_in_stock: 45, unit: 'set', reorder_level: 10, unit_cost: 1200, supplier_id: sup3Id, location: 'Rack C-3' },
    { id: uuidv4(), material_name: 'Cutting Fluid 5L', part_number: 'CF-5L', category: 'Consumables', quantity_in_stock: 30, unit: 'litre', reorder_level: 15, unit_cost: 450, supplier_id: sup2Id, location: 'Store D-1' },
  ];
  for (const inv of invItems) await insert(db.inventory, { ...inv, _id: inv.id, last_updated: now() });

  // ── Tasks ──────────────────────────────────────────────────────────
  const tasks = [
    { id: uuidv4(), order_id: ord1Id, assigned_to: emp1Id, title: 'Setup CNC Machine', description: 'Configure CNC machine for batch production', status: 'completed', priority: 'high', due_date: '2026-10-28', completed_at: now() },
    { id: uuidv4(), order_id: ord1Id, assigned_to: emp1Id, title: 'Quality Check - Batch 1', description: 'Inspect first 50 units for dimensional accuracy', status: 'in_progress', priority: 'high', due_date: '2026-11-05' },
    { id: uuidv4(), order_id: ord2Id, assigned_to: emp2Id, title: 'Material Inspection', description: 'Inspect incoming steel plates', status: 'pending', priority: 'medium', due_date: '2026-11-08' },
    { id: uuidv4(), order_id: ord4Id, assigned_to: emp2Id, title: 'PCB Assembly', description: 'Assemble control boards as per specification', status: 'pending', priority: 'high', due_date: '2026-11-20' },
    { id: uuidv4(), order_id: ord5Id, assigned_to: emp1Id, title: 'Procurement Verification', description: 'Verify received materials against PO', status: 'pending', priority: 'low', due_date: '2026-12-01' },
  ];
  for (const t of tasks) await insert(db.tasks, { ...t, _id: t.id, created_at: now() });

  console.log('✅ Database seeded successfully!');
  console.log('   Admin: admin@ordercraft.com / Admin@123');
  console.log('   Employee 1: emp1@ordercraft.com / Emp@123');
  console.log('   Employee 2: emp2@ordercraft.com / Emp@123');
}

module.exports = { getDb, initializeDatabase, findOne, find, insert, update, remove, count, db };
