import type { Config } from 'tailwindcss';

const neutral = () => ({
  50: '#FAFAFA',
  100: '#F0F0F0',
  200: '#E2E2E2',
  300: '#C9C9C9',
  400: '#A3A3A3',
  500: '#6B6B6B',
  600: '#4A4A4A',
  700: '#333333',
  800: '#1F1F1F',
  900: '#141414',
  950: '#0B0B0C',
});

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Two-tone system: white and near-black halves, neutral ramp for every
        // former hue. The only chroma is `claim` (red-orange), reserved for the
        // point of disagreement. Former violet usage (counterarguments) maps to it.
        slate: neutral(),
        gray: neutral(),
        teal: neutral(),
        cyan: neutral(),
        purple: neutral(),
        pink: neutral(),
        indigo: neutral(),
        amber: neutral(),
        violet: {
          950: '#2B0D05',
          900: '#5A1A08',
          800: '#7A2308',
          700: '#A82B05',
          600: '#C93509',
          500: '#E8410F',
          400: '#FF5A2D',
          300: '#FF8A66',
          200: '#FFCDBD',
          100: '#FFE6DE',
          50: '#FFF3EE',
        },
        success: {
          500: '#10B981',
        },
        crimson: {
          500: '#EF4444',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'slide-in-up': 'slideInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        'count-up': 'countUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        shimmer: 'shimmer 2s linear infinite',
        typing: 'typing 1.4s ease-in-out infinite',
      },
      keyframes: {
        slideInUp: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        countUp: {
          from: { opacity: '0', transform: 'scale(0.8)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          from: { backgroundPosition: '-1000px 0' },
          to: { backgroundPosition: '1000px 0' },
        },
        typing: {
          '0%, 60%, 100%': { opacity: '0.3' },
          '30%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
