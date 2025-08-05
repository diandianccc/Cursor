import React from 'react';

const JobPerformerLegend = ({ jobPerformers }) => {
  return (
    <div className="flex flex-wrap gap-4">
      {jobPerformers.map((jobPerformer) => (
        <div key={jobPerformer.id} className="flex items-center gap-2">
          <div className={`${jobPerformer.color} w-4 h-4 rounded-full`}></div>
          <span className="text-sm text-gray-700">{jobPerformer.name}</span>
        </div>
      ))}
    </div>
  );
};

export default JobPerformerLegend; 