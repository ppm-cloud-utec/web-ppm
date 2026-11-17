import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // Inter llega por next/font; el fallback mantiene la pantalla
        // legible si la tipografia tarda en cargar.
        sans: ["var(--fuente)", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        // El semaforo de salud del portafolio
        verde: "#15803d",
        ambar: "#b45309",
        rojo: "#b91c1c",
        // Identidad del producto
        marca: {
          DEFAULT: "var(--marca)",
          fuerte: "var(--marca-fuerte)",
          tenue: "var(--marca-tenue)",
        },
        superficie: "var(--superficie)",
        borde: "var(--borde)",
        "borde-fuerte": "var(--borde-fuerte)",
        tinta: {
          DEFAULT: "var(--tinta)",
          media: "var(--tinta-media)",
          suave: "var(--tinta-suave)",
        },
      },
      boxShadow: {
        carta: "var(--sombra-carta)",
        elevada: "var(--sombra-elevada)",
      },
    },
  },
} satisfies Config;
