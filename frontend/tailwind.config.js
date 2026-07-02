/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Cairo', 'Tajawal', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eef5ff',
          100: '#d9e8ff',
          200: '#bcd6ff',
          300: '#8ebcff',
          400: '#5996ff',
          500: '#3470f5',
          600: '#1f51d6',
          700: '#1a40ad',
          800: '#1b388a',
          900: '#0f2557',
        },
        gold: {
          400: '#d4af37',
          500: '#c19b2e',
          600: '#a07f22',
        },
      },
      boxShadow: {
        card: '0 4px 20px rgba(15, 37, 87, 0.08)',
      },
    },
  },
  plugins: [],
};
