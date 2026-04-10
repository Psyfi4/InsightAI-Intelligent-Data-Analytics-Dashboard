/** @type {import('tailwindcss').Config} */
export default {
  // Only scan files that actually use Tailwind classes
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Custom dark palette used throughout the dashboard
        surface: {
          900: '#0f172a',   // page background
          800: '#1e293b',   // card background
          700: '#334155',   // border / divider
          600: '#475569',   // muted text
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow':  'spin 2s linear infinite',
      },
    },
  },
  plugins: [],
}
