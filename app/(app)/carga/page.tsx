"use client";

/**
 * Vista de Workload: cada persona con su ocupacion, en rojo si pasa del 100%.
 * Es la vista que tienen monday, Smartsheet y Planview.
 */

import { useEffect, useState } from "react";

import { FalloApi, llamar, pct, USAR_MOCKS } from "@/lib/api";
import { CARGA } from "@/lib/mock";
import { Cargando, Error_, Tarjeta, Vacio } from "@/components/ui";

type Persona = {
  recurso_id: number;
  nombre: string;
  rol_tecnico: string;
  capacidad_horas_semana: number;
  ocupacion_pct: number;
  disponible_pct: number;
  horas_comprometidas: number;
  sobreasignado: boolean;
  n_asignaciones: number;
};

type Resumen = {
  personas: number;
  sobreasignadas: number;
  sin_asignar: number;
  ocupacion_promedio: number;
  capacidad_total: number;
  horas_comprometidas: number;
};

/** Barra de ocupacion que puede pasar del 100% y lo muestra desbordando. */
function BarraCarga({ ocupacion }: { ocupacion: number }) {
  const hasta100 = Math.min(ocupacion, 100);
  const exceso = Math.max(ocupacion - 100, 0);
  // El exceso se dibuja sobre la misma escala de 100, para que se vea cuanto
  // se paso en proporcion a su capacidad.
  const anchoExceso = Math.min(exceso, 100);

  return (
    <div className="flex items-center gap-2">
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className={ocupacion > 100 ? "h-full bg-amber-500" : "h-full bg-green-600"}
          style={{ width: `${hasta100}%` }}
        />
        {exceso > 0 && (
          <div
            className="absolute inset-y-0 h-full bg-red-600"
            style={{ left: `${100 - anchoExceso}%`, width: `${anchoExceso}%` }}
          />
        )}
      </div>
      <span
        className={`w-16 shrink-0 text-right text-xs font-medium tabular-nums ${
          ocupacion > 100 ? "text-rojo" : "text-slate-600"
        }`}
      >
        {pct(ocupacion)}
      </span>
    </div>
  );
}

export default function Carga() {
  const [personas, setPersonas] = useState<Persona[] | null>(null);
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [soloSobre, setSoloSobre] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (USAR_MOCKS) {
      setPersonas(CARGA as Persona[]);
      setResumen({
        personas: 6, sobreasignadas: 2, sin_asignar: 1,
        ocupacion_promedio: 75, capacidad_total: 256, horas_comprometidas: 189.6,
      });
      return;
    }
    llamar<Persona[]>("recursos", "/carga")
      .then(({ datos, meta }) => {
        setPersonas(datos);
        setResumen(meta as unknown as Resumen);
      })
      .catch((e: FalloApi) => setError(e.message));
  }, []);

  if (error) return <Error_ mensaje={error} />;
  if (!personas) return <Cargando que="la carga del equipo" />;

  const lista = soloSobre ? personas.filter((p) => p.sobreasignado) : personas;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          Carga del equipo
        </h1>
        <p className="text-sm text-slate-500">
          Ocupación semanal de cada persona. En rojo, lo que pasa de su capacidad.
        </p>
      </div>

      {resumen && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Tarjeta titulo="Personas" valor={resumen.personas} />
          <Tarjeta
            titulo="Sobreasignadas"
            valor={resumen.sobreasignadas}
            detalle="por encima del 100%"
            alerta={resumen.sobreasignadas > 0}
          />
          <Tarjeta
            titulo="Sin asignar"
            valor={resumen.sin_asignar}
            detalle="capacidad libre"
          />
          <Tarjeta
            titulo="Ocupación promedio"
            valor={pct(resumen.ocupacion_promedio)}
            detalle={`${Number(resumen.horas_comprometidas).toLocaleString("es-PE")} de ${Number(resumen.capacidad_total).toLocaleString("es-PE")} h/sem`}
          />
        </div>
      )}

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={soloSobre}
          onChange={(e) => setSoloSobre(e.target.checked)}
          className="h-4 w-4"
        />
        Mostrar solo las personas sobreasignadas
      </label>

      {lista.length === 0 ? (
        <Vacio mensaje="Nadie sobreasignado. El equipo está dentro de su capacidad." />
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2 font-medium">Persona</th>
                <th className="px-4 py-2 font-medium">Rol</th>
                <th className="px-4 py-2 text-right font-medium">Capacidad</th>
                <th className="w-64 px-4 py-2 font-medium">Ocupación</th>
                <th className="px-4 py-2 text-right font-medium">Horas comp.</th>
                <th className="px-4 py-2 text-right font-medium">Proyectos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lista.map((p) => (
                <tr
                  key={p.recurso_id}
                  className={p.sobreasignado ? "bg-red-50/40" : ""}
                >
                  <td className="px-4 py-2 font-medium text-slate-900">
                    {p.nombre}
                  </td>
                  <td className="px-4 py-2 text-slate-600">{p.rol_tecnico}</td>
                  <td className="px-4 py-2 text-right tabular-nums text-slate-600">
                    {p.capacidad_horas_semana} h
                  </td>
                  <td className="px-4 py-2">
                    <BarraCarga ocupacion={Number(p.ocupacion_pct)} />
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums">
                    {Number(p.horas_comprometidas).toFixed(1)}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums">
                    {p.n_asignaciones}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-slate-400">
        La vista solo cuenta asignaciones vigentes hoy. Asignar a alguien que ya
        está al 100% publica <code>recurso.sobreasignado</code> y le llega la
        alerta al PM.
      </p>
    </div>
  );
}
