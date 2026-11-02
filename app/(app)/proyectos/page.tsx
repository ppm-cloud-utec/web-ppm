"use client";

/** Tabla de proyectos, filtrable. La vista Grid que tienen los 3 referentes. */

import { useEffect, useState } from "react";
import Link from "next/link";

import { FalloApi, llamar, soles, USAR_MOCKS } from "@/lib/api";
import { PROYECTOS } from "@/lib/mock";
import { Barra, Cargando, Error_, Estado, Semaforo, Vacio } from "@/components/ui";

type Proyecto = {
  id: number;
  codigo: string;
  nombre: string;
  estado: string;
  prioridad_score: number;
  avance_pct: number;
  salud: string;
  en_riesgo: boolean;
  presupuesto_estimado: number;
  portafolio: string;
};

const ESTADOS = ["", "propuesto", "aprobado", "en_curso", "en_pausa", "cerrado", "cancelado"];

export default function Proyectos() {
  const [proyectos, setProyectos] = useState<Proyecto[] | null>(null);
  const [total, setTotal] = useState(0);
  const [estado, setEstado] = useState("");
  const [salud, setSalud] = useState("");
  const [soloRiesgo, setSoloRiesgo] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    if (USAR_MOCKS) {
      let lista = PROYECTOS as Proyecto[];
      if (estado) lista = lista.filter((p) => p.estado === estado);
      if (salud) lista = lista.filter((p) => p.salud === salud);
      if (soloRiesgo) lista = lista.filter((p) => p.en_riesgo);
      setProyectos(lista);
      setTotal(lista.length);
      return;
    }

    const q = new URLSearchParams({ limite: "25", pagina: String(pagina) });
    if (estado) q.set("estado", estado);
    if (salud) q.set("salud", salud);
    if (soloRiesgo) q.set("en_riesgo", "true");

    setProyectos(null);
    llamar<Proyecto[]>("portafolios", `/proyectos?${q}`)
      .then(({ datos, meta }) => {
        setProyectos(datos);
        setTotal(Number(meta?.total ?? datos.length));
      })
      .catch((e: FalloApi) => setError(e.message));
  }, [estado, salud, soloRiesgo, pagina]);

  if (error) return <Error_ mensaje={error} />;

  const paginas = Math.ceil(total / 25);

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Proyectos</h1>
          <p className="text-sm text-slate-500">
            {total.toLocaleString("es-PE")} proyectos en este tenant
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 text-sm">
        <select
          value={estado}
          onChange={(e) => { setEstado(e.target.value); setPagina(1); }}
          className="rounded-md border border-slate-300 px-2 py-1.5"
        >
          {ESTADOS.map((e) => (
            <option key={e} value={e}>
              {e ? e.replace("_", " ") : "Todos los estados"}
            </option>
          ))}
        </select>

        <select
          value={salud}
          onChange={(e) => { setSalud(e.target.value); setPagina(1); }}
          className="rounded-md border border-slate-300 px-2 py-1.5"
        >
          <option value="">Toda la salud</option>
          <option value="verde">verde</option>
          <option value="ambar">ámbar</option>
          <option value="rojo">rojo</option>
        </select>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={soloRiesgo}
            onChange={(e) => { setSoloRiesgo(e.target.checked); setPagina(1); }}
            className="h-4 w-4"
          />
          Solo en riesgo
        </label>
      </div>

      {!proyectos ? (
        <Cargando que="los proyectos" />
      ) : proyectos.length === 0 ? (
        <Vacio mensaje="Ningún proyecto con esos filtros." />
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-2 font-medium">Proyecto</th>
                  <th className="px-4 py-2 font-medium">Portafolio</th>
                  <th className="px-4 py-2 font-medium">Estado</th>
                  <th className="px-4 py-2 text-right font-medium">Prioridad</th>
                  <th className="w-48 px-4 py-2 font-medium">Avance</th>
                  <th className="px-4 py-2 font-medium">Salud</th>
                  <th className="px-4 py-2 text-right font-medium">Presupuesto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {proyectos.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2">
                      <Link
                        href={`/proyectos/${p.id}`}
                        className="font-medium text-slate-900 hover:underline"
                      >
                        {p.nombre}
                      </Link>
                      <div className="text-xs text-slate-400">{p.codigo}</div>
                    </td>
                    <td className="px-4 py-2 text-xs text-slate-500">
                      {p.portafolio}
                    </td>
                    <td className="px-4 py-2">
                      <Estado estado={p.estado} />
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums">
                      {Number(p.prioridad_score).toFixed(1)}
                    </td>
                    <td className="px-4 py-2">
                      <Barra valor={Number(p.avance_pct)} />
                    </td>
                    <td className="px-4 py-2">
                      <Semaforo salud={p.salud} />
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums">
                      {soles(p.presupuesto_estimado)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {paginas > 1 && (
            <div className="flex items-center justify-between text-sm">
              <button
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                disabled={pagina === 1}
                className="rounded-md border border-slate-300 px-3 py-1.5 disabled:opacity-40"
              >
                Anterior
              </button>
              <span className="text-slate-500">
                Página {pagina} de {paginas}
              </span>
              <button
                onClick={() => setPagina((p) => Math.min(paginas, p + 1))}
                disabled={pagina >= paginas}
                className="rounded-md border border-slate-300 px-3 py-1.5 disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
