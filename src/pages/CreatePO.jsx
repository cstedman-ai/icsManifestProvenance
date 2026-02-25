import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Plus, Trash2, X } from 'lucide-react';

function emptyItem() {
  return {
    description: '',
    partNumber: '',
    quantity: 1,
    unitPrice: 0,
    serials: [],
    serialInput: '',
  };
}

export default function CreatePO() {
  const navigate = useNavigate();
  const { dispatch } = useApp();
  const [poNumber, setPoNumber] = useState('');
  const [vendor, setVendor] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([emptyItem()]);

  function updateItem(idx, field, value) {
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );
  }

  function addSerial(idx) {
    const serial = items[idx].serialInput.trim();
    if (!serial) return;
    setItems((prev) =>
      prev.map((item, i) =>
        i === idx
          ? {
              ...item,
              serials: [...item.serials, serial],
              serialInput: '',
            }
          : item
      )
    );
  }

  function removeSerial(itemIdx, serialIdx) {
    setItems((prev) =>
      prev.map((item, i) =>
        i === itemIdx
          ? { ...item, serials: item.serials.filter((_, si) => si !== serialIdx) }
          : item
      )
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!poNumber.trim() || !vendor.trim()) return;
    if (items.some((i) => !i.description.trim() || i.quantity < 1)) return;

    dispatch({
      type: 'CREATE_PO',
      payload: {
        poNumber: poNumber.trim(),
        vendor: vendor.trim(),
        notes,
        items: items.map(({ serialInput, ...rest }) => rest),
      },
    });
    navigate('/purchase-orders');
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>Create Purchase Order</h2>
      </div>

      <form onSubmit={handleSubmit} className="form-stack">
        <div className="card">
          <h3>Order Details</h3>
          <div className="form-row">
            <div className="form-group">
              <label>PO Number *</label>
              <input
                type="text"
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                placeholder="PO-2026-001"
                required
              />
            </div>
            <div className="form-group">
              <label>Vendor *</label>
              <input
                type="text"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                placeholder="Vendor name"
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>
        </div>

        <div className="card">
          <div className="card-header-row">
            <h3>Line Items</h3>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setItems((prev) => [...prev, emptyItem()])}
            >
              <Plus size={14} /> Add Item
            </button>
          </div>

          {items.map((item, idx) => (
            <div key={idx} className="line-item">
              <div className="line-item-header">
                <span className="line-item-number">Item #{idx + 1}</span>
                {items.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-icon btn-danger"
                    onClick={() =>
                      setItems((prev) => prev.filter((_, i) => i !== idx))
                    }
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <div className="form-row">
                <div className="form-group flex-2">
                  <label>Description *</label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) =>
                      updateItem(idx, 'description', e.target.value)
                    }
                    placeholder="Item description"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Part Number</label>
                  <input
                    type="text"
                    value={item.partNumber}
                    onChange={(e) =>
                      updateItem(idx, 'partNumber', e.target.value)
                    }
                    placeholder="PN-001"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(idx, 'quantity', parseInt(e.target.value) || 1)
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Unit Price</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) =>
                      updateItem(
                        idx,
                        'unitPrice',
                        parseFloat(e.target.value) || 0
                      )
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Expected Serial Numbers</label>
                <div className="serial-input-row">
                  <input
                    type="text"
                    value={item.serialInput}
                    onChange={(e) =>
                      updateItem(idx, 'serialInput', e.target.value)
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
                {item.serials.length > 0 && (
                  <div className="serial-tags">
                    {item.serials.map((s, si) => (
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

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/purchase-orders')}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Create Purchase Order
          </button>
        </div>
      </form>
    </div>
  );
}
