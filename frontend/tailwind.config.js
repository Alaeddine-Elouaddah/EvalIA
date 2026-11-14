export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1E3A8A',
          50: '#EFF4FF',
          100: '#DDE8FF',
          200: '#BFD2FF',
          300: '#91B2FF',
          400: '#5D88F5',
          500: '#3B63D1',
          600: '#294BAF',
          700: '#1E3A8A',
          800: '#1C3475',
          900: '#1D3064',
        },
        accent: {
          DEFAULT: '#F59E0B',
          soft: '#FFF7E6',
          strong: '#B45309',
        },
        surface: '#FFFFFF',
        canvas: '#F5F7FB',
        ink: '#0F172A',
        muted: '#475569',
        line: '#E2E8F0',
        success: {
          DEFAULT: '#15803D',
          soft: '#F0FDF4',
          line: '#BBF7D0',
        },
        danger: {
          DEFAULT: '#B91C1C',
          soft: '#FEF2F2',
          line: '#FECACA',
        },
        info: {
          DEFAULT: '#1D4ED8',
          soft: '#EFF6FF',
          line: '#BFDBFE',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 12px 32px -18px rgb(15 23 42 / 0.18)',
      },
    },
  },
}
