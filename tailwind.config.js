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
    },
  },
  plugins: [],
}
