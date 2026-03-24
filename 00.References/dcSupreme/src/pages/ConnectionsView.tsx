import { useState } from 'react';
import { Plus, Trash2, Cable as CableIcon } from 'lucide-react';
import { useDatacenterStore } from '../store/useDatacenterStore';
import AddConnectionModal from '../components/AddConnectionModal';

export default function ConnectionsView() {
  const connections = useDatacenterStore(state => state.connections);
  const cabinets = useDatacenterStore(state => state.cabinets);
  const removeConnection = useDatacenterStore(state => state.removeConnection);
  const [showAddConnection, setShowAddConnection] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'fiber' | 'ethernet'>('all');

  const getCabinetNumber = (cabinetId: string) => {
    return cabinets.find(c => c.id === cabinetId)?.number || '?';
  };

  const getEquipmentName = (cabinetId: string, equipmentId: string) => {
    const cabinet = cabinets.find(c => c.id === cabinetId);
    const equipment = cabinet?.equipment.find(e => e.id === equipmentId);
    return equipment?.name || 'Unknown';
  };

  const filteredConnections = connections.filter(conn => {
    if (filterType === 'all') return true;
    return conn.connectionType === filterType;
  });

  const handleRemoveConnection = (id: string) => {
    if (confirm('Are you sure you want to remove this connection?')) {
      removeConnection(id);
    }
  };

  // Calculate statistics
  const stats = {
    total: connections.length,
    fiber: connections.filter(c => c.connectionType === 'fiber').length,
    ethernet: connections.filter(c => c.connectionType === 'ethernet').length,
    totalLength: connections.reduce((sum, c) => sum + c.length, 0),
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Connections</h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage cable connections between equipment
            </p>
          </div>
          <button
            onClick={() => setShowAddConnection(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus size={20} />
            Add Connection
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-4">
            <div className="text-sm text-primary-600 font-medium">Total Connections</div>
            <div className="text-2xl font-bold text-primary-700 mt-1">{stats.total}</div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
            <div className="text-sm text-blue-600 font-medium">Fiber</div>
            <div className="text-2xl font-bold text-blue-700 mt-1">{stats.fiber}</div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
            <div className="text-sm text-orange-600 font-medium">Ethernet</div>
            <div className="text-2xl font-bold text-orange-700 mt-1">{stats.ethernet}</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
            <div className="text-sm text-green-600 font-medium">Total Cable (ft)</div>
            <div className="text-2xl font-bold text-green-700 mt-1">{stats.totalLength}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Filter:</span>
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filterType === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({connections.length})
          </button>
          <button
            onClick={() => setFilterType('fiber')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filterType === 'fiber'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Fiber ({stats.fiber})
          </button>
          <button
            onClick={() => setFilterType('ethernet')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filterType === 'ethernet'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Ethernet ({stats.ethernet})
          </button>
        </div>
      </div>

      {/* Connections Table */}
      <div className="flex-1 overflow-auto p-6">
        {filteredConnections.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <CableIcon size={64} className="mb-4 text-gray-300" />
            <p className="text-lg font-medium">No connections found</p>
            <p className="text-sm mt-2">Click "Add Connection" to create a new connection.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    From
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Length
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredConnections.map((connection) => (
                  <tr key={connection.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          Cabinet #{getCabinetNumber(connection.fromCabinetId)}
                        </div>
                        <div className="text-gray-600">
                          {getEquipmentName(connection.fromCabinetId, connection.fromEquipmentId)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          Cabinet #{getCabinetNumber(connection.toCabinetId)}
                        </div>
                        <div className="text-gray-600">
                          {getEquipmentName(connection.toCabinetId, connection.toEquipmentId)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        connection.connectionType === 'fiber'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {connection.connectionType === 'fiber' ? 'Fiber' : 'Ethernet'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {connection.length} ft
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleRemoveConnection(connection.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddConnection && (
        <AddConnectionModal onClose={() => setShowAddConnection(false)} />
      )}
    </div>
  );
}

