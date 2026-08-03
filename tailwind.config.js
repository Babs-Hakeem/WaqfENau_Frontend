/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3AAB6D',
          dark: '#2D8A56',
          light: '#E8F7EF',
        },
        amber: '#F5A623',
        red: '#E05252',
        blue: '#3B82F6',
        dark: '#111827',
        gray: {
          DEFAULT: '#6B7280',
          light: '#F3F4F6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'card': '16px',
        'button': '26px',
      },
      animation: {
        'shake': 'shake 0.5s ease-in-out',
        'float-up': 'floatUp 1s ease-out forwards',
        'pulse-green': 'pulseGreen 2s infinite',
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-10px)' },
          '75%': { transform: 'translateX(10px)' },
        },
        floatUp: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-40px)', opacity: '0' },
        },
        pulseGreen: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(58, 171, 109, 0.4)' },
          '50%': { boxShadow: '0 0 0 12px rgba(58, 171, 109, 0)' },
        },
      },
    },
  },
  plugins: [],
}