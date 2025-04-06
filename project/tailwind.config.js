/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      animation: {
        'slow-rotate': 'slowRotate 20s linear infinite',
        'in': 'in 0.2s ease-out',
        'out': 'out 0.2s ease-in',
        'fade-in': 'fadeIn 0.1s ease-in-out',
        'slide-in-from-top-5': 'slideInFromTop5 0.2s ease-out',
      },
      keyframes: {
        slowRotate: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        in: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        out: {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-10px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInFromTop5: {
          '0%': { transform: 'translateY(-5px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        '.animate-in': {
          animation: 'in 0.2s ease-out forwards',
        },
        '.animate-out': {
          animation: 'out 0.2s ease-in forwards',
        },
      };
      addUtilities(newUtilities, ['responsive', 'hover']);
    },
  ],
};
