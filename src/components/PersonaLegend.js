import React from 'react';
import { getJobPerformerStyles } from '../services/jobPerformerService';

const JobPerformerLegend = ({ 
  jobPerformers, 
  selectedFilters = [], 
  onFilterChange,
  showUnassigned = true 
}) => {
  console.log('🎭 JobPerformerLegend received:', jobPerformers);
  
  if (!jobPerformers || jobPerformers.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic">
        No job performers available
      </div>
    );
  }

  const handleFilterToggle = (performerId) => {
    if (!onFilterChange) return;
    
    const newFilters = selectedFilters.includes(performerId)
      ? selectedFilters.filter(id => id !== performerId)
      : [...selectedFilters, performerId];
    
    onFilterChange(newFilters);
  };

  const handleClearFilters = () => {
    if (onFilterChange) {
      onFilterChange([]);
    }
  };

  const hasActiveFilters = selectedFilters.length > 0;
  
  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Filter controls */}
      {onFilterChange && (
        <div className="flex items-center gap-2 mr-2 border-r border-gray-300 pr-3">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Filter:</span>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Clear ({selectedFilters.length})
            </button>
          )}
        </div>
      )}
      
      {jobPerformers.map((jobPerformer) => {
        const styles = getJobPerformerStyles(jobPerformer);
        const isSelected = selectedFilters.includes(jobPerformer.id);
        const isClickable = !!onFilterChange;
        
        return (
          <div 
            key={jobPerformer.id} 
            className={`flex items-center gap-2 ${isClickable ? 'cursor-pointer hover:bg-gray-100 px-2 py-1 rounded-md transition-colors' : ''} ${isSelected ? 'bg-blue-100 ring-1 ring-blue-300' : ''}`}
            onClick={() => handleFilterToggle(jobPerformer.id)}
            title={isClickable ? `Click to ${isSelected ? 'remove' : 'add'} filter` : ''}
          >
            <div 
              className={`w-4 h-4 rounded-full ${!styles.backgroundColor ? jobPerformer.color : ''} ${isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}
              style={styles.backgroundColor ? { backgroundColor: styles.backgroundColor } : {}}
            ></div>
            <span className={`text-sm ${isSelected ? 'text-blue-800 font-medium' : 'text-gray-700'}`}>
              {jobPerformer.name}
            </span>
          </div>
        );
      })}
      
      {/* "No Job Performer Assigned" entry */}
      {showUnassigned && (
        <div 
          className={`flex items-center gap-2 ${onFilterChange ? 'cursor-pointer hover:bg-gray-100 px-2 py-1 rounded-md transition-colors' : ''} ${selectedFilters.includes('unassigned') ? 'bg-blue-100 ring-1 ring-blue-300' : ''}`}
          onClick={() => handleFilterToggle('unassigned')}
          title={onFilterChange ? `Click to ${selectedFilters.includes('unassigned') ? 'remove' : 'add'} filter` : ''}
        >
          <div 
            className={`w-4 h-4 rounded-full ${selectedFilters.includes('unassigned') ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}
            style={{ backgroundColor: '#d1d5db' }}
          ></div>
          <span className={`text-sm ${selectedFilters.includes('unassigned') ? 'text-blue-800 font-medium' : 'text-gray-700'}`}>
            No Job Performer Assigned
          </span>
        </div>
      )}
    </div>
  );
};

export default JobPerformerLegend; 