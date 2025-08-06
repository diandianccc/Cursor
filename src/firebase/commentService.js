import { supabase } from './config';

// Test table access on load
const testTableAccess = async () => {
  try {
    console.log('🧪 Testing journey_maps table for comments...');
    console.log('🔗 Supabase URL:', supabase.supabaseUrl);
    console.log('🔑 Using anon key:', supabase.supabaseKey?.substring(0, 20) + '...');
    
    // Test 1: Basic table access
    const { data, error } = await supabase
      .from('journey_maps')
      .select('id, name, step_comments')
      .limit(1);
    
    if (error) {
      console.error('❌ Journey maps access failed:', error);
      console.error('❌ Full error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      
      if (error.message && error.message.includes('step_comments')) {
        console.error('🚨 SOLUTION: The step_comments column does not exist!');
        console.error('🔧 Run this SQL in Supabase:');
        console.error('   ALTER TABLE public.journey_maps ADD COLUMN step_comments JSONB DEFAULT \'{}\';');
      }
    } else {
      console.log('✅ journey_maps table accessible for comments');
      console.log('📊 Sample data:', data);
      
      // Check if step_comments column exists
      if (data && data.length > 0) {
        const firstRow = data[0];
        if ('step_comments' in firstRow) {
          console.log('✅ step_comments column exists!', firstRow.step_comments);
        } else {
          console.error('❌ step_comments column NOT found in table!');
          console.log('📋 Available columns:', Object.keys(firstRow));
        }
      }
    }
    
    // Test 2: Check current journey map ID
    const currentJourneyMapId = localStorage.getItem('currentJourneyMapId');
    console.log('🗺️ Current journey map ID:', currentJourneyMapId);
    
  } catch (err) {
    console.error('❌ Table access test error:', err);
  }
};

// Run test when module loads
testTableAccess();

// Get current journey map ID from localStorage
const getCurrentJourneyMapId = () => {
  return localStorage.getItem('currentJourneyMapId');
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

// Get comment counts for multiple steps (for showing indicators)
export const getStepCommentCounts = async (stepIds) => {
  try {
    if (!stepIds || stepIds.length === 0) return {};

    const journeyMapId = getCurrentJourneyMapId();
    if (!journeyMapId) return {};

    const { data, error } = await supabase
      .from('journey_maps')
      .select('step_comments')
      .eq('id', journeyMapId)
      .single();

    if (error) {
      console.error('Error fetching step comment counts:', error);
      return {};
    }

    const stepComments = data?.step_comments || {};
    const counts = {};
    
    stepIds.forEach(stepId => {
      const comments = stepComments[stepId] || [];
      counts[stepId] = comments.length;
    });

    return counts;
  } catch (error) {
    console.error('Error in getStepCommentCounts:', error);
    return {};
  }
};

// Delete a comment (if needed for moderation)
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

    if (fetchError) throw fetchError;

    const currentComments = currentData?.step_comments || {};
    const stepComments = currentComments[stepId] || [];
    
    // Remove the comment
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

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error in deleteStepComment:', error);
    throw error;
  }
};

// Simple callback for comment updates (no real-time with JSON approach)
export const subscribeToStepComments = (stepId, callback) => {
  // For JSON approach, we'll use polling or manual refresh
  // This is a placeholder for compatibility
  return {
    unsubscribe: () => {}
  };
};