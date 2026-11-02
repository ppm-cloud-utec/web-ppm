"use client";

/**
 * Detalle del proyecto: EL MOMENTO CLAVE DE LA DEMO.
 *
 * Completar una tarea aqui llama solo a ms-tareas. El avance del proyecto lo
 * recalcula ms-portafolios por evento. Para que se vea, tras completar se
 * vuelve a pedir el proyecto y el porcentaje ya cambio sin que el frontend se
 * lo haya dicho a nadie.
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { FalloApi, llamar, pct, soles, USAR_MOCKS } from "@/lib/api";
import { PRESUPUESTO, PROYECTOS, TAREAS } from "@/lib/mock";
import { Barra, Cargando, Error_, Estado, Semaforo } from "@/components/ui";

type Proyecto = {
  id: number; codigo: string; nombre: string; descripcion: string;
  estado: string; prioridad_score: number; avance_pct: number; salud: string;
  en_riesgo: boolean; presupuesto_estimado: number; portafolio: string;
  fecha_inicio: string | null; fecha_fin_estimada: string | null;
  historial?: { estado_anterior: string; estado_nuevo: string;
                avance_pct: number; motivo: string; cambiado_en: string }[];
};

type Tarea = {
  tarea_id: string; nombre: string; tipo: string; estado: string;
  fecha_fin: string | null; horas_estimadas: number;
};

type Presupuesto = typeof PRESUPUESTO;

export default function DetalleProyecto() {
  const { id } = useParams<{ id: string }>();
  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [presupuesto, setPresupuesto] = useState<Presupuesto | null>(null);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [completando, setCompletando] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (USAR_MOCKS) {
      setProyecto(PROYECTOS.find((p) => String(p.id) === id) as unknown as Proyecto);
      setTareas(TAREAS as Tarea[]);
      setPresupuesto(PRESUPUESTO);
      return;
    }
    try {
      const [p, t] = await Promise.all([
        llamar<Proyecto>("portafolios", `/proyectos/${id}`),
        llamar<Tarea[]>("tareas", `/proyectos/${id}/tareas?limite=100`),
      ]);
      setProyecto(p.datos);
      setTareas(t.datos);
      // El presupuesto puede no existir si el proyecto es muy nuevo y el
      // evento aun no llego: no es un error que deba romper la pantalla.
      try {
        const b = await llamar<Presupuesto>("presupuestos", `/presupuestos/${id}`);
        setPresupuesto(b.datos);
      } catch {
        setPresupuesto(null);
      }
    } catch (e) {
      setError(e instanceof FalloApi ? e.message : "Error inesperado");
    }
  }, [id]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function completar(tarea: Tarea) {
    setCompletando(tarea.tarea_id);
    setAviso("");
    const antes = Number(proyecto?.avance_pct ?? 0);

    try {
      if (USAR_MOCKS) {
        setTareas((ts) =>
          ts.map((t) =>
            t.tarea_id === tarea.tarea_id ? { ...t, estado: "completada" } : t,
          ),
        );
        const completadas = tareas.filter(
          (t) => t.estado === "completada" || t.tarea_id === tarea.tarea_id,
        ).length;
        const nuevo = (100 * completadas) / tareas.length;
        setProyecto((p) => (p ? { ...p, avance_pct: nuevo } : p));
        setAviso(
          `El avance pasó de ${pct(antes)} a ${pct(nuevo)} por el evento tarea.completada`,
        );
        return;
      }

      // Una sola llamada, a ms-tareas. Nada mas.
      const { datos } = await llamar<{
        proyecto: { avance_pct: number; total_tareas: number; tareas_completadas: number };
      }>("tareas", `/proyectos/${id}/tareas/${tarea.tarea_id}/completar`, {
        metodo: "POST",
      });

      // El worker de ms-portafolios tarda un instante en procesar el evento.
      // Se espera un momento y se recarga: el avance ya cambio solo.
      setAviso("Evento publicado. Esperando que el worker recalcule el avance...");
      await new Promise((r) => setTimeout(r, 2500));
      await cargar();
      setAviso(
        `El avance pasó de ${pct(antes)} a ${pct(datos.proyecto.avance_pct)} ` +
        `(${datos.proyecto.tareas_completadas} de ${datos.proyecto.total_tareas} tareas). ` +
        `El frontend nunca llamó a ms-portafolios.`,
      );
    } catch (e) {
      setError(e instanceof FalloApi ? e.message : "No se pudo completar");
    } finally {
      setCompletando(null);
    }
  }

  if (error) return <Error_ mensaje={error} />;
  if (!proyecto) return <Cargando que="el proyecto" />;

  const completadas = tareas.filter((t) => t.estado === "completada").length;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/proyectos" className="text-sm text-slate-500 hover:underline">
          ← Proyectos
        </Link>
        <div className="mt-1 flex items-center gap-3">
          <h1 className="text-xl font-semibold text-slate-900">
            {proyecto.nombre}
          </h1>
          <Semaforo salud={proyecto.salud} />
          <Estado estado={proyecto.estado} />
        </div>
        <p className="text-sm text-slate-500">
          {proyecto.codigo} · {proyecto.portafolio}
        </p>
      </div>

      {aviso && (
        <div className="rounded-lg border border-green-300 bg-green-50 p-3 text-sm text-green-900">
          {aviso}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase text-slate-500">Avance</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">
            {pct(proyecto.avance_pct)}
          </p>
          <div className="mt-2">
            <Barra valor={Number(proyecto.avance_pct)} />
          </div>
          <p className="mt-1 text-xs text-slate-400">
            lo mantiene el worker, no la API
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase text-slate-500">Prioridad</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">
            {Number(proyecto.prioridad_score).toFixed(1)}
          </p>
          <p className="mt-1 text-xs text-slate-400">score de 0 a 100</p>
        </div>

        <div
          className={`rounded-lg border bg-white p-4 ${
            presupuesto && Number(presupuesto.ejecutado_pct) >= 90
              ? "border-red-300"
              : "border-slate-200"
          }`}
        >
          <p className="text-xs uppercase text-slate-500">Ejecución</p>
          {presupuesto ? (
            <>
              <p
                className={`mt-1 text-2xl font-semibold tabular-nums ${
                  Number(presupuesto.ejecutado_pct) >= 90 ? "text-rojo" : ""
                }`}
              >
                {pct(presupuesto.ejecutado_pct)}
              </p>
              <div className="mt-2">
                <Barra valor={Number(presupuesto.ejecutado_pct)} invertido />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {soles(presupuesto.total_gastado)} de{" "}
                {soles(presupuesto.monto_aprobado)}
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-slate-500">
              Sin presupuesto todavía. Se crea cuando el worker de
              ms-presupuestos recibe <code>proyecto.creado</code>.
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Tareas: el panel con el que se dispara el evento */}
        <section className="lg:col-span-3">
          <h2 className="mb-2 text-sm font-medium text-slate-700">
            Tareas ({completadas} de {tareas.length} completadas)
          </h2>
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-100">
                {tareas.map((t) => (
                  <tr key={t.tarea_id}>
                    <td className="px-4 py-2">
                      <span
                        className={
                          t.estado === "completada"
                            ? "text-slate-400 line-through"
                            : "text-slate-900"
                        }
                      >
                        {t.nombre}
                      </span>
                      {t.tipo === "hito" && (
                        <span className="ml-2 rounded bg-slate-900 px-1.5 py-0.5 text-[10px] font-medium uppercase text-white">
                          hito
                        </span>
                      )}
                      <div className="text-xs text-slate-400">
                        {t.fecha_fin ?? "sin fecha"} · {t.horas_estimadas} h
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <Estado estado={t.estado} />
                    </td>
                    <td className="px-4 py-2 text-right">
                      {t.estado !== "completada" && (
                        <button
                          onClick={() => completar(t)}
                          disabled={completando !== null}
                          className="rounded-md bg-slate-900 px-2.5 py-1 text-xs font-medium text-white disabled:opacity-50"
                        >
                          {completando === t.tarea_id
                            ? "Completando..."
                            : "Completar"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {tareas.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-sm text-slate-500">
                      Este proyecto no tiene tareas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Completar llama solo a ms-tareas. El avance de arriba lo recalcula
            ms-portafolios al recibir <code>tarea.completada</code> por SQS.
          </p>
        </section>

        <div className="space-y-6 lg:col-span-2">
          {presupuesto && (
            <section>
              <h2 className="mb-2 text-sm font-medium text-slate-700">
                Partidas
              </h2>
              <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-4">
                {presupuesto.partidas.map((p) => (
                  <div key={p.id}>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-700">{p.nombre}</span>
                      <span className="tabular-nums text-slate-500">
                        {soles(p.gastado)} / {soles(p.monto_asignado)}
                      </span>
                    </div>
                    <div className="mt-1">
                      <Barra
                        valor={
                          Number(p.monto_asignado) > 0
                            ? (100 * Number(p.gastado)) / Number(p.monto_asignado)
                            : 0
                        }
                        invertido
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {proyecto.historial && proyecto.historial.length > 0 && (
            <section>
              <h2 className="mb-2 text-sm font-medium text-slate-700">
                Historial
              </h2>
              <ol className="space-y-2 rounded-lg border border-slate-200 bg-white p-4 text-xs">
                {proyecto.historial.slice(0, 8).map((h, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-slate-400">
                      {h.cambiado_en?.slice(0, 10)}
                    </span>
                    <span className="text-slate-700">
                      {h.estado_anterior
                        ? `${h.estado_anterior} → ${h.estado_nuevo}`
                        : h.estado_nuevo}
                      {h.motivo && (
                        <span className="text-slate-400"> · {h.motivo}</span>
                      )}
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
