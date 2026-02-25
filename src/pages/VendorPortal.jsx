import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { QRCodeSVG } from 'qrcode.react';
import { X, Package } from 'lucide-react';

export default function VendorPortal() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [selectedPOId, setSelectedPOId] = useState(
    searchParams.get('poId') || ''
  );
  const [trackingNumber, setTrackingNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [shipmentItems, setShipmentItems] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [lastShipment, setLastShipment] = useState(null);

  const availablePOs = state.purchaseOrders.filter(
    (po) => po.status === 'issued' || po.status === 'shipped'
  );
  const selectedPO = state.purchaseOrders.find((po) => po.id === selectedPOId);

  useEffect(() => {
    if (selectedPO) {
      setShipmentItems(
        selectedPO.items.map((item) => ({
          poItemId: item.id,
          description: item.description,
          partNumber: item.partNumber,
          quantityOrdered: item.quantityOrdered,
          quantityShipped: item.quantityOrdered,
          serialsShipped: [...item.serials],
          serialInput: '',
        }))
      );
      setSubmitted(false);
      setLastShipment(null);
    }
  }, [selectedPOId]);

  function updateShipmentItem(idx, field, value) {
    setShipmentItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );
  }

  function addSerial(idx) {
    const serial = shipmentItems[idx].serialInput.trim();
    if (!serial) return;
    setShipmentItems((prev) =>
      prev.map((item, i) =>
        i === idx
          ? {
              ...item,
              serialsShipped: [...item.serialsShipped, serial],
              serialInput: '',
            }
          : item
      )
    );
  }

  function removeSerial(itemIdx, serialIdx) {
    setShipmentItems((prev) =>
      prev.map((item, i) =>
        i === itemIdx
          ? {
              ...item,
              serialsShipped: item.serialsShipped.filter(
                (_, si) => si !== serialIdx
              ),
            }
          : item
      )
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!selectedPO) return;

    const payload = {
      poId: selectedPO.id,
      trackingNumber,
      notes,
      items: shipmentItems.map(({ poItemId, quantityShipped, serialsShipped }) => ({
        poItemId,
        quantityShipped,
        serialsShipped,
      })),
    };

    dispatch({ type: 'CREATE_SHIPMENT', payload });

    const qrPayload = {
      poNumber: selectedPO.poNumber,
      vendor: selectedPO.vendor,
      tracking: trackingNumber,
      items: shipmentItems.map((si) => ({
        desc: si.description,
        pn: si.partNumber,
        qtyShipped: si.quantityShipped,
        serials: si.serialsShipped,
      })),
    };
    setLastShipment(qrPayload);
    setSubmitted(true);
  }

  if (submitted && lastShipment) {
    const qrString = JSON.stringify(lastShipment);
    return (
      <div className="page">
        <div className="card success-card">
          <Package size={48} />
          <h2>Shipment Recorded</h2>
          <p>
            Shipment for <strong>{lastShipment.poNumber}</strong> has been
            recorded. Print or save the QR code below — attach it to the shipment
            so the receiver can scan it upon delivery.
          </p>

          <div className="qr-section">
            <QRCodeSVG value={qrString} size={240} level="M" />
            <p className="text-muted">
              Contains: PO #{lastShipment.poNumber}, {lastShipment.items.length}{' '}
              line item(s), tracking: {lastShipment.tracking || 'N/A'}
            </p>
          </div>

          <div className="shipment-summary">
            <h3>Shipment Summary</h3>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Part #</th>
                  <th>Qty Shipped</th>
                  <th>Serials</th>
                </tr>
              </thead>
              <tbody>
                {lastShipment.items.map((item, i) => (
                  <tr key={i}>
                    <td>{item.desc}</td>
                    <td>{item.pn}</td>
                    <td>{item.qtyShipped}</td>
                    <td>{item.serials.join(', ') || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="form-actions">
            <button
              className="btn btn-primary"
              onClick={() => window.print()}
            >
              Print QR Code
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setSubmitted(false);
                setSelectedPOId('');
              }}
            >
              Record Another Shipment
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/purchase-orders')}
            >
              Back to POs
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <h2>Vendor Shipment Portal</h2>
      <p className="text-muted">
        Select a purchase order and record the items being shipped, including
        serial numbers and quantities.
      </p>

      <form onSubmit={handleSubmit} className="form-stack">
        <div className="card">
          <h3>Select Purchase Order</h3>
          <div className="form-group">
            <label>Purchase Order</label>
            <select
              value={selectedPOId}
              onChange={(e) => setSelectedPOId(e.target.value)}
              required
            >
              <option value="">-- Select a PO --</option>
              {availablePOs.map((po) => (
                <option key={po.id} value={po.id}>
                  {po.poNumber} — {po.vendor}
                </option>
              ))}
            </select>
          </div>
          {selectedPO && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>Tracking Number</label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Carrier tracking number"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Shipment Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Any notes about the shipment..."
                />
              </div>
            </>
          )}
        </div>

        {selectedPO && shipmentItems.length > 0 && (
          <div className="card">
            <h3>Items Being Shipped</h3>
            {shipmentItems.map((item, idx) => (
              <div key={idx} className="line-item">
                <div className="line-item-header">
                  <span className="line-item-number">
                    {item.description}{' '}
                    {item.partNumber && `(${item.partNumber})`}
                  </span>
                  <span className="text-muted">
                    Ordered: {item.quantityOrdered}
                  </span>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Quantity Shipping</label>
                    <input
                      type="number"
                      min="0"
                      max={item.quantityOrdered}
                      value={item.quantityShipped}
                      onChange={(e) =>
                        updateShipmentItem(
                          idx,
                          'quantityShipped',
                          parseInt(e.target.value) || 0
                        )
                      }
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Serial Numbers</label>
                  <div className="serial-input-row">
                    <input
                      type="text"
                      value={item.serialInput}
                      onChange={(e) =>
                        updateShipmentItem(idx, 'serialInput', e.target.value)
                      }
                      placeholder="Enter serial number"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSerial(idx);
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => addSerial(idx)}
                    >
                      Add
                    </button>
                  </div>
                  {item.serialsShipped.length > 0 && (
                    <div className="serial-tags">
                      {item.serialsShipped.map((s, si) => (
                        <span key={si} className="serial-tag">
                          {s}
                          <button
                            type="button"
                            onClick={() => removeSerial(idx, si)}
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedPO && (
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Record Shipment & Generate QR
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
