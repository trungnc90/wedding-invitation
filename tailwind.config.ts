import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#C9A96E',
          dark: '#B08D4F',
        },
        vintage: {
          cream: '#FAF8F5',
          paper: '#FEFDFB',
          tape: '#E8DFC4',
          ink: '#3D3D3D',
        },
      },
      fontFamily: {
        script: ['var(--font-script)', 'Playfair Display', 'serif'],
        names: ['var(--font-names)', 'cursive'],
        landing: ['var(--font-landing)', 'cursive'],
        mono: ['var(--font-mono)', 'monospace'],
        vintage: ['system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
