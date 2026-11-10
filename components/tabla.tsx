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
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/80">
            {columnas.map((c) => {
              const activa = orden?.col === c.clave;
              return (
                <th
                  key={c.clave}
                  style={c.ancho ? { width: c.ancho } : undefined}
                  className={`px-3 py-2 text-xs font-medium uppercase tracking-wide ${
                    c.numerica ? "text-right" : "text-left"
                  } text-slate-500`}
                >
                  <button
                    onClick={() => alternar(c)}
                    className={`inline-flex items-center gap-1 hover:text-slate-900 ${
                      activa ? "text-slate-900" : ""
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
        <tbody className="divide-y divide-slate-100">
          {ordenadas.map((f) => (
            <tr
              key={clave(f)}
              onClick={onFila ? () => onFila(f) : undefined}
              className={`${onFila ? "cursor-pointer" : ""} hover:bg-slate-50`}
            >
              {columnas.map((c) => (
                <td
                  key={c.clave}
                  className={`px-3 py-2 ${c.numerica ? "text-right tabular-nums" : ""}`}
                >
                  {c.render(f)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
