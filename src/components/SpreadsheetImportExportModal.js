import React from 'react';
import Modal from './Modal';

const SpreadsheetImportExportModal = ({ isOpen, onClose, stages, onImportData }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import/Export Data">
      <div className="space-y-4">
        <div className="text-center py-8">
          <div className="text-gray-500 mb-4">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Import/Export Feature
          </h3>
          <p className="text-gray-600 mb-4">
            This feature is currently being updated. Please check back soon!
          </p>
        </div>
        
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
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