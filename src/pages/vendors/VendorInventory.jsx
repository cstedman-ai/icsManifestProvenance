import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  Package,
  Plus,
  Minus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Search,
  Save,
  X,
} from 'lucide-react';
import {
  getCatalogForVendor,
  categoryLabels,
} from '../../data/cores/catalog';
import InventoryItemModal from '../../components/InventoryItemModal';

export default function VendorInventory() {
  const { state, dispatch } = useApp();
  const { user } = useAuth();
  const vendorId = user?.vendor?.id || '';
  const vendorName = user?.vendor?.shortName || user?.vendor?.name || '';

  const catalogItems = useMemo(() => getCatalogForVendor(vendorId), [vendorId]);

  const inventoryMap = useMemo(() => {
    const map = {};
    state.vendorInventory
      .filter((v) => v.vendorId === vendorId)
      .forEach((v) => {
        if (v.catalogItemId) map[v.catalogItemId] = v;
      });
    return map;
  }, [state.vendorInventory, vendorId]);

  const customItems = useMemo(
    () =>
      state.vendorInventory.filter(
        (v) => v.vendorId === vendorId && v.custom
      ),
    [state.vendorInventory, vendorId]
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [modalItem, setModalItem] = useState(null);
  const [newItem, setNewItem] = useState({
    model: '',
    partNumber: '',
    category: 'other',
    description: '',
    estimatedCost: '',
    quantity: 0,
  });

  const groupedCatalog = useMemo(() => {
    const filtered = catalogItems.filter(
      (item) =>
        !searchTerm ||
        item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.partNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const groups = {};
    filtered.forEach((item) => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [catalogItems, searchTerm]);

  function toggleCategory(cat) {
    setExpandedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  }

  function setStock(catalogItemId, quantity) {
    dispatch({
      type: 'SET_INVENTORY_STOCK',
      payload: { vendorId, catalogItemId, quantity: Math.max(0, quantity) },
    });
  }

  function getStock(catalogItemId) {
    return inventoryMap[catalogItemId]?.quantity || 0;
  }

  function handleAddCustom(e) {
    e.preventDefault();
    if (!newItem.model.trim() || !newItem.description.trim()) return;
    dispatch({
      type: 'ADD_CUSTOM_INVENTORY_ITEM',
      payload: { ...newItem, vendorId, quantity: Math.max(0, newItem.quantity) },
    });
    setNewItem({
      model: '',
      partNumber: '',
      category: 'other',
      description: '',
      estimatedCost: '',
      quantity: 0,
    });
    setShowAddForm(false);
  }

  function updateCustomQuantity(id, quantity) {
    dispatch({
      type: 'UPDATE_CUSTOM_INVENTORY_ITEM',
      payload: { id, updates: { quantity: Math.max(0, quantity) } },
    });
  }

  function removeCustomItem(id) {
    dispatch({ type: 'REMOVE_INVENTORY_ITEM', payload: id });
  }

  const totalStocked = Object.values(inventoryMap).reduce(
    (sum, v) => sum + (v.quantity || 0),
    0
  ) + customItems.reduce((sum, v) => sum + (v.quantity || 0), 0);

  const stockedLineCount =
    Object.values(inventoryMap).filter((v) => v.quantity > 0).length +
    customItems.filter((v) => v.quantity > 0).length;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Inventory</h2>
          <p className="text-muted">
            Manage stocked items for <strong>{vendorName}</strong>
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <Plus size={16} /> Add Custom Item
        </button>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-value">{catalogItems.length + customItems.length}</span>
          <span className="stat-label">Catalog Items</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stockedLineCount}</span>
          <span className="stat-label">Items Stocked</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{totalStocked}</span>
          <span className="stat-label">Total Units</span>
        </div>
      </div>

      {showAddForm && (
        <div className="card">
          <div className="card-header-row">
            <h3>Add Custom Item</h3>
            <button
              className="btn btn-icon"
              onClick={() => setShowAddForm(false)}
            >
              <X size={16} />
            </button>
          </div>
          <form onSubmit={handleAddCustom} className="form-stack">
            <div className="form-row">
              <div className="form-group flex-2">
                <label>Model / Name *</label>
                <input
                  type="text"
                  value={newItem.model}
                  onChange={(e) =>
                    setNewItem((p) => ({ ...p, model: e.target.value }))
                  }
                  placeholder="Product model name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Part Number</label>
                <input
                  type="text"
                  value={newItem.partNumber}
                  onChange={(e) =>
                    setNewItem((p) => ({ ...p, partNumber: e.target.value }))
                  }
                  placeholder="PN-001"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <select
                  value={newItem.category}
                  onChange={(e) =>
                    setNewItem((p) => ({ ...p, category: e.target.value }))
                  }
                >
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Estimated Cost</label>
                <input
                  type="text"
                  value={newItem.estimatedCost}
                  onChange={(e) =>
                    setNewItem((p) => ({ ...p, estimatedCost: e.target.value }))
                  }
                  placeholder="$0.00"
                />
              </div>
              <div className="form-group">
                <label>Initial Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={newItem.quantity}
                  onChange={(e) =>
                    setNewItem((p) => ({
                      ...p,
                      quantity: parseInt(e.target.value) || 0,
                    }))
                  }
                />
              </div>
            </div>
            <div className="form-group">
              <label>Description *</label>
              <textarea
                value={newItem.description}
                onChange={(e) =>
                  setNewItem((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Item description..."
                rows={2}
                required
              />
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <Save size={14} /> Add to Inventory
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="card-header-row">
          <h3>
            <Package size={18} /> Product Catalog
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

        {Object.keys(groupedCatalog).length === 0 && !customItems.length && (
          <p className="text-muted" style={{ padding: '1rem 0' }}>
            No catalog items are mapped to your vendor account.
            Use "Add Custom Item" to build your inventory.
          </p>
        )}

        {Object.entries(groupedCatalog).map(([category, items]) => {
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
                    const qty = getStock(item.id);
                    return (
                      <div key={item.id} className="inventory-row">
                        <div
                          className="inventory-row-info inventory-row-clickable"
                          onClick={() => setModalItem(item)}
                        >
                          <div className="inventory-row-model">
                            {item.model}
                          </div>
                          <div className="inventory-row-desc">
                            {item.description}
                          </div>
                          <div className="inventory-row-meta">
                            <span>PN: {item.partNumber}</span>
                            <span>{item.estimatedCost}</span>
                            <span className="inventory-row-specs">
                              {item.specs}
                            </span>
                          </div>
                        </div>
                        <div className="inventory-row-qty">
                          <button
                            className="btn btn-icon btn-sm"
                            onClick={() => setStock(item.id, qty - 1)}
                            disabled={qty <= 0}
                          >
                            <Minus size={14} />
                          </button>
                          <input
                            type="number"
                            min="0"
                            className="inventory-qty-input"
                            value={qty}
                            onChange={(e) =>
                              setStock(
                                item.id,
                                parseInt(e.target.value) || 0
                              )
                            }
                          />
                          <button
                            className="btn btn-icon btn-sm"
                            onClick={() => setStock(item.id, qty + 1)}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {customItems.length > 0 && (
          <div className="inventory-category">
            <button
              className="inventory-category-header"
              onClick={() => toggleCategory('_custom')}
            >
              {expandedCategories['_custom'] !== false ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
              <span className="inventory-category-name">Custom Items</span>
              <span className="inventory-category-count">
                {customItems.length} item{customItems.length !== 1 ? 's' : ''}
              </span>
            </button>

            {expandedCategories['_custom'] !== false && (
              <div className="inventory-items">
                {customItems.map((item) => (
                  <div key={item.id} className="inventory-row">
                    <div
                      className="inventory-row-info inventory-row-clickable"
                      onClick={() => setModalItem({ ...item, custom: true })}
                    >
                      <div className="inventory-row-model">{item.model}</div>
                      <div className="inventory-row-desc">
                        {item.description}
                      </div>
                      <div className="inventory-row-meta">
                        {item.partNumber && <span>PN: {item.partNumber}</span>}
                        {item.estimatedCost && (
                          <span>{item.estimatedCost}</span>
                        )}
                        <span>
                          {categoryLabels[item.category] || item.category}
                        </span>
                      </div>
                    </div>
                    <div className="inventory-row-qty">
                      <button
                        className="btn btn-icon btn-sm"
                        onClick={() =>
                          updateCustomQuantity(item.id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 0}
                      >
                        <Minus size={14} />
                      </button>
                      <input
                        type="number"
                        min="0"
                        className="inventory-qty-input"
                        value={item.quantity}
                        onChange={(e) =>
                          updateCustomQuantity(
                            item.id,
                            parseInt(e.target.value) || 0
                          )
                        }
                      />
                      <button
                        className="btn btn-icon btn-sm"
                        onClick={() =>
                          updateCustomQuantity(item.id, item.quantity + 1)
                        }
                      >
                        <Plus size={14} />
                      </button>
                      <button
                        className="btn btn-icon btn-sm btn-danger"
                        onClick={() => removeCustomItem(item.id)}
                        title="Remove item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {modalItem && (
        <InventoryItemModal
          item={modalItem}
          vendorName={vendorName}
          purchaseOrders={state.purchaseOrders}
          onClose={() => setModalItem(null)}
        />
      )}
    </div>
  );
}
