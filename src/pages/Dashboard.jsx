import { useApp } from '../context/AppContext';
import { reconcilePO, getOverallPOStatus } from '../utils/reconcile';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  Truck,
  PackageCheck,
  AlertTriangle,
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

export default function Dashboard() {
  const { state } = useApp();
  const { purchaseOrders, shipments, receivings } = state;

  const totalPOs = purchaseOrders.length;
  const totalShipments = shipments.length;
  const totalReceivings = receivings.length;

  const discrepancies = purchaseOrders.reduce((count, po) => {
    const recon = reconcilePO(po, shipments, receivings);
    const hasIssue = recon.some(
      (r) =>
        r.missingSerials.length > 0 ||
        r.extraSerials.length > 0 ||
        r.shippedVsReceivedDelta !== 0
    );
    return count + (hasIssue ? 1 : 0);
  }, 0);

  const recentPOs = [...purchaseOrders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div className="page">
      <h2>Dashboard</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <ClipboardList size={28} />
          <div>
            <span className="stat-number">{totalPOs}</span>
            <span className="stat-label">Purchase Orders</span>
          </div>
        </div>
        <div className="stat-card">
          <Truck size={28} />
          <div>
            <span className="stat-number">{totalShipments}</span>
            <span className="stat-label">Shipments</span>
          </div>
        </div>
        <div className="stat-card">
          <PackageCheck size={28} />
          <div>
            <span className="stat-number">{totalReceivings}</span>
            <span className="stat-label">Receivings</span>
          </div>
        </div>
        <div className="stat-card warn">
          <AlertTriangle size={28} />
          <div>
            <span className="stat-number">{discrepancies}</span>
            <span className="stat-label">Discrepancies</span>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Recent Purchase Orders</h3>
        {recentPOs.length === 0 ? (
          <p className="empty-state">
            No purchase orders yet.{' '}
            <Link to="/purchase-orders">Create one</Link>
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>PO Number</th>
                <th>Vendor</th>
                <th>Items</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {recentPOs.map((po) => {
                const recon = reconcilePO(po, shipments, receivings);
                const overallStatus = getOverallPOStatus(recon);
                return (
                  <tr key={po.id}>
                    <td>
                      <Link to={`/purchase-orders/${po.id}`}>
                        {po.poNumber}
                      </Link>
                    </td>
                    <td>{po.vendor}</td>
                    <td>{po.items.length}</td>
                    <td>
                      <StatusBadge status={overallStatus} />
                    </td>
                    <td>{new Date(po.createdAt).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="quick-actions">
        <Link to="/purchase-orders/new" className="btn btn-primary">
          New Purchase Order
        </Link>
        <Link to="/vendor-portal" className="btn btn-secondary">
          Vendor Portal
        </Link>
        <Link to="/receiving" className="btn btn-secondary">
          Record Delivery
        </Link>
      </div>
    </div>
  );
}
