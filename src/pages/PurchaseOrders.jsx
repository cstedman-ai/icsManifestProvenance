import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import { reconcilePO, getOverallPOStatus } from '../utils/reconcile';
import { Plus, Trash2 } from 'lucide-react';

export default function PurchaseOrders() {
  const { state, dispatch } = useApp();
  const { purchaseOrders, shipments, receivings } = state;

  const sorted = [...purchaseOrders].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  function handleDelete(id) {
    if (window.confirm('Delete this purchase order?')) {
      dispatch({ type: 'DELETE_PO', payload: id });
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>Purchase Orders</h2>
        <Link to="/purchase-orders/new" className="btn btn-primary">
          <Plus size={16} /> New PO
        </Link>
      </div>

      {sorted.length === 0 ? (
        <div className="empty-state card">
          <p>No purchase orders yet. Create your first one to get started.</p>
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>PO Number</th>
              <th>Vendor</th>
              <th>Items</th>
              <th>Total Value</th>
              <th>Status</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((po) => {
              const recon = reconcilePO(po, shipments, receivings);
              const overallStatus = getOverallPOStatus(recon);
              const totalValue = po.items.reduce(
                (sum, i) => sum + i.quantityOrdered * i.unitPrice,
                0
              );
              return (
                <tr key={po.id}>
                  <td>
                    <Link to={`/purchase-orders/${po.id}`}>{po.poNumber}</Link>
                  </td>
                  <td>{po.vendor}</td>
                  <td>{po.items.length}</td>
                  <td>${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td>
                    <StatusBadge status={overallStatus} />
                  </td>
                  <td>{new Date(po.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn btn-icon btn-danger"
                      onClick={() => handleDelete(po.id)}
                      title="Delete PO"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
