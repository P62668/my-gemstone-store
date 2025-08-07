/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        ruby: {
          400: '#dc2626',
          500: '#b91c1c',
          600: '#991b1b',
        },
        emerald: {
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
        },
        sapphire: {
          400: '#3b82f6',
          500: '#2563eb',
          600: '#1d4ed8',
        },
        diamond: {
          400: '#f3f4f6',
          500: '#e5e7eb',
          600: '#d1d5db',
        },
        pearl: {
          400: '#fce7f3',
          500: '#fbcfe8',
          600: '#f9a8d4',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        shimmer: 'shimmer 2.5s linear infinite',
        'fade-in': 'fadeIn 0.6s ease-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'scale-up': 'scaleUp 0.3s ease-out',
        'scale-up-subtle': 'scaleUpSubtle 0.4s ease-out',
        'fade-in-scale': 'fadeInScale 0.5s ease-out',
        glow: 'glow 1.5s ease-in-out infinite alternate',
      },
      keyframes: {
        shimmer: {
          '0%': { opacity: '0', transform: 'translateX(-100%)' },
          '50%': { opacity: '0.5', transform: 'translateX(100%)' },
          '100%': { opacity: '0', transform: 'translateX(200%)' },
        },
        glow: {
          '0%': { filter: 'drop-shadow(0 0 0px #fff)' },
          '100%': { filter: 'drop-shadow(0 0 16px #fff)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        scaleUp: {
          '0%': {
            opacity: '0',
            transform: 'scale(0.95)',
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
        scaleUpSubtle: {
          '0%': {
            opacity: '0',
            transform: 'scale(0.98)',
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
        fadeInScale: {
          '0%': {
            opacity: '0',
            transform: 'scale(0.9) translateY(10px)',
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1) translateY(0)',
          },
        },
      },
    },
  },
  plugins: [],
};
