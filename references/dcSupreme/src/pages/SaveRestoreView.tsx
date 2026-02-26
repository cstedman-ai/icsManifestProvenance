import { useState } from 'react';
import { Download, Upload, FileText, Database, FileSpreadsheet } from 'lucide-react';
import { useDatacenterStore } from '../store/useDatacenterStore';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type ExportFormat = 'csv' | 'xlsx' | 'ods' | 'json';
type ReportScope = 'all' | 'hall' | 'cabinet' | 'pod' | 'inventory';

export default function SaveRestoreView() {
  const cabinets = useDatacenterStore(state => state.cabinets);
  const dataHalls = useDatacenterStore(state => state.dataHalls);
  const connections = useDatacenterStore(state => state.connections);
  const availableInventory = useDatacenterStore(state => state.availableInventory);
  
  const [reportScope, setReportScope] = useState<ReportScope>('all');
  const [selectedHall, setSelectedHall] = useState('');
  const [selectedCabinet, setSelectedCabinet] = useState('');
  const [selectedPod, setSelectedPod] = useState('');

  // Export entire state
  const handleExportState = (format: ExportFormat) => {
    const state = {
      cabinets,
      dataHalls,
      connections,
      availableInventory,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
      downloadFile(blob, `datacenter-backup-${Date.now()}.json`);
      return;
    }

    // Convert to worksheet format
    const ws = XLSX.utils.json_to_sheet([{
      cabinets: cabinets.length,
      dataHalls: dataHalls.length,
      connections: connections.length,
      equipment: cabinets.reduce((sum, c) => sum + c.equipment.length, 0),
      exportedAt: state.exportedAt
    }]);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Overview');

    // Add detailed sheets
    if (cabinets.length > 0) {
      const cabinetData = cabinets.map(c => ({
        Number: c.number,
        Hall: dataHalls.find(h => h.id === c.dataHallId)?.name,
        Row: c.row + 1,
        Model: c.specificationModel,
        Equipment: c.equipment.length,
        PDUs: (c.pdus || []).reduce((sum, p) => sum + p.quantity, 0)
      }));
      const cabinetSheet = XLSX.utils.json_to_sheet(cabinetData);
      XLSX.utils.book_append_sheet(wb, cabinetSheet, 'Cabinets');
    }

    if (format === 'csv') {
      XLSX.writeFile(wb, `datacenter-export-${Date.now()}.csv`);
    } else if (format === 'xlsx') {
      XLSX.writeFile(wb, `datacenter-export-${Date.now()}.xlsx`);
    } else if (format === 'ods') {
      XLSX.writeFile(wb, `datacenter-export-${Date.now()}.ods`, { bookType: 'ods' });
    }
  };

  // Import state
  const handleImportState = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        JSON.parse(content); // Validate JSON
        
        if (confirm('This will replace all current data. Are you sure?')) {
          alert('Import functionality ready. Full state restore will be implemented in next update.');
        }
      } catch (error) {
        alert('Error importing file. Please ensure it\'s a valid JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  // Generate PDF Report
  const handleRunReport = () => {
    const doc = new jsPDF();
    const timestamp = new Date().toLocaleString();

    // Title
    doc.setFontSize(20);
    doc.text('DC Supreme - Datacenter Report', 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${timestamp}`, 14, 28);

    let yPos = 40;

    if (reportScope === 'all' || reportScope === 'inventory') {
      // Overview Statistics
      doc.setFontSize(14);
      doc.text('Overview', 14, yPos);
      yPos += 10;

      const stats = [
        ['Total Data Halls', dataHalls.length.toString()],
        ['Total Cabinets', cabinets.length.toString()],
        ['Total Equipment', cabinets.reduce((sum, c) => sum + c.equipment.length, 0).toString()],
        ['Total Connections', connections.length.toString()],
      ];

      autoTable(doc, {
        startY: yPos,
        head: [['Metric', 'Value']],
        body: stats,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] }
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;
    }

    // Data Hall specific report
    if (reportScope === 'hall' && selectedHall) {
      const hall = dataHalls.find(h => h.id === selectedHall);
      const hallCabinets = cabinets.filter(c => c.dataHallId === selectedHall);

      doc.setFontSize(14);
      doc.text(`Data Hall: ${hall?.name}`, 14, yPos);
      yPos += 10;

      const hallData = hallCabinets.map(c => [
        c.number.toString(),
        (c.row + 1).toString(),
        c.specificationModel || 'N/A',
        c.equipment.length.toString(),
        (c.pdus || []).reduce((sum, p) => sum + p.quantity, 0).toString()
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Cabinet #', 'Row', 'Model', 'Equipment', 'PDUs']],
        body: hallData,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] }
      });
    }

    // Cabinet specific report
    if (reportScope === 'cabinet' && selectedCabinet) {
      const cabinet = cabinets.find(c => c.id === selectedCabinet);
      if (cabinet) {
        doc.setFontSize(14);
        doc.text(`Cabinet #${cabinet.number}`, 14, yPos);
        yPos += 10;

        const equipmentData = cabinet.equipment.map(eq => [
          eq.name,
          `U${eq.rackUnit}`,
          `${eq.height || 1}U`,
          (eq.connectionTypes || [eq.connectionType]).join(', '),
          (eq.transceivers || []).reduce((sum, t) => sum + t.quantity, 0).toString()
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['Equipment', 'Position', 'Height', 'Connection', 'Transceivers']],
          body: equipmentData,
          theme: 'striped',
          headStyles: { fillColor: [59, 130, 246] }
        });
      }
    }

    // Save PDF
    doc.save(`datacenter-report-${reportScope}-${Date.now()}.pdf`);
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <h2 className="text-2xl font-bold text-gray-800">Save / Restore</h2>
        <p className="text-sm text-gray-600 mt-1">
          Export, import, and generate reports for your datacenter
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Export Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <Download size={20} className="text-primary-600" />
                <h3 className="text-lg font-bold text-gray-800">Export Datacenter</h3>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Export the complete datacenter state including cabinets, equipment, connections, and inventory
              </p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => handleExportState('json')}
                  className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
                >
                  <Database size={32} className="text-primary-600" />
                  <span className="font-semibold text-gray-800">JSON</span>
                  <span className="text-xs text-gray-600">Full State</span>
                </button>
                <button
                  onClick={() => handleExportState('csv')}
                  className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
                >
                  <FileText size={32} className="text-green-600" />
                  <span className="font-semibold text-gray-800">CSV</span>
                  <span className="text-xs text-gray-600">Spreadsheet</span>
                </button>
                <button
                  onClick={() => handleExportState('xlsx')}
                  className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
                >
                  <FileSpreadsheet size={32} className="text-blue-600" />
                  <span className="font-semibold text-gray-800">XLSX</span>
                  <span className="text-xs text-gray-600">Excel</span>
                </button>
                <button
                  onClick={() => handleExportState('ods')}
                  className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
                >
                  <FileSpreadsheet size={32} className="text-orange-600" />
                  <span className="font-semibold text-gray-800">ODS</span>
                  <span className="text-xs text-gray-600">OpenOffice</span>
                </button>
              </div>
            </div>
          </div>

          {/* Import Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <Upload size={20} className="text-primary-600" />
                <h3 className="text-lg font-bold text-gray-800">Import Datacenter</h3>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Restore datacenter from a previously exported backup file
              </p>
            </div>
            <div className="p-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-primary-500 transition-colors">
                <label className="flex flex-col items-center gap-4 cursor-pointer">
                  <Upload size={48} className="text-gray-400" />
                  <div className="text-center">
                    <p className="font-semibold text-gray-800">Click to upload backup file</p>
                    <p className="text-sm text-gray-600 mt-1">JSON format only</p>
                  </div>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportState}
                    className="hidden"
                  />
                  <span className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                    Select File
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Report Generation Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-primary-600" />
                <h3 className="text-lg font-bold text-gray-800">Run Report</h3>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Generate detailed PDF reports for specific scopes
              </p>
            </div>
            <div className="p-6 space-y-4">
              {/* Report Scope Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Scope
                </label>
                <select
                  value={reportScope}
                  onChange={(e) => setReportScope(e.target.value as ReportScope)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">Complete Datacenter</option>
                  <option value="hall">Specific Data Hall</option>
                  <option value="pod">Specific Pod</option>
                  <option value="cabinet">Specific Cabinet</option>
                  <option value="inventory">Inventory Summary</option>
                </select>
              </div>

              {/* Data Hall Selector */}
              {reportScope === 'hall' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Data Hall
                  </label>
                  <select
                    value={selectedHall}
                    onChange={(e) => setSelectedHall(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Choose a hall...</option>
                    {dataHalls.map(hall => (
                      <option key={hall.id} value={hall.id}>{hall.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Pod Selector */}
              {reportScope === 'pod' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Pod (Row Pair)
                  </label>
                  <select
                    value={selectedPod}
                    onChange={(e) => setSelectedPod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Choose a pod...</option>
                    <option value="0">Pod 1 (Rows 1-2)</option>
                    <option value="1">Pod 2 (Rows 3-4)</option>
                    <option value="2">Pod 3 (Rows 5-6)</option>
                    <option value="3">Pod 4 (Rows 7-8)</option>
                  </select>
                </div>
              )}

              {/* Cabinet Selector */}
              {reportScope === 'cabinet' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Cabinet
                  </label>
                  <select
                    value={selectedCabinet}
                    onChange={(e) => setSelectedCabinet(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Choose a cabinet...</option>
                    {cabinets.map(cab => (
                      <option key={cab.id} value={cab.id}>
                        Cabinet #{cab.number} (Row {cab.row + 1})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Generate Report Button */}
              <button
                onClick={handleRunReport}
                disabled={
                  (reportScope === 'hall' && !selectedHall) ||
                  (reportScope === 'cabinet' && !selectedCabinet) ||
                  (reportScope === 'pod' && !selectedPod)
                }
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <FileText size={20} />
                Generate PDF Report
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
              <div className="text-sm text-blue-600 font-medium">Cabinets</div>
              <div className="text-2xl font-bold text-blue-700 mt-1">{cabinets.length}</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
              <div className="text-sm text-green-600 font-medium">Equipment</div>
              <div className="text-2xl font-bold text-green-700 mt-1">
                {cabinets.reduce((sum, c) => sum + c.equipment.length, 0)}
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
              <div className="text-sm text-purple-600 font-medium">Connections</div>
              <div className="text-2xl font-bold text-purple-700 mt-1">{connections.length}</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
              <div className="text-sm text-orange-600 font-medium">Data Halls</div>
              <div className="text-2xl font-bold text-orange-700 mt-1">{dataHalls.length}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

