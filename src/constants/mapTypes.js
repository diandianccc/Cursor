// Mapping types and their terminologies
export const MAP_TYPES = {
  USER_JOURNEY: 'user_journey',
  JOBS_TO_BE_DONE: 'jobs_to_be_done'
};

// Terminology for different mapping types
export const TERMINOLOGY = {
  [MAP_TYPES.USER_JOURNEY]: {
    name: 'User Journey Map',
    stage: 'Stage',
    stages: 'Stages',
    task: 'Task',
    tasks: 'Tasks',
    step: 'Step',
    steps: 'Steps',
    description: 'Create and visualize customer journey stages, tasks, and touchpoints',
    icon: '🗺️'
  },
  [MAP_TYPES.JOBS_TO_BE_DONE]: {
    name: 'Jobs to be Done Map',
    stage: 'Domain',
    stages: 'Domains',
    task: 'Macro Job',
    tasks: 'Macro Jobs',
    step: 'Micro Job',
    steps: 'Micro Jobs',
    description: 'Map customer jobs, outcomes, and pain points using Jobs-to-be-Done framework',
    icon: '🎯'
  }
};

// Get terminology for a mapping type
export const getTerminology = (mapType) => {
  return TERMINOLOGY[mapType] || TERMINOLOGY[MAP_TYPES.USER_JOURNEY];
};

// Default mapping types for new map creation
export const MAP_TYPE_OPTIONS = [
  {
    type: MAP_TYPES.USER_JOURNEY,
    title: 'User Journey Map',
    description: 'Traditional customer journey mapping with stages, tasks, and steps',
    icon: '🗺️',
    defaultName: 'My User Journey'
  },
  {
    type: MAP_TYPES.JOBS_TO_BE_DONE,
    title: 'Jobs to be Done Map',
    description: 'Map customer jobs using the Jobs-to-be-Done framework',
    icon: '🎯',
    defaultName: 'My Jobs Map'
  }
]; 