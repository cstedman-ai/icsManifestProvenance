import { useState } from 'react';
import { X, Search, Cable } from 'lucide-react';
import { useDatacenterStore } from '../store/useDatacenterStore';
import { TransceiverSpecifications } from './datacenterCore/qsfps';

interface SelectConnectionModalProps {
  currentCabinetId: string;
  currentEquipmentId?: string;
  transceivers: Array<{ model: string; quantity: number }>;
  onSelect: (cabinetId: string, equipmentId: string, equipmentName: string) => void;
  onClose: () => void;
}

export default function SelectConnectionModal({ 
  currentCabinetId, 
  transceivers,
  onSelect, 
  onClose 
}: SelectConnectionModalProps) {
  const cabinets = useDatacenterStore(state => state.cabinets);
  const dataHalls = useDatacenterStore(state => state.dataHalls);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHall, setSelectedHall] = useState<string>('all');

  // Get transceiver types for compatibility
  const transceiverTypes = transceivers.map(t => {
    const spec = TransceiverSpecifications.find(s => s.model === t.model);
    return spec?.formFactor;
  }).filter(Boolean);

  // Filter cabinets
  const filteredCabinets = cabinets.filter(cab => {
    // Exclude current cabinet
    if (cab.id === currentCabinetId) return false;
    
    // Only show cabinets with equipment
    if (cab.equipment.length === 0) return false;
    
    // Filter by hall
    if (selectedHall !== 'all' && cab.dataHallId !== selectedHall) return false;
    
    // Filter by search term
    if (searchTerm) {
      const matchesCabinet = cab.number.toString().includes(searchTerm);
      const matchesEquipment = cab.equipment.some(eq => 
        eq.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      return matchesCabinet || matchesEquipment;
    }
    
    return true;
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[80] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-primary-600 text-white flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">Select Connection Target</h3>
            <p className="text-sm opacity-90 mt-1">Choose equipment to connect to</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-primary-700 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Filters */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 space-y-3">
          <div className="flex gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search cabinets or equipment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            <select
              value={selectedHall}
              onChange={(e) => setSelectedHall(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Halls</option>
              {dataHalls.map(hall => (
                <option key={hall.id} value={hall.id}>{hall.name}</option>
              ))}
            </select>
          </div>
          
          {transceiverTypes.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Cable size={16} />
              <span>Compatible transceivers: {transceiverTypes.join(', ')}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {filteredCabinets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <Cable size={64} className="mb-4 text-gray-300" />
              <p className="text-lg font-medium">No compatible equipment found</p>
              <p className="text-sm mt-2">Try adjusting your search or hall filter</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCabinets.map(cabinet => {
                const hall = dataHalls.find(h => h.id === cabinet.dataHallId);
                return (
                  <div key={cabinet.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                      <h4 className="font-semibold text-gray-800">
                        Cabinet #{cabinet.number} - {hall?.name} (Row {cabinet.row + 1})
                      </h4>
                    </div>
                    <div className="p-4 space-y-2">
                      {cabinet.equipment.map(eq => {
                        const hasFiber = eq.connectionType === 'fiber' || eq.connectionTypes?.includes('fiber');
                        const hasCompatibleType = transceiverTypes.length === 0 || hasFiber;
                        
                        return (
                          <button
                            key={eq.id}
                            onClick={() => onSelect(cabinet.id, eq.id, `Cabinet #${cabinet.number} - ${eq.name}`)}
                            disabled={!hasCompatibleType}
                            className={`w-full text-left p-3 rounded-lg border transition-colors ${
                              hasCompatibleType
                                ? 'border-gray-200 bg-white hover:bg-primary-50 hover:border-primary-500'
                                : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-gray-800">{eq.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-gray-600">U{eq.rackUnit}</span>
                                  <span className="text-xs text-gray-400">•</span>
                                  <span className="text-xs text-gray-600">{eq.height || 1}U</span>
                                  {(eq.connectionTypes || [eq.connectionType]).map((type, idx) => (
                                    <span key={idx} className={`text-xs px-2 py-0.5 rounded-full ${
                                      type === 'fiber' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                                    }`}>
                                      {type}
                                    </span>
                                  ))}
                                  {eq.transceivers && eq.transceivers.length > 0 && (
                                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                                      {eq.transceivers.reduce((sum, t) => sum + t.quantity, 0)} transceivers
                                    </span>
                                  )}
                                </div>
                              </div>
                              {hasCompatibleType && (
                                <Cable size={18} className="text-primary-600" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            {filteredCabinets.length} cabinet(s) available
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

