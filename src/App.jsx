import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PurchaseOrders from './pages/PurchaseOrders';
import CreatePO from './pages/CreatePO';
import PODetail from './pages/PODetail';
import VendorPortal from './pages/VendorPortal';
import Receiving from './pages/Receiving';
import Reconciliation from './pages/Reconciliation';
import DataManagement from './pages/DataManagement';

function ProtectedRoutes() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'vendor') {
    return (
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<VendorPortal />} />
          <Route path="vendor-portal" element={<VendorPortal />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="purchase-orders" element={<PurchaseOrders />} />
        <Route path="purchase-orders/new" element={<CreatePO />} />
        <Route path="purchase-orders/:id" element={<PODetail />} />
        <Route path="vendor-portal" element={<VendorPortal />} />
        <Route path="receiving" element={<Receiving />} />
        <Route path="reconciliation" element={<Reconciliation />} />
        <Route path="data" element={<DataManagement />} />
      </Route>
    </Routes>
  );
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <Login />}
      />
      <Route path="/*" element={<ProtectedRoutes />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}
