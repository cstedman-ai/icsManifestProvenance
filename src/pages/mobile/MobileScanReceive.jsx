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
const MAX_CANVAS_DIM = 2048;
const SIG_INTERNAL_HEIGHT = 420;

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
        userEmail={user?.email || 'unknown'}
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

function formatDateStamp() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hr = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${y}${m}${day}:${hr}${min}`;
}

function AnnotateScreen({ imageDataUrl, userEmail, onSave, onBack }) {
  const photoCanvasRef = useRef(null);
  const sigCanvasRef = useRef(null);
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState(PEN_COLORS[0]);
  const [lineWidth, setLineWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState([]);
  const [textInput, setTextInput] = useState('');
  const [textPos, setTextPos] = useState(null);
  const [isSigning, setIsSigning] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const imgRef = useRef(null);

  const dateStamp = formatDateStamp();

  // Load photo onto the annotation canvas at full resolution
  useEffect(() => {
    const img = new window.Image();
    img.onload = () => {
      imgRef.current = img;
      const canvas = photoCanvasRef.current;
      if (!canvas) return;

      const hiResScale = Math.min(MAX_CANVAS_DIM / Math.max(img.width, img.height), 1);
      canvas.width = Math.round(img.width * hiResScale);
      canvas.height = Math.round(img.height * hiResScale);

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      drawStampPreview(ctx, canvas.width, canvas.height);
      setHistory([canvas.toDataURL()]);
    };
    img.src = imageDataUrl;
  }, [imageDataUrl]);

  // Initialize signature canvas at high resolution
  useEffect(() => {
    const sigCanvas = sigCanvasRef.current;
    if (!sigCanvas) return;
    const container = sigCanvas.parentElement;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    sigCanvas.width = Math.round(container.clientWidth * dpr);
    sigCanvas.height = SIG_INTERNAL_HEIGHT;
    const ctx = sigCanvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, sigCanvas.width, sigCanvas.height);
    drawSigPlaceholder(ctx, sigCanvas.width, sigCanvas.height);
  }, []);

  function drawSigPlaceholder(ctx, w, h) {
    const s = w / 350;
    ctx.save();
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1 * s;
    ctx.setLineDash([6 * s, 4 * s]);
    const y = h - 30 * (h / 140);
    ctx.beginPath();
    ctx.moveTo(20 * s, y);
    ctx.lineTo(w - 20 * s, y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#9ca3af';
    ctx.font = `${Math.round(13 * s)}px -apple-system, sans-serif`;
    ctx.fillText('Sign above the line', 20 * s, h - 10 * (h / 140));
    ctx.restore();
  }

  function drawStampPreview(ctx, w, h) {
    const fontSize = Math.max(11, w * 0.022);
    const pad = Math.round(fontSize * 0.6);
    ctx.save();
    ctx.font = `600 ${fontSize}px -apple-system, sans-serif`;
    const emailW = ctx.measureText(userEmail).width;
    const dateW = ctx.measureText(dateStamp).width;
    const textW = Math.max(emailW, dateW);
    const gap = Math.round(fontSize * 0.4);
    const sigPreviewH = Math.round(fontSize * 2);
    const boxW = textW + pad * 2;
    const boxH = pad + fontSize + gap + sigPreviewH + gap + fontSize + pad;
    const margin = Math.round(w * 0.02);
    const bx = w - boxW - margin;
    const by = h - boxH - margin;
    const radius = Math.round(fontSize * 0.4);

    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.beginPath();
    ctx.roundRect(bx, by, boxW, boxH, radius);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();

    let curY = by + pad + fontSize;
    ctx.fillStyle = '#111827';
    ctx.font = `600 ${fontSize}px -apple-system, sans-serif`;
    ctx.fillText(userEmail, bx + pad, curY);

    curY += gap;
    ctx.fillStyle = '#9ca3af';
    ctx.font = `italic ${Math.round(fontSize * 0.8)}px -apple-system, sans-serif`;
    ctx.fillText('[ signature ]', bx + pad, curY + sigPreviewH / 2 + fontSize * 0.2);
    curY += sigPreviewH;

    curY += Math.round(gap * 0.3);
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.beginPath();
    ctx.moveTo(bx + pad, curY);
    ctx.lineTo(bx + boxW - pad, curY);
    ctx.stroke();
    curY += Math.round(gap * 0.7) + fontSize;

    ctx.fillStyle = '#374151';
    ctx.font = `600 ${fontSize}px -apple-system, sans-serif`;
    ctx.fillText(dateStamp, bx + pad, curY);

    ctx.restore();
  }

  // ── Photo canvas drawing ──
  function getPos(e, canvas) {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches?.[0] || e.changedTouches?.[0] || e;
    return {
      x: (touch.clientX - rect.left) * (canvas.width / rect.width),
      y: (touch.clientY - rect.top) * (canvas.height / rect.height),
    };
  }

  function canvasScale() {
    const canvas = photoCanvasRef.current;
    if (!canvas) return 1;
    const rect = canvas.getBoundingClientRect();
    return canvas.width / rect.width;
  }

  function startDraw(e) {
    e.preventDefault();
    const canvas = photoCanvasRef.current;
    if (tool === 'text') {
      setTextPos(getPos(e, canvas));
      return;
    }
    setIsDrawing(true);
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    const s = canvasScale();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = (tool === 'circle' ? 2 : lineWidth) * s;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (tool === 'circle') {
      ctx._circleStart = pos;
    }
  }

  function draw(e) {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = photoCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    if (tool === 'pen') {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
  }

  function endDraw(e) {
    e.preventDefault();
    if (!isDrawing && tool !== 'text') return;
    const canvas = photoCanvasRef.current;
    if (tool === 'circle' && isDrawing) {
      const ctx = canvas.getContext('2d');
      const s = canvasScale();
      const start = ctx._circleStart;
      const end = getPos(e, canvas);
      const rx = Math.abs(end.x - start.x) / 2;
      const ry = Math.abs(end.y - start.y) / 2;
      const cx = (start.x + end.x) / 2;
      const cy = (start.y + end.y) / 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, Math.max(rx, 5), Math.max(ry, 5), 0, 0, 2 * Math.PI);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2 * s;
      ctx.stroke();
    }
    setIsDrawing(false);
    setHistory((prev) => [...prev, canvas.toDataURL()]);
  }

  // ── Signature canvas drawing ──
  function sigGetPos(e) {
    return getPos(e, sigCanvasRef.current);
  }

  function sigStart(e) {
    e.preventDefault();
    setIsSigning(true);
    setHasSigned(true);
    const sigCanvas = sigCanvasRef.current;
    const rect = sigCanvas.getBoundingClientRect();
    const sigScale = sigCanvas.width / rect.width;
    const ctx = sigCanvas.getContext('2d');
    const pos = sigGetPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2.5 * sigScale;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }

  function sigMove(e) {
    e.preventDefault();
    if (!isSigning) return;
    const ctx = sigCanvasRef.current.getContext('2d');
    const pos = sigGetPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }

  function sigEnd(e) {
    e.preventDefault();
    setIsSigning(false);
  }

  function clearSignature() {
    const sigCanvas = sigCanvasRef.current;
    const ctx = sigCanvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, sigCanvas.width, sigCanvas.height);
    drawSigPlaceholder(ctx, sigCanvas.width, sigCanvas.height);
    setHasSigned(false);
  }

  // ── Annotation helpers ──
  function handleUndo() {
    if (history.length <= 1) return;
    const newHistory = history.slice(0, -1);
    setHistory(newHistory);
    const img = new window.Image();
    img.onload = () => {
      const ctx = photoCanvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, photoCanvasRef.current.width, photoCanvasRef.current.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = newHistory[newHistory.length - 1];
  }

  function handleClear() {
    if (!imgRef.current || !photoCanvasRef.current) return;
    const canvas = photoCanvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imgRef.current, 0, 0, canvas.width, canvas.height);
    drawStampPreview(ctx, canvas.width, canvas.height);
    setHistory([canvas.toDataURL()]);
  }

  function handleTextPlace() {
    if (!textPos || !textInput.trim()) return;
    const canvas = photoCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const fontSize = Math.max(20, canvas.width * 0.028);
    ctx.font = `bold ${fontSize}px -apple-system, sans-serif`;

    const padding = Math.round(fontSize * 0.3);
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

    setHistory((prev) => [...prev, canvas.toDataURL()]);
    setTextInput('');
    setTextPos(null);
  }

  // ── Accept: composite final PNG with signature box in bottom-right ──
  function handleAccept() {
    if (textPos && textInput.trim()) handleTextPlace();

    const photoCanvas = photoCanvasRef.current;
    const sigCanvas = sigCanvasRef.current;

    const outW = photoCanvas.width;
    const outH = photoCanvas.height;

    const out = document.createElement('canvas');
    out.width = outW;
    out.height = outH;
    const ctx = out.getContext('2d');

    // Draw annotated photo
    ctx.drawImage(photoCanvas, 0, 0);

    // ── Signature stamp box in bottom-right corner ──
    const fontSize = Math.max(16, Math.round(outW * 0.022));
    const pad = Math.round(fontSize * 0.6);
    const borderW = Math.max(1, Math.round(outW / 800));

    ctx.font = `600 ${fontSize}px -apple-system, sans-serif`;
    const emailW = ctx.measureText(userEmail).width;
    const dateW = ctx.measureText(dateStamp).width;
    const textMaxW = Math.max(emailW, dateW);

    // Signature drawn area: fit to box width, maintain aspect ratio
    const sigBoxW = textMaxW + pad * 2;
    const sigDrawW = sigBoxW - pad * 2;
    const sigAspect = sigCanvas.width / sigCanvas.height;
    const sigDrawH = Math.round(sigDrawW / sigAspect);

    // Box layout: [pad] email [gap] signature [gap] date [pad]
    const gap = Math.round(fontSize * 0.4);
    const boxW = sigBoxW;
    const boxH = pad + fontSize + gap + sigDrawH + gap + fontSize + pad;
    const margin = Math.round(outW * 0.02);
    const bx = outW - boxW - margin;
    const by = outH - boxH - margin;
    const radius = Math.round(fontSize * 0.4);

    // Semi-transparent background
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
    ctx.beginPath();
    ctx.roundRect(bx, by, boxW, boxH, radius);
    ctx.fill();

    // Border
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = borderW;
    ctx.stroke();
    ctx.restore();

    // Email
    let curY = by + pad + fontSize;
    ctx.fillStyle = '#111827';
    ctx.font = `600 ${fontSize}px -apple-system, sans-serif`;
    ctx.fillText(userEmail, bx + pad, curY);

    // Signature
    curY += gap;
    if (hasSigned) {
      ctx.drawImage(sigCanvas, bx + pad, curY, sigDrawW, sigDrawH);
    }
    curY += sigDrawH;

    // Divider line above date
    curY += Math.round(gap * 0.3);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.lineWidth = borderW;
    ctx.beginPath();
    ctx.moveTo(bx + pad, curY);
    ctx.lineTo(bx + boxW - pad, curY);
    ctx.stroke();
    curY += Math.round(gap * 0.7);

    // Date
    curY += fontSize;
    ctx.fillStyle = '#374151';
    ctx.font = `600 ${fontSize}px -apple-system, sans-serif`;
    ctx.fillText(dateStamp, bx + pad, curY);

    const dataUrl = out.toDataURL('image/png');

    // Trigger download to the device
    out.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PackingSlip_${dateStamp}_${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    }, 'image/png');

    onSave(dataUrl);
  }

  return (
    <div className="mobile-annotate-page">
      <div className="mobile-annotate-topbar">
        <button className="mobile-back-btn" onClick={onBack}>
          &larr; Back
        </button>
        <span className="mobile-annotate-title">Packing Slip</span>
        <button
          className="mobile-annotate-save"
          onClick={handleAccept}
          disabled={!hasSigned}
          title={hasSigned ? 'Accept' : 'Please sign first'}
        >
          <Check size={16} /> Accept
        </button>
      </div>

      {/* ── Photo with annotation canvas ── */}
      <div className="mobile-annotate-canvas-wrap">
        <canvas
          ref={photoCanvasRef}
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
          <button className="btn btn-primary btn-sm" onClick={handleTextPlace}>
            Place
          </button>
        </div>
      )}

      {/* ── Annotation toolbar ── */}
      <div className="mobile-annotate-toolbar mobile-annotate-toolbar--compact">
        <div className="mobile-annotate-tools">
          <button
            className={`mobile-annotate-tool-btn${tool === 'pen' ? ' active' : ''}`}
            onClick={() => setTool('pen')}
          >
            <Pen size={16} />
          </button>
          <button
            className={`mobile-annotate-tool-btn${tool === 'circle' ? ' active' : ''}`}
            onClick={() => setTool('circle')}
          >
            <Circle size={16} />
          </button>
          <button
            className={`mobile-annotate-tool-btn${tool === 'text' ? ' active' : ''}`}
            onClick={() => setTool('text')}
          >
            <Type size={16} />
          </button>
          <div className="mobile-annotate-separator" />
          <button className="mobile-annotate-tool-btn" onClick={handleUndo}>
            <Undo2 size={16} />
          </button>
          <button className="mobile-annotate-tool-btn" onClick={handleClear}>
            <Trash2 size={16} />
          </button>
          <div className="mobile-annotate-separator" />
          {PEN_COLORS.map((c) => (
            <button
              key={c}
              className={`mobile-annotate-color mobile-annotate-color--sm${color === c ? ' active' : ''}`}
              style={{ background: c }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
      </div>

      {/* ── Signature pad ── */}
      <div className="mobile-sig-section">
        <div className="mobile-sig-header">
          <span className="mobile-sig-label">Signature</span>
          <button className="mobile-sig-clear" onClick={clearSignature}>
            <Trash2 size={14} /> Clear
          </button>
        </div>
        <div className="mobile-sig-pad-wrap">
          <canvas
            ref={sigCanvasRef}
            onTouchStart={sigStart}
            onTouchMove={sigMove}
            onTouchEnd={sigEnd}
            onMouseDown={sigStart}
            onMouseMove={sigMove}
            onMouseUp={sigEnd}
            className="mobile-sig-canvas"
          />
        </div>
        <div className="mobile-sig-meta">
          <span>{userEmail}</span>
          <span>{dateStamp}</span>
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
