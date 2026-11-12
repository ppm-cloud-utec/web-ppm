"use client";

/**
 * Shell de la aplicacion.
 *
 * Navegacion LATERAL, como monday y Smartsheet: deja todo el ancho a las
 * tablas y da sensacion de producto, no de sitio web con pestañas.
 *
 * El selector de organizacion vive arriba del todo y siempre visible, porque
 * la demo consiste en cambiar entre Acme y Globex y hay que ver con cual se
 * esta trabajando en cada momento.
 */

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { cerrarSesion, sesion, type Sesion } from "@/lib/api";
import { Avatar } from "@/components/ui";

const MENU = [
  { href: "/dashboard", texto: "Dashboard", icono: "▦" },
  { href: "/admision", texto: "Admisión", icono: "⤓" },
  { href: "/portafolios", texto: "Portafolios", icono: "▧" },
  { href: "/proyectos", texto: "Proyectos", icono: "▤" },
  { href: "/kanban", texto: "Kanban", icono: "▥" },
  { href: "/carga", texto: "Carga del equipo", icono: "◴" },
];

const ORGANIZACIONES: Record<string, string> = {
  "t-acme": "Acme Ingeniería",
  "t-globex": "Globex Consulting",
  "t-initech": "Initech Software",
};

export default function LayoutApp({ children }: { children: React.ReactNode }) {
  const ruta = usePathname();
  const router = useRouter();
  const [s, setS] = useState<Sesion | null>(null);

  useEffect(() => {
    const actual = sesion();
    if (!actual) {
      router.replace("/");
      return;
    }
    setS(actual);
  }, [router]);

  if (!s) return null;

  return (
    <div className="flex min-h-screen">
      {/* ---------------------------------------------------- lateral */}
      <aside className="flex w-60 shrink-0 flex-col border-r border-slate-800 bg-slate-900">
        <div className="px-4 py-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded bg-white text-sm font-bold text-slate-900">
              P
            </span>
            <span className="font-semibold text-white">Portafolio</span>
          </Link>
        </div>

        {/* Organizacion activa: lo mas visible de la barra */}
        <div className="mx-3 mb-4 rounded-lg bg-slate-800 px-3 py-2.5">
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
            Organización
          </p>
          <p className="mt-0.5 truncate text-sm font-medium text-white">
            {ORGANIZACIONES[s.tenant_id] ?? s.tenant_id}
          </p>
          <p className="font-mono text-[11px] text-slate-400">{s.tenant_id}</p>
        </div>

        <nav className="flex-1 space-y-0.5 px-3">
          {MENU.map((m) => {
            const activo = ruta.startsWith(m.href);
            return (
              <Link
                key={m.href}
                href={m.href}
                className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                  activo
                    ? "bg-slate-800 font-medium text-white"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                }`}
              >
                <span className="w-4 text-center text-xs">{m.icono}</span>
                {m.texto}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 p-3">
          <div className="flex items-center gap-2.5">
            <Avatar nombre={s.nombre} id={s.usuario_id} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-white">{s.nombre}</p>
              <p className="text-xs capitalize text-slate-400">{s.rol}</p>
            </div>
          </div>
          <button
            onClick={cerrarSesion}
            className="mt-2 w-full rounded-md px-3 py-1.5 text-left text-xs text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            Cambiar de organización / salir
          </button>
        </div>
      </aside>

      {/* ---------------------------------------------------- contenido */}
      <div className="min-w-0 flex-1 bg-slate-50">
        <main className="mx-auto max-w-[1400px] p-6">{children}</main>
      </div>
    </div>
  );
}
