import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { vendors } from '../data/cores/vendors';
import { catalogItems, categoryLabels } from '../data/cores/catalog';
import {
  ShoppingCart,
  ChevronDown,
  ChevronRight,
  Search,
  Trash2,
  Send,
  Package,
  Plus,
  Minus,
  ArrowLeft,
} from 'lucide-react';

export default function Catalog() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [poNumber, setPoNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const selectedVendor = vendors.find((v) => v.id === selectedVendorId);

  const vendorInventory = useMemo(() => {
    if (!selectedVendorId) return [];
    return state.vendorInventory.filter(
      (v) => v.vendorId === selectedVendorId && v.quantity > 0
    );
  }, [state.vendorInventory, selectedVendorId]);

  const enrichedItems = useMemo(() => {
    return vendorInventory.map((inv) => {
      if (inv.custom) {
        return {
          inventoryId: inv.id,
          catalogId: null,
          model: inv.model,
          description: inv.description,
          partNumber: inv.partNumber || '',
          category: inv.category || 'other',
          estimatedCost: inv.estimatedCost || '',
          specs: '',
          available: inv.quantity,
        };
      }
      const cat = catalogItems.find((c) => c.id === inv.catalogItemId);
      if (!cat) return null;
      return {
        inventoryId: inv.id,
        catalogId: cat.id,
        model: cat.model,
        description: cat.description,
        partNumber: cat.partNumber,
        category: cat.category,
        estimatedCost: cat.estimatedCost,
        specs: cat.specs,
        available: inv.quantity,
      };
    }).filter(Boolean);
  }, [vendorInventory]);

  const filteredItems = useMemo(() => {
    if (!searchTerm) return enrichedItems;
    const term = searchTerm.toLowerCase();
    return enrichedItems.filter(
      (item) =>
        item.model.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term) ||
        item.partNumber.toLowerCase().includes(term)
    );
  }, [enrichedItems, searchTerm]);

  const groupedItems = useMemo(() => {
    const groups = {};
    filteredItems.forEach((item) => {
      const cat = item.category || 'other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return groups;
  }, [filteredItems]);

  function toggleCategory(cat) {
    setExpandedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  }

  function addToCart(item) {
    setCart((prev) => {
      const existing = prev.find((c) => c.inventoryId === item.inventoryId);
      if (existing) {
        if (existing.quantity >= item.available) return prev;
        return prev.map((c) =>
          c.inventoryId === item.inventoryId
            ? { ...c, quantity: c.quantity + 1 }
            : c
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }

  function updateCartQty(inventoryId, qty) {
    if (qty <= 0) {
      setCart((prev) => prev.filter((c) => c.inventoryId !== inventoryId));
      return;
    }
    setCart((prev) =>
      prev.map((c) =>
        c.inventoryId === inventoryId
          ? { ...c, quantity: Math.min(qty, c.available) }
          : c
      )
    );
  }

  function removeFromCart(inventoryId) {
    setCart((prev) => prev.filter((c) => c.inventoryId !== inventoryId));
  }

  function getCartQty(inventoryId) {
    return cart.find((c) => c.inventoryId === inventoryId)?.quantity || 0;
  }

  const cartTotal = cart.reduce((sum, c) => sum + c.quantity, 0);

  function handleSubmit(e) {
    e.preventDefault();
    if (!poNumber.trim() || cart.length === 0 || !selectedVendor) return;

    dispatch({
      type: 'CREATE_PO',
      payload: {
        poNumber: poNumber.trim(),
        vendor: selectedVendor.shortName,
        notes,
        items: cart.map((c) => ({
          description: c.model,
          partNumber: c.partNumber,
          quantity: c.quantity,
          unitPrice: parseFloat(c.estimatedCost.replace(/[$,]/g, '')) || 0,
          serials: [],
        })),
      },
    });

    setSubmitted(true);
  }

  function handleReset() {
    setCart([]);
    setPoNumber('');
    setNotes('');
    setSubmitted(false);
    setShowCart(false);
  }

  if (submitted) {
    return (
      <div className="page">
        <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✓</div>
          <h2>Purchase Order Created</h2>
          <p className="text-muted" style={{ margin: '0.75rem 0 1.5rem' }}>
            PO <strong>{poNumber}</strong> has been issued to{' '}
            <strong>{selectedVendor?.shortName}</strong> with {cart.length} line
            item{cart.length !== 1 ? 's' : ''}.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button className="btn btn-secondary" onClick={handleReset}>
              Create Another
            </button>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/purchase-orders')}
            >
              View Purchase Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedVendorId) {
    return (
      <div className="page">
        <div className="page-header">
          <div>
            <h2>Catalog</h2>
            <p className="text-muted">
              Select a vendor to browse their stocked inventory
            </p>
          </div>
        </div>

        <div className="catalog-vendor-grid">
          {vendors.map((v) => {
            const stockCount = state.vendorInventory.filter(
              (inv) => inv.vendorId === v.id && inv.quantity > 0
            ).length;
            return (
              <button
                key={v.id}
                className="catalog-vendor-card"
                onClick={() => {
                  setSelectedVendorId(v.id);
                  setCart([]);
                  setSearchTerm('');
                  setShowCart(false);
                }}
              >
                <span
                  className="catalog-vendor-icon"
                  style={{ background: v.color }}
                >
                  {v.logo ? (
                    <img
                      src={v.logo}
                      alt={v.shortName}
                      className="catalog-vendor-logo-img"
                    />
                  ) : (
                    v.logoInitials
                  )}
                </span>
                <span className="catalog-vendor-name">{v.shortName}</span>
                <span className="catalog-vendor-stock">
                  {stockCount > 0
                    ? `${stockCount} item${stockCount !== 1 ? 's' : ''} in stock`
                    : 'No stock'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            className="btn btn-icon"
            onClick={() => {
              setSelectedVendorId('');
              setCart([]);
              setSearchTerm('');
              setShowCart(false);
            }}
            title="Back to vendors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2>
              {selectedVendor?.shortName} Catalog
            </h2>
            <p className="text-muted">
              {enrichedItems.length} stocked item{enrichedItems.length !== 1 ? 's' : ''} available
            </p>
          </div>
        </div>
        <button
          className={`btn ${cartTotal > 0 ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setShowCart(!showCart)}
        >
          <ShoppingCart size={16} />
          Cart{cartTotal > 0 ? ` (${cartTotal})` : ''}
        </button>
      </div>

      {showCart && (
        <div className="card catalog-cart">
          <h3>
            <ShoppingCart size={16} /> Order Cart
          </h3>
          {cart.length === 0 ? (
            <p className="text-muted" style={{ padding: '0.5rem 0' }}>
              No items added yet. Browse the catalog below and add items.
            </p>
          ) : (
            <>
              <div className="catalog-cart-items">
                {cart.map((c) => (
                  <div key={c.inventoryId} className="catalog-cart-row">
                    <div className="catalog-cart-row-info">
                      <span className="catalog-cart-row-model">{c.model}</span>
                      <span className="catalog-cart-row-pn">
                        {c.partNumber}
                      </span>
                    </div>
                    <div className="catalog-cart-row-qty">
                      <button
                        className="btn btn-icon btn-sm"
                        onClick={() =>
                          updateCartQty(c.inventoryId, c.quantity - 1)
                        }
                      >
                        <Minus size={14} />
                      </button>
                      <span className="catalog-cart-row-qty-val">
                        {c.quantity}
                      </span>
                      <button
                        className="btn btn-icon btn-sm"
                        onClick={() =>
                          updateCartQty(c.inventoryId, c.quantity + 1)
                        }
                        disabled={c.quantity >= c.available}
                      >
                        <Plus size={14} />
                      </button>
                      <button
                        className="btn btn-icon btn-sm btn-danger"
                        onClick={() => removeFromCart(c.inventoryId)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="catalog-cart-form">
                <div className="form-row">
                  <div className="form-group flex-2">
                    <label>PO Number *</label>
                    <input
                      type="text"
                      value={poNumber}
                      onChange={(e) => setPoNumber(e.target.value)}
                      placeholder="PO-2026-001"
                      required
                    />
                  </div>
                  <div className="form-group flex-2">
                    <label>Notes</label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Optional notes..."
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!poNumber.trim() || cart.length === 0}
                >
                  <Send size={14} /> Issue PO to {selectedVendor?.shortName}
                </button>
              </form>
            </>
          )}
        </div>
      )}

      <div className="card">
        <div className="card-header-row">
          <h3>
            <Package size={18} /> Available Inventory
          </h3>
          <div className="inventory-search">
            <Search size={14} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search items..."
            />
          </div>
        </div>

        {Object.keys(groupedItems).length === 0 && (
          <p className="text-muted" style={{ padding: '1rem 0' }}>
            {enrichedItems.length === 0
              ? 'This vendor has no stocked inventory. Items must be stocked on the vendor side first.'
              : 'No items match your search.'}
          </p>
        )}

        {Object.entries(groupedItems).map(([category, items]) => {
          const isExpanded = expandedCategories[category] !== false;
          return (
            <div key={category} className="inventory-category">
              <button
                className="inventory-category-header"
                onClick={() => toggleCategory(category)}
              >
                {isExpanded ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
                <span className="inventory-category-name">
                  {categoryLabels[category] || category}
                </span>
                <span className="inventory-category-count">
                  {items.length} item{items.length !== 1 ? 's' : ''}
                </span>
              </button>

              {isExpanded && (
                <div className="inventory-items">
                  {items.map((item) => {
                    const inCart = getCartQty(item.inventoryId);
                    return (
                      <div
                        key={item.inventoryId}
                        className={`inventory-row ${inCart > 0 ? 'inventory-row--selected' : ''}`}
                      >
                        <div className="inventory-row-info">
                          <div className="inventory-row-model">
                            {item.model}
                          </div>
                          <div className="inventory-row-desc">
                            {item.description}
                          </div>
                          <div className="inventory-row-meta">
                            <span>PN: {item.partNumber}</span>
                            {item.estimatedCost && (
                              <span>{item.estimatedCost}</span>
                            )}
                            <span className="catalog-avail">
                              {item.available} in stock
                            </span>
                            {item.specs && (
                              <span className="inventory-row-specs">
                                {item.specs}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="inventory-row-qty">
                          {inCart > 0 ? (
                            <>
                              <button
                                className="btn btn-icon btn-sm"
                                onClick={() =>
                                  updateCartQty(item.inventoryId, inCart - 1)
                                }
                              >
                                <Minus size={14} />
                              </button>
                              <span className="catalog-in-cart">{inCart}</span>
                              <button
                                className="btn btn-icon btn-sm"
                                onClick={() =>
                                  updateCartQty(item.inventoryId, inCart + 1)
                                }
                                disabled={inCart >= item.available}
                              >
                                <Plus size={14} />
                              </button>
                            </>
                          ) : (
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => addToCart(item)}
                            >
                              <Plus size={14} /> Add
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
