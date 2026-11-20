"use client";

/**
 * Dashboard ejecutivo.
 *
 * Esta organizado alrededor de las 4 PREGUNTAS del producto, no como una
 * rejilla de tarjetas iguales: cada bloque responde una, y la respuesta va
 * primero y grande. Un PMO entra aqui a decidir, no a mirar numeros sueltos.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bar, BarChart, CartesianGrid, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

import { CURSOR, EJE, REJILLA, Tooltip_ } from "@/components/grafico";

import { FalloApi, llamar, pct, soles, USAR_MOCKS } from "@/lib/api";
import { KPIS, PROYECTOS, SERIE } from "@/lib/mock";
import {
  Barra, Cargando, Error_, Fecha, Seccion, Semaforo, Tarjeta,
} from "@/components/ui";

type Kpis = typeof KPIS;
type Punto = { periodo: string; tareas_completadas?: number; monto_gastado?: number };

export default function Dashboard() {
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [serie, setSerie] = useState<Punto[]>([]);
  const [riesgo, setRiesgo] = useState<any[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (USAR_MOCKS) {
      setKpis(KPIS);
      setSerie(SERIE);
      setRiesgo(PROYECTOS.filter((p) => p.salud !== "verde"));
      return;
    }
    Promise.all([
      llamar<Kpis>("analitico", "/kpis"),
      llamar<Punto[]>("analitico", "/kpis/serie"),
      llamar<any[]>("portafolios", "/proyectos?en_riesgo=true&limite=10"),
    ])
      .then(([k, s, r]) => { setKpis(k.datos); setSerie(s.datos); setRiesgo(r.datos); })
      .catch((e: FalloApi) => setError(e.message));
  }, []);

  if (error) return <Error_ mensaje={error} />;
  if (!kpis) return <Cargando que="el dashboard" />;

  const saldo = kpis.presupuesto_comprometido - kpis.monto_gastado;
  const ejecucionAlta = kpis.ejecucion_global_pct >= 90;

  return (
    <div className="space-y-8">
      {/* La apertura responde la pregunta con la que esta persona entra, en
          una frase. Un numero grande con su etiqueta es el tratamiento por
          defecto de cualquier panel y obliga a interpretar; aqui el titular
          ya es la conclusion y debajo esta la evidencia. */}
      <header className="aparece border-b border-borde-fuerte pb-6">
        <p className="text-sm text-tinta-media">Hoy en la cartera</p>
        <h1 className="mt-2 max-w-[22ch] text-[2.1rem] font-semibold leading-[1.15] tracking-tight text-tinta sm:text-[2.6rem]">
          {riesgo.length === 0 ? (
            <>Ningún proyecto necesita atención.</>
          ) : (
            <>
              <span className="tabular">{riesgo.length}</span> de{" "}
              <span className="tabular">
                {kpis.proyectos_creados.toLocaleString("es-PE")}
              </span>{" "}
              proyectos necesitan atención.
            </>
          )}
        </h1>
        <p className="mt-3 max-w-[60ch] text-sm leading-relaxed text-tinta-media">
          {kpis.presupuestos_excedidos > 0 ? (
            <>
              {kpis.presupuestos_excedidos.toLocaleString("es-PE")} presupuestos
              cruzaron el 90% de lo aprobado y quedan {soles(saldo)} por ejecutar
              en toda la cartera.
            </>
          ) : (
            <>Ningún presupuesto cruzó el 90% de lo aprobado. Quedan {soles(saldo)} por ejecutar.</>
          )}
        </p>
      </header>

      {/* ---------------------------------------------- PREGUNTA 1 */}
      <Seccion pregunta="¿En qué estamos gastando y cuánto queda?">
        <div className="rounded-bloque border border-borde bg-superficie p-5">
          <div className="flex flex-wrap items-end gap-x-10 gap-y-4">
            <div>
              <p className="text-xs text-tinta-media">Saldo disponible</p>
              <p className="mt-1 text-4xl font-semibold tabular-nums text-tinta">
                {soles(saldo)}
              </p>
            </div>
            <div className="min-w-[14rem] flex-1">
              <div className="mb-1.5 flex justify-between text-xs">
                <span className="text-tinta-media">
                  Ejecutado <span className="font-medium">{pct(kpis.ejecucion_global_pct)}</span>
                </span>
                <span className="tabular-nums text-tinta-suave">
                  {soles(kpis.monto_gastado)} de {soles(kpis.presupuesto_comprometido)}
                </span>
              </div>
              <Barra valor={kpis.ejecucion_global_pct} invertido etiqueta={false} />
              <p className="mt-1.5 text-xs text-tinta-media">
                {kpis.gastos.toLocaleString("es-PE")} gastos registrados
              </p>
            </div>
            <div
              className={`rounded-lg px-4 py-2.5 ${
                kpis.presupuestos_excedidos > 0 ? "bg-red-50" : "bg-slate-50"
              }`}
            >
              <p className="text-xs text-tinta-media">Excedidos</p>
              <p
                className={`text-2xl font-semibold tabular-nums ${
                  kpis.presupuestos_excedidos > 0 ? "text-red-700" : "text-tinta"
                }`}
              >
                {kpis.presupuestos_excedidos}
              </p>
              <p className="text-xs text-tinta-media">cruzaron el 90%</p>
            </div>
          </div>
          {ejecucionAlta && (
            <p className="mt-4 border-t border-red-100 pt-3 text-sm text-red-700">
              La ejecución global supera el 90%. Revisa los proyectos en riesgo
              antes de aprobar nuevas propuestas.
            </p>
          )}
        </div>
      </Seccion>

      {/* ------------------------------------- PREGUNTAS 2 y avance */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Seccion
          pregunta="¿Quién está sobrecargado?"
          accion={
            <Link href="/carga" className="text-xs text-tinta-media underline hover:text-tinta">
              Ver el equipo
            </Link>
          }
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Tarjeta
              titulo="Sobreasignadas"
              valor={kpis.sobreasignaciones}
              detalle="por encima del 100%"
              alerta={kpis.sobreasignaciones > 0}
              acento
            />
            <Tarjeta
              titulo="Horas comprometidas"
              valor={kpis.horas_comprometidas.toLocaleString("es-PE")}
              detalle={`${kpis.asignaciones} asignaciones vigentes`}
            />
          </div>
        </Seccion>

        <Seccion pregunta="¿Cómo va la ejecución?">
          <div className="rounded-dato border border-borde bg-superficie p-4">
            <div className="flex items-baseline justify-between">
              <p className="text-3xl font-semibold tabular-nums text-tinta">
                {pct(kpis.avance_global_pct)}
              </p>
              <p className="text-xs tabular-nums text-tinta-media">
                {kpis.tareas_completadas.toLocaleString("es-PE")} de{" "}
                {kpis.tareas_creadas.toLocaleString("es-PE")} tareas
              </p>
            </div>
            <div className="mt-3">
              <Barra valor={kpis.avance_global_pct} etiqueta={false} />
            </div>
            <p className="mt-2 text-xs text-tinta-suave">
              Lo recalculan los eventos <code>tarea.completada</code>, nadie lo reporta a mano.
            </p>
          </div>
        </Seccion>
      </div>

      {/* ---------------------------------------------- PREGUNTA 3 */}
      <Seccion
        pregunta="¿Qué proyecto se va a caer?"
        titulo={`${riesgo.length} proyectos en ámbar o rojo`}
        accion={
          <Link href="/proyectos?en_riesgo=true" className="text-xs text-tinta-media underline hover:text-tinta">
            Ver todos
          </Link>
        }
      >
        {riesgo.length === 0 ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 px-4 py-6 text-center text-sm text-emerald-800">
            Ningún proyecto en riesgo ahora mismo.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 overflow-hidden rounded-lg border border-borde bg-superficie">
            {riesgo.slice(0, 6).map((p) => (
              <Link
                key={p.id}
                href={`/proyecto?id=${p.id}`}
                className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50"
              >
                <Semaforo salud={p.salud} mini />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-tinta">{p.nombre}</p>
                  <p className="text-xs text-tinta-suave">{p.codigo}</p>
                </div>
                <div className="w-32 shrink-0">
                  <Barra valor={Number(p.avance_pct)} />
                </div>
                <div className="hidden w-24 shrink-0 text-right sm:block">
                  <Fecha valor={p.fecha_fin_estimada} vence />
                </div>
                <div className="w-28 shrink-0 text-right text-sm tabular-nums text-tinta-media">
                  {soles(p.presupuesto_estimado)}
                </div>
              </Link>
            ))}
          </div>
        )}
      </Seccion>

      {/* ---------------------------------------------- tendencia */}
      {serie.length > 0 && (
        <Seccion pregunta="¿Cómo venimos en el tiempo?">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-dato border border-borde bg-superficie p-4">
              <p className="mb-3 text-xs font-medium text-tinta-suave">
                Tareas completadas por mes
              </p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={serie} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                  <CartesianGrid {...REJILLA} />
                  <XAxis dataKey="periodo" {...EJE} />
                  <YAxis {...EJE} />
                  <Tooltip cursor={CURSOR} content={<Tooltip_ />} />
                  {/* Extremo redondeado solo arriba: abajo la barra tiene que
                      apoyar en la linea base o la longitud se lee mal. */}
                  <Bar
                    dataKey="tareas_completadas"
                    fill="var(--dato)"
                    radius={[4, 4, 0, 0]}
                    name="Completadas"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-dato border border-borde bg-superficie p-4">
              <p className="mb-3 text-xs font-medium text-tinta-suave">
                Gasto por mes
              </p>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={serie} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
                  <CartesianGrid {...REJILLA} />
                  <XAxis dataKey="periodo" {...EJE} />
                  <YAxis {...EJE} tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`} />
                  <Tooltip content={<Tooltip_ formato={(v) => soles(v)} />} />
                  {/* Antes esta linea usaba el ambar del semaforo. Un color de
                      estado no puede ser tambien un color de serie: deja de
                      significar "atencion" cuando aparece en un grafico que
                      solo informa. */}
                  <Line
                    type="monotone" dataKey="monto_gastado" stroke="var(--dato)"
                    strokeWidth={2} dot={false} name="Gastado"
                    activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--superficie)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Seccion>
      )}

      <p className="border-t border-borde pt-4 text-xs text-tinta-suave">
        Los KPIs salen de los agregados que <code>ms-analitico</code> mantiene a
        partir de los eventos del sistema. Ningún número se calcula a mano.
      </p>
    </div>
  );
}
