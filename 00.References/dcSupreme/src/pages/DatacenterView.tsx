import { useState, useEffect } from 'react';
import { useDatacenterStore } from '../store/useDatacenterStore';
import CabinetCard from '../components/CabinetCard';
import CabinetDetailsModal from '../components/CabinetDetailsModal';
import { Plus, Building2 } from 'lucide-react';

export default function DatacenterView() {
  const cabinets = useDatacenterStore(state => state.cabinets);
  const dataHalls = useDatacenterStore(state => state.dataHalls);
  const addDataHall = useDatacenterStore(state => state.addDataHall);
  
  const [selectedCabinet, setSelectedCabinet] = useState<string | null>(null);
  const [activeHallId, setActiveHallId] = useState<string>('');
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (dataHalls.length > 0 && !activeHallId) {
      setActiveHallId(dataHalls[0].id);
    }
  }, [dataHalls, activeHallId]);

  const handleAddHall = () => {
    addDataHall();
    // Automatically switch to the new hall (it will be the last one)
    // We need to wait for store update, but we can just rely on user clicking it or effect
    // Actually, let's just let the user see it appear.
  };

  // Filter cabinets for active hall
  const activeCabinets = cabinets.filter(c => c.dataHallId === activeHallId);

  // Group cabinets by row
  const cabinetsByRow = activeCabinets.reduce((acc, cabinet) => {
    if (!acc[cabinet.row]) {
      acc[cabinet.row] = [];
    }
    acc[cabinet.row].push(cabinet);
    return acc;
  }, {} as Record<number, typeof cabinets>);

  const rows = Object.keys(cabinetsByRow)
    .map(Number)
    .sort((a, b) => a - b);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5));

  const cabinet = selectedCabinet 
    ? cabinets.find(c => c.id === selectedCabinet)
    : null;

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Datacenter Layout</h2>
            <p className="text-sm text-gray-600 mt-1">
              Visual representation of cabinets and pods
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={handleZoomOut}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                -
              </button>
              <span className="text-sm font-medium min-w-[60px] text-center">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Data Hall Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {dataHalls.map(hall => (
            <button
              key={hall.id}
              onClick={() => setActiveHallId(hall.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap
                ${activeHallId === hall.id 
                  ? 'bg-primary-600 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              <Building2 size={16} />
              {hall.name}
            </button>
          ))}
          <button
            onClick={handleAddHall}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm bg-white border border-dashed border-gray-300 text-primary-600 hover:bg-primary-50 transition-colors whitespace-nowrap"
          >
            <Plus size={16} />
            Add Hall
          </button>
        </div>
      </div>

      {/* Datacenter Floor Plan */}
      <div className="flex-1 overflow-auto p-8">
        <div 
          className="inline-block min-w-full"
          style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
        >
          {activeCabinets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <p>No cabinets in this data hall.</p>
            </div>
          ) : (
            <div className="space-y-12">
              {rows.map((rowNum, idx) => {
                const rowCabinets = cabinetsByRow[rowNum].sort((a, b) => a.position - b.position);
                const podNum = Math.floor(rowNum / 2);
                const rowInPod = rowNum % 2;
                
                return (
                  <div key={rowNum}>
                    {rowInPod === 0 && (
                      <div className="mb-4">
                        <div className="inline-block px-4 py-2 bg-primary-100 text-primary-700 rounded-lg font-semibold">
                          Pod {podNum + 1}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-sm font-semibold text-gray-700 min-w-[80px]">
                        Row {rowNum + 1}
                      </span>
                    </div>
                    
                    <div className="flex gap-4 flex-wrap">
                      {rowCabinets.map(cabinet => (
                        <CabinetCard
                          key={cabinet.id}
                          cabinet={cabinet}
                          onClick={() => setSelectedCabinet(cabinet.id)}
                        />
                      ))}
                    </div>
                    
                    {rowInPod === 1 && idx < rows.length - 1 && (
                      <div className="mt-8 border-t-2 border-dashed border-gray-300" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white border-t border-gray-200 px-6 py-3">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Has Equipment</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-300 rounded"></div>
            <span>Empty</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span>Fiber Connections</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span>Ethernet Connections</span>
          </div>
        </div>
      </div>

      {/* Cabinet Details Modal */}
      {cabinet && (
        <CabinetDetailsModal
          cabinet={cabinet}
          onClose={() => setSelectedCabinet(null)}
        />
      )}
    </div>
  );
}
