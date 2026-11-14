export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        sky: {
          DEFAULT: '#0EA5E9',
          50: '#F0F9FF',
          100: '#E0F2FE',
          300: '#7DD3FC',
          400: '#38BDF8',
        },
        accent: {
          DEFAULT: '#F59E0B',
          soft: '#FFFBEB',
          strong: '#B45309',
        },
        surface: '#FFFFFF',
        canvas: '#F5F9FF',
        ink: '#0F172A',
        muted: '#475569',
        subtle: '#94A3B8',
        line: '#E2E8F0',
        success: {
          DEFAULT: '#10B981',
          soft: '#ECFDF5',
          line: '#A7F3D0',
        },
        danger: {
          DEFAULT: '#EF4444',
          soft: '#FEF2F2',
          line: '#FECACA',
        },
        info: {
          DEFAULT: '#0EA5E9',
          soft: '#F0F9FF',
          line: '#BAE6FD',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 18px 48px -34px rgb(37 99 235 / 0.26)',
        card: '0 12px 30px -24px rgb(15 23 42 / 0.22)',
        'card-hover': '0 22px 40px -28px rgb(14 165 233 / 0.35)',
        button: '0 10px 22px -12px rgb(37 99 235 / 0.6)',
        'button-hover': '0 14px 28px -12px rgb(37 99 235 / 0.64)',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'soft-float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.8s infinite',
        'soft-float': 'soft-float 6s ease-in-out infinite',
      },
    },
  },
}
