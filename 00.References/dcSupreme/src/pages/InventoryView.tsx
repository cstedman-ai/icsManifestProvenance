import { useMemo, useState } from 'react';
import { Package, Download, Server, Cable as CableIcon, Cpu, Box, Zap, Plus, X } from 'lucide-react';
import { useDatacenterStore } from '../store/useDatacenterStore';
import { CableSpecifications } from '../components/datacenterCore/cables';
import { CabinetSpecifications } from '../components/datacenterCore/cabinets';
import { NodeSpecifications } from '../components/datacenterCore/nodes';
import { SwitchSpecifications } from '../components/datacenterCore/switches';
import { TransceiverSpecifications } from '../components/datacenterCore/qsfps';
import { PDUSpecifications } from '../components/datacenterCore/pdus';

type InventoryTab = 'cables' | 'equipment' | 'transceivers' | 'cabinets' | 'catalog' | 'stock';

export default function InventoryView() {
  const getCableInventory = useDatacenterStore(state => state.getCableInventory);
  const connections = useDatacenterStore(state => state.connections);
  const cabinets = useDatacenterStore(state => state.cabinets);
  const availableInventory = useDatacenterStore(state => state.availableInventory);
  const [activeTab, setActiveTab] = useState<InventoryTab>('stock');

  const inventory = useMemo(() => getCableInventory(), [connections]);

  const deployedEquipment = useMemo(() => {
    const equipment = cabinets.flatMap(cab => cab.equipment);
    const nodes = equipment.filter(eq => eq.name.includes('PowerEdge') || eq.name.includes('Server'));
    const switches = equipment.filter(eq => eq.name.includes('Switch') || eq.name.includes('Spectrum') || eq.name.includes('Quantum'));
    return { nodes, switches, total: equipment };
  }, [cabinets]);

  const transceiverInventory = useMemo(() => {
    const allTransceivers = cabinets
      .flatMap(cab => cab.equipment)
      .flatMap(eq => eq.transceivers || []);
    
    const grouped = allTransceivers.reduce((acc, trans) => {
      const existing = acc.find(t => t.model === trans.model);
      if (existing) {
        existing.quantity += trans.quantity;
      } else {
        acc.push({ model: trans.model, quantity: trans.quantity });
      }
      return acc;
    }, [] as Array<{ model: string; quantity: number }>);

    return grouped.sort((a, b) => a.model.localeCompare(b.model));
  }, [cabinets]);

  const cabinetInventory = useMemo(() => {
    const types = cabinets.reduce((acc, cab) => {
      const model = cab.specificationModel || 'Generic 42U';
      acc[model] = (acc[model] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(types).map(([model, count]) => ({
      model,
      count,
      spec: CabinetSpecifications.find(s => s.model === model)
    }));
  }, [cabinets]);

  const fiberInventory = inventory.filter(item => item.type === 'fiber');
  const ethernetInventory = inventory.filter(item => item.type === 'ethernet');

  const fiberTotal = fiberInventory.reduce((sum, item) => sum + (item.length * item.quantity), 0);
  const ethernetTotal = ethernetInventory.reduce((sum, item) => sum + (item.length * item.quantity), 0);
  const fiberCount = fiberInventory.reduce((sum, item) => sum + item.quantity, 0);
  const ethernetCount = ethernetInventory.reduce((sum, item) => sum + item.quantity, 0);

  const handleExport = () => {
    let csvContent = '';
    
    if (activeTab === 'cables') {
      csvContent = [
        ['Cable Type', 'Length (ft)', 'Quantity', 'Total Length (ft)'],
        ...inventory.map(item => [
          item.type === 'fiber' ? 'Fiber Optic' : 'Ethernet',
          item.length,
          item.quantity,
          item.length * item.quantity
        ])
      ].map(row => row.join(',')).join('\n');
    } else if (activeTab === 'equipment') {
      csvContent = [
        ['Type', 'Name', 'Cabinet', 'Rack Unit', 'Height (U)'],
        ...deployedEquipment.total.map(eq => {
          const cab = cabinets.find(c => c.equipment.includes(eq));
          return [
            eq.connectionType === 'fiber' ? 'Fiber Equipment' : 'Ethernet Equipment',
            eq.name,
            `Cabinet #${cab?.number}`,
            eq.rackUnit,
            eq.height || 1
          ];
        })
      ].map(row => row.join(',')).join('\n');
    } else if (activeTab === 'transceivers') {
      csvContent = [
        ['Model', 'Deployed', 'Available'],
        ...transceiverInventory.map(t => [t.model, t.quantity, availableInventory.transceivers[t.model] || 0])
      ].map(row => row.join(',')).join('\n');
    } else if (activeTab === 'cabinets') {
      csvContent = [
        ['Cabinet Model', 'Quantity', 'Height (U)'],
        ...cabinetInventory.map(c => [c.model, c.count, c.spec?.rackUnits || 'N/A'])
      ].map(row => row.join(',')).join('\n');
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab}-inventory-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'stock' as InventoryTab, label: 'Stock', icon: Package },
    { id: 'equipment' as InventoryTab, label: 'Deployed', icon: Server },
    { id: 'transceivers' as InventoryTab, label: 'Transceivers', icon: Cpu },
    { id: 'cables' as InventoryTab, label: 'Cables', icon: CableIcon },
    { id: 'catalog' as InventoryTab, label: 'Catalog', icon: Box },
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Inventory & Catalog</h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage stock and view deployed equipment
            </p>
          </div>
          <button
            onClick={handleExport}
            disabled={activeTab === 'catalog' || activeTab === 'stock'}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Download size={20} />
            Export CSV
          </button>
        </div>

        <div className="flex gap-2 mt-4 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'stock' && <StockInventory availableInventory={availableInventory} />}
        {activeTab === 'cables' && (
          <CablesInventory 
            inventory={inventory}
            fiberInventory={fiberInventory}
            ethernetInventory={ethernetInventory}
            fiberTotal={fiberTotal}
            ethernetTotal={ethernetTotal}
            fiberCount={fiberCount}
            ethernetCount={ethernetCount}
            connections={connections}
          />
        )}
        {activeTab === 'equipment' && <EquipmentInventory equipment={deployedEquipment} cabinets={cabinets} />}
        {activeTab === 'transceivers' && <TransceiverInventory inventory={transceiverInventory} availableInventory={availableInventory} />}
        {activeTab === 'catalog' && <CatalogView />}
      </div>
    </div>
  );
}

// Stock Inventory Component
function StockInventory({ availableInventory }: any) {
  const addToInventory = useDatacenterStore(state => state.addToInventory);
  const [showAddForm, setShowAddForm] = useState<string | null>(null);
  const [addQuantity, setAddQuantity] = useState(1);
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedCableType, setSelectedCableType] = useState('');
  const [selectedCableLength, setSelectedCableLength] = useState('');

  const handleAddStock = (category: string) => {
    if (!selectedModel || addQuantity < 1) return;
    
    addToInventory(category as any, selectedModel, addQuantity);
    setShowAddForm(null);
    setSelectedModel('');
    setAddQuantity(1);
  };

  const handleAddCableStock = () => {
    if (!selectedCableType || !selectedCableLength || addQuantity < 1) return;
    
    const key = `${selectedCableType}-${selectedCableLength}m`;
    addToInventory('cables', key, addQuantity);
    setShowAddForm(null);
    setSelectedCableType('');
    setSelectedCableLength('');
    setAddQuantity(1);
  };

  const categories = [
    { key: 'nodes', label: 'Server Nodes', specs: NodeSpecifications, icon: Server },
    { key: 'switches', label: 'Switches', specs: SwitchSpecifications, icon: Cpu },
    { key: 'transceivers', label: 'Transceivers', specs: TransceiverSpecifications, icon: Zap },
    { key: 'pdus', label: 'PDUs', specs: PDUSpecifications, icon: Zap },
    { key: 'cables', label: 'Cables', specs: CableSpecifications, icon: CableIcon, isCable: true },
  ];

  return (
    <div className="space-y-6">
      {categories.map(category => {
        const Icon = category.icon;
        const stock = availableInventory[category.key as keyof typeof availableInventory] || {};
        const totalStock = Object.values(stock).reduce((sum: number, qty: any) => sum + qty, 0);

        return (
          <div key={category.key} className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon size={20} className="text-primary-600" />
                <h3 className="text-lg font-bold text-gray-800">{category.label}</h3>
                <span className="text-sm bg-primary-100 text-primary-700 px-2 py-1 rounded-full font-semibold">
                  {totalStock} in stock
                </span>
              </div>
              <button
                onClick={() => setShowAddForm(category.key)}
                className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
              >
                <Plus size={16} />
                Add Stock
              </button>
            </div>

            {showAddForm === category.key && !category.isCable && (
              <div className="px-6 py-4 bg-blue-50 border-b border-blue-200 flex gap-2">
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">Select model...</option>
                  {category.specs.map((spec: any) => (
                    <option key={spec.model} value={spec.model}>
                      {spec.manufacturer} {spec.model}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  value={addQuantity}
                  onChange={(e) => setAddQuantity(parseInt(e.target.value))}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="Qty"
                />
                <button
                  onClick={() => handleAddStock(category.key)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowAddForm(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 text-sm"
                >
                  Cancel
                </button>
              </div>
            )}

            {showAddForm === category.key && category.isCable && (
              <div className="px-6 py-4 bg-blue-50 border-b border-blue-200 space-y-3">
                <div className="flex gap-2">
                  <select
                    value={selectedCableType}
                    onChange={(e) => setSelectedCableType(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">Select cable type...</option>
                    {CableSpecifications.map((spec: any) => (
                      <option key={spec.model} value={spec.category}>
                        {spec.model} ({spec.type})
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedCableLength}
                    onChange={(e) => setSelectedCableLength(e.target.value)}
                    className="w-48 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">Length...</option>
                    {[
                      { m: 1, ft: 3.28 },
                      { m: 2, ft: 6.56 },
                      { m: 3, ft: 9.84 },
                      { m: 5, ft: 16.40 },
                      { m: 7, ft: 22.97 },
                      { m: 10, ft: 32.81 },
                      { m: 15, ft: 49.21 },
                      { m: 20, ft: 65.62 },
                      { m: 25, ft: 82.02 },
                      { m: 30, ft: 98.43 },
                      { m: 45, ft: 147.64 },
                      { m: 50, ft: 164.04 }
                    ].map(len => (
                      <option key={len.m} value={len.m}>{len.m}m ({len.ft} ft)</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={addQuantity}
                    onChange={(e) => setAddQuantity(parseInt(e.target.value))}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Qty"
                  />
                  <button
                    onClick={handleAddCableStock}
                    disabled={!selectedCableType || !selectedCableLength}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm disabled:bg-gray-300"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowAddForm(null)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="p-6">
              {Object.keys(stock).length === 0 ? (
                <p className="text-center text-gray-500 py-8">No stock available. Click "Add Stock" to begin.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(stock).map(([model, qty]: [string, any]) => {
                    if (category.isCable) {
                      // Parse cable key: "Cat6a-5m" -> ["Cat6a", "5m"]
                      const [cableType, lengthStr] = model.split('-');
                      const lengthMetric = parseFloat(lengthStr.replace('m', ''));
                      const cableSpec = CableSpecifications.find(s => s.category === cableType);
                      
                      // Find imperial conversion
                      const lengthData = cableSpec?.availableLengths.find(l => l.metric === lengthMetric);
                      const imperialDisplay = lengthData 
                        ? `${lengthData.imperial} ${lengthData.unitImperial}`
                        : `${(lengthMetric * 3.28).toFixed(2)} ft`;
                      
                      return (
                        <div key={model} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-semibold text-sm text-gray-800">{cableSpec?.model || cableType}</p>
                              <p className="text-xs text-gray-600 mt-1">
                                Length: {lengthStr} ({imperialDisplay})
                              </p>
                              <p className="text-xs text-gray-500">
                                {cableSpec?.type === 'copper' ? 'Copper' : 'Fiber'} - {cableSpec?.connector}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold text-green-600">{qty}</div>
                              <div className="text-xs text-gray-500">available</div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    
                    const spec: any = category.specs.find((s: any) => s.model === model);
                    return (
                      <div key={model} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-sm text-gray-800">{spec?.manufacturer || spec?.model}</p>
                            <p className="text-xs text-gray-600 mt-1">{model}</p>
                            {spec?.estimatedCost && (
                              <p className="text-xs text-primary-600 font-semibold mt-1">{spec.estimatedCost}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-green-600">{qty}</div>
                            <div className="text-xs text-gray-500">available</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Cable Inventory Component (same as before)
function CablesInventory({ inventory, fiberInventory, ethernetInventory, fiberTotal, ethernetTotal, fiberCount, ethernetCount }: any) {
  const InventoryCard = ({ title, items, color, totalLength, totalCount }: any) => {
    const colorClasses: Record<string, any> = {
      blue: { bg: 'from-blue-50 to-blue-100', text: 'text-blue-700', badge: 'bg-blue-500', header: 'bg-blue-600' },
      orange: { bg: 'from-orange-50 to-orange-100', text: 'text-orange-700', badge: 'bg-orange-500', header: 'bg-orange-600' }
    };
    const colors = colorClasses[color];

    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className={`${colors.header} text-white px-6 py-4`}>
          <h3 className="text-lg font-bold">{title}</h3>
          <div className="flex items-center justify-between mt-2">
            <div>
              <p className="text-sm opacity-90">Total Cables</p>
              <p className="text-2xl font-bold">{totalCount}</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Total Length</p>
              <p className="text-2xl font-bold">{totalLength} ft</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          {items.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No cables of this type needed</p>
          ) : (
            <div className="space-y-3">
              {items.map((item: any, idx: number) => (
                <div key={idx} className={`flex items-center justify-between p-4 bg-gradient-to-r ${colors.bg} rounded-lg border border-gray-200`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 ${colors.badge} rounded-full`}></div>
                    <div>
                      <p className="font-semibold text-gray-800">{item.length} ft</p>
                      <p className="text-sm text-gray-600">{item.quantity} {item.quantity === 1 ? 'cable' : 'cables'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${colors.text}`}>{item.length * item.quantity} ft</p>
                    <p className="text-xs text-gray-600">total</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-4">
          <div className="text-sm text-primary-600 font-medium">Total Cables</div>
          <div className="text-2xl font-bold text-primary-700 mt-1">{fiberCount + ethernetCount}</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
          <div className="text-sm text-purple-600 font-medium">Total Length</div>
          <div className="text-2xl font-bold text-purple-700 mt-1">{fiberTotal + ethernetTotal} ft</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
          <div className="text-sm text-green-600 font-medium">Avg. Cable Length</div>
          <div className="text-2xl font-bold text-green-700 mt-1">
            {fiberCount + ethernetCount > 0 ? Math.round((fiberTotal + ethernetTotal) / (fiberCount + ethernetCount)) : 0} ft
          </div>
        </div>
      </div>
      {inventory.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <CableIcon size={64} className="mb-4 text-gray-300" />
          <p className="text-lg font-medium">No cable connections</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InventoryCard title="Fiber Optic Cables" items={fiberInventory} color="blue" totalLength={fiberTotal} totalCount={fiberCount} />
          <InventoryCard title="Ethernet Cables" items={ethernetInventory} color="orange" totalLength={ethernetTotal} totalCount={ethernetCount} />
        </div>
      )}
    </>
  );
}

function EquipmentInventory({ equipment, cabinets }: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="text-sm text-blue-600 font-medium">Total Equipment</div>
          <div className="text-2xl font-bold text-blue-700 mt-1">{equipment.total.length}</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
          <div className="text-sm text-green-600 font-medium">Server Nodes</div>
          <div className="text-2xl font-bold text-green-700 mt-1">{equipment.nodes.length}</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
          <div className="text-sm text-purple-600 font-medium">Switches</div>
          <div className="text-2xl font-bold text-purple-700 mt-1">{equipment.switches.length}</div>
        </div>
      </div>
      {equipment.total.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <Server size={64} className="mb-4 text-gray-300" />
          <p className="text-lg font-medium">No equipment deployed</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Equipment</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Cabinet</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Position</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Height</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {equipment.total.map((eq: any) => {
                const cab = cabinets.find((c: any) => c.equipment.includes(eq));
                return (
                  <tr key={eq.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{eq.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">#{cab?.number}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">U{eq.rackUnit}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{eq.height || 1}U</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        {(eq.connectionTypes || [eq.connectionType]).map((type: string, idx: number) => (
                          <span key={idx} className={`text-xs px-2 py-1 rounded-full font-semibold ${
                            type === 'fiber' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                          }`}>
                            {type === 'fiber' ? 'Fiber' : 'Ethernet'}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function TransceiverInventory({ inventory, availableInventory }: any) {
  const totalDeployed = inventory.reduce((sum: number, t: any) => sum + t.quantity, 0);
  const totalAvailable = Object.values(availableInventory.transceivers).reduce((sum: number, qty: any) => sum + qty, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="text-sm text-blue-600 font-medium">Deployed</div>
          <div className="text-2xl font-bold text-blue-700 mt-1">{totalDeployed}</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
          <div className="text-sm text-green-600 font-medium">Available</div>
          <div className="text-2xl font-bold text-green-700 mt-1">{totalAvailable}</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
          <div className="text-sm text-purple-600 font-medium">Total</div>
          <div className="text-2xl font-bold text-purple-700 mt-1">{totalDeployed + totalAvailable}</div>
        </div>
      </div>
      {inventory.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <Cpu size={64} className="mb-4 text-gray-300" />
          <p className="text-lg font-medium">No transceivers deployed</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {inventory.map((trans: any, idx: number) => {
            const spec = TransceiverSpecifications.find(s => s.model === trans.model);
            const available = availableInventory.transceivers[trans.model] || 0;
            return (
              <div key={idx} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{spec?.manufacturer} {trans.model}</h4>
                    <p className="text-xs text-gray-600 mt-1">{spec?.formFactor} • {spec?.dataRate}</p>
                    <div className="flex gap-4 mt-2 text-sm">
                      <span className="text-blue-600">Deployed: {trans.quantity}</span>
                      <span className="text-green-600">Available: {available}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CatalogView() {
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  const categories = [
    { name: 'Cables', items: CableSpecifications, icon: CableIcon },
    { name: 'Cabinets', items: CabinetSpecifications, icon: Box },
    { name: 'Server Nodes', items: NodeSpecifications, icon: Server },
    { name: 'Switches', items: SwitchSpecifications, icon: Cpu },
    { name: 'Transceivers', items: TransceiverSpecifications, icon: Zap },
    { name: 'PDUs', items: PDUSpecifications, icon: Zap },
  ];

  return (
    <>
      <div className="space-y-6">
        {categories.map(category => {
          const Icon = category.icon;
          return (
            <div key={category.name} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-3">
                  <Icon size={20} className="text-primary-600" />
                  <h3 className="text-lg font-bold text-gray-800">{category.name}</h3>
                  <span className="text-sm text-gray-600">({category.items.length} models)</span>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {category.items.map((item: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedItem(item);
                        setSelectedCategory(category.name);
                      }}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-primary-50 hover:border-primary-300 transition-colors text-left cursor-pointer"
                    >
                      <p className="font-semibold text-sm text-gray-800">{item.manufacturer || item.model}</p>
                      <p className="text-xs text-gray-600 mt-1">{item.model || item.type}</p>
                      {item.estimatedCost && (
                        <p className="text-xs text-primary-600 font-semibold mt-1">{item.estimatedCost}</p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Specification Modal */}
      {selectedItem && (
        <SpecificationModal
          item={selectedItem}
          category={selectedCategory}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </>
  );
}

// Specification Modal Component
function SpecificationModal({ item, category, onClose }: { item: any; category: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[80] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-primary-600 text-white flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">{item.manufacturer || 'Generic'} {item.model}</h3>
            <p className="text-sm opacity-90 mt-1">{category} - {item.description || item.type}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-primary-700 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* General Info */}
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2 text-sm uppercase tracking-wide">General Information</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  {item.manufacturer && <p><span className="font-medium">Manufacturer:</span> {item.manufacturer}</p>}
                  {item.model && <p><span className="font-medium">Model:</span> {item.model}</p>}
                  {item.description && <p><span className="font-medium">Description:</span> {item.description}</p>}
                  {item.type && <p><span className="font-medium">Type:</span> {item.type}</p>}
                  {item.estimatedCost && <p><span className="font-medium">Est. Cost:</span> <span className="text-primary-600 font-semibold">{item.estimatedCost}</span></p>}
                  {item.releaseDate && <p><span className="font-medium">Release Date:</span> {item.releaseDate}</p>}
                </div>
              </div>

              {/* Dimensions */}
              {item.dimensions && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2 text-sm uppercase tracking-wide">Dimensions</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                    {item.dimensions.height && (
                      <p><span className="font-medium">Height:</span> {item.dimensions.height.imperial}" ({item.dimensions.height.metric}mm)</p>
                    )}
                    {item.dimensions.width && (
                      <p><span className="font-medium">Width:</span> {item.dimensions.width.imperial}" ({item.dimensions.width.metric}mm)</p>
                    )}
                    {item.dimensions.depth && (
                      <p><span className="font-medium">Depth:</span> {item.dimensions.depth.imperial}" ({item.dimensions.depth.metric}mm)</p>
                    )}
                  </div>
                </div>
              )}

              {/* Chassis Info (Servers/Switches) */}
              {item.chassis && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2 text-sm uppercase tracking-wide">Chassis</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                    <p><span className="font-medium">Form Factor:</span> {item.chassis.formFactor}</p>
                    <p><span className="font-medium">Rack Units:</span> {item.chassis.rackUnits}U</p>
                    {item.chassis.weight?.max && (
                      <p><span className="font-medium">Max Weight:</span> {item.chassis.weight.max.imperial} lbs ({item.chassis.weight.max.metric} kg)</p>
                    )}
                  </div>
                </div>
              )}

              {/* Physical Info (Switches) */}
              {item.physical?.chassis && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2 text-sm uppercase tracking-wide">Physical</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                    <p><span className="font-medium">Rack Units:</span> {item.physical.chassis.rackUnits}U</p>
                    {item.physical.chassis.weight && (
                      <p><span className="font-medium">Weight:</span> {item.physical.chassis.weight.imperial} lbs ({item.physical.chassis.weight.metric} kg)</p>
                    )}
                    {item.physical.cooling?.airflow && (
                      <p><span className="font-medium">Airflow:</span> {item.physical.cooling.airflow}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Technical Specs */}
            <div className="space-y-4">
              {/* Compute (Servers) */}
              {item.compute && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2 text-sm uppercase tracking-wide">Compute</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                    {item.compute.processors && <p><span className="font-medium">Processors:</span> {item.compute.processors.model}</p>}
                    {item.compute.memory && <p><span className="font-medium">Memory:</span> {item.compute.memory.maxCapacity} {item.compute.memory.type}</p>}
                    {item.compute.gpu?.model && <p><span className="font-medium">GPU:</span> {item.compute.gpu.count}x {item.compute.gpu.model}</p>}
                    {item.compute.storage && <p><span className="font-medium">Storage:</span> {item.compute.storage.bays}</p>}
                  </div>
                </div>
              )}

              {/* Ports (Switches) */}
              {item.ports && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2 text-sm uppercase tracking-wide">Ports</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                    <p><span className="font-medium">Total:</span> {item.ports.total}</p>
                    {item.ports.types?.map((pt: any, i: number) => (
                      <p key={i}><span className="font-medium">{pt.count}x {pt.type}:</span> {pt.speed}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Performance (Switches) */}
              {item.performance && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2 text-sm uppercase tracking-wide">Performance</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                    {item.performance.switchingCapacity && <p><span className="font-medium">Capacity:</span> {item.performance.switchingCapacity}</p>}
                    {item.performance.latency && <p><span className="font-medium">Latency:</span> {item.performance.latency}</p>}
                  </div>
                </div>
              )}

              {/* Power */}
              {item.power && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2 text-sm uppercase tracking-wide">Power</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                    {item.power.powerSupply && <p><span className="font-medium">PSU:</span> {item.power.powerSupply}</p>}
                    {item.power.quantity && <p><span className="font-medium">Quantity:</span> {item.power.quantity}</p>}
                    {item.power.maxConsumption && <p><span className="font-medium">Max Consumption:</span> {item.power.maxConsumption}</p>}
                    {item.power.supplies && <p><span className="font-medium">Supplies:</span> {item.power.supplies}</p>}
                  </div>
                </div>
              )}

              {/* Electrical (PDUs) */}
              {item.electrical && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2 text-sm uppercase tracking-wide">Electrical</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                    {item.electrical.input && (
                      <>
                        <p><span className="font-medium">Input:</span> {item.electrical.input.voltage}, {item.electrical.input.current}</p>
                        <p><span className="font-medium">Max Power:</span> {item.electrical.input.maxPower}</p>
                      </>
                    )}
                    {item.electrical.output?.outlets && (
                      <div>
                        <p className="font-medium">Outlets:</p>
                        {item.electrical.output.outlets.map((o: any, i: number) => (
                          <p key={i} className="ml-4 text-xs">{o.quantity}x {o.type}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Technical Specs (Cables/Transceivers) */}
              {item.technicalSpecs && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2 text-sm uppercase tracking-wide">Technical Specs</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                    {item.technicalSpecs.bandwidth && <p><span className="font-medium">Bandwidth:</span> {item.technicalSpecs.bandwidth}</p>}
                    {item.technicalSpecs.frequency && <p><span className="font-medium">Frequency:</span> {item.technicalSpecs.frequency}</p>}
                    {item.technicalSpecs.gauge && <p><span className="font-medium">Gauge:</span> {item.technicalSpecs.gauge}</p>}
                  </div>
                </div>
              )}

              {/* Connector/Type (Transceivers/Cables) */}
              {(item.connector || item.formFactor || item.dataRate) && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2 text-sm uppercase tracking-wide">Connectivity</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                    {item.formFactor && <p><span className="font-medium">Form Factor:</span> {item.formFactor}</p>}
                    {item.connector && <p><span className="font-medium">Connector:</span> {item.connector}</p>}
                    {item.dataRate && <p><span className="font-medium">Data Rate:</span> {item.dataRate}</p>}
                    {item.wavelength && <p><span className="font-medium">Wavelength:</span> {item.wavelength}</p>}
                    {item.reach && <p><span className="font-medium">Reach:</span> {item.reach.value} {item.reach.unit} {item.reach.conditions && `(${item.reach.conditions})`}</p>}
                  </div>
                </div>
              )}

              {/* Compliance */}
              {item.compliance && item.compliance.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2 text-sm uppercase tracking-wide">Compliance</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex flex-wrap gap-2">
                      {item.compliance.map((comp: string, i: number) => (
                        <span key={i} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                          {comp}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Links */}
              {item.links && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2 text-sm uppercase tracking-wide">Links</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                    {item.links.manufacturer && (
                      <a href={item.links.manufacturer} target="_blank" rel="noopener noreferrer" className="block text-primary-600 hover:text-primary-700 hover:underline">
                        🌐 Manufacturer Website
                      </a>
                    )}
                    {item.links.productPage && (
                      <a href={item.links.productPage} target="_blank" rel="noopener noreferrer" className="block text-primary-600 hover:text-primary-700 hover:underline">
                        📄 Product Page
                      </a>
                    )}
                    {item.links.datasheet && (
                      <a href={item.links.datasheet} target="_blank" rel="noopener noreferrer" className="block text-primary-600 hover:text-primary-700 hover:underline">
                        📋 Datasheet
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
