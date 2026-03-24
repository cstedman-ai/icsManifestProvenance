import { Cabinet } from './datacenterCore';
import { Server, Zap } from 'lucide-react';
import { CabinetSpecifications } from './datacenterCore/cabinets';

interface CabinetCardProps {
  cabinet: Cabinet;
  onClick: () => void;
}

export default function CabinetCard({ cabinet, onClick }: CabinetCardProps) {
  const hasEquipment = cabinet.equipment.length > 0;
  
  // Count equipment that supports fiber or ethernet (including both)
  const fiberCount = cabinet.equipment.filter(e => 
    e.connectionType === 'fiber' || e.connectionTypes?.includes('fiber')
  ).length;
  const ethernetCount = cabinet.equipment.filter(e => 
    e.connectionType === 'ethernet' || e.connectionTypes?.includes('ethernet')
  ).length;
  
  const spec = CabinetSpecifications.find(s => s.model === cabinet.specificationModel) || CabinetSpecifications[0];
  const rackUnits = spec ? spec.rackUnits : 42;
  
  const totalUsedUnits = cabinet.equipment.reduce((sum, eq) => sum + (eq.height || 1), 0);
  const utilization = Math.round((totalUsedUnits / rackUnits) * 100);
  
  const totalPdus = (cabinet.pdus || []).reduce((sum, p) => sum + p.quantity, 0);

  return (
    <button
      onClick={onClick}
      className={`
        relative w-24 h-32 rounded-lg shadow-md transition-all hover:shadow-lg hover:scale-105
        ${hasEquipment ? 'bg-gradient-to-b from-green-400 to-green-600' : 'bg-gradient-to-b from-gray-300 to-gray-400'}
        border-2 border-gray-700 overflow-hidden
      `}
    >
      {/* Cabinet Number */}
      <div className="absolute top-1 left-0 right-0 text-center z-10">
        <span className="text-xs font-bold text-white bg-black bg-opacity-50 px-2 py-0.5 rounded">
          #{cabinet.number}
        </span>
      </div>

      {/* Cabinet Type Badge */}
      <div className="absolute top-1 right-1 z-10">
        <span className="text-[10px] font-bold text-white bg-blue-600 px-1 rounded opacity-80">
          {rackUnits}U
        </span>
      </div>

      {/* Equipment Icon */}
      <div className="absolute inset-0 flex items-center justify-center z-0">
        <Server size={32} className="text-white opacity-80" />
      </div>

      {/* Equipment Count */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1 z-10">
        {fiberCount > 0 && (
          <span className="text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded font-bold">
            F:{fiberCount}
          </span>
        )}
        {ethernetCount > 0 && (
          <span className="text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded font-bold">
            E:{ethernetCount}
          </span>
        )}
        {totalPdus > 0 && (
          <span className="text-xs bg-yellow-500 text-white px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5">
            <Zap size={10} />
            {totalPdus}
          </span>
        )}
      </div>

      {/* Utilization Bar */}
      {hasEquipment && (
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black bg-opacity-30">
          <div 
            className="h-full bg-yellow-400 transition-all duration-500"
            style={{ width: `${utilization}%` }}
            title={`${utilization}% Full`}
          />
        </div>
      )}
      
      {!hasEquipment && (
        <div className="absolute -bottom-1 left-2 right-2 h-2 bg-black bg-opacity-30 rounded-b-lg" />
      )}
    </button>
  );
}
