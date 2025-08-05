import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import JobPerformerList from './JobPerformerList';
import JobPerformerModal from './JobPerformerModal';
import { 
  createJobPerformer, 
  updateJobPerformer, 
  deleteJobPerformer,
  subscribeToJobPerformers 
} from '../firebase/journeyService';
import { getAllJobPerformers, updatePersonasArray } from '../services/jobPerformerService';

const JobPerformerManager = ({ isOpen, onClose }) => {
  const [jobPerformers, setJobPerformers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingJobPerformer, setEditingJobPerformer] = useState(null);

  // Subscribe to job performers changes
  useEffect(() => {
    if (!isOpen) return;

    const loadJobPerformers = async () => {
      try {
        // First, get all job performers (including defaults if database is empty)
        const allJobPerformers = await getAllJobPerformers();
        setJobPerformers(allJobPerformers);
        // Update the global PERSONAS array for components that import it
        updatePersonasArray(allJobPerformers);
        setLoading(false);
      } catch (error) {
        console.error('Error loading job performers:', error);
        setLoading(false);
      }
    };

    // Load initial data
    loadJobPerformers();

    // Set up real-time subscription for database changes
    const unsubscribe = subscribeToJobPerformers(async (performers) => {
      // Always reload from service to get combined defaults + database
      try {
        const allJobPerformers = await getAllJobPerformers();
        setJobPerformers(allJobPerformers);
        // Update the global PERSONAS array for components that import it
        updatePersonasArray(allJobPerformers);
      } catch (error) {
        console.error('Error updating job performers:', error);
      }
    });

    return unsubscribe;
  }, [isOpen]);

  const handleAdd = () => {
    setEditingJobPerformer(null);
    setShowModal(true);
  };

  const handleEdit = (jobPerformer) => {
    setEditingJobPerformer(jobPerformer);
    setShowModal(true);
  };

  const handleSave = async (jobPerformerData) => {
    try {
      console.log('🚀 handleSave called with:', jobPerformerData);
      
      if (editingJobPerformer && editingJobPerformer.isDefault) {
        // If editing a default job performer, create a new one instead of updating
        console.log('Converting default job performer to custom job performer');
        await createJobPerformer(jobPerformerData);
      } else if (editingJobPerformer) {
        // Editing an existing custom job performer
        console.log('Updating existing job performer:', editingJobPerformer.id);
        await updateJobPerformer(editingJobPerformer.id, jobPerformerData);
      } else {
        // Creating a new job performer
        console.log('Creating new job performer');
        await createJobPerformer(jobPerformerData);
      }
      
      console.log('✅ Job performer saved successfully!');
      setShowModal(false);
      setEditingJobPerformer(null);
      
      // Refresh the global PERSONAS array and force component re-renders
      const allJobPerformers = await getAllJobPerformers();
      console.log('🔄 JobPerformerManager: Refreshing with job performers:', allJobPerformers);
      setJobPerformers(allJobPerformers);
      updatePersonasArray(allJobPerformers);
      // Trigger a window event to notify other components to re-render
      console.log('🔄 JobPerformerManager: Dispatching jobPerformersUpdated event');
      window.dispatchEvent(new CustomEvent('jobPerformersUpdated', { detail: allJobPerformers }));
    } catch (error) {
      console.error('Error saving job performer:', error);
      const errorMessage = error.message || error.toString() || '';
      if (errorMessage.includes('relation') && errorMessage.includes('does not exist') || 
          errorMessage.includes('table') && errorMessage.includes('does not exist')) {
        alert(`⚠️ Database Setup Required

To save custom Job Performers, you need to create the database table first.

Check the console for setup instructions.`);
        console.error(`
🔧 DATABASE SETUP REQUIRED:

Your Job Performers are currently using defaults. To save custom Job Performers, 
please run this SQL in your Supabase SQL Editor:

CREATE TABLE job_performers (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  resources JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_job_performers_user_id ON job_performers(user_id);

After creating the table, you can edit and save Job Performers normally.
        `);
      } else if (error.code === 'PGRST301' || errorMessage.includes('PGRST301')) {
        alert(`⚠️ Database Setup Required

The job_performers table doesn't exist yet. Check the console for setup instructions.`);
        console.error('PostgreSQL table "job_performers" not found. See the database setup instructions above.');
      } else {
        alert('Failed to save job performer. Please try again or check the console for details.');
        console.error('Full error details:', error);
        console.error('Error message:', errorMessage);
        console.error('Error code:', error.code);
      }
    }
  };

  const handleDelete = async (jobPerformer) => {
    if (jobPerformer.isDefault) {
      alert('Default Job Performers cannot be deleted. You can edit them to create custom versions.');
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete "${jobPerformer.name}"? This action cannot be undone.`)) {
      try {
        await deleteJobPerformer(jobPerformer.id);
      } catch (error) {
        console.error('Error deleting job performer:', error);
        alert('Failed to delete job performer. Please try again.');
      }
    }
  };

  const handleModalDelete = async (id) => {
    try {
      await deleteJobPerformer(id);
    } catch (error) {
      console.error('Error deleting job performer:', error);
      alert('Failed to delete job performer. Please try again.');
    }
  };



  const handleCloseModal = () => {
    setShowModal(false);
    setEditingJobPerformer(null);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Manage Job Performers" size="large">
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <JobPerformerList
              jobPerformers={jobPerformers}
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>
      </Modal>

      <JobPerformerModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSave={handleSave}
        onDelete={handleModalDelete}
        editingJobPerformer={editingJobPerformer}
      />
    </>
  );
};

export default JobPerformerManager;