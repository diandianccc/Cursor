import React from 'react';

const ZoomPanControls = ({ 
  zoom, 
  zoomIn, 
  zoomOut, 
  resetZoom,
  fitToView, 
  canZoomIn, 
  canZoomOut,
  isDragging 
}) => {
  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-2">
      {/* Zoom Level Indicator */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700">
        {Math.round(zoom * 100)}%
      </div>
      
      {/* Control Buttons */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex flex-col gap-1">
        {/* Zoom In */}
        <button
          onClick={zoomIn}
          disabled={!canZoomIn}
          className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Zoom In (Ctrl + Scroll)"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
        
        {/* Reset Zoom */}
        <button
          onClick={resetZoom}
          className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors"
          title="Reset Zoom & Pan"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
        
        {/* Fit to View */}
        <button
          onClick={fitToView}
          className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors"
          title="Fit to View"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
        
        {/* Zoom Out */}
        <button
          onClick={zoomOut}
          disabled={!canZoomOut}
          className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Zoom Out (Ctrl + Scroll)"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
      </div>
      
      {/* Drag Indicator */}
      {isDragging && (
        <div className="bg-blue-600 text-white rounded-lg shadow-lg px-3 py-2 text-sm font-medium flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l3-3m0 0l3 3m-3-3v12M5 12l3-3m0 0l3 3m-3-3v12" />
          </svg>
          Dragging
        </div>
      )}
      
      {/* Instructions */}
      <div className="bg-gray-800 text-white rounded-lg shadow-lg px-3 py-2 text-xs max-w-48">
        <div className="font-medium mb-1">Navigation:</div>
        <div>• Drag to pan</div>
        <div>• Ctrl + scroll to zoom</div>
        <div>• Use buttons to control</div>
      </div>
    </div>
  );
};

export default ZoomPanControls; 