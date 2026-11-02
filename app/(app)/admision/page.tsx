"use client";

/**
 * Bandeja de admision de demanda, rankeada por score.
 *
 * Es la puerta de entrada del portafolio: nada se vuelve proyecto sin pasar
 * por aqui. Y el ranking solo no sirve — al marcar las propuestas que quiere
 * aprobar, el PMO ve cuanto consumen juntas y si se pasa de lo disponible.
 */

import { useEffect, useState } from "react";

import { FalloApi, llamar, pct, soles, USAR_MOCKS } from "@/lib/api";
import { PROPUESTAS } from "@/lib/mock";
import { Cargando, Error_, Vacio } from "@/components/ui";

type Propuesta = {
  id: number;
  nombre: string;
  problema: string;
  costo_estimado: number;
  beneficio_esperado: number;
  valor_estrategico: number;
  urgencia: number;
  riesgo: number;
  score: number;
  portafolio: string;
};

type MetaPriorizacion = {
  presupuesto_disponible: number;
  ya_comprometido: number;
  holgura: number;
  costo_de_la_seleccion: number;
  excede_capacidad: boolean;
  exceso: number;
};

export default function Admision() {
  const [propuestas, setPropuestas] = useState<Propuesta[]>([]);
  const [seleccion, setSeleccion] = useState<number[]>([]);
  const [meta, setMeta] = useState<MetaPriorizacion | null>(null);
  const [error, setError] = useState("");
  const [trabajando, setTrabajando] = useState<number | null>(null);

  async function cargar() {
    if (USAR_MOCKS) {
      setPropuestas(PROPUESTAS as Propuesta[]);
      return;
    }
    try {
      const { datos } = await llamar<Propuesta[]>(
        "portafolios",
        "/propuestas?estado=pendiente",
      );
      setPropuestas(datos);
    } catch (e) {
      setError(e instanceof FalloApi ? e.message : "Error inesperado");
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  // Cada vez que cambia la seleccion se le pregunta al backend si cabe en el
  // presupuesto. El calculo vive alla, no aqui.
  useEffect(() => {
    if (USAR_MOCKS) {
      const costo = propuestas
        .filter((p) => seleccion.includes(p.id))
        .reduce((s, p) => s + Number(p.costo_estimado), 0);
      const holgura = 1_200_000;
      setMeta({
        presupuesto_disponible: 4_800_000,
        ya_comprometido: 3_600_000,
        holgura,
        costo_de_la_seleccion: costo,
        excede_capacidad: costo > holgura,
        exceso: Math.max(0, costo - holgura),
      });
      return;
    }
    llamar<Propuesta[]>(
      "portafolios",
      `/priorizacion?seleccion=${seleccion.join(",")}`,
    )
      .then(({ meta }) => setMeta(meta as unknown as MetaPriorizacion))
      .catch(() => {});
  }, [seleccion, propuestas]);

  function alternar(id: number) {
    setSeleccion((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
    );
  }

  async function decidir(id: number, accion: "aprobar" | "rechazar") {
    setTrabajando(id);
    try {
      if (!USAR_MOCKS) {
        await llamar("portafolios", `/propuestas/${id}/${accion}`, {
          metodo: "POST",
          cuerpo:
            accion === "rechazar"
              ? { motivo: "No entra en el presupuesto del trimestre" }
              : {},
        });
      }
      setPropuestas((p) => p.filter((x) => x.id !== id));
      setSeleccion((s) => s.filter((x) => x !== id));
    } catch (e) {
      setError(e instanceof FalloApi ? e.message : "Error inesperado");
    } finally {
      setTrabajando(null);
    }
  }

  if (error) return <Error_ mensaje={error} />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          Admisión de demanda
        </h1>
        <p className="text-sm text-slate-500">
          {propuestas.length} propuestas pendientes, ordenadas por score de
          prioridad
        </p>
      </div>

      {/* El panel de capacidad: lo que convierte un ranking en una decision */}
      {meta && (
        <div
          className={`rounded-lg border p-4 ${
            meta.excede_capacidad
              ? "border-red-300 bg-red-50"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="grid gap-4 text-sm sm:grid-cols-4">
            <div>
              <p className="text-xs uppercase text-slate-500">Disponible</p>
              <p className="font-semibold tabular-nums">
                {soles(meta.presupuesto_disponible)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-500">
                Ya comprometido
              </p>
              <p className="font-semibold tabular-nums">
                {soles(meta.ya_comprometido)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-500">Holgura</p>
              <p className="font-semibold tabular-nums">{soles(meta.holgura)}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-500">
                Selección ({seleccion.length})
              </p>
              <p
                className={`font-semibold tabular-nums ${
                  meta.excede_capacidad ? "text-rojo" : ""
                }`}
              >
                {soles(meta.costo_de_la_seleccion)}
              </p>
            </div>
          </div>

          {meta.excede_capacidad && (
            <p className="mt-3 border-t border-red-200 pt-3 text-sm font-medium text-red-800">
              La selección excede la holgura en {soles(meta.exceso)}. Hay que
              dejar algo fuera del trimestre.
            </p>
          )}
        </div>
      )}

      {propuestas.length === 0 ? (
        <Vacio mensaje="No hay propuestas pendientes." />
      ) : (
        <div className="space-y-3">
          {propuestas.map((p) => {
            const marcada = seleccion.includes(p.id);
            const retorno =
              Number(p.beneficio_esperado) / Number(p.costo_estimado);
            return (
              <div
                key={p.id}
                className={`rounded-lg border bg-white p-4 ${
                  marcada ? "border-slate-900 ring-1 ring-slate-900" : "border-slate-200"
                }`}
              >
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={marcada}
                    onChange={() => alternar(p.id)}
                    className="mt-1 h-4 w-4"
                    aria-label={`Seleccionar ${p.nombre}`}
                  />

                  <div className="flex-1">
                    <div className="flex items-baseline gap-3">
                      <h3 className="font-medium text-slate-900">{p.nombre}</h3>
                      <span className="rounded bg-slate-900 px-2 py-0.5 text-xs font-semibold text-white tabular-nums">
                        score {Number(p.score).toFixed(1)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-slate-600">{p.problema}</p>
                    <p className="mt-1 text-xs text-slate-400">{p.portafolio}</p>

                    <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-xs sm:grid-cols-6">
                      <div>
                        <dt className="text-slate-500">Costo</dt>
                        <dd className="tabular-nums">{soles(p.costo_estimado)}</dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Beneficio</dt>
                        <dd className="tabular-nums">
                          {soles(p.beneficio_esperado)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Retorno</dt>
                        <dd className="tabular-nums">{retorno.toFixed(2)}x</dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Valor estratégico</dt>
                        <dd>{p.valor_estrategico}/5</dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Urgencia</dt>
                        <dd>{p.urgencia}/5</dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Riesgo</dt>
                        <dd>{p.riesgo}/5</dd>
                      </div>
                    </dl>
                  </div>

                  <div className="flex shrink-0 flex-col gap-2">
                    <button
                      onClick={() => decidir(p.id, "aprobar")}
                      disabled={trabajando === p.id}
                      className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
                    >
                      Aprobar
                    </button>
                    <button
                      onClick={() => decidir(p.id, "rechazar")}
                      disabled={trabajando === p.id}
                      className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 disabled:opacity-50"
                    >
                      Rechazar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-slate-400">
        Aprobar una propuesta la convierte en proyecto y publica{" "}
        <code>proyecto.creado</code>, que hace que ms-presupuestos cree el
        presupuesto en 0 sin que nadie se lo pida.
      </p>
    </div>
  );
}
