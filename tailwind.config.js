/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0a0e1a',
          dark: '#060810',
          light: '#0f1419',
        },
        accent: {
          DEFAULT: '#00ff87',
          50: '#e6fff4',
          100: '#ccffe9',
          200: '#99ffd3',
          300: '#66ffbd',
          400: '#33ffa7',
          500: '#00ff87',
          600: '#00d97e',
          700: '#00b865',
          800: '#00964c',
          900: '#007433',
          hover: '#00d97e',
          light: 'rgba(0, 255, 135, 0.06)',
        },
        gray: {
          850: '#1a1f2e',
          875: '#151a26',
          900: '#0f1419',
          925: '#0a0e1a',
          950: '#060810',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 30px 90px -20px rgba(0, 0, 0, 0.6), 0 15px 40px -10px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        'glow-accent': '0 0 40px rgba(0, 255, 135, 0.3), 0 0 80px rgba(0, 255, 135, 0.15)',
        'glow-gold': '0 0 40px rgba(255, 215, 0, 0.4), 0 0 80px rgba(255, 215, 0, 0.2)',
        'modern': '0 20px 60px -15px rgba(0, 0, 0, 0.5), 0 8px 20px -5px rgba(0, 0, 0, 0.3)',
        'inset-premium': 'inset 0 2px 10px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(0, 0, 0, 0.3)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(ellipse at top, var(--tw-gradient-stops))',
        'gradient-premium': 'linear-gradient(145deg, rgba(25, 35, 55, 0.5) 0%, rgba(15, 25, 40, 0.7) 100%)',
        'gradient-accent': 'linear-gradient(135deg, #00ff87 0%, #00d97e 100%)',
        'gradient-gold': 'linear-gradient(135deg, #ffd700 0%, #ffed4e 50%, #ffd700 100%)',
      },
      backdropBlur: {
        '3xl': '60px',
        '4xl': '80px',
      },
      animation: {
        'gradient': 'gradient-shift 3s ease infinite',
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'productFloat 3.5s ease-in-out infinite',
      },
      keyframes: {
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(1.5)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};
