import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

// next/font descarga y autoaloja la tipografia en el build: no hay peticion
// a Google en tiempo de ejecucion, asi que no depende de la red del aula ni
// filtra la visita de nadie.
// IBM Plex se dibujo para una empresa de ingenieria: terminaciones
// escuadradas y voz tecnica, que es el registro de quien gestiona obras.
// Inter es la tipografia por defecto de cualquier SaaS y no dice nada del
// oficio de esta gente.
const plex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--fuente",
});

// Solo para identificadores y cifras: un codigo de proyecto ES un codigo, y
// alinear soles en columna exige ancho fijo. No se usa para etiquetas.
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--fuente-mono",
});

export const metadata: Metadata = {
  title: "Portafolio — PPM",
  description: "Gestión de portafolios, proyectos, recursos y presupuestos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${plex.variable} ${plexMono.variable}`}>
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
