/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#020617',
          900: '#0f172a',
          850: '#151f33',
          800: '#1e293b',
          700: '#334155',
          600: '#475569',
        },
        emerald: {
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          900: '#064e3b',
        },
        teal: {
          400: '#2dd4bf',
          500: '#14b8a6',
        }
      },
      animation: {
        'pulse-radar': 'pulse-radar 2s cubic-bezier(0.2, 0.8, 0.4, 1) infinite',
      },
      keyframes: {
        'pulse-radar': {
          '0%': { transform: 'scale(0.8)', opacity: '0.9' },
          '70%': { transform: 'scale(2.4)', opacity: '0.0' },
          '100%': { transform: 'scale(2.6)', opacity: '0.0' },
        }
      }
    },
  },
  plugins: [],
}
