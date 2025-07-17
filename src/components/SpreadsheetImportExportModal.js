import React, { useState, useRef } from 'react';
import Modal from './Modal';

const SpreadsheetImportExportModal = ({ isOpen, onClose, stages, onImportData, journeyMapName }) => {
  const [activeTab, setActiveTab] = useState('export');
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');
  const fileInputRef = useRef(null);

  const handleExportJSON = () => {
    const exportData = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      journeyMapName: journeyMapName || 'My Journey Map',
      journeyMap: {
        stages: stages
      }
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    
    // Create safe filename from journey map name
    const safeFileName = (journeyMapName || 'journey-map')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    link.download = `${safeFileName}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    // Flatten the journey map data for CSV export
    const rows = [];
    rows.push(['Stage', 'Task', 'Step Description', 'Persona', 'Pain Points', 'Opportunities', 'Insights']);
    
    stages.forEach(stage => {
      stage.tasks.forEach(task => {
        if (task.steps.length === 0) {
          rows.push([stage.name, task.name, '', '', '', '', '']);
        } else {
          task.steps.forEach(step => {
            const painPoints = step.painPoints ? step.painPoints.join('; ') : '';
            const opportunities = step.opportunities ? step.opportunities.join('; ') : '';
            
            rows.push([
              stage.name,
              task.name,
              step.description || '',
              step.personaId || '',
              painPoints,
              opportunities,
              step.insights || ''
            ]);
          });
        }
      });
    });

    const csvContent = rows.map(row => 
      row.map(field => `"${String(field).replace(/"/g, '""')}"`)
         .join(',')
    ).join('\n');

    const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    
    // Create safe filename from journey map name
    const safeFileName = (journeyMapName || 'journey-map')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    link.download = `${safeFileName}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImportError('');
    setImportSuccess('');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        const importedData = JSON.parse(content);
        
        // Validate the imported data structure
        if (!importedData.journeyMap || !importedData.journeyMap.stages) {
          throw new Error('Invalid file format. Expected a journey map export file.');
        }

        const stages = importedData.journeyMap.stages;
        
        // Basic validation of stages structure
        if (!Array.isArray(stages)) {
          throw new Error('Invalid stages data format.');
        }

        // Validate each stage has required properties
        for (const stage of stages) {
          if (!stage.id || !stage.name || !Array.isArray(stage.tasks)) {
            throw new Error('Invalid stage structure found in file.');
          }
          
          // Validate tasks
          for (const task of stage.tasks) {
            if (!task.id || !task.name || !Array.isArray(task.steps)) {
              throw new Error('Invalid task structure found in file.');
            }
          }
        }

        const importedMapName = importedData.journeyMapName || 'Imported Journey Map';
        setImportSuccess(`Successfully loaded "${importedMapName}" with ${stages.length} stages and ${stages.reduce((total, stage) => total + stage.tasks.length, 0)} tasks.`);
        
        // Call the import handler after a short delay to show success message
        setTimeout(() => {
          onImportData(stages);
          onClose();
        }, 1000);

      } catch (error) {
        setImportError(`Import failed: ${error.message}`);
      }
    };

    reader.onerror = () => {
      setImportError('Failed to read file. Please try again.');
    };

    reader.readAsText(file);
  };

  const resetImportState = () => {
    setImportError('');
    setImportSuccess('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    resetImportState();
  };

  const handleClose = () => {
    resetImportState();
    setActiveTab('export');
    onClose();
  };

  const getTotalSteps = () => {
    return stages.reduce((total, stage) => {
      return total + stage.tasks.reduce((taskTotal, task) => {
        return taskTotal + task.steps.length;
      }, 0);
    }, 0);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Import/Export Journey Map Data">
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => handleTabChange('export')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'export'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Export Data
          </button>
          <button
            onClick={() => handleTabChange('import')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'import'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Import Data
          </button>
        </div>

        {/* Export Tab */}
        {activeTab === 'export' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">{journeyMapName || 'Current Journey Map'}</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p>• {stages.length} stages</p>
                <p>• {stages.reduce((total, stage) => total + stage.tasks.length, 0)} tasks</p>
                <p>• {getTotalSteps()} steps</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Export Options</h4>
                <div className="space-y-2">
                  <button
                    onClick={handleExportJSON}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export as JSON (Recommended)
                  </button>
                  <p className="text-xs text-gray-500 ml-2">Full data export that can be imported back</p>
                </div>

                <div className="space-y-2 mt-3">
                  <button
                    onClick={handleExportCSV}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export as CSV
                  </button>
                  <p className="text-xs text-gray-500 ml-2">Spreadsheet format for analysis (read-only)</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Import Tab */}
        {activeTab === 'import' && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.684-.833-2.464 0L3.349 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <h4 className="font-medium text-amber-900 mb-1">Import Warning</h4>
                  <p className="text-sm text-amber-700">
                    Importing will replace ALL current journey map data. This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Journey Map File
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Only JSON files exported from this application are supported
                </p>
              </div>

              {importError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-red-700">{importError}</p>
                  </div>
                </div>
              )}

              {importSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-green-700">{importSuccess}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SpreadsheetImportExportModal; 