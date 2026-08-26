/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          light: '#ffffff',
          dark: '#090a0f',
        },
        primary: {
          DEFAULT: '#22c55e', // Brand green
          light: '#4ade80',
          dark: '#15803d',
        },
        secondary: {
          DEFAULT: '#84cc16', // Lime
          light: '#a3e635',
          dark: '#4d7c0f',
        },
        accent: {
          DEFAULT: '#65a30d', // Olive accent
          light: '#a3e635',
          dark: '#3f6212',
        },
        success: '#10b981', // Green
        warning: '#f59e0b', // Orange
        danger: '#ef4444', // Red
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'grid-pattern': "radial-gradient(circle, rgba(34, 197, 94, 0.1) 1px, transparent 1px)",
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
