"use client";

/**
 * El dashboard ejecutivo: las 4 preguntas del producto en una pantalla.
 *   1. En que estamos gastando y cuanto queda?
 *   2. Quien esta sobrecargado?
 *   3. Que proyecto se va a caer?
 *   4. Que priorizamos el proximo trimestre?
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bar, BarChart, CartesianGrid, Legend, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

import { FalloApi, llamar, pct, sesion, soles, USAR_MOCKS } from "@/lib/api";
import { KPIS, PROYECTOS, SERIE } from "@/lib/mock";
import { Barra, Cargando, Error_, Semaforo, Tarjeta } from "@/components/ui";

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
      // Los proyectos que se van a caer: en riesgo o en ambar
      llamar<any[]>("portafolios", "/proyectos?en_riesgo=true&limite=10"),
    ])
      .then(([k, s, r]) => {
        setKpis(k.datos);
        setSerie(s.datos);
        setRiesgo(r.datos);
      })
      .catch((e: FalloApi) => setError(e.message));
  }, []);

  if (error) return <Error_ mensaje={error} />;
  if (!kpis) return <Cargando que="el dashboard" />;

  const s = sesion();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          Dashboard ejecutivo
        </h1>
        <p className="text-sm text-slate-500">
          {s?.tenant_id} · {kpis.eventos_procesados.toLocaleString("es-PE")}{" "}
          eventos procesados
        </p>
      </div>

      {/* 1. En que estamos gastando */}
      <section>
        <h2 className="mb-2 text-sm font-medium text-slate-700">
          ¿En qué estamos gastando y cuánto queda?
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Tarjeta
            titulo="Presupuesto comprometido"
            valor={soles(kpis.presupuesto_comprometido)}
            detalle={`${kpis.proyectos_creados} proyectos`}
          />
          <Tarjeta
            titulo="Ejecutado"
            valor={soles(kpis.monto_gastado)}
            detalle={`${kpis.gastos} gastos registrados`}
          />
          <Tarjeta
            titulo="Ejecución"
            valor={pct(kpis.ejecucion_global_pct)}
            alerta={kpis.ejecucion_global_pct >= 90}
          />
          <Tarjeta
            titulo="Presupuestos excedidos"
            valor={kpis.presupuestos_excedidos}
            detalle="cruzaron el 90%"
            alerta={kpis.presupuestos_excedidos > 0}
          />
        </div>
      </section>

      {/* 2 y 3 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-2 text-sm font-medium text-slate-700">
            ¿Quién está sobrecargado?
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Tarjeta
              titulo="Personas sobreasignadas"
              valor={kpis.sobreasignaciones}
              detalle="pasaron del 100%"
              alerta={kpis.sobreasignaciones > 0}
            />
            <Tarjeta
              titulo="Horas comprometidas"
              valor={kpis.horas_comprometidas.toLocaleString("es-PE")}
              detalle={`${kpis.asignaciones} asignaciones`}
            />
          </div>
          <Link
            href="/carga"
            className="mt-2 inline-block text-sm text-slate-600 underline"
          >
            Ver la carga del equipo
          </Link>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-medium text-slate-700">
            Avance de la ejecución
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Tarjeta
              titulo="Tareas completadas"
              valor={`${kpis.tareas_completadas.toLocaleString("es-PE")} / ${kpis.tareas_creadas.toLocaleString("es-PE")}`}
            />
            <Tarjeta titulo="Avance global" valor={pct(kpis.avance_global_pct)} />
          </div>
        </section>
      </div>

      {/* 3. Que proyecto se va a caer */}
      <section>
        <h2 className="mb-2 text-sm font-medium text-slate-700">
          ¿Qué proyecto se va a caer?
        </h2>
        {riesgo.length === 0 ? (
          <p className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">
            Ningún proyecto en riesgo ahora mismo.
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-2 font-medium">Proyecto</th>
                  <th className="px-4 py-2 font-medium">Salud</th>
                  <th className="w-48 px-4 py-2 font-medium">Avance</th>
                  <th className="px-4 py-2 text-right font-medium">Presupuesto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {riesgo.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-2">
                      <Link
                        href={`/proyectos/${p.id}`}
                        className="font-medium text-slate-900 hover:underline"
                      >
                        {p.nombre}
                      </Link>
                      <span className="ml-2 text-xs text-slate-400">
                        {p.codigo}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <Semaforo salud={p.salud} />
                    </td>
                    <td className="px-4 py-2">
                      <Barra valor={Number(p.avance_pct)} />
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums">
                      {soles(p.presupuesto_estimado)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Serie de tiempo */}
      {serie.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-medium text-slate-700">
              Tareas completadas por mes
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={serie}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="periodo" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip />
                <Bar dataKey="tareas_completadas" fill="#0f172a" name="Completadas" />
              </BarChart>
            </ResponsiveContainer>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-medium text-slate-700">
              Gasto por mes
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={serie}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="periodo" fontSize={11} />
                <YAxis
                  fontSize={11}
                  tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`}
                />
                <Tooltip formatter={(v) => soles(Number(v))} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="monto_gastado"
                  stroke="#b45309"
                  name="Gastado"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </section>
        </div>
      )}

      <p className="text-xs text-slate-400">
        Los KPIs salen de los agregados que mantiene ms-analitico a partir de
        los eventos. Nadie los calcula a mano.
      </p>
    </div>
  );
}
