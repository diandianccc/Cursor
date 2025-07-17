import React, { useState, useEffect } from 'react';
import { subscribeToJourneyMaps, createJourneyMap, deleteJourneyMap } from '../firebase/journeyService';
import AddJourneyMapModal from './AddJourneyMapModal';
import LoadingSpinner from './LoadingSpinner';

const JourneyMapSelector = ({ onSelectJourneyMap, user }) => {
  const [journeyMaps, setJourneyMaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deletingMapId, setDeletingMapId] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToJourneyMaps((maps) => {
      setJourneyMaps(maps);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleCreateJourneyMap = async (name) => {
    try {
      const newMapId = await createJourneyMap(name);
      // The new map will appear automatically via real-time subscription
      onSelectJourneyMap(newMapId, name);
    } catch (error) {
      console.error('Failed to create journey map:', error);
      alert('Failed to create journey map. Please try again.');
    }
  };

  const handleDeleteJourneyMap = async (mapId, mapName) => {
    if (window.confirm(`Are you sure you want to delete "${mapName}"? This action cannot be undone.`)) {
      setDeletingMapId(mapId);
      try {
        await deleteJourneyMap(mapId);
        // The map will disappear automatically via real-time subscription
      } catch (error) {
        console.error('Failed to delete journey map:', error);
        alert('Failed to delete journey map. Please try again.');
      } finally {
        setDeletingMapId(null);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStageCount = (stages) => {
    return stages ? stages.length : 0;
  };

  const getTaskCount = (stages) => {
    if (!stages) return 0;
    return stages.reduce((total, stage) => total + (stage.tasks ? stage.tasks.length : 0), 0);
  };

  const getStepCount = (stages) => {
    if (!stages) return 0;
    return stages.reduce((total, stage) => {
      if (!stage.tasks) return total;
      return total + stage.tasks.reduce((taskTotal, task) => {
        return taskTotal + (task.steps ? task.steps.length : 0);
      }, 0);
    }, 0);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Journey Maps</h1>
              <p className="text-gray-600 mt-2">Create and manage journey maps for different products</p>
              {user && (
                <div className="flex items-center mt-3 text-sm text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span>Connected • Real-time collaboration enabled</span>
                </div>
              )}
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Journey Map
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pt-8 pb-12">
        {journeyMaps.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <svg className="w-24 h-24 mx-auto mb-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Journey Maps Yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first journey map to start mapping user experiences for your products.
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2 mx-auto"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create First Journey Map
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {journeyMaps.map((map) => (
              <div
                key={map.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 truncate pr-2">
                      {map.name}
                    </h3>
                    <button
                      onClick={() => handleDeleteJourneyMap(map.id, map.name)}
                      disabled={deletingMapId === map.id}
                      className="text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                      title="Delete journey map"
                    >
                      {deletingMapId === map.id ? (
                        <div className="w-5 h-5 animate-spin border-2 border-red-600 border-t-transparent rounded-full"></div>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Stages:</span>
                      <span className="font-medium text-blue-600">{getStageCount(map.stages)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Tasks:</span>
                      <span className="font-medium text-green-600">{getTaskCount(map.stages)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Steps:</span>
                      <span className="font-medium text-purple-600">{getStepCount(map.stages)}</span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 mb-4">
                    Created: {formatDate(map.created)}
                    {map.last_modified && (
                      <div>Modified: {formatDate(map.last_modified)}</div>
                    )}
                  </div>

                  <button
                    onClick={() => onSelectJourneyMap(map.id, map.name)}
                    className="w-full bg-gray-100 hover:bg-blue-600 hover:text-white text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Open Journey Map
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <AddJourneyMapModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleCreateJourneyMap}
      />
    </div>
  );
};

export default JourneyMapSelector; 