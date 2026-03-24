import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  ScanLine,
  Keyboard,
  Camera,
  Check,
  X,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  PackageCheck,
  Minus,
  Plus,
  Undo2,
  Trash2,
  Pen,
  Circle,
  Type,
  Image as ImageIcon,
  Save,
} from 'lucide-react';

const SCREEN = { SCANNER: 0, ANNOTATE: 1, CHECKLIST: 2, CONFIRM: 3 };
const PEN_COLORS = ['#dc2626', '#2563eb', '#16a34a', '#000000', '#f59e0b'];

export default function MobileScanReceive() {
  const { state, dispatch } = useApp();
  const { user } = useAuth();
  const [screen, setScreen] = useState(SCREEN.SCANNER);
  const [scannedData, setScannedData] = useState(null);
  const [selectedPO, setSelectedPO] = useState(null);
  const [receivingItems, setReceivingItems] = useState([]);
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState([]);
  const [annotatingPhoto, setAnnotatingPhoto] = useState(null);

  const loadPO = useCallback(
    (po) => {
      const poShipments = state.shipments.filter((s) => s.poId === po.id);
      setSelectedPO(po);
      setReceivingItems(
        po.items.map((item) => {
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
            serialStates: serialsShipped.reduce((acc, s) => {
              acc[s] = 'pending';
              return acc;
            }, {}),
            condition: 'good',
            notes: '',
            expanded: true,
          };
        })
      );
      setNotes('');
      setScreen(SCREEN.CHECKLIST);
    },
    [state.shipments]
  );

  const handleScanResult = useCallback(
    (data) => {
      try {
        const parsed = JSON.parse(data);
        setScannedData(parsed);
        if (parsed.poNumber) {
          const po = state.purchaseOrders.find(
            (p) => p.poNumber === parsed.poNumber
          );
          if (po) {
            loadPO(po);
            return;
          }
        }
      } catch {
        const po = state.purchaseOrders.find(
          (p) =>
            p.poNumber === data.trim() &&
            (p.status === 'shipped' || p.status === 'received')
        );
        if (po) {
          setScannedData(null);
          loadPO(po);
        }
      }
    },
    [state.purchaseOrders, loadPO]
  );

  function handlePhotoCaptured(dataUrl) {
    setAnnotatingPhoto(dataUrl);
    setScreen(SCREEN.ANNOTATE);
  }

  function handleAnnotationSaved(annotatedDataUrl) {
    setCapturedPhotos((prev) => [
      ...prev,
      { dataUrl: annotatedDataUrl, timestamp: new Date().toISOString() },
    ]);
    setAnnotatingPhoto(null);
    if (selectedPO) {
      setScreen(SCREEN.CHECKLIST);
    } else {
      setScreen(SCREEN.SCANNER);
    }
  }

  function handleAnnotationBack() {
    setAnnotatingPhoto(null);
    if (selectedPO) {
      setScreen(SCREEN.CHECKLIST);
    } else {
      setScreen(SCREEN.SCANNER);
    }
  }

  function updateItem(idx, field, value) {
    setReceivingItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );
  }

  function toggleSerial(itemIdx, serial) {
    setReceivingItems((prev) =>
      prev.map((item, i) => {
        if (i !== itemIdx) return item;
        const current = item.serialStates[serial];
        const next =
          current === 'pending'
            ? 'received'
            : current === 'received'
              ? 'missing'
              : 'pending';
        return {
          ...item,
          serialStates: { ...item.serialStates, [serial]: next },
        };
      })
    );
  }

  function stepQuantity(idx, delta) {
    setReceivingItems((prev) =>
      prev.map((item, i) => {
        if (i !== idx) return item;
        const next = Math.max(0, item.quantityReceived + delta);
        return { ...item, quantityReceived: next };
      })
    );
  }

  function getDiscrepancies() {
    const issues = [];
    receivingItems.forEach((item) => {
      if (item.quantityReceived !== item.quantityShipped) {
        issues.push({
          item: item.description,
          type: 'quantity',
          detail: `Expected ${item.quantityShipped}, received ${item.quantityReceived}`,
        });
      }
      const missing = Object.entries(item.serialStates).filter(
        ([, v]) => v === 'missing'
      );
      if (missing.length > 0) {
        issues.push({
          item: item.description,
          type: 'serial',
          detail: `${missing.length} serial(s) missing: ${missing.map(([k]) => k).join(', ')}`,
        });
      }
      if (item.condition !== 'good') {
        issues.push({
          item: item.description,
          type: 'condition',
          detail: `Condition: ${item.condition}`,
        });
      }
    });
    return issues;
  }

  function handleSubmit() {
    if (!selectedPO) return;

    const latestShipment = state.shipments
      .filter((s) => s.poId === selectedPO.id)
      .sort((a, b) => new Date(b.shippedAt) - new Date(a.shippedAt))[0];

    dispatch({
      type: 'RECORD_RECEIVING',
      payload: {
        poId: selectedPO.id,
        shipmentId: latestShipment?.id || null,
        receivedBy: user.email,
        notes,
        photoCount: capturedPhotos.length,
        items: receivingItems.map((item) => ({
          poItemId: item.poItemId,
          quantityReceived: item.quantityReceived,
          serialsReceived: Object.entries(item.serialStates)
            .filter(([, v]) => v === 'received')
            .map(([k]) => k),
          condition: item.condition,
          notes: item.notes,
        })),
      },
    });
    setSubmitted(true);
    setScreen(SCREEN.CONFIRM);
  }

  function resetForNextScan() {
    setScreen(SCREEN.SCANNER);
    setScannedData(null);
    setSelectedPO(null);
    setReceivingItems([]);
    setNotes('');
    setSubmitted(false);
    setCapturedPhotos([]);
    setAnnotatingPhoto(null);
  }

  if (screen === SCREEN.SCANNER) {
    return (
      <ScannerScreen
        onScanResult={handleScanResult}
        onPhotoCaptured={handlePhotoCaptured}
        purchaseOrders={state.purchaseOrders}
        onSelectPO={loadPO}
      />
    );
  }

  if (screen === SCREEN.ANNOTATE && annotatingPhoto) {
    return (
      <AnnotateScreen
        imageDataUrl={annotatingPhoto}
        onSave={handleAnnotationSaved}
        onBack={handleAnnotationBack}
      />
    );
  }

  if (screen === SCREEN.CHECKLIST) {
    return (
      <ChecklistScreen
        selectedPO={selectedPO}
        scannedData={scannedData}
        receivingItems={receivingItems}
        notes={notes}
        onNotesChange={setNotes}
        onUpdateItem={updateItem}
        onToggleSerial={toggleSerial}
        onStepQuantity={stepQuantity}
        onBack={resetForNextScan}
        onSubmit={handleSubmit}
        capturedPhotos={capturedPhotos}
        onAddPhoto={handlePhotoCaptured}
      />
    );
  }

  if (screen === SCREEN.CONFIRM) {
    const discrepancies = getDiscrepancies();
    return (
      <ConfirmScreen
        selectedPO={selectedPO}
        receivingItems={receivingItems}
        discrepancies={discrepancies}
        submitted={submitted}
        user={user}
        onScanNext={resetForNextScan}
        capturedPhotos={capturedPhotos}
      />
    );
  }

  return null;
}

/* ─── Screen 1: Scanner ─── */

function ScannerScreen({ onScanResult, onPhotoCaptured, purchaseOrders, onSelectPO }) {
  const [mode, setMode] = useState('camera');
  const [manualInput, setManualInput] = useState('');
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);
  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);

  const shippedPOs = purchaseOrders.filter(
    (po) => po.status === 'shipped' || po.status === 'received'
  );

  useEffect(() => {
    if (mode !== 'camera') return;
    let stopped = false;

    function waitForElement(id, timeout = 3000) {
      return new Promise((resolve, reject) => {
        const el = document.getElementById(id);
        if (el) return resolve(el);
        const observer = new MutationObserver(() => {
          const found = document.getElementById(id);
          if (found) {
            observer.disconnect();
            resolve(found);
          }
        });
        observer.observe(document.body, { childList: true, subtree: true });
        setTimeout(() => {
          observer.disconnect();
          reject(new Error('Scanner element not found'));
        }, timeout);
      });
    }

    async function startScanner() {
      try {
        await waitForElement('mobile-qr-reader');
        if (stopped) return;

        const { Html5Qrcode } = await import('html5-qrcode');
        if (stopped) return;

        const scanner = new Html5Qrcode('mobile-qr-reader');
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            scanner.stop().catch(() => {});
            scannerRef.current = null;
            onScanResult(decodedText);
          },
          () => {}
        );
      } catch (err) {
        if (!stopped) {
          const msg = err?.message || '';
          if (msg.includes('NotAllowed') || msg.includes('Permission')) {
            setCameraError('Camera permission denied. Tap "Manual entry" below.');
          } else if (msg.includes('NotFound') || msg.includes('Requested device not found')) {
            setCameraError('No camera found on this device. Tap "Manual entry" below.');
          } else if (
            window.location.protocol === 'http:' &&
            window.location.hostname !== 'localhost'
          ) {
            setCameraError(
              'Camera requires HTTPS. Access this app via https:// or use manual entry.'
            );
          } else {
            setCameraError(
              'Could not access camera. Check permissions and try again, or use manual entry.'
            );
          }
        }
      }
    }

    startScanner();

    return () => {
      stopped = true;
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [mode, onScanResult]);

  function handleManualSubmit(e) {
    e.preventDefault();
    if (manualInput.trim()) {
      onScanResult(manualInput.trim());
    }
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      onPhotoCaptured(ev.target.result);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  return (
    <div className="mobile-scanner-page">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {mode === 'camera' ? (
        <>
          <div className="mobile-scanner" id="mobile-qr-reader" ref={videoRef}>
            {cameraError && (
              <div className="mobile-scanner-error">
                <AlertTriangle size={24} />
                <p>{cameraError}</p>
              </div>
            )}
          </div>
          <div className="mobile-scanner-overlay">
            <p>Point camera at pallet QR code</p>
          </div>
          <div className="mobile-scanner-actions">
            <button
              className="mobile-scanner-toggle"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera size={18} /> Photo packing slip
            </button>
            <button
              className="mobile-scanner-toggle"
              onClick={() => setMode('manual')}
            >
              <Keyboard size={18} /> Manual entry
            </button>
          </div>
        </>
      ) : (
        <div className="mobile-manual-entry">
          <h2>Manual Entry</h2>
          <p className="text-muted">
            Enter a PO number or paste QR code data
          </p>
          <form onSubmit={handleManualSubmit}>
            <div className="form-group">
              <textarea
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                rows={3}
                placeholder="PO number or QR JSON data..."
                autoFocus
                className="mobile-manual-textarea"
              />
            </div>
            <button type="submit" className="btn btn-primary mobile-btn-full">
              Load Shipment
            </button>
          </form>

          <button
            className="mobile-scanner-action-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera size={18} /> Photo packing slip
          </button>

          {shippedPOs.length > 0 && (
            <div className="mobile-po-list">
              <p className="mobile-po-list-label">Or select a PO:</p>
              {shippedPOs.map((po) => (
                <button
                  key={po.id}
                  className="mobile-po-list-item"
                  onClick={() => onSelectPO(po)}
                >
                  <span className="mobile-po-number">{po.poNumber}</span>
                  <span className="mobile-po-vendor">{po.vendor}</span>
                </button>
              ))}
            </div>
          )}

          <button
            className="mobile-scanner-toggle"
            onClick={() => {
              setCameraError('');
              setMode('camera');
            }}
          >
            <ScanLine size={18} /> Use camera
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Screen 1.5: Annotate Photo ─── */

function AnnotateScreen({ imageDataUrl, onSave, onBack }) {
  const canvasRef = useRef(null);
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState(PEN_COLORS[0]);
  const [lineWidth, setLineWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState([]);
  const [textInput, setTextInput] = useState('');
  const [textPos, setTextPos] = useState(null);
  const imgRef = useRef(null);

  useEffect(() => {
    const img = new window.Image();
    img.onload = () => {
      imgRef.current = img;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const container = canvas.parentElement;
      const maxW = container.clientWidth;
      const maxH = window.innerHeight * 0.6;
      const scale = Math.min(maxW / img.width, maxH / img.height, 1);

      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      setHistory([canvas.toDataURL()]);
    };
    img.src = imageDataUrl;
  }, [imageDataUrl]);

  function getPos(e) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches?.[0] || e.changedTouches?.[0] || e;
    return {
      x: (touch.clientX - rect.left) * (canvas.width / rect.width),
      y: (touch.clientY - rect.top) * (canvas.height / rect.height),
    };
  }

  function startDraw(e) {
    e.preventDefault();
    if (tool === 'text') {
      setTextPos(getPos(e));
      return;
    }
    setIsDrawing(true);
    const ctx = canvasRef.current.getContext('2d');
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = tool === 'circle' ? 2 : lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (tool === 'circle') {
      ctx._circleStart = pos;
    }
  }

  function draw(e) {
    e.preventDefault();
    if (!isDrawing) return;
    const ctx = canvasRef.current.getContext('2d');
    const pos = getPos(e);

    if (tool === 'pen') {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
  }

  function endDraw(e) {
    e.preventDefault();
    if (!isDrawing && tool !== 'text') return;

    if (tool === 'circle' && isDrawing) {
      const ctx = canvasRef.current.getContext('2d');
      const start = ctx._circleStart;
      const end = getPos(e);
      const rx = Math.abs(end.x - start.x) / 2;
      const ry = Math.abs(end.y - start.y) / 2;
      const cx = (start.x + end.x) / 2;
      const cy = (start.y + end.y) / 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, Math.max(rx, 5), Math.max(ry, 5), 0, 0, 2 * Math.PI);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    setIsDrawing(false);
    const canvas = canvasRef.current;
    setHistory((prev) => [...prev, canvas.toDataURL()]);
  }

  function handleUndo() {
    if (history.length <= 1) return;
    const newHistory = history.slice(0, -1);
    setHistory(newHistory);
    const img = new window.Image();
    img.onload = () => {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = newHistory[newHistory.length - 1];
  }

  function handleClear() {
    if (!imgRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.drawImage(imgRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
    setHistory([canvasRef.current.toDataURL()]);
  }

  function handleTextPlace() {
    if (!textPos || !textInput.trim()) return;
    const ctx = canvasRef.current.getContext('2d');
    const fontSize = Math.max(14, canvasRef.current.width * 0.035);
    ctx.font = `bold ${fontSize}px -apple-system, sans-serif`;
    ctx.fillStyle = color;

    const padding = 4;
    const metrics = ctx.measureText(textInput);
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fillRect(
      textPos.x - padding,
      textPos.y - fontSize - padding,
      metrics.width + padding * 2,
      fontSize + padding * 2
    );

    ctx.fillStyle = color;
    ctx.fillText(textInput, textPos.x, textPos.y);

    setHistory((prev) => [...prev, canvasRef.current.toDataURL()]);
    setTextInput('');
    setTextPos(null);
  }

  function handleSave() {
    if (textPos && textInput.trim()) {
      handleTextPlace();
    }
    const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.8);
    onSave(dataUrl);
  }

  return (
    <div className="mobile-annotate-page">
      <div className="mobile-annotate-topbar">
        <button className="mobile-back-btn" onClick={onBack}>
          &larr; Back
        </button>
        <span className="mobile-annotate-title">Annotate Packing Slip</span>
        <button className="mobile-annotate-save" onClick={handleSave}>
          <Save size={16} /> Done
        </button>
      </div>

      <div className="mobile-annotate-canvas-wrap">
        <canvas
          ref={canvasRef}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          className="mobile-annotate-canvas"
        />
      </div>

      {textPos && (
        <div className="mobile-annotate-text-input">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Type annotation..."
            autoFocus
            className="mobile-notes-input"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleTextPlace();
            }}
          />
          <button
            className="btn btn-primary btn-sm"
            onClick={handleTextPlace}
          >
            Place
          </button>
        </div>
      )}

      <div className="mobile-annotate-toolbar">
        <div className="mobile-annotate-tools">
          <button
            className={`mobile-annotate-tool-btn${tool === 'pen' ? ' active' : ''}`}
            onClick={() => setTool('pen')}
            title="Draw"
          >
            <Pen size={18} />
          </button>
          <button
            className={`mobile-annotate-tool-btn${tool === 'circle' ? ' active' : ''}`}
            onClick={() => setTool('circle')}
            title="Circle"
          >
            <Circle size={18} />
          </button>
          <button
            className={`mobile-annotate-tool-btn${tool === 'text' ? ' active' : ''}`}
            onClick={() => setTool('text')}
            title="Text"
          >
            <Type size={18} />
          </button>

          <div className="mobile-annotate-separator" />

          <button
            className="mobile-annotate-tool-btn"
            onClick={handleUndo}
            title="Undo"
          >
            <Undo2 size={18} />
          </button>
          <button
            className="mobile-annotate-tool-btn"
            onClick={handleClear}
            title="Clear all"
          >
            <Trash2 size={18} />
          </button>
        </div>

        <div className="mobile-annotate-colors">
          {PEN_COLORS.map((c) => (
            <button
              key={c}
              className={`mobile-annotate-color${color === c ? ' active' : ''}`}
              style={{ background: c }}
              onClick={() => setColor(c)}
            />
          ))}
          <input
            type="range"
            min={1}
            max={8}
            value={lineWidth}
            onChange={(e) => setLineWidth(Number(e.target.value))}
            className="mobile-annotate-size"
          />
        </div>
      </div>
    </div>
  );
}

/* ─── Screen 2: Receiving Checklist ─── */

function ChecklistScreen({
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
}) {
  const fileInputRef = useRef(null);

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
        <button className="btn btn-primary mobile-btn-full" onClick={onSubmit}>
          <PackageCheck size={18} /> Review & Submit
        </button>
      </div>
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
  const [expanded, setExpanded] = useState(true);
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

/* ─── Screen 3: Confirmation ─── */

function ConfirmScreen({
  selectedPO,
  receivingItems,
  discrepancies,
  submitted,
  user,
  onScanNext,
  capturedPhotos,
}) {
  const totalReceived = receivingItems.reduce(
    (sum, i) => sum + i.quantityReceived,
    0
  );
  const totalExpected = receivingItems.reduce(
    (sum, i) => sum + i.quantityShipped,
    0
  );

  return (
    <div className="mobile-confirm-page">
      <div className="mobile-confirm-header">
        <PackageCheck size={36} className="mobile-confirm-icon" />
        <h2>{submitted ? 'Delivery Recorded' : 'Review Submission'}</h2>
        <p className="text-muted">
          PO {selectedPO.poNumber} — {selectedPO.vendor}
        </p>
      </div>

      <div className="mobile-confirm-summary">
        <div className="mobile-confirm-stat">
          <span className="mobile-confirm-stat-value">{totalReceived}</span>
          <span className="mobile-confirm-stat-label">Items Received</span>
        </div>
        <div className="mobile-confirm-stat">
          <span className="mobile-confirm-stat-value">{totalExpected}</span>
          <span className="mobile-confirm-stat-label">Items Expected</span>
        </div>
        <div className="mobile-confirm-stat">
          <span
            className={`mobile-confirm-stat-value ${discrepancies.length > 0 ? 'warn' : 'ok'}`}
          >
            {discrepancies.length}
          </span>
          <span className="mobile-confirm-stat-label">Discrepancies</span>
        </div>
      </div>

      {discrepancies.length > 0 && (
        <div className="mobile-confirm-discrepancies">
          <h3>
            <AlertTriangle size={16} /> Discrepancies
          </h3>
          {discrepancies.map((d, i) => (
            <div key={i} className="mobile-confirm-discrepancy">
              <span className="mobile-confirm-discrepancy-item">{d.item}</span>
              <span className="mobile-confirm-discrepancy-detail">
                {d.detail}
              </span>
            </div>
          ))}
        </div>
      )}

      {capturedPhotos.length > 0 && (
        <div className="mobile-confirm-photos">
          <h3><ImageIcon size={16} /> Annotated Photos ({capturedPhotos.length})</h3>
          <div className="mobile-photos-grid">
            {capturedPhotos.map((p, i) => (
              <img
                key={i}
                src={p.dataUrl}
                alt={`Annotated slip ${i + 1}`}
                className="mobile-photo-thumb mobile-photo-thumb--lg"
              />
            ))}
          </div>
        </div>
      )}

      <div className="mobile-confirm-audit">
        <p>
          Received by <strong>{user.email}</strong>
        </p>
        <p>{new Date().toLocaleString()}</p>
      </div>

      <div className="mobile-confirm-actions">
        <button
          className="btn btn-primary mobile-btn-full"
          onClick={onScanNext}
        >
          <ScanLine size={18} /> Scan Next Pallet
        </button>
      </div>
    </div>
  );
}
