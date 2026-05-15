/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          ink: '#0f172a',
          soft: '#fdfbf7',
          accent: '#ff7b12'
        }
      },
      boxShadow: {
        soft: '0 12px 40px rgba(15, 23, 42, 0.08)'
      },
      fontFamily: {
        sans: ['"Trebuchet MS"', '"Microsoft YaHei UI"', '"PingFang SC"', 'sans-serif']
      }
    }
  },
  plugins: []
}
