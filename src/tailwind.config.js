/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'persona-new': '#3B82F6',      // Blue
        'persona-returning': '#10B981', // Green
        'persona-power': '#8B5CF6',     // Purple
        'red-25': '#fef7f7',           // Very light red for hover
        'green-25': '#f7fef7',         // Very light green for hover
      }
    },
  },
  plugins: [],
} 