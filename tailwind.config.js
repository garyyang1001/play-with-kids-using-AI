/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4A90E2',
        secondary: '#FF8C42',
        success: '#4CAF50',
        background: '#FEFDF8',
        text: '#2C3E50',
        accent: '#9B59B6',
      },
      fontFamily: {
        'sans': ['Noto Sans TC', 'Source Han Sans', 'PingFang TC', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};