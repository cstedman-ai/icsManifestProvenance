import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import PurchaseOrders from './pages/PurchaseOrders';
import CreatePO from './pages/CreatePO';
import PODetail from './pages/PODetail';
import VendorPortal from './pages/VendorPortal';
import Receiving from './pages/Receiving';
import Reconciliation from './pages/Reconciliation';
import DataManagement from './pages/DataManagement';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
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
      </BrowserRouter>
    </AppProvider>
  );
}
