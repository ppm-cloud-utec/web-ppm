import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // El semaforo de salud del portafolio
        verde: "#15803d",
        ambar: "#b45309",
        rojo: "#b91c1c",
      },
    },
  },
} satisfies Config;
