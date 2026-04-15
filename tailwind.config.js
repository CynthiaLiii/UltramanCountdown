/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 我們可以在這裡自定義超人力霸王的代表色
      colors: {
        ultraRed: '#E60012',
        ultraSilver: '#C0C0C0',
        paperYellow: '#FDF5E6',
      },
      fontFamily: {
        handwriting: ['"Noto Sans TC"', 'cursive'], // 模擬手寫感
      }
    },
  },
  plugins: [],
}
