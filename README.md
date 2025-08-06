# User Journey Map

A React application for creating and managing user journey maps with interactive three-level hierarchy: stages, tasks, and steps with persona-based color coding. Features dual view modes for comprehensive analysis.

## 🎯 **Live Interactive Demo**

**[🔴 LIVE: Enhanced Writer Workflow Map](https://cool-pasca-9f2869.netlify.app/)**
> Interactive workflow demonstration showing transformation from static Figma design to fully functional web application

## Features

- **Stages**: Add horizontally-displayed stages (e.g., "Awareness", "Consideration")
- **Tasks**: Add horizontally-displayed tasks within each stage (e.g., "Research", "Compare")  
- **Steps**: Add vertically-stacked step cards under each task
- **Step Details**: Each step includes description, pain points, and opportunities
- **Personas & Color-Coding**: Assign personas to steps with visual color coding
- **Dual View Modes**: Toggle between Step View and Painpoint View for different analysis perspectives
- **Interactive UI**: Click-to-edit functionality with modals for all levels
- **Responsive Design**: Works on various screen sizes using Tailwind CSS

## View Modes

### Step View (Default)
- Shows individual step cards with full details
- Allows editing, adding, and deleting steps
- Traditional hierarchical view of Stage → Task → Step

### Painpoint View
- Groups all pain points and opportunities from task steps
- Displays pain points and opportunities in separate colored sections
- Shows which step and persona each point originated from
- Ideal for identifying patterns and prioritizing improvements

## Getting Started

### Prerequisites

- Node.js (version 14 or later)
- npm or yarn

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

## Usage

1. **View Toggle**: Use the toggle in the header to switch between Step View and Painpoint View
2. **Adding Stages**: Click the "Add Stage" button to create new journey stages
3. **Editing Stages**: Click the edit icon (pencil) next to any stage name to rename it
4. **Adding Tasks**: Within each stage, click "Add Task" to create new task containers
5. **Editing Tasks**: Click the edit icon next to any task name to rename it
6. **Adding Steps**: Within each task, click "Add Step" to create new step cards (Step View only)
7. **Editing Steps**: Click on any step card to edit its details in a modal (Step View only)
8. **Persona Assignment**: Choose from three personas (Developer, Merchandiser, Ecommerce Leader)
9. **Deleting Items**: Use the delete buttons to remove steps, tasks, or entire stages

## Hierarchy Structure

```
Stage (horizontal layout)
├── Task (horizontal layout within stage)
│   ├── Step (vertical layout under task) - Step View
│   ├── Step
│   └── Step
│   OR
│   ├── Pain Points (grouped) - Painpoint View
│   └── Opportunities (grouped)
├── Task
│   ├── Step / Pain Points & Opportunities
│   └── Step / (depending on view mode)
└── Task
    └── Step / Pain Points & Opportunities
```

## Default Personas

- **Developer** (Blue): Technical team members working on implementation
- **Merchandiser** (Green): Business team members managing product strategy and marketing
- **Ecommerce Leader** (Purple): Senior leadership overseeing ecommerce operations and strategy

## Project Structure

```
src/
├── components/
│   ├── JourneyMap.js          # Main journey map container
│   ├── Stage.js               # Stage component managing tasks
│   ├── Task.js                # Task component with dual view support
│   ├── StepCard.js            # Step card with persona color coding
│   ├── PainpointView.js       # Painpoint view grouping component
│   ├── ViewToggle.js          # View mode toggle component
│   ├── PersonaLegend.js       # Persona color legend
│   ├── Modal.js               # Base modal component
│   ├── AddStageModal.js       # Modal for adding stages
│   ├── EditStageModal.js      # Modal for editing stage names
│   ├── AddTaskModal.js        # Modal for adding tasks
│   ├── EditTaskModal.js       # Modal for editing task names
│   ├── AddStepModal.js        # Modal for adding steps
│   └── EditStepModal.js       # Modal for editing steps
├── constants/
│   └── personas.js            # Persona definitions and colors
├── App.js                     # Main application component
├── index.js                   # Application entry point
└── index.css                  # Tailwind CSS imports
```

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm run eject` - Ejects from Create React App (one-way operation)

## Technologies Used

- React 18
- Tailwind CSS
- UUID for unique identifiers
- Create React App

## License

This project is open source and available under the [MIT License](LICENSE). 