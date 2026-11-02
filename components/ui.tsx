"use client";

import { pct, soles } from "@/lib/api";

/** El semaforo de salud del portafolio. Lo calcula el backend, no el front. */
export function Semaforo({ salud }: { salud: string }) {
  const estilos: Record<string, string> = {
    verde: "bg-green-100 text-green-800 ring-green-300",
    ambar: "bg-amber-100 text-amber-800 ring-amber-300",
    rojo: "bg-red-100 text-red-800 ring-red-300",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${
        estilos[salud] ?? "bg-slate-100 text-slate-700 ring-slate-300"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {salud}
    </span>
  );
}

export function Estado({ estado }: { estado: string }) {
  return (
    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
      {estado.replace("_", " ")}
    </span>
  );
}

/**
 * Barra de progreso que cambia de color segun el porcentaje.
 * Se usa para avance de proyecto y para ejecucion presupuestal.
 */
export function Barra({
  valor,
  umbralAmbar = 70,
  umbralRojo = 90,
  invertido = false,
}: {
  valor: number;
  umbralAmbar?: number;
  umbralRojo?: number;
  /** En avance, mas es mejor. En presupuesto, mas es peor. */
  invertido?: boolean;
}) {
  const v = Math.min(Math.max(valor, 0), 100);
  let color = "bg-green-600";
  if (invertido) {
    if (valor >= umbralRojo) color = "bg-red-600";
    else if (valor >= umbralAmbar) color = "bg-amber-500";
  } else {
    if (valor < 40) color = "bg-amber-500";
    if (valor >= 100) color = "bg-green-700";
  }
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div className={`h-full ${color}`} style={{ width: `${v}%` }} />
      </div>
      <span className="w-14 shrink-0 text-right text-xs tabular-nums text-slate-600">
        {pct(valor)}
      </span>
    </div>
  );
}

export function Tarjeta({
  titulo,
  valor,
  detalle,
  alerta = false,
}: {
  titulo: string;
  valor: string | number;
  detalle?: string;
  alerta?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border bg-white p-4 ${
        alerta ? "border-red-300" : "border-slate-200"
      }`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {titulo}
      </p>
      <p
        className={`mt-1 text-2xl font-semibold tabular-nums ${
          alerta ? "text-rojo" : "text-slate-900"
        }`}
      >
        {valor}
      </p>
      {detalle && <p className="mt-0.5 text-xs text-slate-500">{detalle}</p>}
    </div>
  );
}

export function Monto({ valor }: { valor: number | string }) {
  return <span className="tabular-nums">{soles(valor)}</span>;
}

export function Cargando({ que = "datos" }: { que?: string }) {
  return (
    <div className="flex items-center gap-2 p-8 text-sm text-slate-500">
      <span className="h-3 w-3 animate-pulse rounded-full bg-slate-400" />
      Cargando {que}...
    </div>
  );
}

export function Error_({ mensaje }: { mensaje: string }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
      <p className="font-medium">No se pudo cargar</p>
      <p className="mt-0.5">{mensaje}</p>
    </div>
  );
}

export function Vacio({ mensaje }: { mensaje: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
      {mensaje}
    </div>
  );
}
