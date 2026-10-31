import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Admin pages
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import Customers from './pages/admin/Customers';
import Employees from './pages/admin/Employees';
import Orders from './pages/admin/Orders';
import BOM from './pages/admin/BOM';
import PurchaseOrders from './pages/admin/PurchaseOrders';
import Invoices from './pages/admin/Invoices';
import Payments from './pages/admin/Payments';
import Inventory from './pages/admin/Inventory';
import Suppliers from './pages/admin/Suppliers';
import Reports from './pages/admin/Reports';

// Employee pages
import EmployeeLayout from './layouts/EmployeeLayout';
import EmployeeDashboard from './pages/employee/Dashboard';
import AssignedOrders from './pages/employee/AssignedOrders';
import Tasks from './pages/employee/Tasks';
import InventoryCheck from './pages/employee/InventoryCheck';
import WorkHistory from './pages/employee/WorkHistory';
import ProductionProgress from './pages/employee/ProductionProgress';

const ProtectedRoute = ({ allowedRole }) => {
  const { user, loading, token } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0a0e1a', color: '#00d4ff' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #1e3a5f', borderTop: '3px solid #00d4ff', borderRadius: '50%', animation: 'rotate 1s linear infinite', margin: '0 auto 12px' }} />
        <span>Loading OrderCraft...</span>
      </div>
    </div>
  );
  if (!token || !user) return <Navigate to="/" replace />;
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/employee'} replace />;
  }
  return <Outlet />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRole="admin" />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="customers" element={<Customers />} />
              <Route path="employees" element={<Employees />} />
              <Route path="orders" element={<Orders />} />
              <Route path="bom" element={<BOM />} />
              <Route path="purchase-orders" element={<PurchaseOrders />} />
              <Route path="invoices" element={<Invoices />} />
              <Route path="payments" element={<Payments />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="suppliers" element={<Suppliers />} />
              <Route path="reports" element={<Reports />} />
            </Route>
          </Route>

          {/* Employee Routes */}
          <Route element={<ProtectedRoute allowedRole="employee" />}>
            <Route path="/employee" element={<EmployeeLayout />}>
              <Route index element={<EmployeeDashboard />} />
              <Route path="orders" element={<AssignedOrders />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="inventory" element={<InventoryCheck />} />
              <Route path="history" element={<WorkHistory />} />
              <Route path="production" element={<ProductionProgress />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
