/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './app/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#2563EB', light: '#3B82F6', dark: '#1D4ED8' },
        delivered: '#16A34A',
        missed: '#DC2626',
        pending: '#D97706',
        cow: '#7C3AED',
        report: '#2563EB',
      },
    },
  },
  plugins: [],
};
