/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      screens: {
        desk: "1200px",
      },
      colors: {
        ink: "#0B0B10",
        surface: "#14141E",
        raised: "#1C1C2A",
        line: "#F4F2EC",
        muted: "#8E8CA0",
        accent: "#B026FF",
        cast: {
          narrator: "#FFC53D",
          saurav: "#3DE0FF",
          prof: "#7CFF6B",
          hype: "#FF5CA8",
          self: "#B026FF",
        },
      },
      fontFamily: {
        display: ['"Archivo Black"', "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        brut: "6px 6px 0 0 #000000",
        "brut-sm": "4px 4px 0 0 #000000",
        "brut-xs": "3px 3px 0 0 #000000",
        "brut-accent": "10px 10px 0 0 #B026FF",
        "brut-accent-sm": "4px 4px 0 0 #B026FF",
        "brut-line": "6px 6px 0 0 #F4F2EC",
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
      },
      animation: {
        marquee: "marquee 42s linear infinite",
      },
    },
  },
  plugins: [],
};
