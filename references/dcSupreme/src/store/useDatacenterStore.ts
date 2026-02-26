import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Cabinet, Equipment, Connection, CableInventory, DataHall } from '../components/datacenterCore';

interface AvailableInventory {
  nodes: Record<string, number>;
  switches: Record<string, number>;
  transceivers: Record<string, number>;
  pdus: Record<string, number>;
  cabinets: Record<string, number>;
  cables: Record<string, number>; // Key format: "CableType-LengthM" e.g. "Cat6a-5m"
}

interface DatacenterState {
  cabinets: Cabinet[];
  dataHalls: DataHall[];
  connections: Connection[];
  selectedCabinet: Cabinet | null;
  availableInventory: AvailableInventory;
  
  // Actions
  addCabinet: (cabinet: Cabinet) => void;
  addDataHall: () => void;
  updateCabinet: (id: string, updates: Partial<Cabinet>) => void;
  addEquipment: (cabinetId: string, equipment: Equipment) => void;
  updateEquipment: (cabinetId: string, equipmentId: string, updates: Partial<Equipment>) => void;
  removeEquipment: (cabinetId: string, equipmentId: string) => void;
  addConnection: (connection: Connection) => void;
  removeConnection: (id: string) => void;
  setSelectedCabinet: (cabinet: Cabinet | null) => void;
  calculateCableLength: (fromCabinetId: string, fromRackUnit: number, toCabinetId: string, toRackUnit: number) => number;
  getCableInventory: () => CableInventory[];
  initializeDatacenter: () => void;
  addToInventory: (category: keyof AvailableInventory, model: string, quantity: number) => void;
  getAvailableQuantity: (category: keyof AvailableInventory, model: string) => number;
  deployFromInventory: (category: keyof AvailableInventory, model: string, quantity: number) => boolean;
  returnToInventory: (category: keyof AvailableInventory, model: string, quantity: number) => void;
}

const CABINET_HEIGHT = 7; // feet (standard 42U rack)
const RACK_UNIT_HEIGHT = CABINET_HEIGHT / 42; // feet per rack unit

const generateHallLayout = (hallId: string): Cabinet[] => {
  const cabinets: Cabinet[] = [];
  const CABINETS_PER_ROW = 10;
  const ROWS_PER_POD = 2;
  const TOTAL_PODS = 4; // 8 rows = 4 pods
  const CABINET_WIDTH = 2; // feet
  const CABINET_DEPTH = 3; // feet
  const AISLE_WIDTH = 4; // feet between rows
  const CABINET_SPACING = 0.5; // feet between cabinets

  let cabinetNumber = 1;

  for (let pod = 0; pod < TOTAL_PODS; pod++) {
    for (let rowInPod = 0; rowInPod < ROWS_PER_POD; rowInPod++) {
      const row = pod * ROWS_PER_POD + rowInPod;
      const yOffset = pod * (CABINET_DEPTH * 2 + AISLE_WIDTH * 2) + rowInPod * (CABINET_DEPTH + AISLE_WIDTH);

      for (let pos = 0; pos < CABINETS_PER_ROW; pos++) {
        const x = pos * (CABINET_WIDTH + CABINET_SPACING) + 10;
        const y = yOffset + 10;

        cabinets.push({
          id: `${hallId}-cab-${cabinetNumber}`,
          number: cabinetNumber,
          row,
          position: pos,
          x,
          y,
          dataHallId: hallId,
          specificationModel: 'Dell 44U Rack Cabinet', // Default to Dell 44U
          equipment: [],
          pdus: [
            { model: 'EN6950', quantity: 2 } // Default: 2x Enlogic EN6950 PDUs per cabinet
          ]
        });

        cabinetNumber++;
      }
    }
  }
  return cabinets;
};

