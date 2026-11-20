"use client";

/** Tabla de proyectos: la vista Grid, ordenable y densa. */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { FalloApi, llamar, soles, USAR_MOCKS } from "@/lib/api";
import { PROYECTOS } from "@/lib/mock";
import { Tabla, type Columna } from "@/components/tabla";
import {
  Barra, Cargando, Error_, Estado, Fecha, Ficha, Persona, Semaforo, Vacio,
} from "@/components/ui";

type Proyecto = {
  id: number; codigo: string; nombre: string; estado: string;
  prioridad_score: number; avance_pct: number; salud: string;
  en_riesgo: boolean; presupuesto_estimado: number; portafolio: string;
  responsable?: string | null; responsable_id?: string | null;
  fecha_fin_estimada?: string | null;
};

const ESTADOS = ["", "propuesto", "aprobado", "en_curso", "en_pausa", "cerrado", "cancelado"];

const navBoton =
  "rounded-lg border border-borde bg-superficie px-3 py-1.5 text-tinta-media " +
  "transition-colors hover:border-borde-fuerte hover:text-tinta " +
  "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-borde";

/** Pastilla de filtro. Activa = se ve activa sin tener que abrirla. */
function pastilla(activo: boolean) {
  return `rounded-full border px-3 py-1.5 text-sm transition-colors ${
    activo
      ? "border-transparent bg-marca-tenue font-medium text-marca-fuerte"
      : "border-borde bg-superficie text-tinta-media hover:border-borde-fuerte hover:text-tinta"
  }`;
}

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
            <p className="truncate font-medium text-tinta">{p.nombre}</p>
            <p className="truncate text-xs">
              <span className="font-mono text-tinta-suave">{p.codigo}</span>
              <span className="ml-2 inline-flex items-center gap-1 text-tinta-suave">
                <Ficha nombre={p.portafolio} tam="sm" />
                {p.portafolio}
              </span>
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
        <span className="font-medium text-tinta-media">
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
      render: (p) => <span className="text-tinta-media">{soles(p.presupuesto_estimado)}</span>,
    },
  ];

  const paginas = Math.ceil(total / 25);
  const nFiltros = [estado, salud, soloRiesgo ? "x" : "", busqueda].filter(Boolean).length;

  function limpiar() {
    setBusqueda(""); setEstado(""); setSalud(""); setSoloRiesgo(false); setPagina(1);
  }

  return (
    <div className="space-y-5">
      {/* Jerarquia editorial: el numero es el dato, no una nota al pie.
          Antes el titulo pesaba mas que la cifra que la gente viene a ver. */}
      <header className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-tinta">Proyectos</h1>
          <p className="mt-1 text-sm text-tinta-media">
            <span className="tabular font-medium text-tinta">
              {total.toLocaleString("es-PE")}
            </span>{" "}
            en esta organización
          </p>
        </div>
        {nFiltros > 0 && (
          <button
            onClick={limpiar}
            className="text-sm text-tinta-media underline decoration-borde-fuerte underline-offset-4 transition-colors hover:text-tinta hover:decoration-tinta"
          >
            Quitar {nFiltros === 1 ? "el filtro" : `los ${nFiltros} filtros`}
          </button>
        )}
      </header>

      {/* ------------------------------------------------- filtros
          Antes eran cuatro controles sueltos dentro de una caja gris, que es
          justo el aspecto de plantilla que hay que evitar. Ahora la busqueda
          manda y los filtros son pastillas: se ve de un vistazo cuales estan
          puestos, sin leer el contenido de cada desplegable. */}
      <div className="space-y-3">
        <div className="relative">
          <span
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-tinta-suave"
          >
            ⌕
          </span>
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, código o portafolio en esta página…"
            className="w-full rounded-dato border border-borde bg-superficie py-2.5 pl-9 pr-3 text-sm transition-colors placeholder:text-tinta-suave hover:border-borde-fuerte focus:border-marca"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={estado}
            onChange={(e) => { setEstado(e.target.value); setPagina(1); }}
            aria-label="Filtrar por estado"
            className={pastilla(Boolean(estado))}
          >
            {ESTADOS.map((e) => (
              <option key={e} value={e}>{e ? e.replace("_", " ") : "Todos los estados"}</option>
            ))}
          </select>

          <select
            value={salud}
            onChange={(e) => { setSalud(e.target.value); setPagina(1); }}
            aria-label="Filtrar por salud"
            className={pastilla(Boolean(salud))}
          >
            <option value="">Toda la salud</option>
            <option value="verde">verde</option>
            <option value="ambar">ámbar</option>
            <option value="rojo">rojo</option>
          </select>

          <button
            onClick={() => { setSoloRiesgo((v) => !v); setPagina(1); }}
            aria-pressed={soloRiesgo}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
              soloRiesgo
                ? "border-transparent bg-rojo/10 font-medium text-rojo"
                : "border-borde bg-superficie text-tinta-media hover:border-borde-fuerte hover:text-tinta"
            }`}
          >
            <span
              aria-hidden
              className={`h-1.5 w-1.5 rounded-full ${soloRiesgo ? "bg-estado-critico" : "bg-borde-fuerte"}`}
            />
            Solo en riesgo
          </button>
        </div>
      </div>

      {!proyectos ? (
        <Cargando que="los proyectos" />
      ) : visibles.length === 0 ? (
        <Vacio
          mensaje={
            busqueda
              ? `Ningún proyecto de esta página coincide con "${busqueda}". La búsqueda afina lo ya cargado; para buscar en los ${total.toLocaleString("es-PE")}, usa los filtros.`
              : "Ningún proyecto con esos filtros."
          }
          accion={
            <button
              onClick={limpiar}
              className="text-sm text-tinta-media underline decoration-borde-fuerte underline-offset-4 transition-colors hover:text-tinta"
            >
              Quitar los filtros
            </button>
          }
        />
      ) : (
        <>
          {/* La tabla de 7 columnas no cabe en un telefono: debajo de md se
              cambia por tarjetas con los mismos datos, no por un scroll
              horizontal que obliga a arrastrar para leer una fila. */}
          <div className="aparece hidden md:block">
            <Tabla
              columnas={columnas}
              filas={visibles}
              clave={(p) => p.id}
              ordenInicial={{ col: "prioridad_score", desc: true }}
              onFila={(p) => router.push(`/proyecto?id=${p.id}`)}
            />
          </div>

          <ul className="aparece space-y-2 md:hidden">
            {visibles.map((p) => (
              <li key={p.id}>
                <button
                  onClick={() => router.push(`/proyecto?id=${p.id}`)}
                  className="w-full rounded-dato border border-borde bg-superficie p-3 text-left"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="mt-1.5"><Semaforo salud={p.salud} mini /></span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-tinta">{p.nombre}</p>
                      <p className="truncate text-xs">
                        <span className="font-mono text-tinta-suave">{p.codigo}</span>
                        <span className="ml-2 text-tinta-suave">{p.portafolio}</span>
                      </p>
                    </div>
                    <Estado estado={p.estado} />
                  </div>

                  <div className="mt-3"><Barra valor={Number(p.avance_pct)} /></div>

                  <div className="mt-2.5 flex items-center justify-between gap-2 text-xs">
                    <Persona nombre={p.responsable} id={p.responsable_id} />
                    <span className="tabular text-tinta-media">
                      {soles(p.presupuesto_estimado)}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>

          {paginas > 1 && (
            <nav
              aria-label="Paginación"
              className="flex items-center justify-between gap-3 text-sm"
            >
              {/* Decir el rango, no solo el numero de pagina: "26–50 de 500"
                  ubica a la persona; "Pagina 2 de 20" la obliga a calcular. */}
              <p className="text-tinta-media">
                <span className="tabular font-medium text-tinta">
                  {(pagina - 1) * 25 + 1}–{Math.min(pagina * 25, total)}
                </span>{" "}
                de {total.toLocaleString("es-PE")}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
                  disabled={pagina === 1}
                  className={navBoton}
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPagina((p) => Math.min(paginas, p + 1))}
                  disabled={pagina >= paginas}
                  className={navBoton}
                >
                  Siguiente
                </button>
              </div>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
