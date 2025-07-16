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
      }
    },
  },
  plugins: [],
} 