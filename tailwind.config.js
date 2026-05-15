/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        syne:    ['Syne', 'sans-serif'],
        figtree: ['Figtree', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand:    '#6C5CE7',
        brand2:   '#8B7CF8',
        bg:       '#0D0D10',
        bg2:      '#111116',
        bg3:      '#16161C',
        bg4:      '#1C1C24',
        surface:  '#1E1E28',
        surface2: '#242430',
      },
      borderColor: {
        DEFAULT: 'rgba(255,255,255,0.07)',
      },
      keyframes: {
        'modal-overlay': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'modal-content': {
          '0%':   { opacity: '0', transform: 'translate(-50%, -48%) scale(0.96)' },
          '100%': { opacity: '1', transform: 'translate(-50%, -50%) scale(1)' },
        },
        'toast-in': {
          '0%':   { opacity: '0', transform: 'translateY(8px) scale(0.97)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      animation: {
        'modal-overlay': 'modal-overlay 0.15s ease',
        'modal-content': 'modal-content 0.18s cubic-bezier(0.16,1,0.3,1)',
        'toast-in':      'toast-in 0.2s cubic-bezier(0.16,1,0.3,1)',
      },
    },
  },
  plugins: [],
}
