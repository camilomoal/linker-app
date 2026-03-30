/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          black:       '#0a0a0a',
          surface:     '#1c1c1e',
          surface2:    '#2a2a2e',
          border:      '#3a3a3e',
          primary:     '#49A3D3',
          'primary-dim': '#3a8ab8',
          secondary:   '#97D2EC',
          muted:       '#8e8e93',
          bg:          '#f2f2f7',
          card:        '#ffffff',
        },
      },
    },
  },
  plugins: [],
}