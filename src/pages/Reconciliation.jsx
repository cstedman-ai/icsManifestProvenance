import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { reconcilePO, getOverallPOStatus } from '../utils/reconcile';
import StatusBadge from '../components/StatusBadge';
import { AlertTriangle, CheckCircle, Filter } from 'lucide-react';

export default function Reconciliation() {
  const [searchParams] = useSearchParams();
  const { state } = useApp();
  const { purchaseOrders, shipments, receivings } = state;

  const preSelectedPO = searchParams.get('poId') || '';
  const [filter, setFilter] = useState('all');
  const [selectedPOId, setSelectedPOId] = useState(preSelectedPO);

  const posWithRecon = purchaseOrders.map((po) => {
    const recon = reconcilePO(po, shipments, receivings);
    const overallStatus = getOverallPOStatus(recon);
    const hasDiscrepancy = recon.some(
      (r) =>
        r.missingSerials.length > 0 ||
        r.extraSerials.length > 0 ||
        r.shippedVsReceivedDelta !== 0 ||
        r.orderedVsShippedDelta !== 0
    );
    return { po, recon, overallStatus, hasDiscrepancy };
  });

  const filtered = posWithRecon.filter((entry) => {
    if (filter === 'discrepancy') return entry.hasDiscrepancy;
    if (filter === 'complete') return entry.overallStatus === 'complete';
    if (filter === 'pending')
      return (
        entry.overallStatus === 'pending' ||
        entry.overallStatus === 'in_progress'
      );
    return true;
  });

  const selectedEntry = selectedPOId
    ? posWithRecon.find((e) => e.po.id === selectedPOId)
    : null;

  return (
    <div className="page">
      <h2>Reconciliation</h2>
      <p className="text-muted">
        Compare ordered, shipped, and received quantities. Identify
        discrepancies in items and serial numbers.
      </p>

      <div className="card">
        <div className="card-header-row">
          <h3>Purchase Orders</h3>
          <div className="filter-row">
            <Filter size={14} />
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="discrepancy">With Discrepancies</option>
              <option value="complete">Complete</option>
              <option value="pending">Pending / In Progress</option>
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="empty-state">No purchase orders match this filter.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>PO Number</th>
                <th>Vendor</th>
                <th>Status</th>
                <th>Discrepancy</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(({ po, overallStatus, hasDiscrepancy }) => (
                <tr
                  key={po.id}
                  className={`clickable-row ${selectedPOId === po.id ? 'selected-row' : ''}`}
                  onClick={() => setSelectedPOId(po.id)}
                >
                  <td>{po.poNumber}</td>
                  <td>{po.vendor}</td>
                  <td>
                    <StatusBadge status={overallStatus} />
                  </td>
                  <td>
                    {hasDiscrepancy ? (
                      <span className="discrepancy-indicator">
                        <AlertTriangle size={14} /> Yes
                      </span>
                    ) : (
                      <span className="ok-indicator">
                        <CheckCircle size={14} /> None
                      </span>
                    )}
                  </td>
                  <td>
                    <Link
                      to={`/purchase-orders/${po.id}`}
                      className="btn btn-secondary btn-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View PO
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedEntry && (
        <div className="card">
          <h3>
            Detail: {selectedEntry.po.poNumber} — {selectedEntry.po.vendor}
          </h3>

          <table className="recon-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Part #</th>
                <th>Ordered</th>
                <th>Shipped</th>
                <th>Received</th>
                <th>Order vs Ship</th>
                <th>Ship vs Recv</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {selectedEntry.recon.map((r) => {
                const hasIssue =
                  r.shippedVsReceivedDelta !== 0 ||
                  r.orderedVsShippedDelta !== 0 ||
                  r.missingSerials.length > 0 ||
                  r.extraSerials.length > 0;
                return (
                  <tr key={r.itemId} className={hasIssue ? 'row-warn' : ''}>
                    <td>{r.description}</td>
                    <td>{r.partNumber}</td>
                    <td>{r.quantityOrdered}</td>
                    <td>{r.totalShipped}</td>
                    <td>{r.totalReceived}</td>
                    <td>
                      <DeltaCell value={r.orderedVsShippedDelta} />
                    </td>
                    <td>
                      <DeltaCell value={r.shippedVsReceivedDelta} />
                    </td>
                    <td>
                      <StatusBadge status={r.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {selectedEntry.recon.some(
            (r) => r.missingSerials.length > 0 || r.extraSerials.length > 0
          ) && (
            <div className="serial-discrepancy-section">
              <h4>Serial Number Issues</h4>
              {selectedEntry.recon
                .filter(
                  (r) =>
                    r.missingSerials.length > 0 || r.extraSerials.length > 0
                )
                .map((r) => (
                  <div key={r.itemId} className="serial-discrepancy">
                    <strong>{r.description}</strong>
                    {r.missingSerials.length > 0 && (
                      <div className="serial-issue">
                        <span className="issue-label danger">
                          Missing ({r.missingSerials.length}):
                        </span>
                        <div className="serial-tags">
                          {r.missingSerials.map((s, i) => (
                            <span key={i} className="serial-tag tag-danger">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {r.extraSerials.length > 0 && (
                      <div className="serial-issue">
                        <span className="issue-label warning">
                          Unexpected ({r.extraSerials.length}):
                        </span>
                        <div className="serial-tags">
                          {r.extraSerials.map((s, i) => (
                            <span key={i} className="serial-tag tag-warning">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DeltaCell({ value }) {
  if (value === 0) return <span className="delta-ok">0</span>;
  return (
    <span className="delta-warn">
      {value > 0 ? '+' : ''}
      {value}
    </span>
  );
}
