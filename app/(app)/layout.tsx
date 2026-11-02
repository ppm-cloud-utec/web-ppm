"use client";

/** Shell de la aplicacion: navegacion y el tenant activo siempre visible. */

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { cerrarSesion, sesion, type Sesion } from "@/lib/api";

const MENU = [
  { href: "/dashboard", texto: "Dashboard" },
  { href: "/admision", texto: "Admisión" },
  { href: "/proyectos", texto: "Proyectos" },
  { href: "/kanban", texto: "Kanban" },
  { href: "/carga", texto: "Carga del equipo" },
];

export default function LayoutApp({
  children,
}: {
  children: React.ReactNode;
}) {
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
    <div>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-3">
          <Link href="/dashboard" className="font-semibold text-slate-900">
            Portafolio
          </Link>

          <nav className="flex flex-1 gap-1">
            {MENU.map((m) => (
              <Link
                key={m.href}
                href={m.href}
                className={`rounded-md px-3 py-1.5 text-sm ${
                  ruta.startsWith(m.href)
                    ? "bg-slate-100 font-medium text-slate-900"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {m.texto}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3 text-sm">
            {/* El tenant activo siempre a la vista: en la demo se cambia de
                organizacion y hay que ver que los datos cambian con el. */}
            <span className="rounded-md bg-slate-900 px-2.5 py-1 text-xs font-medium text-white">
              {s.tenant_id}
            </span>
            <span className="text-slate-500">
              {s.nombre} · {s.rol}
            </span>
            <button
              onClick={cerrarSesion}
              className="text-slate-500 underline hover:text-slate-900"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-6">{children}</main>
    </div>
  );
}
