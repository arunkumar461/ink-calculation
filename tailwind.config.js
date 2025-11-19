/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyan: {
          DEFAULT: '#00FFFF',
          dim: '#008B8B',
        },
        magenta: {
          DEFAULT: '#FF00FF',
          dim: '#8B008B',
        },
        yellow: {
          DEFAULT: '#FFFF00',
          dim: '#CCCC00',
        },
        black: {
          DEFAULT: '#000000',
          dim: '#333333',
        }
      }
    },
  },
  plugins: [],
}
