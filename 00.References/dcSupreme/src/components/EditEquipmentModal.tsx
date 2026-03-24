import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { ConnectionType, Equipment } from './datacenterCore';
import { useDatacenterStore } from '../store/useDatacenterStore';
import { TransceiverSpecifications } from './datacenterCore/qsfps';
import { NodeSpecifications } from './datacenterCore/nodes';
import { SwitchSpecifications } from './datacenterCore/switches';
import SelectConnectionModal from './SelectConnectionModal';

interface EditEquipmentModalProps {
  cabinetId: string;
  equipment: Equipment;
  onClose: () => void;
}

export default function EditEquipmentModal({ cabinetId, equipment, onClose }: EditEquipmentModalProps) {
  const updateEquipment = useDatacenterStore(state => state.updateEquipment);
  const getAvailableQuantity = useDatacenterStore(state => state.getAvailableQuantity);
  
  // Try to find the spec to get port capacity
  const nodeSpec = NodeSpecifications.find(s => equipment.name.includes(s.model));
  const switchSpec = SwitchSpecifications.find(s => equipment.name.includes(s.model));
  
  const maxFiberPorts = nodeSpec?.networking?.portCapacity?.fiber || 
                        switchSpec?.portCapacity?.fiber || 999;
  
  const [formData, setFormData] = useState({
    name: equipment.name,
    rackUnit: equipment.rackUnit,
    height: equipment.height || 1,
    connectionType: equipment.connectionType,
    connectsTo: equipment.connectsTo || '',
  });

  const [selectedConnectionTypes, setSelectedConnectionTypes] = useState<ConnectionType[]>(
    equipment.connectionTypes || [equipment.connectionType]
  );

  const [transceivers, setTransceivers] = useState<Array<{ model: string, quantity: number }>>(
    equipment.transceivers || []
  );
  const [newTransceiver, setNewTransceiver] = useState({ model: '', quantity: 1 });
  const [showConnectionModal, setShowConnectionModal] = useState(false);

  const handleAddTransceiver = () => {
    if (!newTransceiver.model || newTransceiver.quantity < 1) return;
    
    // Check port capacity
    const currentCount = transceivers.reduce((sum, t) => sum + t.quantity, 0);
    if (selectedConnectionTypes.includes('fiber')) {
      const wouldExceedCapacity = currentCount + newTransceiver.quantity > maxFiberPorts;
      if (wouldExceedCapacity) {
        alert(`This equipment only supports ${maxFiberPorts} fiber ports. Currently: ${currentCount}. Cannot add ${newTransceiver.quantity} more.`);
        return;
      }
    }
    
    setTransceivers([...transceivers, { ...newTransceiver }]);
    setNewTransceiver({ model: '', quantity: 1 });
  };

  const handleRemoveTransceiver = (index: number) => {
    setTransceivers(transceivers.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateEquipment(cabinetId, equipment.id, {
      name: formData.name,
      rackUnit: formData.rackUnit,
      height: formData.height,
      connectionType: selectedConnectionTypes[0] || 'ethernet',
      connectionTypes: selectedConnectionTypes.length > 1 ? selectedConnectionTypes : undefined,
      connectsTo: formData.connectsTo || undefined,
      transceivers: transceivers.length > 0 ? transceivers : undefined,
    });

    onClose();
  };

  const totalTransceivers = transceivers.reduce((sum, t) => sum + t.quantity, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800">Edit Equipment</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-6 space-y-4">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                      {totalTransceivers} installed
                    </span>
                  )}
                </h4>
                {maxFiberPorts < 999 && (
                  <div className="text-xs text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                    <span className={totalTransceivers >= maxFiberPorts ? 'text-red-600 font-bold' : 'font-semibold'}>
                      {totalTransceivers}/{maxFiberPorts}
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
                  className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <Plus size={18} />
                </button>
              </div>

              {/* Transceiver List */}
              {transceivers.length > 0 && (
                <div className="space-y-2 mt-3">
                  {transceivers.map((trans, idx) => {
                    const spec = TransceiverSpecifications.find(s => s.model === trans.model);
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{spec?.manufacturer} {trans.model}</p>
                          <p className="text-xs text-gray-600">
                            Qty: {trans.quantity} • {spec?.formFactor} • {spec?.dataRate}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveTransceiver(idx)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {transceivers.length === 0 && (
                <div>
                  <p className="text-xs text-gray-600 italic">No transceivers configured</p>
                  {TransceiverSpecifications.filter(s => getAvailableQuantity('transceivers', s.model) > 0).length === 0 && (
                    <p className="text-xs text-red-600 mt-1">⚠️ No transceivers in stock. Add to inventory first.</p>
                  )}
                </div>
              )}
              
              {TransceiverSpecifications.filter(s => getAvailableQuantity('transceivers', s.model) > 0).length === 0 && transceivers.length === 0 && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <p className="font-semibold">⚠️ No transceivers in stock</p>
                  <p className="text-xs mt-1">Go to Inventory → Stock to add transceivers.</p>
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
            <p className="text-xs text-gray-500 mt-1">
              Select target equipment from any cabinet
            </p>
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
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Save Changes
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

