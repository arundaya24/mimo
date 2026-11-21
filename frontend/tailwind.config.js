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
          50: '#FDFCFB',
          100: '#F8F6F1',
          200: '#F1EDE5',
          300: '#E7E2DA',
          400: '#D5CDC2',
        },
        brown: {
          300: '#BDB2A6',
          400: '#9E9284',
          500: '#756A5E',
          600: '#5A5046',
          700: '#433B33',
          800: '#2E2721',
          900: '#1D1814',
        },
        terracotta: {
          50: '#FBF5F1',
          100: '#F5E7DF',
          200: '#EBCBBD',
          300: '#DFA58E',
          400: '#D38061',
          500: '#C75D35',
          600: '#AF4A24',
          700: '#8E3818',
        },
        charcoal: {
          500: '#645F59',
          600: '#47433E',
          700: '#322F2B',
          800: '#22201D',
          900: '#141311',
        },
        border: {
          DEFAULT: '#E7E2DA',
          subtle: '#EFEBE4',
          hover: '#C8BFB3',
          active: '#9E9284',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      animation: {
        'shimmer': 'shimmer 3s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        }
      }
    },
  },
  plugins: [],
}
