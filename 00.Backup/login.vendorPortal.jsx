import { vendors } from '../../data/cores/vendors';
import { Truck } from 'lucide-react';

export default function VendorSelectPanel({ onBack, onSelect }) {
  return (
    <div className="login-form-panel vendor-select-panel">
      <button className="login-back" onClick={onBack}>
        &larr; Back
      </button>
      <div className="login-form-header login-form-header--vendor">
        <Truck size={24} />
        <h2>Vendor Login</h2>
      </div>
      <p className="login-vendor-prompt">Select your company</p>
      <div className="vendor-grid">
        {vendors.map((v) => (
          <button
            key={v.id}
            className="vendor-grid-card"
            onClick={() => onSelect(v)}
          >
            <span
              className="vendor-grid-icon"
              style={{ background: v.color }}
            >
              {v.logo ? (
                <img src={v.logo} alt={v.shortName} className="vendor-select-logo-img" />
              ) : (
                v.logoInitials
              )}
            </span>
            <span className="vendor-grid-name">{v.shortName}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
