import { useMemo, useState } from 'react';
import {
  X,
  ExternalLink,
  FileText,
  Clock,
  Package,
  Tag,
  DollarSign,
  Cpu,
  Info,
} from 'lucide-react';
import { categoryLabels } from '../data/cores/catalog';

export default function InventoryItemModal({
  item,
  vendorName,
  purchaseOrders,
  onClose,
}) {
  const orderHistory = useMemo(() => {
    if (!item) return [];
    const matchName = item.model?.toLowerCase() || '';
    const matchPN = item.partNumber?.toLowerCase() || '';

    return purchaseOrders
      .filter((po) => {
        if (po.vendor !== vendorName) return false;
        return po.items.some((li) => {
          const desc = (li.description || '').toLowerCase();
          const pn = (li.partNumber || '').toLowerCase();
          return (
            (matchPN && pn && pn === matchPN) ||
            (matchName && desc && desc === matchName)
          );
        });
      })
      .map((po) => {
        const matchingItems = po.items.filter((li) => {
          const desc = (li.description || '').toLowerCase();
          const pn = (li.partNumber || '').toLowerCase();
          return (
            (matchPN && pn && pn === matchPN) ||
            (matchName && desc && desc === matchName)
          );
        });
        const totalQty = matchingItems.reduce(
          (sum, li) => sum + (li.quantityOrdered || 0),
          0
        );
        return {
          poNumber: po.poNumber,
          status: po.status,
          createdAt: po.createdAt,
          quantity: totalQty,
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [item, vendorName, purchaseOrders]);

  const [activeTab, setActiveTab] = useState('details');

  if (!item) return null;

  const specs = (item.specs || '').split('|').map((s) => s.trim()).filter(Boolean);
  const isCustom = !!item.custom;

  return (
    <div className="inv-modal-overlay" onClick={onClose}>
      <div className="inv-modal" onClick={(e) => e.stopPropagation()}>
        <div className="inv-modal-header">
          <div>
            <h2 className="inv-modal-title">{item.model}</h2>
            <span className="inv-modal-subtitle">
              {item.manufacturer || vendorName}
              {' · '}
              {categoryLabels[item.category] || item.category || 'Item'}
            </span>
          </div>
          <button className="btn btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="inv-modal-tabs">
          <button
            className={`inv-modal-tab${activeTab === 'details' ? ' inv-modal-tab--active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            <Info size={14} /> Details
          </button>
          <button
            className={`inv-modal-tab${activeTab === 'history' ? ' inv-modal-tab--active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <Clock size={14} /> Order History
            {orderHistory.length > 0 && (
              <span className="inv-modal-tab-badge">{orderHistory.length}</span>
            )}
          </button>
        </div>

        <div className="inv-modal-body">
          {activeTab === 'details' && (
            <>
              {/* Description */}
              <div className="inv-modal-section">
                <h4><Info size={14} /> Description</h4>
                <p>{item.description}</p>
              </div>

              {/* Specifications */}
              {specs.length > 0 && (
                <div className="inv-modal-section">
                  <h4><Cpu size={14} /> Specifications</h4>
                  <div className="inv-modal-specs">
                    {specs.map((spec, i) => (
                      <span key={i} className="inv-modal-spec-tag">{spec}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Details grid */}
              <div className="inv-modal-section">
                <h4><Tag size={14} /> Details</h4>
                <div className="inv-modal-details">
                  {item.partNumber && (
                    <div className="inv-modal-detail">
                      <span className="inv-modal-detail-label">Part Number</span>
                      <span className="inv-modal-detail-value">{item.partNumber}</span>
                    </div>
                  )}
                  {item.estimatedCost && (
                    <div className="inv-modal-detail">
                      <span className="inv-modal-detail-label">Estimated Cost</span>
                      <span className="inv-modal-detail-value">
                        <DollarSign size={12} /> {item.estimatedCost.replace('$', '')}
                      </span>
                    </div>
                  )}
                  <div className="inv-modal-detail">
                    <span className="inv-modal-detail-label">Category</span>
                    <span className="inv-modal-detail-value">
                      {categoryLabels[item.category] || item.category || '—'}
                    </span>
                  </div>
                  {isCustom && (
                    <div className="inv-modal-detail">
                      <span className="inv-modal-detail-label">Source</span>
                      <span className="inv-modal-detail-value">Custom (vendor-added)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Links */}
              {item.links && (item.links.productPage || item.links.datasheet) && (
                <div className="inv-modal-section">
                  <h4><ExternalLink size={14} /> Links</h4>
                  <div className="inv-modal-links">
                    {item.links.productPage && (
                      <a
                        href={item.links.productPage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inv-modal-link"
                      >
                        <Package size={14} /> Product Page
                        <ExternalLink size={12} />
                      </a>
                    )}
                    {item.links.datasheet && (
                      <a
                        href={item.links.datasheet}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inv-modal-link"
                      >
                        <FileText size={14} /> Datasheet
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'history' && (
            <div className="inv-modal-section">
              {orderHistory.length === 0 ? (
                <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                  No purchase orders found for this item.
                </p>
              ) : (
                <div className="inv-modal-history">
                  <div className="inv-modal-history-header">
                    <span>PO Number</span>
                    <span>Qty</span>
                    <span>Status</span>
                    <span>Date</span>
                  </div>
                  {orderHistory.map((order, i) => (
                    <div key={i} className="inv-modal-history-row">
                      <span className="inv-modal-history-po">{order.poNumber}</span>
                      <span>{order.quantity}</span>
                      <span className={`inv-modal-status inv-modal-status--${order.status}`}>
                        {order.status}
                      </span>
                      <span className="inv-modal-history-date">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
