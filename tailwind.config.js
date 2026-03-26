/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg:                '#131313',
        'surface-lowest':  '#0E0E0E',
        'surface-low':     '#1C1B1B',
        'surface':         '#201F1F',
        'surface-high':    '#2A2A2A',
        'surface-highest': '#353534',
        crimson:           '#BD3939',
        'crimson-dark':    '#8D141B',
        'on-surface':      '#e5e2e1',
        secondary:         '#c8c6c5',
        outline:           '#a88a87',
        'outline-var':     '#59413f',
        teal:              '#399BA3',
        mint:              '#9ADDBD',
      },
      borderRadius: {
        DEFAULT: '0.125rem',
        sm:   '0.125rem',
        md:   '0.25rem',
        lg:   '0.25rem',
        xl:   '0.5rem',
        '2xl':'0.75rem',
        full: '9999px',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

