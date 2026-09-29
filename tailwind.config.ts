import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#1E5EEB', light: '#EBF1FE', dark: '#164BC0' },
        available: { DEFAULT: '#2FAF56', light: '#E9F7EE', dark: '#248A43' },
        busy: { DEFAULT: '#EF4444', light: '#FDECEC' },
        unknown: { DEFAULT: '#9CA3AF', light: '#F1F3F6' },
        zone: { a: '#2FAF56', b: '#1E5EEB', c: '#F08C00', d: '#EF4444' },
        ink: { DEFAULT: '#111827', sub: '#4B5563', muted: '#8A94A6' },
        navy: '#1C2B4A',
        line: '#EDF0F5',
        surface: '#F6F8FB',
      },
      fontFamily: {
        sans: ['"Pretendard Variable"', 'Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '18px',
      },
      boxShadow: {
        card: '0 2px 12px rgba(17,24,39, 0.06)',
        float: '0 4px 16px rgba(17,24,39, 0.12)',
      },
      maxWidth: {
        phone: '390px',
      },
      keyframes: {
        'slot-flash': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
      },
      animation: {
        'slot-flash': 'slot-flash 1.6s ease-out forwards',
      },
    },
  },
  plugins: [],
};

export default config;
