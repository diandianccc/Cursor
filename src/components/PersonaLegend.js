import React from 'react';
import { getJobPerformerStyles } from '../services/jobPerformerService';

const JobPerformerLegend = ({ jobPerformers }) => {
  return (
    <div className="flex flex-wrap gap-4 items-center">
      {jobPerformers.map((jobPerformer) => {
        const styles = getJobPerformerStyles(jobPerformer);
        return (
          <div key={jobPerformer.id} className="flex items-center gap-2">
            <div 
              className={`w-4 h-4 rounded-full ${!styles.backgroundColor ? jobPerformer.color : ''}`}
              style={styles.backgroundColor ? { backgroundColor: styles.backgroundColor } : {}}
            ></div>
            <span className="text-sm text-gray-700">{jobPerformer.name}</span>
          </div>
        );
      })}
    </div>
  );
};

export default JobPerformerLegend; 