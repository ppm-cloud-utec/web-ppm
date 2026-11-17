import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// next/font descarga y autoaloja la tipografia en el build: no hay peticion
// a Google en tiempo de ejecucion, asi que no depende de la red del aula ni
// filtra la visita de nadie.
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--fuente",
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
    <html lang="es" className={inter.variable}>
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
