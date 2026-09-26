/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      animation: {
        "scan-line": "scan 2s linear infinite",
        "fade-in": "fadeIn 0.4s ease-in-out",
      },

      keyframes: {
        scan: {
          "0%": { top: "0%" },
          "100%": { top: "100%" },
        },

        fadeIn: {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },
    },
  },

  plugins: [],
};
