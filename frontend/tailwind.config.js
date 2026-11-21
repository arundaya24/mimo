/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFCF9',
          100: '#FBF8F2',
          200: '#F5EFE6',
          300: '#EFE6D9',
          400: '#E4D7C4',
        },
        brown: {
          50: '#F8F6F4',
          100: '#EFECE9',
          200: '#D7CEC7',
          300: '#B8A89C',
          400: '#9C8879',
          500: '#7D6652',
          600: '#645140',
          700: '#4D3E31',
          800: '#382D24',
          900: '#261F18',
        },
        terracotta: {
          50: '#FDF6F2',
          100: '#FAECE4',
          200: '#F5DACB',
          300: '#EBBFA9',
          400: '#E39C79',
          500: '#D97746',
          600: '#C25F2E',
          700: '#9E4A21',
          800: '#7E3B1B',
        },
        charcoal: {
          50: '#F4F4F4',
          100: '#E6E6E6',
          200: '#C7C6C5',
          300: '#A4A2A0',
          400: '#73706D',
          500: '#524E4B',
          600: '#3E3B38',
          700: '#2E2B28',
          800: '#22201D',
          900: '#181615',
        },
        sage: {
          100: '#EDF3EC',
          200: '#D6E4D4',
          400: '#8EB389',
          500: '#6E9867',
          600: '#567A50',
        },
        honey: {
          100: '#FEF8EA',
          300: '#F9DF9C',
          500: '#EBB438',
          600: '#CF9920',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Fraunces"', 'serif'],
        cozy: ['"Outfit"', 'sans-serif'],
      },
      animation: {
        'float': 'float 4s ease-in-out infinite',
        'purr': 'purr 2s ease-in-out infinite',
        'tail': 'tailWag 3s ease-in-out infinite',
        'breathe': 'breathe 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        purr: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' },
        },
        tailWag: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(12deg)' },
          '75%': { transform: 'rotate(-8deg)' },
        },
        breathe: {
          '0%, 100%': { transform: 'scaleY(1)' },
          '50%': { transform: 'scaleY(0.97)' },
        }
      }
    },
  },
  plugins: [],
}
