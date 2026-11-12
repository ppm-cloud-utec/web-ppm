"use client";

/** Listado y creación de portafolios (ms-portafolios). */

import { useCallback, useEffect, useState } from "react";

import { FalloApi, llamar, pct, soles, USAR_MOCKS } from "@/lib/api";
import { PORTAFOLIOS } from "@/lib/mock";
import { Tabla, type Columna } from "@/components/tabla";
import { Cargando, Error_, Vacio } from "@/components/ui";

/**
 * Lo que devuelve GET /portafolios de ms-portafolios. Los nombres salen del
 * SELECT del handler (`proyectos`, `comprometido`, `avance_promedio`): no son
 * inventables, porque TypeScript no puede verificar la forma de una respuesta
 * remota y un nombre que no coincide se renderiza vacio sin avisar.
 */
type Portafolio = {
  id: number;
  nombre: string;
  objetivo_estrategico?: string | null;
  presupuesto_disponible?: number | string | null;
  capacidad_horas_semana?: number | null;
  proyectos?: number | null;
  en_curso?: number | null;
  en_riesgo?: number | null;
  comprometido?: number | string | null;
  avance_promedio?: number | string | null;
};

export default function Portafolios() {
  const [lista, setLista] = useState<Portafolio[] | null>(null);
  const [error, setError] = useState("");
  const [abierto, setAbierto] = useState(false);
  const [nombre, setNombre] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [disponible, setDisponible] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState("");
  const [aviso, setAviso] = useState("");

  const cargar = useCallback(async () => {
    if (USAR_MOCKS) {
      setLista(PORTAFOLIOS);
      return;
    }
    try {
      const { datos } = await llamar<Portafolio[]>("portafolios", "/portafolios");
      setLista(datos);
    } catch (e) {
      setError(e instanceof FalloApi ? e.message : "Error inesperado");
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setErrorForm("");
    try {
      // ms-portafolios valida con campos_permitidos(): un campo de mas da 400,
      // asi que los opcionales vacios NO se mandan en vez de ir como "".
      const cuerpo: Record<string, unknown> = {
        nombre: nombre.trim(),
        objetivo_estrategico: objetivo.trim(),
      };
      if (descripcion.trim()) cuerpo.descripcion = descripcion.trim();
      if (disponible.trim()) cuerpo.presupuesto_disponible = Number(disponible);

      if (USAR_MOCKS) {
        setLista((l) => [
          {
            id: (l?.length ?? 0) + 1,
            nombre: nombre.trim(),
            objetivo_estrategico: objetivo.trim(),
            presupuesto_disponible: Number(disponible || 0),
            proyectos: 0,
            comprometido: 0,
            avance_promedio: 0,
          },
          ...(l ?? []),
        ]);
      } else {
        await llamar("portafolios", "/portafolios", { metodo: "POST", cuerpo });
        await cargar();
      }
      setAviso(`Portafolio "${cuerpo.nombre}" creado.`);
      setNombre("");
      setObjetivo("");
      setDescripcion("");
      setDisponible("");
      setAbierto(false);
    } catch (err) {
      setErrorForm(err instanceof FalloApi ? err.message : "No se pudo crear");
    } finally {
      setGuardando(false);
    }
  }

  if (error) return <Error_ mensaje={error} />;

  const columnas: Columna<Portafolio>[] = [
    {
      clave: "nombre", titulo: "Portafolio",
      orden: (p) => p.nombre,
      render: (p) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-900">{p.nombre}</p>
          {p.objetivo_estrategico && (
            <p className="truncate text-xs text-slate-400">{p.objetivo_estrategico}</p>
          )}
        </div>
      ),
    },
    {
      clave: "proyectos", titulo: "Proyectos", numerica: true, ancho: "6rem",
      orden: (p) => Number(p.proyectos ?? 0),
      render: (p) => (
        <span className="text-slate-700">
          {p.proyectos ?? "—"}
          {Number(p.en_riesgo ?? 0) > 0 && (
            <span className="ml-1 text-xs text-red-600">({p.en_riesgo} en riesgo)</span>
          )}
        </span>
      ),
    },
    {
      clave: "avance_promedio", titulo: "Avance", numerica: true, ancho: "6rem",
      orden: (p) => Number(p.avance_promedio ?? 0),
      render: (p) => <span className="text-slate-700">{pct(p.avance_promedio)}</span>,
    },
    {
      clave: "comprometido", titulo: "Comprometido", numerica: true, ancho: "9rem",
      orden: (p) => Number(p.comprometido ?? 0),
      render: (p) => <span className="text-slate-700">{soles(p.comprometido)}</span>,
    },
    {
      clave: "presupuesto_disponible", titulo: "Disponible", numerica: true, ancho: "9rem",
      orden: (p) => Number(p.presupuesto_disponible ?? 0),
      render: (p) => <span className="text-slate-700">{soles(p.presupuesto_disponible)}</span>,
    },
  ];

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Portafolios</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {lista ? `${lista.length} portafolios en esta organización` : "Cargando…"}
          </p>
        </div>
        <button
          onClick={() => setAbierto((v) => !v)}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white"
        >
          {abierto ? "Cancelar" : "Nuevo portafolio"}
        </button>
      </header>

      {aviso && (
        <div className="rounded-lg border border-green-300 bg-green-50 p-3 text-sm text-green-900">
          {aviso}
        </div>
      )}

      {abierto && (
        <form
          onSubmit={crear}
          className="space-y-3 rounded-lg border border-slate-200 bg-white p-4"
        >
          <div>
            <label className="text-xs font-medium uppercase text-slate-500">Nombre</label>
            <input
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm focus:border-slate-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-medium uppercase text-slate-500">
              Objetivo estratégico
            </label>
            <input
              required
              value={objetivo}
              onChange={(e) => setObjetivo(e.target.value)}
              placeholder="Ej. Ampliar cobertura en el cono norte"
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm focus:border-slate-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-medium uppercase text-slate-500">
              Presupuesto disponible (opcional)
            </label>
            <input
              type="number" min="0" step="0.01"
              value={disponible}
              onChange={(e) => setDisponible(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm focus:border-slate-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-medium uppercase text-slate-500">
              Descripción (opcional)
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm focus:border-slate-400 focus:outline-none"
            />
          </div>
          {errorForm && <p className="text-sm text-red-700">{errorForm}</p>}
          <button
            type="submit"
            disabled={guardando || !nombre.trim() || !objetivo.trim()}
            className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {guardando ? "Creando…" : "Crear portafolio"}
          </button>
        </form>
      )}

      {!lista ? (
        <Cargando que="los portafolios" />
      ) : lista.length === 0 ? (
        <Vacio mensaje="Esta organización aún no tiene portafolios." />
      ) : (
        <Tabla columnas={columnas} filas={lista} clave={(p) => p.id} />
      )}
    </div>
  );
}
