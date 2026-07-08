/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        heading: ["Poppins", "sans-serif"],
        body: ["Inter", "sans-serif"],
        dashboard: ["Roboto", "sans-serif"]
      },
      colors: {
        shakti: {
          pink: "#D81B60",
          purple: "#6A1B9A",
          teal: "#26A69A",
          ink: "#1E293B",
          mist: "#F8FAFC"
        }
      },
      boxShadow: {
        glow: "0 24px 80px rgba(216, 27, 96, 0.22)",
        teal: "0 20px 60px rgba(38, 166, 154, 0.22)"
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        pulseSoft: "pulseSoft 2.2s ease-in-out infinite",
        waveform: "waveform 1.05s ease-in-out infinite"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-16px)" }
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.55", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.05)" }
        },
        waveform: {
          "0%, 100%": { transform: "scaleY(0.35)" },
          "50%": { transform: "scaleY(1)" }
        }
      }
    }
  },
  plugins: []
};
