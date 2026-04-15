import { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  PackageCheck,
  Minus,
  Plus,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react';

export default function MobileDetailedReview({
  selectedPO,
  scannedData,
  receivingItems,
  notes,
  onNotesChange,
  onUpdateItem,
  onToggleSerial,
  onStepQuantity,
  onBack,
  onSubmit,
  capturedPhotos,
  onAddPhoto,
  userEmail,
}) {
  const fileInputRef = useRef(null);
  const [showSigPanel, setShowSigPanel] = useState(false);
  const sigRef = useRef(null);
  const sigDrawing = useRef(false);
  const sigLastPos = useRef({ x: 0, y: 0 });
  const [hasSigned, setHasSigned] = useState(false);

  useEffect(() => {
    if (!showSigPanel || !sigRef.current) return;
    const canvas = sigRef.current;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [showSigPanel]);

  function getSigPos(e) {
    const canvas = sigRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches ? e.touches[0] : e;
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  }

  function sigTouchStart(e) {
    e.preventDefault();
    sigDrawing.current = true;
    sigLastPos.current = getSigPos(e);
  }

  function sigTouchMove(e) {
    if (!sigDrawing.current) return;
    e.preventDefault();
    const pos = getSigPos(e);
    const ctx = sigRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(sigLastPos.current.x, sigLastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    sigLastPos.current = pos;
    if (!hasSigned) setHasSigned(true);
  }

  function sigTouchEnd() {
    sigDrawing.current = false;
  }

  function clearSig() {
    const canvas = sigRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);
    setHasSigned(false);
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onAddPhoto(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  return (
    <div className="mobile-checklist-page">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <div className="mobile-checklist-header">
        <button className="mobile-back-btn" onClick={onBack}>
          &larr; Scan
        </button>
        <div>
          <h2>{selectedPO.poNumber}</h2>
          <p className="text-muted">
            {selectedPO.vendor}
            {scannedData?.tracking && ` — ${scannedData.tracking}`}
          </p>
        </div>
      </div>

      <div className="mobile-checklist-scroll">
        <div className="mobile-checklist">
          {receivingItems.map((item, idx) => (
            <ChecklistItem
              key={idx}
              item={item}
              idx={idx}
              onUpdateItem={onUpdateItem}
              onToggleSerial={onToggleSerial}
              onStepQuantity={onStepQuantity}
            />
          ))}

          {capturedPhotos.length > 0 && (
            <div className="mobile-photos-card">
              <h4><ImageIcon size={16} /> Packing Slip Photos ({capturedPhotos.length})</h4>
              <div className="mobile-photos-grid">
                {capturedPhotos.map((p, i) => (
                  <img
                    key={i}
                    src={p.dataUrl}
                    alt={`Packing slip ${i + 1}`}
                    className="mobile-photo-thumb"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mobile-checklist-notes">
          <label>Delivery Notes</label>
          <textarea
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            rows={2}
            placeholder="General notes..."
            className="mobile-manual-textarea"
          />
        </div>

        <div className="mobile-checklist-actions">
          <button
            className="btn btn-secondary mobile-btn-full"
            onClick={() => fileInputRef.current?.click()}
            style={{ marginBottom: '0.5rem' }}
          >
            <Camera size={18} /> Photo Packing Slip
          </button>
          <button className="btn btn-primary mobile-btn-full" onClick={() => setShowSigPanel(true)}>
            <PackageCheck size={18} /> Physical Check Completed
          </button>
        </div>
      </div>

      {showSigPanel && (
        <div className="checklist-sig-overlay">
          <div className="checklist-sig-panel">
            <div className="checklist-sig-header">
              <h3>Sign to Confirm</h3>
              <button className="checklist-sig-close" onClick={() => { setShowSigPanel(false); setHasSigned(false); }}>
                <X size={18} />
              </button>
            </div>
            <p className="checklist-sig-email">{userEmail}</p>
            <div className="checklist-sig-canvas-wrap">
              <canvas
                ref={sigRef}
                onTouchStart={sigTouchStart}
                onTouchMove={sigTouchMove}
                onTouchEnd={sigTouchEnd}
                onMouseDown={sigTouchStart}
                onMouseMove={sigTouchMove}
                onMouseUp={sigTouchEnd}
                className="checklist-sig-canvas"
              />
            </div>
            <div className="checklist-sig-actions">
              <button className="btn btn-secondary btn-sm" onClick={clearSig}>
                <Trash2 size={14} /> Clear
              </button>
              <button
                className="btn btn-primary btn-sm"
                disabled={!hasSigned}
                onClick={() => {
                  const dataUrl = sigRef.current ? sigRef.current.toDataURL('image/png') : null;
                  onBack(dataUrl);
                }}
              >
                <Check size={14} /> Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ChecklistItem({
  item,
  idx,
  onUpdateItem,
  onToggleSerial,
  onStepQuantity,
}) {
  const [expanded, setExpanded] = useState(false);
  const hasSerials = Object.keys(item.serialStates).length > 0;
  const receivedCount = Object.values(item.serialStates).filter(
    (v) => v === 'received'
  ).length;
  const missingCount = Object.values(item.serialStates).filter(
    (v) => v === 'missing'
  ).length;
  const qtyMismatch = item.quantityReceived !== item.quantityShipped;

  return (
    <div
      className={`mobile-checklist-item${qtyMismatch || missingCount > 0 ? ' mobile-checklist-item--warn' : ''}`}
    >
      <button
        className="mobile-checklist-item-header"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="mobile-checklist-item-title">
          <span className="mobile-checklist-sku">{item.description}</span>
          {item.partNumber && (
            <span className="mobile-checklist-mpn">{item.partNumber}</span>
          )}
        </div>
        <div className="mobile-checklist-item-meta">
          {hasSerials && (
            <span
              className={`mobile-checklist-serial-count ${missingCount > 0 ? 'warn' : receivedCount === Object.keys(item.serialStates).length ? 'ok' : ''}`}
            >
              {receivedCount}/{Object.keys(item.serialStates).length}
            </span>
          )}
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {expanded && (
        <div className="mobile-checklist-item-body">
          <div className="mobile-stepper-row">
            <span className="mobile-stepper-label">
              Qty (expected: {item.quantityShipped})
            </span>
            <div className="mobile-stepper">
              <button
                className="mobile-stepper-btn"
                onClick={() => onStepQuantity(idx, -1)}
              >
                <Minus size={18} />
              </button>
              <span
                className={`mobile-stepper-value${qtyMismatch ? ' warn' : ''}`}
              >
                {item.quantityReceived}
              </span>
              <button
                className="mobile-stepper-btn"
                onClick={() => onStepQuantity(idx, 1)}
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          {hasSerials && (
            <div className="mobile-serial-section">
              <span className="mobile-serial-label">Serials</span>
              <div className="mobile-serial-chips">
                {Object.entries(item.serialStates).map(([serial, status]) => (
                  <button
                    key={serial}
                    className={`mobile-serial-chip mobile-serial-chip--${status}`}
                    onClick={() => onToggleSerial(idx, serial)}
                  >
                    {status === 'received' && <Check size={12} />}
                    {status === 'missing' && <X size={12} />}
                    {serial}
                  </button>
                ))}
              </div>
              <p className="mobile-serial-hint">
                Tap to cycle: pending → received → missing
              </p>
            </div>
          )}

          <div className="mobile-condition-row">
            <span className="mobile-condition-label">Condition</span>
            <div className="mobile-condition-toggles">
              {['good', 'damaged', 'wrong'].map((c) => (
                <button
                  key={c}
                  className={`mobile-condition-btn${item.condition === c ? ` mobile-condition-btn--${c}` : ''}`}
                  onClick={() => onUpdateItem(idx, 'condition', c)}
                >
                  {c === 'good' ? 'Good' : c === 'damaged' ? 'Damaged' : 'Wrong Item'}
                </button>
              ))}
            </div>
          </div>

          <div className="mobile-item-notes">
            <input
              type="text"
              value={item.notes}
              onChange={(e) => onUpdateItem(idx, 'notes', e.target.value)}
              placeholder="Item notes..."
              className="mobile-notes-input"
            />
          </div>
        </div>
      )}
    </div>
  );
}
