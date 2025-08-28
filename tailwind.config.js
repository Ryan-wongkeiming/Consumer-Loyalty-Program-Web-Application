/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'blackmores': {
          'teal': '#1DB5A6',
          'teal-dark': '#17A085',
          'blue': '#4A9EFF',
          'gray-light': '#F5F5F5',
          'gray-medium': '#E5E5E5',
          'text-dark': '#333333',
          'text-medium': '#666666',
        }
      }
    },
  },
  plugins: [],
};
