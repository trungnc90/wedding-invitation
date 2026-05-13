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
          paper: '#FFFFFF',
          tape: '#E8DFC4',
          ink: '#3D3D3D',
        },
      },
      fontFamily: {
        script: ['var(--font-script)', 'Caveat', 'cursive'],
        names: ['var(--font-names)', 'Sacramento', 'cursive'],
        vintage: ['var(--font-mono)', 'Courier Prime', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
