import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { ConnectionType, Equipment } from './datacenterCore';
import { useDatacenterStore } from '../store/useDatacenterStore';
import { NodeSpecifications } from './datacenterCore/nodes';
import { SwitchSpecifications } from './datacenterCore/switches';
import { TransceiverSpecifications } from './datacenterCore/qsfps';
import SelectConnectionModal from './SelectConnectionModal';

interface AddEquipmentModalProps {
  cabinetId: string;
  onClose: () => void;
}

type EquipmentMode = 'manual' | 'server' | 'switch';

export default function AddEquipmentModal({ cabinetId, onClose }: AddEquipmentModalProps) {
  const addEquipment = useDatacenterStore(state => state.addEquipment);
  const getAvailableQuantity = useDatacenterStore(state => state.getAvailableQuantity);
  const deployFromInventory = useDatacenterStore(state => state.deployFromInventory);
  
  const [mode, setMode] = useState<EquipmentMode>('manual');
  const [selectedModel, setSelectedModel] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    rackUnit: 1,
    height: 1,
    connectionType: 'ethernet' as ConnectionType,
    connectsTo: '',
  });

  const [selectedConnectionTypes, setSelectedConnectionTypes] = useState<ConnectionType[]>(['ethernet']);

  const [transceivers, setTransceivers] = useState<Array<{ model: string, quantity: number }>>([]);
  const [newTransceiver, setNewTransceiver] = useState({ model: '', quantity: 1 });
  const [showConnectionModal, setShowConnectionModal] = useState(false);

  // Check stock availability
  const availableStock = mode !== 'manual' && selectedModel
    ? getAvailableQuantity(mode === 'server' ? 'nodes' : 'switches', selectedModel)
    : Infinity;

  // Get port capacity from selected spec
  const selectedServerSpec = mode === 'server' ? NodeSpecifications.find(s => s.model === selectedModel) : null;
  const selectedSwitchSpec = mode === 'switch' ? SwitchSpecifications.find(s => s.model === selectedModel) : null;
  
  const maxFiberPorts = mode === 'server'
    ? selectedServerSpec?.networking?.portCapacity?.fiber || 999
    : selectedSwitchSpec?.portCapacity?.fiber || 999;
  const currentTransceiverCount = transceivers.reduce((sum, t) => sum + t.quantity, 0);

  // Auto-fill form when a predefined model is selected
  useEffect(() => {
    if (mode === 'manual' || !selectedModel) return;

    let spec: any = null;
    if (mode === 'server') {
      spec = NodeSpecifications.find(s => s.model === selectedModel);
    } else if (mode === 'switch') {
      spec = SwitchSpecifications.find(s => s.model === selectedModel);
    }

    if (spec) {
      let connType: ConnectionType = 'ethernet';
      const hasFiber = spec.networking?.options?.some((opt: string) => opt.toLowerCase().includes('fiber') || opt.toLowerCase().includes('qsfp') || opt.toLowerCase().includes('osfp')) ||
                       spec.ports?.types?.some((t: any) => t.type.toLowerCase().includes('qsfp') || t.type.toLowerCase().includes('osfp') || t.type.toLowerCase().includes('sfp'));
      
      if (hasFiber) {
        connType = 'fiber';
      }

      const height = mode === 'server' ? spec.chassis.rackUnits : spec.physical.chassis.rackUnits;

      // For servers/switches, default to both if they have fiber capability
      const types: ConnectionType[] = hasFiber ? ['ethernet', 'fiber'] : ['ethernet'];
      
      setFormData(prev => ({
        ...prev,
        name: `${spec.manufacturer} ${spec.model}`,
        height: height || 1,
        connectionType: connType
      }));
      
      setSelectedConnectionTypes(types);
    }
  }, [mode, selectedModel]);

  const handleAddTransceiver = () => {
    if (!newTransceiver.model || newTransceiver.quantity < 1) return;
    
    // Check port capacity
    if (selectedConnectionTypes.includes('fiber')) {
      const wouldExceedCapacity = currentTransceiverCount + newTransceiver.quantity > maxFiberPorts;
      if (wouldExceedCapacity) {
        alert(`This equipment only supports ${maxFiberPorts} fiber ports. Currently: ${currentTransceiverCount}. Cannot add ${newTransceiver.quantity} more.`);
        return;
      }
    }
    
    const available = getAvailableQuantity('transceivers', newTransceiver.model);
    if (available < newTransceiver.quantity) {
      alert(`Only ${available} units of ${newTransceiver.model} available in stock. Please add more to inventory first.`);
      return;
    }
    
    setTransceivers([...transceivers, { ...newTransceiver }]);
    setNewTransceiver({ model: '', quantity: 1 });
  };

  const handleRemoveTransceiver = (index: number) => {
    setTransceivers(transceivers.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check and deploy from inventory if not manual
    if (mode !== 'manual' && selectedModel) {
      const success = deployFromInventory(
        mode === 'server' ? 'nodes' : 'switches',
        selectedModel,
        1
      );
      
      if (!success) {
        alert(`No stock available for ${selectedModel}. Please add to inventory first in the Inventory → Stock tab.`);
        return;
      }
    }

    // Deploy transceivers from inventory
    for (const trans of transceivers) {
      const success = deployFromInventory('transceivers', trans.model, trans.quantity);
      if (!success) {
        alert(`Not enough stock for ${trans.model}. Available: ${getAvailableQuantity('transceivers', trans.model)}. Please add to inventory first.`);
        return;
      }
    }

    const equipment: Equipment = {
      id: `eq-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: formData.name,
      rackUnit: formData.rackUnit,
      height: formData.height,
      connectionType: selectedConnectionTypes[0] || 'ethernet', // Primary type
      connectionTypes: selectedConnectionTypes.length > 1 ? selectedConnectionTypes : undefined,
      connectsTo: formData.connectsTo || undefined,
      transceivers: transceivers.length > 0 ? [...transceivers] : undefined, // Create new array to ensure reactivity
    };

    console.log('Adding equipment with transceivers:', equipment);
    addEquipment(cabinetId, equipment);
    
    // Show confirmation
    if (transceivers.length > 0) {
      const totalCount = transceivers.reduce((sum, t) => sum + t.quantity, 0);
      console.log(`Added ${totalCount} transceivers to equipment`);
    }
    
    onClose();
  };

  const totalTransceivers = transceivers.reduce((sum, t) => sum + t.quantity, 0);
  
  // Check if any transceivers have insufficient stock
  const hasInsufficientTransceiverStock = transceivers.some(trans => 
    getAvailableQuantity('transceivers', trans.model) < trans.quantity
  );
  
  // Can submit if: manual mode OR (has stock AND no transceiver issues) AND has at least one connection type
  const canSubmit = selectedConnectionTypes.length > 0 && (
    mode === 'manual' 
      ? !hasInsufficientTransceiverStock
      : (availableStock > 0 && !hasInsufficientTransceiverStock)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800">Add Equipment</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-6 space-y-4">
          {/* Spec Selection Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-lg mb-4">
            <button
              type="button"
              onClick={() => { setMode('manual'); setSelectedModel(''); setFormData(p => ({...p, height: 1})); }}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${mode === 'manual' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Manual
            </button>
            <button
              type="button"
              onClick={() => { setMode('server'); setSelectedModel(''); }}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${mode === 'server' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Server
            </button>
            <button
              type="button"
              onClick={() => { setMode('switch'); setSelectedModel(''); }}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${mode === 'switch' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Switch
            </button>
          </div>

          {/* Model Dropdown (if not manual) */}
          {mode !== 'manual' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select {mode === 'server' ? 'Server Node' : 'Switch'}
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select a model...</option>
                {mode === 'server' ? (
                  NodeSpecifications.map(spec => {
                    const available = getAvailableQuantity('nodes', spec.model);
                    return (
                      <option key={spec.model} value={spec.model}>
                        {spec.manufacturer} {spec.model} ({spec.chassis.rackUnits}U) - {available} available
                      </option>
                    );
                  })
                ) : (
                  SwitchSpecifications.map(spec => {
                    const available = getAvailableQuantity('switches', spec.model);
                    return (
                      <option key={spec.model} value={spec.model}>
                        {spec.manufacturer} {spec.model} ({spec.physical.chassis.rackUnits}U) - {available} available
                      </option>
                    );
                  })
                )}
              </select>
              
              {selectedModel && availableStock === 0 && (
                <div className="flex items-center gap-2 mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  <AlertCircle size={16} />
                  <span>No stock available. Add to inventory first.</span>
                </div>
              )}
              {selectedModel && availableStock > 0 && (
                <div className="flex items-center gap-2 mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                  <span className="font-semibold">{availableStock}</span> units available in stock
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Equipment Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g., Switch 1, Server A"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Position (U) *
              </label>
              <input
                type="number"
                required
                min="1"
                max="48"
                value={formData.rackUnit}
                onChange={(e) => setFormData({ ...formData, rackUnit: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Height (U) *
              </label>
              <input
                type="number"
                required
                min="1"
                max="48"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: parseInt(e.target.value) })}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${mode !== 'manual' ? 'bg-gray-100' : ''}`}
                readOnly={mode !== 'manual' && !!selectedModel}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Connection Types *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedConnectionTypes.includes('ethernet')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedConnectionTypes([...selectedConnectionTypes, 'ethernet']);
                    } else {
                      setSelectedConnectionTypes(selectedConnectionTypes.filter(t => t !== 'ethernet'));
                    }
                  }}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Ethernet (Copper)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedConnectionTypes.includes('fiber')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedConnectionTypes([...selectedConnectionTypes, 'fiber']);
                    } else {
                      setSelectedConnectionTypes(selectedConnectionTypes.filter(t => t !== 'fiber'));
                    }
                  }}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Fiber Optic</span>
              </label>
            </div>
            {selectedConnectionTypes.length === 0 && (
              <p className="text-xs text-red-600 mt-1">Please select at least one connection type</p>
            )}
          </div>

          {/* Transceiver Selection (for Fiber connections) */}
          {selectedConnectionTypes.includes('fiber') && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                  <span className="text-blue-600">Fiber Transceivers</span>
                  {totalTransceivers > 0 && (
                    <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                      {totalTransceivers} selected
                    </span>
                  )}
                </h4>
                {mode !== 'manual' && maxFiberPorts < 999 && (
                  <div className="text-xs text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                    <span className={currentTransceiverCount >= maxFiberPorts ? 'text-red-600 font-bold' : 'font-semibold'}>
                      {currentTransceiverCount}/{maxFiberPorts}
                    </span> ports used
                  </div>
                )}
              </div>

              {/* Add Transceiver Form */}
              <div className="flex gap-2">
                <select
                  value={newTransceiver.model}
                  onChange={(e) => setNewTransceiver({ ...newTransceiver, model: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select transceiver...</option>
                  {TransceiverSpecifications
                    .filter(spec => getAvailableQuantity('transceivers', spec.model) > 0)
                    .map((spec) => {
                      const available = getAvailableQuantity('transceivers', spec.model);
                      return (
                        <option key={spec.model} value={spec.model}>
                          {spec.manufacturer} {spec.model} ({spec.formFactor}) - {available} available
                        </option>
                      );
                    })}
                </select>
                <input
                  type="number"
                  min="1"
                  value={newTransceiver.quantity}
                  onChange={(e) => setNewTransceiver({ ...newTransceiver, quantity: parseInt(e.target.value) })}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Qty"
                />
                <button
                  type="button"
                  onClick={handleAddTransceiver}
                  disabled={!newTransceiver.model}
                  className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
                >
                  Add
                </button>
              </div>

              {/* Transceiver List */}
              {transceivers.length > 0 ? (
                <div className="space-y-2 mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-blue-700">
                      {transceivers.length} type(s), {totalTransceivers} total units
                    </p>
                    <p className="text-xs text-gray-600">Will be installed with equipment</p>
                  </div>
                  {transceivers.map((trans, idx) => {
                    const spec = TransceiverSpecifications.find(s => s.model === trans.model);
                    const available = getAvailableQuantity('transceivers', trans.model);
                    return (
                      <div key={idx} className={`flex items-center justify-between p-3 rounded-lg border ${
                        available >= trans.quantity ? 'bg-white border-green-300 border-2' : 'bg-red-50 border-red-200'
                      }`}>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{spec?.manufacturer} {trans.model}</p>
                          <p className="text-xs text-gray-600">
                            Qty: <span className="font-bold">{trans.quantity}</span> • Available in stock: <span className="font-bold">{available}</span>
                          </p>
                          {available < trans.quantity && (
                            <p className="text-xs text-red-600 font-semibold mt-1">⚠️ Insufficient stock!</p>
                          )}
                          {available >= trans.quantity && (
                            <p className="text-xs text-green-600 font-semibold mt-1">✓ Ready to deploy</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveTransceiver(idx)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : null}
              
              {TransceiverSpecifications.filter(s => getAvailableQuantity('transceivers', s.model) > 0).length === 0 && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <p className="font-semibold">⚠️ No transceivers in stock</p>
                  <p className="text-xs mt-1">Go to Inventory → Stock to add transceivers before configuring fiber connections.</p>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Connects To (Optional)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.connectsTo}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                placeholder="Click 'Select' to choose equipment..."
              />
              <button
                type="button"
                onClick={() => setShowConnectionModal(true)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Select
              </button>
              {formData.connectsTo && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, connectsTo: '' })}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Add Equipment
            </button>
          </div>
        </form>
      </div>
      
      {showConnectionModal && (
        <SelectConnectionModal
          currentCabinetId={cabinetId}
          transceivers={transceivers}
          onSelect={(_cabId, _eqId, eqName) => {
            setFormData({ ...formData, connectsTo: eqName });
            setShowConnectionModal(false);
          }}
          onClose={() => setShowConnectionModal(false)}
        />
      )}
    </div>
  );
}
