"use client";

/** Tabla de proyectos: la vista Grid, ordenable y densa. */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { FalloApi, llamar, soles, USAR_MOCKS } from "@/lib/api";
import { PROYECTOS } from "@/lib/mock";
import { Tabla, type Columna } from "@/components/tabla";
import {
  Barra, Cargando, Error_, Estado, Fecha, Persona, Semaforo, Vacio,
} from "@/components/ui";

type Proyecto = {
  id: number; codigo: string; nombre: string; estado: string;
  prioridad_score: number; avance_pct: number; salud: string;
  en_riesgo: boolean; presupuesto_estimado: number; portafolio: string;
  responsable?: string | null; responsable_id?: string | null;
  fecha_fin_estimada?: string | null;
};

const ESTADOS = ["", "propuesto", "aprobado", "en_curso", "en_pausa", "cerrado", "cancelado"];

export default function Proyectos() {
  const router = useRouter();
  const [proyectos, setProyectos] = useState<Proyecto[] | null>(null);
  const [total, setTotal] = useState(0);
  const [estado, setEstado] = useState("");
  const [salud, setSalud] = useState("");
  const [busqueda, setBusqueda] = useState("");
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

  // La busqueda filtra en cliente sobre la pagina cargada: es un afinado
  // rapido, no sustituye al filtro del servidor.
  const visibles = (proyectos ?? []).filter((p) =>
    busqueda
      ? `${p.nombre} ${p.codigo} ${p.portafolio}`.toLowerCase().includes(busqueda.toLowerCase())
      : true,
  );

  const columnas: Columna<Proyecto>[] = [
    {
      clave: "nombre", titulo: "Proyecto",
      render: (p) => (
        <div className="flex items-center gap-2.5">
          <Semaforo salud={p.salud} mini />
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-900">{p.nombre}</p>
            <p className="truncate text-xs text-slate-400">
              {p.codigo} · {p.portafolio}
            </p>
          </div>
        </div>
      ),
    },
    {
      clave: "responsable", titulo: "Responsable", ancho: "11rem",
      orden: (p) => p.responsable ?? "zzz",
      render: (p) => <Persona nombre={p.responsable} id={p.responsable_id} />,
    },
    {
      clave: "estado", titulo: "Estado", ancho: "7rem",
      render: (p) => <Estado estado={p.estado} />,
    },
    {
      clave: "prioridad_score", titulo: "Prioridad", numerica: true, ancho: "6rem",
      orden: (p) => Number(p.prioridad_score),
      render: (p) => (
        <span className="font-medium text-slate-700">
          {Number(p.prioridad_score).toFixed(1)}
        </span>
      ),
    },
    {
      clave: "avance_pct", titulo: "Avance", ancho: "9rem",
      orden: (p) => Number(p.avance_pct),
      render: (p) => <Barra valor={Number(p.avance_pct)} />,
    },
    {
      clave: "fecha_fin_estimada", titulo: "Entrega", ancho: "6rem",
      orden: (p) => p.fecha_fin_estimada ?? "9999",
      render: (p) => <Fecha valor={p.fecha_fin_estimada} vence />,
    },
    {
      clave: "presupuesto_estimado", titulo: "Presupuesto", numerica: true, ancho: "8rem",
      orden: (p) => Number(p.presupuesto_estimado),
      render: (p) => <span className="text-slate-700">{soles(p.presupuesto_estimado)}</span>,
    },
  ];

  const paginas = Math.ceil(total / 25);

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Proyectos</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {total.toLocaleString("es-PE")} proyectos en esta organización
          </p>
        </div>
      </header>

      {/* ------------------------------------------------- filtros */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white p-2">
        <input
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, código o portafolio…"
          className="min-w-[16rem] flex-1 rounded-md border border-slate-200 px-3 py-1.5 text-sm placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
        />
        <select
          value={estado}
          onChange={(e) => { setEstado(e.target.value); setPagina(1); }}
          className="rounded-md border border-slate-200 px-2.5 py-1.5 text-sm"
        >
          {ESTADOS.map((e) => (
            <option key={e} value={e}>{e ? e.replace("_", " ") : "Todos los estados"}</option>
          ))}
        </select>
        <select
          value={salud}
          onChange={(e) => { setSalud(e.target.value); setPagina(1); }}
          className="rounded-md border border-slate-200 px-2.5 py-1.5 text-sm"
        >
          <option value="">Toda la salud</option>
          <option value="verde">verde</option>
          <option value="ambar">ámbar</option>
          <option value="rojo">rojo</option>
        </select>
        <button
          onClick={() => { setSoloRiesgo((v) => !v); setPagina(1); }}
          className={`rounded-md border px-3 py-1.5 text-sm ${
            soloRiesgo
              ? "border-red-300 bg-red-50 font-medium text-red-700"
              : "border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          Solo en riesgo
        </button>
      </div>

      {!proyectos ? (
        <Cargando que="los proyectos" />
      ) : visibles.length === 0 ? (
        <Vacio
          mensaje={
            busqueda
              ? `Ningún proyecto coincide con "${busqueda}".`
              : "Ningún proyecto con esos filtros."
          }
          accion={
            <button
              onClick={() => { setBusqueda(""); setEstado(""); setSalud(""); setSoloRiesgo(false); }}
              className="text-sm text-slate-600 underline"
            >
              Quitar los filtros
            </button>
          }
        />
      ) : (
        <>
          <Tabla
            columnas={columnas}
            filas={visibles}
            clave={(p) => p.id}
            ordenInicial={{ col: "prioridad_score", desc: true }}
            onFila={(p) => router.push(`/proyecto?id=${p.id}`)}
          />

          {paginas > 1 && (
            <div className="flex items-center justify-between text-sm">
              <button
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                disabled={pagina === 1}
                className="rounded-md border border-slate-200 bg-white px-3 py-1.5 disabled:opacity-40"
              >
                Anterior
              </button>
              <span className="text-slate-500">Página {pagina} de {paginas}</span>
              <button
                onClick={() => setPagina((p) => Math.min(paginas, p + 1))}
                disabled={pagina >= paginas}
                className="rounded-md border border-slate-200 bg-white px-3 py-1.5 disabled:opacity-40"
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
