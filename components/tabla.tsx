"use client";

/** Tabla densa con ordenamiento por columna. */

import { useMemo, useState } from "react";

export type Columna<T> = {
  clave: string;
  titulo: string;
  /** Alinea a la derecha los numeros. */
  numerica?: boolean;
  ancho?: string;
  /** Valor por el que se ordena; si falta, se usa fila[clave]. */
  orden?: (fila: T) => string | number;
  render: (fila: T) => React.ReactNode;
};

export function Tabla<T extends Record<string, any>>({
  columnas,
  filas,
  clave,
  ordenInicial,
  onFila,
}: {
  columnas: Columna<T>[];
  filas: T[];
  clave: (fila: T) => string | number;
  ordenInicial?: { col: string; desc: boolean };
  onFila?: (fila: T) => void;
}) {
  const [orden, setOrden] = useState(ordenInicial ?? null);

  const ordenadas = useMemo(() => {
    if (!orden) return filas;
    const col = columnas.find((c) => c.clave === orden.col);
    if (!col) return filas;
    const valor = col.orden ?? ((f: T) => f[col.clave]);
    return [...filas].sort((a, b) => {
      const va = valor(a), vb = valor(b);
      const n = typeof va === "number" && typeof vb === "number"
        ? va - vb
        : String(va ?? "").localeCompare(String(vb ?? ""), "es");
      return orden.desc ? -n : n;
    });
  }, [filas, orden, columnas]);

  function alternar(c: Columna<T>) {
    setOrden((o) =>
      o?.col === c.clave ? { col: c.clave, desc: !o.desc } : { col: c.clave, desc: false },
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-borde bg-superficie shadow-carta">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-borde bg-slate-50/70">
            {columnas.map((c) => {
              const activa = orden?.col === c.clave;
              return (
                <th
                  key={c.clave}
                  style={c.ancho ? { width: c.ancho } : undefined}
                  className={`px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider ${
                    c.numerica ? "text-right" : "text-left"
                  } text-tinta-suave`}
                >
                  <button
                    onClick={() => alternar(c)}
                    className={`inline-flex items-center gap-1 rounded transition-colors hover:text-tinta ${
                      activa ? "text-tinta" : ""
                    }`}
                    // Decir en voz alta como esta ordenado: el simbolo solo
                    // no llega a quien usa lector de pantalla.
                    aria-label={`Ordenar por ${c.titulo}${
                      activa ? (orden?.desc ? ", descendente" : ", ascendente") : ""
                    }`}
                  >
                    {c.titulo}
                    <span className={activa ? "opacity-100" : "opacity-0"}>
                      {orden?.desc ? "↓" : "↑"}
                    </span>
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100/80">
          {ordenadas.map((f) => (
            <tr
              key={clave(f)}
              onClick={onFila ? () => onFila(f) : undefined}
              onKeyDown={
                onFila
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onFila(f);
                      }
                    }
                  : undefined
              }
              tabIndex={onFila ? 0 : undefined}
              role={onFila ? "link" : undefined}
              className={`group transition-colors ${
                onFila
                  ? "cursor-pointer focus-visible:bg-marca-tenue focus-visible:outline-none"
                  : ""
              } hover:bg-marca-tenue/60`}
            >
              {columnas.map((c, i) => (
                <td
                  key={c.clave}
                  className={`px-3 py-2.5 ${c.numerica ? "tabular text-right" : ""} ${
                    onFila && i === columnas.length - 1 ? "relative pr-7" : ""
                  }`}
                >
                  {c.render(f)}
                  {onFila && i === columnas.length - 1 && (
                    <span
                      aria-hidden
                      className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-tinta-suave opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
                    >
                      ›
                    </span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
