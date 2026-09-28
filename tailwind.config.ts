import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#0A5BD9', light: '#EAF2FF', dark: '#0848AE' },
        available: { DEFAULT: '#16A34A', light: '#E8F7EE', dark: '#128A3E' },
        busy: { DEFAULT: '#EF4444', light: '#FDECEC' },
        unknown: { DEFAULT: '#9CA3AF', light: '#F1F3F6' },
        zone: { a: '#16A34A', b: '#0A5BD9', c: '#F08C00', d: '#EF4444' },
        ink: { DEFAULT: '#111A2E', sub: '#4B5563', muted: '#8A94A6' },
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
        card: '0 2px 12px rgba(17, 26, 46, 0.06)',
        float: '0 4px 16px rgba(17, 26, 46, 0.12)',
      },
      maxWidth: {
        phone: '390px',
      },
    },
  },
  plugins: [],
};

export default config;
