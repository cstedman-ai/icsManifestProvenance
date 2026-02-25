import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { reconcilePO, getOverallPOStatus } from '../utils/reconcile';
import { QRCodeSVG } from 'qrcode.react';
import StatusBadge from '../components/StatusBadge';
import { ArrowLeft, Printer } from 'lucide-react';

export default function PODetail() {
  const { id } = useParams();
  const { state } = useApp();
  const { purchaseOrders, shipments, receivings } = state;

  const po = purchaseOrders.find((p) => p.id === id);
  if (!po) {
    return (
      <div className="page">
        <p>Purchase order not found.</p>
        <Link to="/purchase-orders">Back to list</Link>
      </div>
    );
  }

  const recon = reconcilePO(po, shipments, receivings);
  const overallStatus = getOverallPOStatus(recon);
  const totalValue = po.items.reduce(
    (sum, i) => sum + i.quantityOrdered * i.unitPrice,
    0
  );

  const qrData = JSON.stringify({
    poId: po.id,
    poNumber: po.poNumber,
    vendor: po.vendor,
    items: po.items.map((i) => ({
      id: i.id,
      desc: i.description,
      pn: i.partNumber,
      qty: i.quantityOrdered,
      serials: i.serials,
    })),
  });

  return (
    <div className="page">
      <div className="page-header">
        <Link to="/purchase-orders" className="btn btn-secondary btn-sm">
          <ArrowLeft size={14} /> Back
        </Link>
        <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>
          <Printer size={14} /> Print
        </button>
      </div>

      <div className="po-detail-grid">
        <div className="card">
          <h3>
            PO: {po.poNumber} <StatusBadge status={overallStatus} />
          </h3>
          <div className="detail-fields">
            <div>
              <strong>Vendor:</strong> {po.vendor}
            </div>
            <div>
              <strong>Created:</strong>{' '}
              {new Date(po.createdAt).toLocaleDateString()}
            </div>
            <div>
              <strong>Total Value:</strong> $
              {totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            {po.notes && (
              <div>
                <strong>Notes:</strong> {po.notes}
              </div>
            )}
          </div>
        </div>

        <div className="card qr-card">
          <h3>Vendor QR Code</h3>
          <p className="text-muted">
            Vendor scans this to access the shipment portal
          </p>
          <QRCodeSVG value={qrData} size={180} level="M" />
        </div>
      </div>

      <div className="card">
        <h3>Line Items & Reconciliation</h3>
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Part #</th>
              <th>Ordered</th>
              <th>Shipped</th>
              <th>Received</th>
              <th>Delta</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recon.map((r) => (
              <tr key={r.itemId} className={r.shippedVsReceivedDelta !== 0 ? 'row-warn' : ''}>
                <td>{r.description}</td>
                <td>{r.partNumber}</td>
                <td>{r.quantityOrdered}</td>
                <td>{r.totalShipped}</td>
                <td>{r.totalReceived}</td>
                <td>
                  {r.shippedVsReceivedDelta !== 0 ? (
                    <span className="delta-warn">
                      {r.shippedVsReceivedDelta > 0 ? '+' : ''}
                      {r.shippedVsReceivedDelta}
                    </span>
                  ) : (
                    <span className="delta-ok">0</span>
                  )}
                </td>
                <td>
                  <StatusBadge status={r.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {recon.some((r) => r.missingSerials.length > 0 || r.extraSerials.length > 0) && (
        <div className="card card-warning">
          <h3>Serial Number Discrepancies</h3>
          {recon
            .filter((r) => r.missingSerials.length > 0 || r.extraSerials.length > 0)
            .map((r) => (
              <div key={r.itemId} className="serial-discrepancy">
                <h4>{r.description}</h4>
                {r.missingSerials.length > 0 && (
                  <div>
                    <strong>Missing (shipped but not received):</strong>
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
                  <div>
                    <strong>Extra (received but not shipped):</strong>
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

      <div className="quick-actions">
        <Link
          to={`/vendor-portal?poId=${po.id}`}
          className="btn btn-primary"
        >
          Record Shipment
        </Link>
        <Link
          to={`/receiving?poId=${po.id}`}
          className="btn btn-secondary"
        >
          Record Delivery
        </Link>
      </div>
    </div>
  );
}
