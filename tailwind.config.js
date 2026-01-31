/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      colors: {
        'splash-bg': '#1A3B14',
        'splash-text': '#8CE750',
        'splash-subtitle': '#D0D0D0',
        'protein': '#FFD700',
        'carbs': '#FFA500',
        'fat': '#8A2BE2',
        'add-button': '#90EE90',
        primary: '#26222F',
        secondary: '#757575',
        'calendar-accent': '#D3C1FF',
        'page-bg': '#E6E0E9',
      },
    },
  },
  plugins: [],
}
