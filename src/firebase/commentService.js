import { supabase } from './config';

// Helper function to get current journey map ID
const getCurrentJourneyMapId = () => {
  const journeyMapId = localStorage.getItem('currentJourneyMapId');
  if (!journeyMapId) {
    console.warn('⚠️ No current journey map ID found in localStorage');
  }
  return journeyMapId;
};

// Get all comments for a specific step
export const getStepComments = async (stepId) => {
  try {
    const journeyMapId = getCurrentJourneyMapId();
    if (!journeyMapId) {
      console.warn('No journey map ID found');
      return [];
    }

    console.log('🔍 Getting comments for step:', stepId, 'in journey map:', journeyMapId);

    const { data, error } = await supabase
      .from('journey_maps')
      .select('step_comments')
      .eq('id', journeyMapId)
      .single();

    if (error) {
      console.error('Error fetching step comments:', error);
      if (error.message && error.message.includes('step_comments')) {
        console.error('🚨 The step_comments column does not exist!');
        console.error('🔧 Run the SQL script: database_setup_step_comments.sql');
      }
      throw error;
    }

    const stepComments = data?.step_comments || {};
    const comments = stepComments[stepId] || [];
    
    console.log('✅ Found comments for step:', comments);
    return comments;
  } catch (error) {
    console.error('Error in getStepComments:', error);
    throw error;
  }
};

// Add a new comment to a step
export const addStepComment = async (stepId, authorName, message) => {
  try {
    const journeyMapId = getCurrentJourneyMapId();
    if (!journeyMapId) {
      throw new Error('No journey map ID found');
    }

    console.log('🔄 Adding comment:', { stepId, authorName, message, journeyMapId });
    
    // First, get current comments
    const { data: currentData, error: fetchError } = await supabase
      .from('journey_maps')
      .select('step_comments')
      .eq('id', journeyMapId)
      .single();

    if (fetchError) {
      console.error('Error fetching current comments:', fetchError);
      throw fetchError;
    }

    // Create new comment
    const newComment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      author_name: authorName.trim(),
      message: message.trim(),
      created_at: new Date().toISOString()
    };

    // Update comments structure
    const currentComments = currentData?.step_comments || {};
    const stepComments = currentComments[stepId] || [];
    const updatedStepComments = [...stepComments, newComment];
    
    const updatedComments = {
      ...currentComments,
      [stepId]: updatedStepComments
    };

    console.log('💾 Updating comments:', updatedComments);

    // Save back to database
    const { data, error } = await supabase
      .from('journey_maps')
      .update({ step_comments: updatedComments })
      .eq('id', journeyMapId)
      .select();

    if (error) {
      console.error('❌ Error updating comments:', error);
      throw error;
    }

    console.log('✅ Comment added successfully:', newComment);
    return newComment;
  } catch (error) {
    console.error('❌ Error in addStepComment:', error);
    throw error;
  }
};

// Get comment counts for all steps in current journey map
export const getStepCommentCounts = async () => {
  try {
    const journeyMapId = getCurrentJourneyMapId();
    if (!journeyMapId) {
      return {};
    }

    const { data, error } = await supabase
      .from('journey_maps')
      .select('step_comments')
      .eq('id', journeyMapId)
      .single();

    if (error) {
      console.error('Error fetching comment counts:', error);
      return {};
    }

    const stepComments = data?.step_comments || {};
    const counts = {};
    
    // Count comments for each step
    Object.keys(stepComments).forEach(stepId => {
      counts[stepId] = stepComments[stepId]?.length || 0;
    });

    return counts;
  } catch (error) {
    console.error('Error in getStepCommentCounts:', error);
    return {};
  }
};

// Delete a comment
export const deleteStepComment = async (stepId, commentId) => {
  try {
    const journeyMapId = getCurrentJourneyMapId();
    if (!journeyMapId) {
      throw new Error('No journey map ID found');
    }

    // Get current comments
    const { data: currentData, error: fetchError } = await supabase
      .from('journey_maps')
      .select('step_comments')
      .eq('id', journeyMapId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    // Remove the comment
    const currentComments = currentData?.step_comments || {};
    const stepComments = currentComments[stepId] || [];
    const updatedStepComments = stepComments.filter(comment => comment.id !== commentId);
    
    const updatedComments = {
      ...currentComments,
      [stepId]: updatedStepComments
    };

    // Save back to database
    const { error } = await supabase
      .from('journey_maps')
      .update({ step_comments: updatedComments })
      .eq('id', journeyMapId);

    if (error) {
      throw error;
    }

    console.log('✅ Comment deleted successfully');
    return true;
  } catch (error) {
    console.error('❌ Error in deleteStepComment:', error);
    throw error;
  }
};

console.log('💬 Comment service initialized');