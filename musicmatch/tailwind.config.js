/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./views/**/*.ejs"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"halyard-display"', "sans-serif"],
        body: ['"halyard-text"', "sans-serif"],
      },
      colors: {
        base: "#0f0e17",
        surface: "#1a1828",
        card: "#221f33",
        border: "#2e2b42",
        accent: "#7c6aff",
        green: "#4ade80",
        red: "#f87171",
        muted: "#6b6889",
        light: "#e8e6f0",
        bg: "#0b0c1e",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both",
        "fade-up": "fadeUp 0.55s ease forwards",
        "slide-down": "slideDown 0.4s ease forwards",
      },
    },
  },
  plugins: [],
};
