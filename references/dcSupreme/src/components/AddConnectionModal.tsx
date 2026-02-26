import { useState } from 'react';
import { X } from 'lucide-react';
import { Connection } from './datacenterCore';
import { useDatacenterStore } from '../store/useDatacenterStore';

interface AddConnectionModalProps {
  onClose: () => void;
}

export default function AddConnectionModal({ onClose }: AddConnectionModalProps) {
  const cabinets = useDatacenterStore(state => state.cabinets);
  const addConnection = useDatacenterStore(state => state.addConnection);
  const calculateCableLength = useDatacenterStore(state => state.calculateCableLength);

  const [formData, setFormData] = useState({
    fromCabinetId: '',
    fromEquipmentId: '',
    toCabinetId: '',
    toEquipmentId: '',
  });

  const cabinetsWithEquipment = cabinets.filter(c => c.equipment.length > 0);

  const fromCabinet = cabinets.find(c => c.id === formData.fromCabinetId);
  const toCabinet = cabinets.find(c => c.id === formData.toCabinetId);

  const fromEquipment = fromCabinet?.equipment.find(e => e.id === formData.fromEquipmentId);
  const toEquipment = toCabinet?.equipment.find(e => e.id === formData.toEquipmentId);

  const canSubmit = formData.fromCabinetId && formData.fromEquipmentId && 
                    formData.toCabinetId && formData.toEquipmentId &&
                    fromEquipment && toEquipment;

  const estimatedLength = canSubmit && fromEquipment && toEquipment
    ? calculateCableLength(
        formData.fromCabinetId,
        fromEquipment.rackUnit,
        formData.toCabinetId,
        toEquipment.rackUnit
      )
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canSubmit || !fromEquipment || !toEquipment) return;

    const connection: Connection = {
      id: `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      fromCabinetId: formData.fromCabinetId,
      fromEquipmentId: formData.fromEquipmentId,
      toCabinetId: formData.toCabinetId,
      toEquipmentId: formData.toEquipmentId,
      connectionType: fromEquipment.connectionType,
      length: estimatedLength,
    };

    addConnection(connection);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800">Add Connection</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* From Section */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-3">From</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Source Cabinet *
                </label>
                <select
                  required
                  value={formData.fromCabinetId}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    fromCabinetId: e.target.value,
                    fromEquipmentId: '' 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select cabinet...</option>
                  {cabinetsWithEquipment.map(cabinet => (
                    <option key={cabinet.id} value={cabinet.id}>
                      Cabinet #{cabinet.number} (Row {cabinet.row + 1}, Pos {cabinet.position + 1})
                    </option>
                  ))}
                </select>
              </div>

              {fromCabinet && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Source Equipment *
                  </label>
                  <select
                    required
                    value={formData.fromEquipmentId}
                    onChange={(e) => setFormData({ ...formData, fromEquipmentId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select equipment...</option>
                    {fromCabinet.equipment.map(eq => (
                      <option key={eq.id} value={eq.id}>
                        {eq.name} (U{eq.rackUnit}) - {eq.connectionType}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* To Section */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-3">To</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destination Cabinet *
                </label>
                <select
                  required
                  value={formData.toCabinetId}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    toCabinetId: e.target.value,
                    toEquipmentId: '' 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select cabinet...</option>
                  {cabinetsWithEquipment.map(cabinet => (
                    <option key={cabinet.id} value={cabinet.id}>
                      Cabinet #{cabinet.number} (Row {cabinet.row + 1}, Pos {cabinet.position + 1})
                    </option>
                  ))}
                </select>
              </div>

              {toCabinet && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destination Equipment *
                  </label>
                  <select
                    required
                    value={formData.toEquipmentId}
                    onChange={(e) => setFormData({ ...formData, toEquipmentId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select equipment...</option>
                    {toCabinet.equipment.map(eq => (
                      <option key={eq.id} value={eq.id}>
                        {eq.name} (U{eq.rackUnit}) - {eq.connectionType}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Connection Info */}
          {canSubmit && fromEquipment && toEquipment && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Connection Summary</h4>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-gray-600">Type:</span>{' '}
                  <span className={`font-semibold ${
                    fromEquipment.connectionType === 'fiber' ? 'text-blue-700' : 'text-orange-700'
                  }`}>
                    {fromEquipment.connectionType === 'fiber' ? 'Fiber Optic' : 'Ethernet'}
                  </span>
                </p>
                <p>
                  <span className="text-gray-600">Estimated Cable Length:</span>{' '}
                  <span className="font-semibold text-gray-900">{estimatedLength} feet</span>
                </p>
                {fromEquipment.connectionType !== toEquipment.connectionType && (
                  <p className="text-red-600 font-medium mt-2">
                    ⚠️ Warning: Connection types don't match!
                  </p>
                )}
              </div>
            </div>
          )}

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
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Add Connection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

