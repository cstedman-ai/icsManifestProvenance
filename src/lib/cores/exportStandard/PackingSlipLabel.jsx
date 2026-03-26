import { QRCodeSVG } from 'qrcode.react';

const CW_LOGO = '/assets/icons/CoreWeave/coreWeave.Symbol.svg';

export function formatDateTime() {
  const d = new Date();
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hr = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${y}${mo}${day}:${hr}${min}`;
}

export default function PackingSlipLabel({ qrString, poNumber, vendorName, vendorLogo, tracking, itemCount, dateTime }) {
  const stamp = dateTime || formatDateTime();

  return (
    <div className="qr-print-label">
      <div className="qr-print-header">
        <div className="qr-print-logo qr-print-logo--cw">
          <img src={CW_LOGO} alt="CoreWeave" />
        </div>
        <div className="qr-print-header-center">
          <span className="qr-print-po">PO {poNumber}</span>
          <span className="qr-print-vendor-name">{vendorName}</span>
        </div>
        <div className="qr-print-logo qr-print-logo--vendor">
          {vendorLogo ? (
            <img src={vendorLogo} alt={vendorName} />
          ) : (
            <span className="qr-print-logo-fallback">{vendorName}</span>
          )}
        </div>
      </div>

      <div className="qr-print-body">
        <div className="qr-print-qr">
          <QRCodeSVG value={qrString} size={240} level="M" />
        </div>
        <div className="qr-print-datetime">{stamp}</div>
      </div>

      <div className="qr-print-footer">
        <span>Tracking: {tracking || 'N/A'}</span>
        <span>{itemCount} line item(s)</span>
      </div>
    </div>
  );
}
