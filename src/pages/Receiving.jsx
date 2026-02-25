import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { X, ScanLine } from 'lucide-react';

export default function Receiving() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [selectedPOId, setSelectedPOId] = useState(
    searchParams.get('poId') || ''
  );
  const [receivedBy, setReceivedBy] = useState('');
  const [notes, setNotes] = useState('');
  const [receivingItems, setReceivingItems] = useState([]);
  const [qrInput, setQrInput] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const shippedPOs = state.purchaseOrders.filter(
    (po) => po.status === 'shipped' || po.status === 'received'
  );
  const selectedPO = state.purchaseOrders.find((po) => po.id === selectedPOId);

  useEffect(() => {
    if (selectedPO) {
      const poShipments = state.shipments.filter(
        (s) => s.poId === selectedPO.id
      );

      setReceivingItems(
        selectedPO.items.map((item) => {
          const totalShipped = poShipments.reduce((sum, s) => {
            const match = s.items.find((si) => si.poItemId === item.id);
            return sum + (match ? match.quantityShipped : 0);
          }, 0);
          const serialsShipped = poShipments.flatMap((s) => {
            const match = s.items.find((si) => si.poItemId === item.id);
            return match ? match.serialsShipped : [];
          });

          return {
            poItemId: item.id,
            description: item.description,
            partNumber: item.partNumber,
            quantityOrdered: item.quantityOrdered,
            quantityShipped: totalShipped,
            quantityReceived: totalShipped,
            serialsShipped,
            serialsReceived: [...serialsShipped],
            serialInput: '',
            condition: 'good',
            notes: '',
          };
        })
      );
      setSubmitted(false);
    }
  }, [selectedPOId]);

  function handleQRPaste() {
    try {
      const data = JSON.parse(qrInput);
      if (data.poNumber) {
        const matchingPO = state.purchaseOrders.find(
          (po) => po.poNumber === data.poNumber
        );
        if (matchingPO) {
          setSelectedPOId(matchingPO.id);
          setShowScanner(false);
          setQrInput('');
        }
      }
    } catch {
      alert('Invalid QR data. Please paste the QR code content.');
    }
  }

  function updateReceivingItem(idx, field, value) {
    setReceivingItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );
  }

  function addSerial(idx) {
    const serial = receivingItems[idx].serialInput.trim();
    if (!serial) return;
    setReceivingItems((prev) =>
      prev.map((item, i) =>
        i === idx
          ? {
              ...item,
              serialsReceived: [...item.serialsReceived, serial],
              serialInput: '',
            }
          : item
      )
    );
  }

  function removeSerial(itemIdx, serialIdx) {
    setReceivingItems((prev) =>
      prev.map((item, i) =>
        i === itemIdx
          ? {
              ...item,
              serialsReceived: item.serialsReceived.filter(
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

    const latestShipment = state.shipments
      .filter((s) => s.poId === selectedPO.id)
      .sort((a, b) => new Date(b.shippedAt) - new Date(a.shippedAt))[0];

    dispatch({
      type: 'RECORD_RECEIVING',
      payload: {
        poId: selectedPO.id,
        shipmentId: latestShipment?.id || null,
        receivedBy,
        notes,
        items: receivingItems.map(
          ({ poItemId, quantityReceived, serialsReceived, condition, notes: itemNotes }) => ({
            poItemId,
            quantityReceived,
            serialsReceived,
            condition,
            notes: itemNotes,
          })
        ),
      },
    });
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="page">
        <div className="card success-card">
          <h2>Delivery Recorded</h2>
          <p>
            Receiving record for <strong>{selectedPO.poNumber}</strong> has been
            saved. Check the reconciliation page for any discrepancies.
          </p>
          <div className="form-actions">
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/reconciliation?poId=${selectedPO.id}`)}
            >
              View Reconciliation
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setSubmitted(false);
                setSelectedPOId('');
              }}
            >
              Record Another Delivery
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <h2>Receiving / Delivery</h2>
      <p className="text-muted">
        Record items as they arrive. Select a PO or paste QR code data from the
        shipment label.
      </p>

      <div className="card">
        <div className="card-header-row">
          <h3>Identify Shipment</h3>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowScanner(!showScanner)}
          >
            <ScanLine size={14} /> {showScanner ? 'Hide' : 'Paste'} QR Data
          </button>
        </div>

        {showScanner && (
          <div className="qr-scanner-section">
            <div className="form-group">
              <label>Paste QR Code Data</label>
              <textarea
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                rows={4}
                placeholder='Paste the QR code JSON content here...'
              />
            </div>
            <button className="btn btn-primary btn-sm" onClick={handleQRPaste}>
              Load from QR Data
            </button>
          </div>
        )}

        <div className="form-group">
          <label>Select Purchase Order</label>
          <select
            value={selectedPOId}
            onChange={(e) => setSelectedPOId(e.target.value)}
            required
          >
            <option value="">-- Select a shipped PO --</option>
            {shippedPOs.map((po) => (
              <option key={po.id} value={po.id}>
                {po.poNumber} — {po.vendor} ({po.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedPO && (
        <form onSubmit={handleSubmit} className="form-stack">
          <div className="card">
            <h3>Receiving Details</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Received By</label>
                <input
                  type="text"
                  value={receivedBy}
                  onChange={(e) => setReceivedBy(e.target.value)}
                  placeholder="Your name"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="General delivery notes..."
              />
            </div>
          </div>

          <div className="card">
            <h3>Received Items</h3>
            {receivingItems.map((item, idx) => (
              <div key={idx} className="line-item">
                <div className="line-item-header">
                  <span className="line-item-number">
                    {item.description}{' '}
                    {item.partNumber && `(${item.partNumber})`}
                  </span>
                  <span className="text-muted">
                    Shipped: {item.quantityShipped}
                  </span>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Quantity Received</label>
                    <input
                      type="number"
                      min="0"
                      value={item.quantityReceived}
                      onChange={(e) =>
                        updateReceivingItem(
                          idx,
                          'quantityReceived',
                          parseInt(e.target.value) || 0
                        )
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Condition</label>
                    <select
                      value={item.condition}
                      onChange={(e) =>
                        updateReceivingItem(idx, 'condition', e.target.value)
                      }
                    >
                      <option value="good">Good</option>
                      <option value="damaged">Damaged</option>
                      <option value="partial">Partial</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    Serial Numbers Received
                    {item.serialsShipped.length > 0 && (
                      <span className="text-muted">
                        {' '}
                        (expected: {item.serialsShipped.length})
                      </span>
                    )}
                  </label>
                  <div className="serial-input-row">
                    <input
                      type="text"
                      value={item.serialInput}
                      onChange={(e) =>
                        updateReceivingItem(idx, 'serialInput', e.target.value)
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
                  {item.serialsReceived.length > 0 && (
                    <div className="serial-tags">
                      {item.serialsReceived.map((s, si) => {
                        const isExpected = item.serialsShipped.includes(s);
                        return (
                          <span
                            key={si}
                            className={`serial-tag ${isExpected ? '' : 'tag-warning'}`}
                          >
                            {s}
                            {!isExpected && ' (unexpected)'}
                            <button
                              type="button"
                              onClick={() => removeSerial(idx, si)}
                            >
                              <X size={12} />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Item Notes</label>
                  <input
                    type="text"
                    value={item.notes}
                    onChange={(e) =>
                      updateReceivingItem(idx, 'notes', e.target.value)
                    }
                    placeholder="Notes about this item..."
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Record Delivery
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
