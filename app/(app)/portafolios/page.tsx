"use client";

/** Listado y creación de portafolios (ms-portafolios). */

import { useCallback, useEffect, useState } from "react";

import { FalloApi, llamar, soles, USAR_MOCKS } from "@/lib/api";
import { PORTAFOLIOS } from "@/lib/mock";
import { Tabla, type Columna } from "@/components/tabla";
import { Cargando, Error_, Fecha, Vacio } from "@/components/ui";

type Portafolio = {
  id: number;
  nombre: string;
  descripcion?: string | null;
  n_proyectos?: number | null;
  presupuesto_total?: number | null;
  creado_en?: string | null;
};

export default function Portafolios() {
  const [lista, setLista] = useState<Portafolio[] | null>(null);
  const [error, setError] = useState("");
  const [abierto, setAbierto] = useState(false);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
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
      const cuerpo = { nombre: nombre.trim(), descripcion: descripcion.trim() };
      if (USAR_MOCKS) {
        setLista((l) => [
          { id: (l?.length ?? 0) + 1, ...cuerpo, n_proyectos: 0, presupuesto_total: 0 },
          ...(l ?? []),
        ]);
      } else {
        await llamar("portafolios", "/portafolios", { metodo: "POST", cuerpo });
        await cargar();
      }
      setAviso(`Portafolio "${cuerpo.nombre}" creado.`);
      setNombre("");
      setDescripcion("");
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
          {p.descripcion && (
            <p className="truncate text-xs text-slate-400">{p.descripcion}</p>
          )}
        </div>
      ),
    },
    {
      clave: "n_proyectos", titulo: "Proyectos", numerica: true, ancho: "7rem",
      orden: (p) => Number(p.n_proyectos ?? 0),
      render: (p) => <span className="text-slate-700">{p.n_proyectos ?? "—"}</span>,
    },
    {
      clave: "presupuesto_total", titulo: "Presupuesto", numerica: true, ancho: "9rem",
      orden: (p) => Number(p.presupuesto_total ?? 0),
      render: (p) => (
        <span className="text-slate-700">
          {p.presupuesto_total != null ? soles(p.presupuesto_total) : "—"}
        </span>
      ),
    },
    {
      clave: "creado_en", titulo: "Creado", ancho: "7rem",
      orden: (p) => p.creado_en ?? "",
      render: (p) => <Fecha valor={p.creado_en} />,
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
            <label className="text-xs font-medium uppercase text-slate-500">Descripción</label>
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
            disabled={guardando || !nombre.trim()}
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
