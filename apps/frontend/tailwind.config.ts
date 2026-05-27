import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        veda: {
          50: '#eef4ff',
          100: '#dbe7ff',
          500: '#3b6df0',
          600: '#2855d6',
          700: '#1f43ab',
          900: '#0f1f4e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'ui-serif', 'serif'],
      },
    },
  },
  plugins: [],
};
export default config;
