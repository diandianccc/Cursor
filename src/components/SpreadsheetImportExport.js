import React, { useRef } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { v4 as uuidv4 } from 'uuid';
import { PERSONAS } from '../constants/personas';

const SpreadsheetImportExport = ({ stages, onImportData }) => {
  const fileInputRef = useRef(null);

  // Generate template data
  const generateTemplate = () => {
    return [
      {
        'Stage Name': 'Awareness',
        'Task Name': 'Research Product',
        'Step Description': 'User searches for product information',
        'Step Persona': 'Developer',
        'Pain Points': 'Hard to find relevant information, Too many options',
        'Opportunities': 'Improve search functionality, Add filtering options'
      },
      {
        'Stage Name': 'Awareness',
        'Task Name': 'Research Product',
        'Step Description': 'User reads reviews',
        'Step Persona': 'Merchandiser',
        'Pain Points': 'Reviews are outdated',
        'Opportunities': 'Encourage recent reviews'
      },
      {
        'Stage Name': 'Consideration',
        'Task Name': 'Compare Options',
        'Step Description': 'User compares different products',
        'Step Persona': 'Ecommerce Leader',
        'Pain Points': 'Difficult to compare features',
        'Opportunities': 'Create comparison tool'
      },
      {
        'Stage Name': '',
        'Task Name': '',
        'Step Description': '',
        'Step Persona': '',
        'Pain Points': '',
        'Opportunities': ''
      }
    ];
  };

  // Download template
  const downloadTemplate = () => {
    const templateData = generateTemplate();
    
    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(templateData);
    
    // Set column widths
    ws['!cols'] = [
      { width: 15 }, // Stage Name
      { width: 20 }, // Task Name
      { width: 30 }, // Step Description
      { width: 15 }, // Step Persona
      { width: 40 }, // Pain Points
      { width: 40 }  // Opportunities
    ];

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Journey Map Template');
    
    // Add instructions sheet
    const instructions = [
      { 'Instructions': 'How to use this template:' },
      { 'Instructions': '' },
      { 'Instructions': '1. Fill in your journey map data in the "Journey Map Template" sheet' },
      { 'Instructions': '2. Stage Name: The main stage of the user journey' },
      { 'Instructions': '3. Task Name: A specific task within that stage' },
      { 'Instructions': '4. Step Description: Individual steps within the task' },
      { 'Instructions': '5. Step Persona: Must be one of: Developer, Merchandiser, Ecommerce Leader' },
      { 'Instructions': '6. Pain Points: Separate multiple pain points with commas' },
      { 'Instructions': '7. Opportunities: Separate multiple opportunities with commas' },
      { 'Instructions': '' },
      { 'Instructions': 'Notes:' },
      { 'Instructions': '- You can have multiple steps for the same task' },
      { 'Instructions': '- You can have multiple tasks for the same stage' },
      { 'Instructions': '- Leave Pain Points and Opportunities empty if none' },
      { 'Instructions': '- Save as Excel (.xlsx) or CSV (.csv) format' },
      { 'Instructions': '- After filling, go back to the app and use "Import Spreadsheet"' }
    ];
    
    const instructionsWs = XLSX.utils.json_to_sheet(instructions);
    instructionsWs['!cols'] = [{ width: 60 }];
    XLSX.utils.book_append_sheet(wb, instructionsWs, 'Instructions');
    
    // Generate file and download
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    saveAs(blob, 'journey-map-template.xlsx');
  };

  // Parse uploaded file
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Read the first sheet (should be the template)
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Convert spreadsheet data to app format
        const convertedData = convertSpreadsheetToAppData(jsonData);
        onImportData(convertedData);
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        alert('Data imported successfully!');
      } catch (error) {
        console.error('Error parsing file:', error);
        alert('Error parsing file. Please make sure it follows the template format.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Convert spreadsheet data to app data structure
  const convertSpreadsheetToAppData = (data) => {
    const stagesMap = new Map();

    data.forEach(row => {
      // Skip empty rows
      if (!row['Stage Name'] || !row['Task Name'] || !row['Step Description']) {
        return;
      }

      const stageName = row['Stage Name'].trim();
      const taskName = row['Task Name'].trim();
      const stepDescription = row['Step Description'].trim();
      const personaName = row['Step Persona']?.trim() || '';
      const painPointsText = row['Pain Points']?.trim() || '';
      const opportunitiesText = row['Opportunities']?.trim() || '';

      // Find persona ID
      const persona = PERSONAS.find(p => 
        p.name.toLowerCase() === personaName.toLowerCase()
      );
      const personaId = persona ? persona.id : PERSONAS[0].id; // Default to first persona

      // Parse pain points and opportunities (comma-separated)
      const painPoints = painPointsText ? 
        painPointsText.split(',').map(p => p.trim()).filter(p => p) : [];
      const opportunities = opportunitiesText ? 
        opportunitiesText.split(',').map(o => o.trim()).filter(o => o) : [];

      // Get or create stage
      if (!stagesMap.has(stageName)) {
        stagesMap.set(stageName, {
          id: uuidv4(),
          name: stageName,
          tasks: []
        });
      }
      const stage = stagesMap.get(stageName);

      // Get or create task
      let task = stage.tasks.find(t => t.name === taskName);
      if (!task) {
        task = {
          id: uuidv4(),
          name: taskName,
          steps: []
        };
        stage.tasks.push(task);
      }

      // Create step
      const step = {
        id: uuidv4(),
        description: stepDescription,
        personaId: personaId,
        painPoints: painPoints,
        opportunities: opportunities
      };
      task.steps.push(step);
    });

    return Array.from(stagesMap.values());
  };

  // Export current data to spreadsheet
  const exportCurrentData = () => {
    const exportData = [];

    stages.forEach(stage => {
      stage.tasks.forEach(task => {
        task.steps.forEach(step => {
          const persona = PERSONAS.find(p => p.id === step.personaId);
          exportData.push({
            'Stage Name': stage.name,
            'Task Name': task.name,
            'Step Description': step.description || '',
            'Step Persona': persona ? persona.name : '',
            'Pain Points': step.painPoints ? step.painPoints.join(', ') : '',
            'Opportunities': step.opportunities ? step.opportunities.join(', ') : ''
          });
        });
      });
    });

    // If no data, add empty row
    if (exportData.length === 0) {
      exportData.push({
        'Stage Name': '',
        'Task Name': '',
        'Step Description': '',
        'Step Persona': '',
        'Pain Points': '',
        'Opportunities': ''
      });
    }

    const ws = XLSX.utils.json_to_sheet(exportData);
    ws['!cols'] = [
      { width: 15 }, { width: 20 }, { width: 30 },
      { width: 15 }, { width: 40 }, { width: 40 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Journey Map Data');
    
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    saveAs(blob, 'journey-map-export.xlsx');
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="font-semibold text-gray-800">Spreadsheet Import/Export</h3>
      </div>

      <div className="flex flex-wrap gap-3">
        {/* Download Template */}
        <button
          onClick={downloadTemplate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download Template
        </button>

        {/* Import File */}
        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            Import Spreadsheet
          </button>
        </div>

        {/* Export Current Data */}
        <button
          onClick={exportCurrentData}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          Export Current Data
        </button>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>How to use:</strong></p>
        <ol className="list-decimal list-inside mt-1 space-y-1">
          <li><strong>Download Template</strong> - Get an Excel file with sample data and instructions</li>
          <li><strong>Fill the template</strong> - Add your stages, tasks, steps, personas, pain points, and opportunities</li>
          <li><strong>Import Spreadsheet</strong> - Upload your completed file to replace current data</li>
          <li><strong>Export Current Data</strong> - Download your current journey map as a spreadsheet</li>
        </ol>
      </div>
    </div>
  );
};

export default SpreadsheetImportExport; 