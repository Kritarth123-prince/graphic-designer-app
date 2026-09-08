/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0A0A0A',
        charcoal: '#111111',
        ivory: '#F5F1E8',
        paper: '#FFFFFF',
        gold: '#C9A468',
        bronze: '#8C6A4F',
      },
      fontFamily: {
        serif: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"Archivo"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      letterSpacing: {
        wide2: '0.14em',
      },
    },
  },
  plugins: [],
};
