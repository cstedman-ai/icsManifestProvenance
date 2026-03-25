import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import {
  Package,
  ChevronDown,
  ChevronUp,
  Printer,
  Search,
  Clock,
} from 'lucide-react';
import { format } from 'date-fns';

export default function VendorShipmentHistory() {
  const { state } = useApp();
  const { user } = useAuth();
  const vendorName = user?.vendor?.shortName || user?.vendor?.name || '';
  const [expandedId, setExpandedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const vendorPOs = state.purchaseOrders.filter(
    (po) =>
      po.vendor === vendorName &&
      (po.status === 'shipped' || po.status === 'received')
  );

  const filtered = vendorPOs.filter((po) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      po.poNumber.toLowerCase().includes(q) ||
      po.notes?.toLowerCase().includes(q)
    );
  });

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  function getShipmentsForPO(poId) {
    return state.shipments
      .filter((s) => s.poId === poId)
      .sort((a, b) => new Date(b.shippedAt) - new Date(a.shippedAt));
  }

  function buildQRPayload(po, shipment) {
    return {
      poNumber: po.poNumber,
      vendor: po.vendor,
      tracking: shipment.trackingNumber || '',
      items: shipment.items.map((si) => {
        const poItem = po.items.find((i) => i.id === si.poItemId);
        return {
          desc: poItem?.description || 'Unknown',
          pn: poItem?.partNumber || '',
          qtyShipped: si.quantityShipped,
          serials: si.serialsShipped,
        };
      }),
    };
  }

  function handlePrint(po, shipment) {
    setExpandedId(po.id);
    setTimeout(() => window.print(), 200);
  }

  const isExpanded = (id) => expandedId === id;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Shipment History</h2>
          <p className="text-muted">
            View and reprint past shipments for <strong>{vendorName}</strong>
          </p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="search-bar">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by PO number..."
            className="search-input"
          />
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="card empty-state">
          <Package size={40} />
          <h3>No shipments yet</h3>
          <p className="text-muted">
            Recorded shipments will appear here so you can review and reprint QR
            codes.
          </p>
        </div>
      ) : (
        <div className="shipment-history-list">
          {sorted.map((po) => {
            const shipments = getShipmentsForPO(po.id);
            const expanded = isExpanded(po.id);

            return (
              <div
                key={po.id}
                className={`card shipment-history-card${expanded ? ' shipment-history-card--open' : ''}`}
              >
                <button
                  className="shipment-history-header"
                  onClick={() => setExpandedId(expanded ? null : po.id)}
                >
                  <div className="shipment-history-info">
                    <span className="shipment-history-po">{po.poNumber}</span>
                    <span className="shipment-history-meta">
                      <Clock size={13} />
                      {format(new Date(po.createdAt), 'MMM d, yyyy')}
                    </span>
                    <span
                      className={`status-badge status-badge--${po.status}`}
                    >
                      {po.status}
                    </span>
                  </div>
                  <div className="shipment-history-toggle">
                    <span className="text-muted">
                      {shipments.length} shipment{shipments.length !== 1 ? 's' : ''}
                    </span>
                    {expanded ? (
                      <ChevronUp size={18} />
                    ) : (
                      <ChevronDown size={18} />
                    )}
                  </div>
                </button>

                {expanded && (
                  <div className="shipment-history-body">
                    {shipments.length === 0 ? (
                      <p className="text-muted" style={{ padding: '1rem' }}>
                        No shipment records found for this PO.
                      </p>
                    ) : (
                      shipments.map((shipment) => {
                        const qrPayload = buildQRPayload(po, shipment);
                        const qrString = JSON.stringify(qrPayload);

                        return (
                          <div
                            key={shipment.id}
                            className="shipment-history-detail"
                          >
                            <div className="shipment-history-detail-header">
                              <div>
                                <p className="shipment-history-detail-date">
                                  Shipped{' '}
                                  {format(
                                    new Date(shipment.shippedAt),
                                    'MMM d, yyyy h:mm a'
                                  )}
                                </p>
                                {shipment.trackingNumber && (
                                  <p className="text-muted">
                                    Tracking: {shipment.trackingNumber}
                                  </p>
                                )}
                              </div>
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => handlePrint(po, shipment)}
                              >
                                <Printer size={14} /> Reprint
                              </button>
                            </div>

                            <table className="shipment-history-table">
                              <thead>
                                <tr>
                                  <th>Item</th>
                                  <th>Part #</th>
                                  <th>Qty</th>
                                  <th>Serials</th>
                                </tr>
                              </thead>
                              <tbody>
                                {qrPayload.items.map((item, i) => (
                                  <tr key={i}>
                                    <td>{item.desc}</td>
                                    <td>{item.pn || '—'}</td>
                                    <td>{item.qtyShipped}</td>
                                    <td>
                                      {item.serials.length > 0
                                        ? item.serials.join(', ')
                                        : '—'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>

                            <div className="shipment-history-qr">
                              <QRCodeSVG
                                value={qrString}
                                size={180}
                                level="M"
                              />
                              <p className="text-muted">
                                PO {qrPayload.poNumber} —{' '}
                                {qrPayload.items.length} item(s)
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
