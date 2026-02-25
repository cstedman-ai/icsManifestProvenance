import { useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  exportDatabaseAsJSON,
  importDatabaseFromJSON,
} from '../utils/storage';
import { Download, Upload, Trash2, Database } from 'lucide-react';

export default function DataManagement() {
  const { state, dispatch } = useApp();
  const fileInputRef = useRef(null);
  const [importStatus, setImportStatus] = useState(null);

  const stats = {
    purchaseOrders: state.purchaseOrders.length,
    shipments: state.shipments.length,
    receivings: state.receivings.length,
    totalItems: state.purchaseOrders.reduce(
      (sum, po) => sum + po.items.length,
      0
    ),
  };

  function handleExport() {
    exportDatabaseAsJSON(state);
  }

  async function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const data = await importDatabaseFromJSON(file);
      dispatch({ type: 'IMPORT_DB', payload: data });
      setImportStatus({
        type: 'success',
        message: `Imported ${data.purchaseOrders.length} POs, ${data.shipments.length} shipments, ${data.receivings.length} receivings.`,
      });
    } catch (err) {
      setImportStatus({ type: 'error', message: err.message });
    }
    e.target.value = '';
  }

  function handleClear() {
    if (
      window.confirm(
        'This will permanently delete ALL data. Are you sure?'
      )
    ) {
      dispatch({
        type: 'IMPORT_DB',
        payload: { purchaseOrders: [], shipments: [], receivings: [] },
      });
      setImportStatus({ type: 'success', message: 'All data cleared.' });
    }
  }

  return (
    <div className="page">
      <h2>Data Management</h2>
      <p className="text-muted">
        Export, import, or clear your database. All data is stored as JSON.
      </p>

      <div className="stats-grid">
        <div className="stat-card">
          <Database size={24} />
          <div>
            <span className="stat-number">{stats.purchaseOrders}</span>
            <span className="stat-label">Purchase Orders</span>
          </div>
        </div>
        <div className="stat-card">
          <Database size={24} />
          <div>
            <span className="stat-number">{stats.shipments}</span>
            <span className="stat-label">Shipments</span>
          </div>
        </div>
        <div className="stat-card">
          <Database size={24} />
          <div>
            <span className="stat-number">{stats.receivings}</span>
            <span className="stat-label">Receivings</span>
          </div>
        </div>
        <div className="stat-card">
          <Database size={24} />
          <div>
            <span className="stat-number">{stats.totalItems}</span>
            <span className="stat-label">Total Line Items</span>
          </div>
        </div>
      </div>

      <div className="data-actions-grid">
        <div className="card">
          <h3>
            <Download size={18} /> Export Database
          </h3>
          <p>Download the entire database as a JSON file for backup or transfer.</p>
          <button className="btn btn-primary" onClick={handleExport}>
            Export as JSON
          </button>
        </div>

        <div className="card">
          <h3>
            <Upload size={18} /> Import Database
          </h3>
          <p>
            Import a previously exported JSON file. This will <strong>replace</strong>{' '}
            all current data.
          </p>
          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            onChange={handleImport}
            style={{ display: 'none' }}
          />
          <button
            className="btn btn-secondary"
            onClick={() => fileInputRef.current.click()}
          >
            Choose JSON File
          </button>
        </div>

        <div className="card">
          <h3>
            <Trash2 size={18} /> Clear All Data
          </h3>
          <p>
            Permanently delete all purchase orders, shipments, and receiving
            records.
          </p>
          <button className="btn btn-danger" onClick={handleClear}>
            Clear Database
          </button>
        </div>
      </div>

      {importStatus && (
        <div className={`alert alert-${importStatus.type}`}>
          {importStatus.message}
        </div>
      )}
    </div>
  );
}
