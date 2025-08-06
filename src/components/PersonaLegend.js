import React from 'react';
import { getJobPerformerStyles } from '../services/jobPerformerService';

const JobPerformerLegend = ({ jobPerformers }) => {
  return (
    <div className="flex flex-wrap gap-4">
      {jobPerformers.map((jobPerformer) => {
        const customStyles = getJobPerformerStyles(jobPerformer);
        return (
          <div key={jobPerformer.id} className="flex items-center gap-2">
            <div 
              className={`w-4 h-4 rounded-full ${!customStyles.backgroundColor ? jobPerformer.color : ''}`}
              style={customStyles.backgroundColor ? { backgroundColor: customStyles.backgroundColor } : {}}
            ></div>
            <span className="text-sm text-gray-700">{jobPerformer.name}</span>
          </div>
        );
      })}
    </div>
  );
};

export default JobPerformerLegend; 