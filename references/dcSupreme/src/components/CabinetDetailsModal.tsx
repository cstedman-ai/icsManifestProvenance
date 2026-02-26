import { useState } from 'react';
import { X, Plus, Trash2, Edit2, Zap } from 'lucide-react';
import { Cabinet, Equipment } from './datacenterCore';
import { useDatacenterStore } from '../store/useDatacenterStore';
import AddEquipmentModal from './AddEquipmentModal';
import EditEquipmentModal from './EditEquipmentModal';
import { CabinetSpecifications } from './datacenterCore/cabinets';
import { TransceiverSpecifications } from './datacenterCore/qsfps';
import { NodeSpecifications } from './datacenterCore/nodes';
import { SwitchSpecifications } from './datacenterCore/switches';
import { PDUSpecifications } from './datacenterCore/pdus';

interface CabinetDetailsModalProps {
  cabinet: Cabinet;
  onClose: () => void;
}

export default function CabinetDetailsModal({ cabinet, onClose }: CabinetDetailsModalProps) {
  const [showAddEquipment, setShowAddEquipment] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const removeEquipment = useDatacenterStore(state => state.removeEquipment);
  const updateCabinet = useDatacenterStore(state => state.updateCabinet);
  const returnToInventory = useDatacenterStore(state => state.returnToInventory);
  
  const sortedEquipment = [...cabinet.equipment].sort((a, b) => a.rackUnit - b.rackUnit);

  const handleRemoveEquipment = (equipmentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const equipment = cabinet.equipment.find(eq => eq.id === equipmentId);
    if (!equipment) return;
    
    if (confirm('Are you sure you want to remove this equipment? It will be returned to inventory.')) {
      // Return transceivers to inventory
      if (equipment.transceivers) {
        equipment.transceivers.forEach(trans => {
          returnToInventory('transceivers', trans.model, trans.quantity);
        });
      }
      
      // Return equipment to inventory if it's from a known spec
      const isNode = NodeSpecifications.some(s => equipment.name.includes(s.model));
      const isSwitch = SwitchSpecifications.some(s => equipment.name.includes(s.model));
      
      if (isNode) {
        const spec = NodeSpecifications.find(s => equipment.name.includes(s.model));
        if (spec) returnToInventory('nodes', spec.model, 1);
      } else if (isSwitch) {
        const spec = SwitchSpecifications.find(s => equipment.name.includes(s.model));
        if (spec) returnToInventory('switches', spec.model, 1);
      }
      
      removeEquipment(cabinet.id, equipmentId);
    }
  };

  const currentSpec = CabinetSpecifications.find(s => s.model === cabinet.specificationModel) || CabinetSpecifications[0];
  const totalUsedUnits = cabinet.equipment.reduce((sum, eq) => sum + (eq.height || 1), 0);

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                Cabinet #{cabinet.number}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Row {cabinet.row + 1}, Position {cabinet.position + 1} • Location: ({cabinet.x}ft, {cabinet.y}ft)
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Cabinet Spec Selector */}
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Cabinet Model</label>
              <select
                value={cabinet.specificationModel || currentSpec.model}
                onChange={(e) => updateCabinet(cabinet.id, { specificationModel: e.target.value })}
                className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                {CabinetSpecifications.map((spec) => (
                  <option key={spec.model} value={spec.model}>
                    {spec.manufacturer} {spec.model} ({spec.rackUnits}U)
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-4 text-sm text-gray-600">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-gray-500 uppercase">Height</span>
                <span>{currentSpec.rackUnits}U</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-gray-500 uppercase">Max Load</span>
                <span>{currentSpec.weight.maxStaticLoad.imperial} lbs</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-gray-500 uppercase">Depth</span>
                <span>{currentSpec.dimensions.depth.imperial}"</span>
              </div>
            </div>
          </div>

          {/* PDU Section */}
          <div className="px-6 py-3 bg-yellow-50 border-b border-yellow-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <Zap size={18} className="text-yellow-600" />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 text-sm">Power Distribution Units (PDUs)</h4>
                  {cabinet.pdus && cabinet.pdus.length > 0 ? (
                    <div className="flex gap-4 mt-1 flex-wrap">
                      {cabinet.pdus.map((pdu, idx) => {
                        const spec = PDUSpecifications.find(s => s.model === pdu.model);
                        return (
                          <div key={idx} className="flex items-center gap-2 bg-white px-2 py-1 rounded border border-yellow-300">
                            <div className="text-xs text-gray-700">
                              <span className="font-semibold">{pdu.quantity}x</span> {spec?.manufacturer} {pdu.model}
                              <span className="text-gray-500 ml-1">({spec?.electrical.input.maxPower})</span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const newPdus = cabinet.pdus?.filter((_, i) => i !== idx) || [];
                                updateCabinet(cabinet.id, { pdus: newPdus });
                              }}
                              className="text-red-600 hover:bg-red-50 rounded p-0.5"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-600 mt-1">No PDUs configured</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  const totalPdus = (cabinet.pdus || []).reduce((sum, p) => sum + p.quantity, 0);
                  if (totalPdus >= 4) {
                    alert('Maximum 4 PDUs per cabinet');
                    return;
                  }
                  const model = PDUSpecifications[0]?.model || 'EN6950';
                  const existingPdus = cabinet.pdus || [];
                  const existing = existingPdus.find(p => p.model === model);
                  if (existing) {
                    const newPdus = existingPdus.map(p => 
                      p.model === model ? { ...p, quantity: Math.min(p.quantity + 1, 4) } : p
                    );
                    updateCabinet(cabinet.id, { pdus: newPdus });
                  } else {
                    updateCabinet(cabinet.id, { pdus: [...existingPdus, { model, quantity: 1 }] });
                  }
                }}
                disabled={(cabinet.pdus || []).reduce((sum, p) => sum + p.quantity, 0) >= 4}
                className="flex items-center gap-1 px-3 py-1.5 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-xs disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Plus size={14} />
                Add PDU
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-700">Equipment List</h4>
              <button
                onClick={() => setShowAddEquipment(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus size={18} />
                Add Equipment
              </button>
            </div>

            {sortedEquipment.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No equipment installed in this cabinet.</p>
                <p className="text-sm mt-2">Click "Add Equipment" to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedEquipment.map((equipment) => {
                  const transceiverCount = equipment.transceivers?.reduce((sum, t) => sum + t.quantity, 0) || 0;
                  console.log('Equipment:', equipment.name, 'Transceivers:', equipment.transceivers, 'Count:', transceiverCount);
                  
                  return (
                    <div
                      key={equipment.id}
                      onClick={() => setEditingEquipment(equipment)}
                      className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors group"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-sm font-semibold text-gray-600 bg-white px-2 py-1 rounded border border-gray-300" title={`Height: ${equipment.height || 1}U`}>
                            U{equipment.rackUnit}
                            {(equipment.height || 1) > 1 && `-${equipment.rackUnit + (equipment.height || 1) - 1}`}
                          </span>
                          <span className="font-medium text-gray-800">
                            {equipment.name}
                          </span>
                        {/* Show all connection types */}
                        {(equipment.connectionTypes || [equipment.connectionType]).map((type, idx) => (
                          <span key={idx} className={`text-xs px-2 py-1 rounded-full font-semibold ${
                            type === 'fiber'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            {type === 'fiber' 
                              ? `Fiber${transceiverCount > 0 ? ` (${transceiverCount})` : ''}`
                              : 'Ethernet'}
                          </span>
                        ))}
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {equipment.height || 1}U
                          </span>
                          {transceiverCount > 0 && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded font-semibold">
                              🔌 {transceiverCount} Transceivers
                            </span>
                          )}
                          <Edit2 size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        
                        {/* Transceivers Display with Numbering */}
                        {equipment.transceivers && equipment.transceivers.length > 0 && (
                          <div className="mt-2 ml-16 space-y-1">
                            <p className="text-xs font-semibold text-gray-600">Transceivers (Numbered):</p>
                            {equipment.transceivers.map((trans, typeIdx) => {
                              const spec = TransceiverSpecifications.find(s => s.model === trans.model);
                              return (
                                <div key={typeIdx} className="text-xs text-gray-700">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                    <span className="font-semibold">{spec?.manufacturer} {trans.model} ({spec?.formFactor})</span>
                                  </div>
                                  <div className="ml-4 flex flex-wrap gap-1">
                                    {Array.from({ length: trans.quantity }, (_, i) => (
                                      <span key={i} className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-[10px] font-bold rounded">
                                        {i + 1}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        
                        {equipment.connectsTo && (
                          <p className="text-sm text-gray-600 mt-1 ml-16">
                            Connects to: {equipment.connectsTo}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={(e) => handleRemoveEquipment(equipment.id, e)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                Total Equipment: <span className="font-semibold">{cabinet.equipment.length}</span>
              </span>
              <span className="text-gray-600">
                Rack Units Used: <span className="font-semibold">{totalUsedUnits}/{currentSpec.rackUnits}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {showAddEquipment && (
        <AddEquipmentModal
          cabinetId={cabinet.id}
          onClose={() => setShowAddEquipment(false)}
        />
      )}

      {editingEquipment && (
        <EditEquipmentModal
          cabinetId={cabinet.id}
          equipment={editingEquipment}
          onClose={() => setEditingEquipment(null)}
        />
      )}
    </>
  );
}
