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
        mono: ["var(--fuente-mono)", ...defaultTheme.fontFamily.mono],
      },
      colors: {
        // El semaforo de salud: relleno (marca) y tinta (texto) separados,
        // porque el relleno que mejor se distingue no siempre se puede leer.
        verde: "var(--tinta-bien)",
        ambar: "var(--tinta-alerta)",
        rojo: "var(--tinta-critico)",
        estado: {
          bien: "var(--estado-bien)",
          alerta: "var(--estado-alerta)",
          critico: "var(--estado-critico)",
        },
        // Color de serie de los graficos
        dato: {
          DEFAULT: "var(--dato)",
          tenue: "var(--dato-tenue)",
        },
        rejilla: "var(--rejilla)",
        eje: "var(--eje)",
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
        elevada: "var(--sombra-elevada)",
      },
      borderRadius: {
        // El radio codifica jerarquia: la respuesta principal es mas blanda
        // que la tabla que la sustenta.
        dato: "0.375rem",
        bloque: "0.75rem",
      },
    },
  },
} satisfies Config;
