/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef2f2',
          100: '#ffe1e1',
          200: '#ffc8c8',
          300: '#ffa2a2',
          400: '#f87171',
          500: '#E53935', // Master PRD primary token
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          DEFAULT: '#E53935',
        },
        surface: {
          light: '#FFFFFF',
          'light-secondary': '#F7F8FA',
          dark: '#0f172a',
          'dark-secondary': '#1e293b',
          'dark-card': '#1e293b',
        },
        medical: {
          red: '#E53935',
          darkRed: '#B71C1C',
          crimson: '#DC2626',
          lightRed: '#FFEBEE',
          slate: '#1F2937',
          gray: '#6B7280',
          green: '#16A34A',
          amber: '#F59E0B',
        }
      },
      borderRadius: {
        'card': '18px',
        'btn': '11px',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'soft-lg': '0 10px 30px -4px rgba(0, 0, 0, 0.08)',
        'glow-red': '0 0 25px -3px rgba(229, 57, 53, 0.35)',
      },
      animation: {
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
