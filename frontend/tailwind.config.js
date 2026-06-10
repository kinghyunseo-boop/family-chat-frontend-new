/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        kakao: {
          yellow: "#FEE500",
          brown: "#3C1E1E",
          bg: "#B2C7D9",
          chat: "#ABC1D1",
          myMsg: "#FEE500",
          otherMsg: "#FFFFFF",
          sidebar: "#1E2A38",
          accent: "#5B93C5",
        },
      },
      fontFamily: {
        sans: ["'Noto Sans KR'", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
