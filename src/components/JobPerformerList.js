import React from 'react';

const JobPerformerList = ({ jobPerformers, onEdit, onDelete, onAdd }) => {
  const getColorStyle = (hexColor) => ({
    backgroundColor: hexColor
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Job Performers</h3>
        <button
          onClick={onAdd}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium text-sm"
        >
          Add Job Performer
        </button>
      </div>

      {jobPerformers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No job performers defined yet.</p>
          <p className="text-sm mt-1">Click "Add Job Performer" to get started.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {jobPerformers.map((jobPerformer) => (
            <div
              key={jobPerformer.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div 
                    className="w-6 h-6 rounded-full border-2 border-gray-300 flex-shrink-0 mt-0.5"
                    style={getColorStyle(jobPerformer.hexColor || jobPerformer.color)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900 truncate">
                        {jobPerformer.name}
                      </h4>
                      {jobPerformer.isDefault && (
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    {jobPerformer.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {jobPerformer.description}
                      </p>
                    )}
                    {jobPerformer.resources && jobPerformer.resources.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">Resources:</p>
                        <div className="flex flex-wrap gap-1">
                          {jobPerformer.resources.map((resource, index) => (
                            resource.name && (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                              >
                                {resource.url ? (
                                  <a
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-indigo-600"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {resource.name}
                                  </a>
                                ) : (
                                  resource.name
                                )}
                              </span>
                            )
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => onEdit(jobPerformer)}
                    className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                    title="Edit job performer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDelete(jobPerformer)}
                    className="p-1 transition-colors text-gray-400 hover:text-red-600"
                    title="Delete job performer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobPerformerList;