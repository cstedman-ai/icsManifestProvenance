import { useState, useRef, useEffect } from 'react';
import { vendors } from '../../data/cores/vendors';
import { Truck, Search, ChevronDown } from 'lucide-react';

export default function VendorSelectPanel({ onBack, onSelect }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const filtered = vendors.filter(
    (v) =>
      v.name.toLowerCase().includes(query.toLowerCase()) ||
      v.shortName.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

      <div className="vendor-search-dropdown" ref={ref}>
        <div
          className="vendor-search-input-wrap"
          onClick={() => setOpen(true)}
        >
          <Search size={16} className="vendor-search-icon" />
          <input
            type="text"
            className="vendor-search-input"
            placeholder="Search vendors…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
          />
          <ChevronDown
            size={16}
            className={`vendor-search-chevron${open ? ' vendor-search-chevron--open' : ''}`}
          />
        </div>

        {open && (
          <ul className="vendor-search-list">
            {filtered.length === 0 ? (
              <li className="vendor-search-empty">No vendors found</li>
            ) : (
              filtered.map((v) => (
                <li key={v.id}>
                  <button
                    className="vendor-search-option"
                    onClick={() => {
                      onSelect(v);
                      setOpen(false);
                    }}
                  >
                    <span
                      className="vendor-search-badge"
                      style={{ background: v.color }}
                    >
                      {v.logo ? (
                        <img
                          src={v.logo}
                          alt={v.shortName}
                          className="vendor-select-logo-img"
                        />
                      ) : (
                        v.logoInitials
                      )}
                    </span>
                    <span className="vendor-search-label">
                      <span className="vendor-search-name">{v.name}</span>
                      {v.shortName !== v.name && (
                        <span className="vendor-search-short">
                          {v.shortName}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