export const useDatacenterStore = create<DatacenterState>()(
  persist(
    (set, get) => ({
  cabinets: [],
  dataHalls: [],
  connections: [],
  selectedCabinet: null,
  availableInventory: {
    nodes: {},
    switches: {},
    transceivers: {},
    pdus: {},
    cabinets: {},
    cables: {},
  },

  addCabinet: (cabinet) => set((state) => ({
    cabinets: [...state.cabinets, cabinet]
  })),

  addDataHall: () => set((state) => {
    const nextIndex = state.dataHalls.length;
    const hallLetter = String.fromCharCode(65 + nextIndex);
    const hallId = `hall-${hallLetter.toLowerCase()}`;
    const newHall: DataHall = {
      id: hallId,
      name: `Data Hall ${hallLetter}`
    };

    const newCabinets = generateHallLayout(hallId);

    return {
      dataHalls: [...state.dataHalls, newHall],
      cabinets: [...state.cabinets, ...newCabinets]
    };
  }),

  updateCabinet: (id, updates) => set((state) => ({
    cabinets: state.cabinets.map(cab => 
      cab.id === id ? { ...cab, ...updates } : cab
    )
  })),

  addEquipment: (cabinetId, equipment) => {
    console.log('Store: Adding equipment to cabinet', cabinetId, equipment);
    set((state) => ({
      cabinets: state.cabinets.map(cab =>
        cab.id === cabinetId
          ? { ...cab, equipment: [...cab.equipment, { ...equipment }] }
          : cab
      )
    }));
  },

  updateEquipment: (cabinetId, equipmentId, updates) => set((state) => ({
    cabinets: state.cabinets.map(cab =>
      cab.id === cabinetId
        ? {
            ...cab,
            equipment: cab.equipment.map(eq =>
              eq.id === equipmentId ? { ...eq, ...updates } : eq
            )
          }
        : cab
    )
  })),

  removeEquipment: (cabinetId, equipmentId) => set((state) => ({
    cabinets: state.cabinets.map(cab =>
      cab.id === cabinetId
        ? { ...cab, equipment: cab.equipment.filter(eq => eq.id !== equipmentId) }
        : cab
    )
  })),

  addConnection: (connection) => set((state) => ({
    connections: [...state.connections, connection]
  })),

  removeConnection: (id) => set((state) => ({
    connections: state.connections.filter(conn => conn.id !== id)
  })),

  setSelectedCabinet: (cabinet) => set({ selectedCabinet: cabinet }),

  calculateCableLength: (fromCabinetId, fromRackUnit, toCabinetId, toRackUnit) => {
    const state = get();
    const fromCabinet = state.cabinets.find(c => c.id === fromCabinetId);
    const toCabinet = state.cabinets.find(c => c.id === toCabinetId);

    if (!fromCabinet || !toCabinet) return 0;

    if (fromCabinet.dataHallId !== toCabinet.dataHallId) {
      return 300;
    }

    const dx = Math.abs(toCabinet.x - fromCabinet.x);
    const dy = Math.abs(toCabinet.y - fromCabinet.y);
    const horizontalDistance = dx + dy;

    const fromHeight = fromRackUnit * RACK_UNIT_HEIGHT;
    const toHeight = toRackUnit * RACK_UNIT_HEIGHT;
    const verticalDistance = Math.abs(toHeight - fromHeight);

    const totalDistance = horizontalDistance + verticalDistance + (CABINET_HEIGHT * 2);
    const withSlack = totalDistance * 1.2;

    return Math.ceil(withSlack);
  },

  getCableInventory: () => {
    const state = get();
    const inventory = new Map<string, Map<number, number>>();

    state.connections.forEach(conn => {
      const type = conn.connectionType;
      const length = conn.length;
      
      if (!inventory.has(type)) {
        inventory.set(type, new Map());
      }
      
      const typeLengths = inventory.get(type)!;
      typeLengths.set(length, (typeLengths.get(length) || 0) + 1);
    });

    const result: CableInventory[] = [];
    inventory.forEach((lengths, type) => {
      lengths.forEach((quantity, length) => {
        result.push({
          type: type as 'fiber' | 'ethernet',
          length,
          quantity
        });
      });
    });

    return result.sort((a, b) => {
      if (a.type !== b.type) return a.type.localeCompare(b.type);
      return a.length - b.length;
    });
  },

  initializeDatacenter: () => {
    if (get().cabinets.length > 0) return;

    const hallId = 'hall-a';
    const initialHall: DataHall = { id: hallId, name: 'Data Hall A' };
    const cabinets = generateHallLayout(hallId);

    set({ 
      dataHalls: [initialHall],
      cabinets, 
      connections: [] 
    });
  },

  addToInventory: (category, model, quantity) => set((state) => {
    const currentCategory = state.availableInventory[category] || {};
    return {
      availableInventory: {
        ...state.availableInventory,
        [category]: {
          ...currentCategory,
          [model]: (currentCategory[model] || 0) + quantity
        }
      }
    };
  }),

  getAvailableQuantity: (category, model) => {
    const state = get();
    const categoryInventory = state.availableInventory[category];
    return categoryInventory ? (categoryInventory[model] || 0) : 0;
  },

  deployFromInventory: (category, model, quantity) => {
    const state = get();
    const currentCategory = state.availableInventory[category] || {};
    const available = currentCategory[model] || 0;
    
    if (available < quantity) {
      return false;
    }

    set({
      availableInventory: {
        ...state.availableInventory,
        [category]: {
          ...currentCategory,
          [model]: available - quantity
        }
      }
    });

    return true;
  },

  returnToInventory: (category, model, quantity) => set((state) => {
    const currentCategory = state.availableInventory[category] || {};
    return {
      availableInventory: {
        ...state.availableInventory,
        [category]: {
          ...currentCategory,
          [model]: (currentCategory[model] || 0) + quantity
        }
      }
    };
  })
}),
    {
      name: 'datacenter-storage',
      version: 1,
    }
  )
);
