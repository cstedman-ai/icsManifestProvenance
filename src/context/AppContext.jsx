import { createContext, useContext, useReducer, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { loadDatabase, saveDatabase } from '../utils/storage';

const AppContext = createContext(null);

function appReducer(state, action) {
  switch (action.type) {
    case 'LOAD_DB':
      return { ...action.payload };

    case 'CREATE_PO': {
      const po = {
        id: uuidv4(),
        poNumber: action.payload.poNumber,
        vendor: action.payload.vendor,
        createdAt: new Date().toISOString(),
        status: 'issued',
        items: action.payload.items.map((item) => ({
          id: uuidv4(),
          description: item.description,
          partNumber: item.partNumber,
          quantityOrdered: item.quantity,
          unitPrice: item.unitPrice,
          serials: item.serials || [],
        })),
        notes: action.payload.notes || '',
      };
      return { ...state, purchaseOrders: [...state.purchaseOrders, po] };
    }

    case 'UPDATE_PO': {
      return {
        ...state,
        purchaseOrders: state.purchaseOrders.map((po) =>
          po.id === action.payload.id ? { ...po, ...action.payload.updates } : po
        ),
      };
    }

    case 'DELETE_PO': {
      return {
        ...state,
        purchaseOrders: state.purchaseOrders.filter((po) => po.id !== action.payload),
      };
    }

    case 'CREATE_SHIPMENT': {
      const shipment = {
        id: uuidv4(),
        poId: action.payload.poId,
        shippedAt: new Date().toISOString(),
        items: action.payload.items.map((item) => ({
          id: uuidv4(),
          poItemId: item.poItemId,
          quantityShipped: item.quantityShipped,
          serialsShipped: item.serialsShipped || [],
        })),
        trackingNumber: action.payload.trackingNumber || '',
        notes: action.payload.notes || '',
      };
      const updatedPOs = state.purchaseOrders.map((po) =>
        po.id === action.payload.poId ? { ...po, status: 'shipped' } : po
      );
      return {
        ...state,
        purchaseOrders: updatedPOs,
        shipments: [...state.shipments, shipment],
      };
    }

    case 'RECORD_RECEIVING': {
      const receiving = {
        id: uuidv4(),
        poId: action.payload.poId,
        shipmentId: action.payload.shipmentId,
        receivedAt: new Date().toISOString(),
        items: action.payload.items.map((item) => ({
          id: uuidv4(),
          poItemId: item.poItemId,
          quantityReceived: item.quantityReceived,
          serialsReceived: item.serialsReceived || [],
          condition: item.condition || 'good',
          notes: item.notes || '',
        })),
        receivedBy: action.payload.receivedBy || '',
        notes: action.payload.notes || '',
      };
      const updatedPOs = state.purchaseOrders.map((po) =>
        po.id === action.payload.poId ? { ...po, status: 'received' } : po
      );
      return {
        ...state,
        purchaseOrders: updatedPOs,
        receivings: [...state.receivings, receiving],
      };
    }

    case 'SET_INVENTORY_STOCK': {
      const { vendorId, catalogItemId, quantity } = action.payload;
      const existing = state.vendorInventory.find(
        (v) => v.vendorId === vendorId && v.catalogItemId === catalogItemId
      );
      if (existing) {
        return {
          ...state,
          vendorInventory: state.vendorInventory.map((v) =>
            v.vendorId === vendorId && v.catalogItemId === catalogItemId
              ? { ...v, quantity, updatedAt: new Date().toISOString() }
              : v
          ),
        };
      }
      return {
        ...state,
        vendorInventory: [
          ...state.vendorInventory,
          {
            id: uuidv4(),
            vendorId,
            catalogItemId,
            quantity,
            updatedAt: new Date().toISOString(),
          },
        ],
      };
    }

    case 'ADD_CUSTOM_INVENTORY_ITEM': {
      const item = {
        id: uuidv4(),
        vendorId: action.payload.vendorId,
        catalogItemId: null,
        custom: true,
        model: action.payload.model,
        partNumber: action.payload.partNumber,
        category: action.payload.category,
        description: action.payload.description,
        estimatedCost: action.payload.estimatedCost,
        quantity: action.payload.quantity,
        updatedAt: new Date().toISOString(),
      };
      return {
        ...state,
        vendorInventory: [...state.vendorInventory, item],
      };
    }

    case 'UPDATE_CUSTOM_INVENTORY_ITEM': {
      return {
        ...state,
        vendorInventory: state.vendorInventory.map((v) =>
          v.id === action.payload.id
            ? { ...v, ...action.payload.updates, updatedAt: new Date().toISOString() }
            : v
        ),
      };
    }

    case 'REMOVE_INVENTORY_ITEM': {
      return {
        ...state,
        vendorInventory: state.vendorInventory.filter(
          (v) => v.id !== action.payload
        ),
      };
    }

    case 'IMPORT_DB':
      return { ...action.payload };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, null, loadDatabase);

  useEffect(() => {
    if (state) saveDatabase(state);
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}
