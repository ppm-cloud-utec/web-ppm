"use client";

/** Kanban de proyectos por estado. */

import { useEffect, useState } from "react";
import Link from "next/link";

import { FalloApi, llamar, soles, USAR_MOCKS } from "@/lib/api";
import { PROYECTOS } from "@/lib/mock";
import { Cargando, Error_, Semaforo } from "@/components/ui";

type Proyecto = {
  id: number; codigo: string; nombre: string; estado: string;
  avance_pct: number; salud: string; presupuesto_estimado: number;
  prioridad_score: number;
};

const COLUMNAS = [
  { codigo: "propuesto", titulo: "Propuesto" },
  { codigo: "aprobado", titulo: "Aprobado" },
  { codigo: "en_curso", titulo: "En curso" },
  { codigo: "en_pausa", titulo: "En pausa" },
  { codigo: "cerrado", titulo: "Cerrado" },
];

export default function Kanban() {
  const [proyectos, setProyectos] = useState<Proyecto[] | null>(null);
  const [error, setError] = useState("");
  const [moviendo, setMoviendo] = useState<number | null>(null);

  useEffect(() => {
    if (USAR_MOCKS) {
      setProyectos(PROYECTOS as Proyecto[]);
      return;
    }
    llamar<Proyecto[]>("portafolios", "/proyectos?limite=200")
      .then(({ datos }) => setProyectos(datos))
      .catch((e: FalloApi) => setError(e.message));
  }, []);

  /** Mover una tarjeta cambia el estado del proyecto por la API. */
  async function mover(p: Proyecto, nuevo: string) {
    if (p.estado === nuevo) return;
    setMoviendo(p.id);
    const antes = p.estado;
    setProyectos((lista) =>
      lista!.map((x) => (x.id === p.id ? { ...x, estado: nuevo } : x)),
    );
    try {
      if (!USAR_MOCKS) {
        await llamar("portafolios", `/proyectos/${p.id}`, {
          metodo: "PUT",
          cuerpo: { estado: nuevo, motivo: "movido en el kanban" },
        });
      }
    } catch (e) {
      // Si falla, se revierte en pantalla: no se deja una mentira visible.
      setProyectos((lista) =>
        lista!.map((x) => (x.id === p.id ? { ...x, estado: antes } : x)),
      );
      setError(e instanceof FalloApi ? e.message : "No se pudo mover");
    } finally {
      setMoviendo(null);
    }
  }

  if (error) return <Error_ mensaje={error} />;
  if (!proyectos) return <Cargando que="el tablero" />;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Kanban</h1>
        <p className="text-sm text-slate-500">
          Arrastra una tarjeta a otra columna para cambiar el estado del proyecto
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-5">
        {COLUMNAS.map((col) => {
          const enColumna = proyectos.filter((p) => p.estado === col.codigo);
          return (
            <div
              key={col.codigo}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                const id = Number(e.dataTransfer.getData("text/plain"));
                const p = proyectos.find((x) => x.id === id);
                if (p) mover(p, col.codigo);
              }}
              className="rounded-lg bg-slate-100 p-2"
            >
              <div className="mb-2 flex items-center justify-between px-1">
                <h2 className="text-sm font-medium text-slate-700">
                  {col.titulo}
                </h2>
                <span className="text-xs text-slate-500">{enColumna.length}</span>
              </div>

              <div className="space-y-2">
                {enColumna.map((p) => (
                  <div
                    key={p.id}
                    draggable
                    onDragStart={(e) =>
                      e.dataTransfer.setData("text/plain", String(p.id))
                    }
                    className={`cursor-grab rounded-md border border-slate-200 bg-white p-2.5 text-sm ${
                      moviendo === p.id ? "opacity-50" : ""
                    }`}
                  >
                    <Link
                      href={`/proyectos/${p.id}`}
                      className="font-medium text-slate-900 hover:underline"
                    >
                      {p.nombre}
                    </Link>
                    <div className="mt-1 flex items-center justify-between">
                      <Semaforo salud={p.salud} />
                      <span className="text-xs tabular-nums text-slate-500">
                        {Number(p.avance_pct).toFixed(0)}%
                      </span>
                    </div>
                    <p className="mt-1 text-xs tabular-nums text-slate-400">
                      {soles(p.presupuesto_estimado)}
                    </p>
                  </div>
                ))}

                {enColumna.length === 0 && (
                  <p className="px-1 py-4 text-center text-xs text-slate-400">
                    vacío
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
