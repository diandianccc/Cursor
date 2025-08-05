import React from 'react';

const PersonaLegend = ({ personas }) => {
  return (
    <div className="flex flex-wrap gap-4">
      {personas.map((persona) => (
        <div key={persona.id} className="flex items-center gap-2">
          <div className={`${persona.color} w-4 h-4 rounded-full`}></div>
          <span className="text-sm text-gray-700">{persona.name}</span>
        </div>
      ))}
    </div>
  );
};

export default PersonaLegend; 