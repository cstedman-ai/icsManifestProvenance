import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import DatacenterView from './pages/DatacenterView';
import ConnectionsView from './pages/ConnectionsView';
import InventoryView from './pages/InventoryView';
import SaveRestoreView from './pages/SaveRestoreView';
import { useDatacenterStore } from './store/useDatacenterStore';

function App() {
  const initializeDatacenter = useDatacenterStore(state => state.initializeDatacenter);

  useEffect(() => {
    initializeDatacenter();
  }, [initializeDatacenter]);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/datacenter" replace />} />
        <Route path="/datacenter" element={<DatacenterView />} />
        <Route path="/connections" element={<ConnectionsView />} />
        <Route path="/inventory" element={<InventoryView />} />
        <Route path="/save-restore" element={<SaveRestoreView />} />
      </Routes>
    </Layout>
  );
}

export default App;

