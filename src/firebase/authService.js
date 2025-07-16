import { supabase } from './config';

// Generate a unique session ID for anonymous users
const generateSessionId = () => {
  return 'user_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

// Get or create anonymous user session
export const getAnonymousUser = () => {
  let sessionId = localStorage.getItem('userSessionId');
  
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem('userSessionId', sessionId);
  }
  
  return {
    uid: sessionId,
    isAnonymous: true
  };
};

// Sign in anonymously (simplified for Supabase)
export const signInAnonymous = async () => {
  try {
    const user = getAnonymousUser();
    return user;
  } catch (error) {
    console.error('Error getting anonymous user:', error);
    throw error;
  }
};

// Listen to authentication state changes (simplified)
export const onAuthChange = (callback) => {
  // For our simplified approach, we'll just call the callback with the anonymous user
  const user = getAnonymousUser();
  callback(user);
  
  // Return a cleanup function (no-op for our simple case)
  return () => {};
};

// Get current user
export const getCurrentUser = () => {
  return getAnonymousUser();
};

// Generate a friendly name for anonymous users
export const getUserDisplayName = (user) => {
  if (!user || !user.uid) return 'Anonymous';
  
  // Generate a friendly name based on user ID
  const userId = user.uid;
  const adjectives = ['Quick', 'Smart', 'Bright', 'Cool', 'Fast', 'Sharp', 'Bold', 'Swift'];
  const nouns = ['Fox', 'Wolf', 'Eagle', 'Lion', 'Tiger', 'Hawk', 'Bear', 'Shark'];
  
  // Simple hash function to get consistent names
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash + userId.charCodeAt(i)) & 0xffffffff;
  }
  
  const adjIndex = Math.abs(hash) % adjectives.length;
  const nounIndex = Math.abs(hash >> 8) % nouns.length;
  
  return `${adjectives[adjIndex]} ${nouns[nounIndex]}`;
}; 