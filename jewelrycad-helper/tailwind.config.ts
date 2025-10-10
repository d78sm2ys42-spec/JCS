import type { Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/lib/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        background: '#0f0f0f',
        foreground: '#f5f5f5',
        accent: '#c8a951',
        muted: '#1f1f1f',
        border: '#2a2a2a'
      },
      fontFamily: {
        sans: ['var(--font-sans)', ...fontFamily.sans]
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
};

export default config;
