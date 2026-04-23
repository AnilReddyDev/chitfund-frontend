// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#111827",   // dark
        accent: "#16a34a",    // green
        soft: "#f9fafb",
      },
      borderRadius: {
        xl: "16px",
        "2xl": "20px",
      },
    },
  },
};