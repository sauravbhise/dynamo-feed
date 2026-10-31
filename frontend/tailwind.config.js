/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      screens: {
        desk: "1200px",
      },
      colors: {
        ink: "#211C1F",
        surface: "#2B2428",
        raised: "#352C30",
        cream: "#F2EAE2",
        muted: "#B9ADA6",
        sage: {
          DEFAULT: "#93B29C",
          deep: "#1A3122",
        },
        cast: {
          narrator: "#C7B3D9",
          saurav: "#E0A5EC",
          prof: "#DEC490",
          hype: "#D9A5AE",
          self: "#A9BED6",
          visitor: "#B9ADA6",
        },
      },
      fontFamily: {
        display: ["Nunito", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 8px 24px rgba(0, 0, 0, 0.25)",
        card: "0 12px 32px rgba(0, 0, 0, 0.3)",
      },
    },
  },
  plugins: [],
};
