"use client";

import { pct, soles } from "@/lib/api";

/* ------------------------------------------------------------------ salud */

/** El semaforo del portafolio. Lo calcula el backend, no el front. */
export function Semaforo({ salud, mini = false }: { salud: string; mini?: boolean }) {
  const estilos: Record<string, string> = {
    verde: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    ambar: "bg-amber-50 text-amber-700 ring-amber-600/20",
    rojo: "bg-red-50 text-red-700 ring-red-600/20",
  };
  const punto: Record<string, string> = {
    verde: "bg-emerald-500",
    ambar: "bg-amber-500",
    rojo: "bg-red-500",
  };

  if (mini) {
    return (
      <span
        className={`inline-block h-2 w-2 rounded-full ${punto[salud] ?? "bg-slate-300"}`}
        title={salud}
      />
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
        estilos[salud] ?? "bg-slate-50 text-slate-600 ring-slate-500/20"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${punto[salud] ?? "bg-slate-400"}`} />
      {salud}
    </span>
  );
}

const ESTADO_COLOR: Record<string, string> = {
  propuesto: "bg-slate-100 text-slate-600",
  aprobado: "bg-blue-50 text-blue-700",
  en_curso: "bg-indigo-50 text-indigo-700",
  en_pausa: "bg-amber-50 text-amber-700",
  cerrado: "bg-emerald-50 text-emerald-700",
  cancelado: "bg-slate-100 text-slate-400 line-through",
  pendiente: "bg-slate-100 text-slate-600",
  en_progreso: "bg-indigo-50 text-indigo-700",
  completada: "bg-emerald-50 text-emerald-700",
  bloqueada: "bg-red-50 text-red-700",
};

export function Estado({ estado }: { estado: string }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded px-1.5 py-0.5 text-xs font-medium ${
        ESTADO_COLOR[estado] ?? "bg-slate-100 text-slate-600"
      }`}
    >
      {estado.replace(/_/g, " ")}
    </span>
  );
}

/* ---------------------------------------------------------------- avatar */

const COLORES = [
  "bg-rose-100 text-rose-700", "bg-orange-100 text-orange-700",
  "bg-amber-100 text-amber-700", "bg-emerald-100 text-emerald-700",
  "bg-teal-100 text-teal-700", "bg-sky-100 text-sky-700",
  "bg-indigo-100 text-indigo-700", "bg-violet-100 text-violet-700",
];

/**
 * Avatar con iniciales. El color se deriva del identificador, no es aleatorio:
 * la misma persona tiene siempre el mismo color en todas las pantallas.
 */
export function Avatar({
  nombre,
  id,
  tam = "md",
}: {
  nombre?: string | null;
  id?: string | null;
  tam?: "sm" | "md";
}) {
  const texto = (nombre || "").trim();
  const iniciales = texto
    ? texto.split(/\s+/).slice(0, 2).map((p) => p[0]).join("").toUpperCase()
    : "··";

  const semilla = (id || texto || "x")
    .split("")
    .reduce((a, c) => a + c.charCodeAt(0), 0);
  const color = texto ? COLORES[semilla % COLORES.length] : "bg-slate-100 text-slate-400";
  const medida = tam === "sm" ? "h-5 w-5 text-[10px]" : "h-7 w-7 text-xs";

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold ${medida} ${color}`}
      title={texto || "sin responsable"}
    >
      {iniciales}
    </span>
  );
}

export function Persona({
  nombre,
  id,
  detalle,
}: {
  nombre?: string | null;
  id?: string | null;
  detalle?: string | null;
}) {
  return (
    <div className="flex items-center gap-2">
      <Avatar nombre={nombre} id={id} />
      <div className="min-w-0">
        <p className="truncate text-sm text-slate-900">{nombre || "Sin asignar"}</p>
        {detalle && <p className="truncate text-xs text-slate-500">{detalle}</p>}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- fecha */

/**
 * Fecha relativa ("hace 3 dias", "en 2 semanas"), con la fecha exacta en el
 * tooltip. En un PPM lo que importa de una fecha es si ya paso o cuanto falta,
 * no el dia concreto.
 */
export function Fecha({ valor, vence = false }: { valor?: string | null; vence?: boolean }) {
  if (!valor) return <span className="text-slate-400">—</span>;

  const d = new Date(valor);
  if (Number.isNaN(d.getTime())) return <span className="text-slate-400">—</span>;

  const dias = Math.round((d.getTime() - Date.now()) / 86_400_000);
  const abs = Math.abs(dias);
  let texto: string;
  if (abs === 0) texto = "hoy";
  else if (abs < 7) texto = dias < 0 ? `hace ${abs} d` : `en ${abs} d`;
  else if (abs < 31) texto = dias < 0 ? `hace ${Math.round(abs / 7)} sem` : `en ${Math.round(abs / 7)} sem`;
  else if (abs < 365) texto = dias < 0 ? `hace ${Math.round(abs / 30)} m` : `en ${Math.round(abs / 30)} m`;
  else texto = d.toLocaleDateString("es-PE", { year: "numeric", month: "short" });

  // Una fecha de fin ya vencida es informacion de riesgo: se marca.
  const atrasado = vence && dias < 0;

  return (
    <span
      className={atrasado ? "font-medium text-red-600" : "text-slate-600"}
      title={d.toLocaleDateString("es-PE", { dateStyle: "long" })}
    >
      {texto}
    </span>
  );
}

/* ----------------------------------------------------------------- barras */

export function Barra({
  valor,
  umbralAmbar = 70,
  umbralRojo = 90,
  invertido = false,
  etiqueta = true,
}: {
  valor: number;
  umbralAmbar?: number;
  umbralRojo?: number;
  /** En avance, mas es mejor. En presupuesto, mas es peor. */
  invertido?: boolean;
  etiqueta?: boolean;
}) {
  const v = Math.min(Math.max(valor, 0), 100);
  let color = "bg-emerald-500";
  if (invertido) {
    if (valor >= umbralRojo) color = "bg-red-500";
    else if (valor >= umbralAmbar) color = "bg-amber-500";
  } else if (valor < 40) {
    color = "bg-amber-500";
  }

  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-150 bg-slate-200">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${v}%` }} />
      </div>
      {etiqueta && (
        <span className="w-11 shrink-0 text-right text-xs tabular-nums text-slate-500">
          {Math.round(valor)}%
        </span>
      )}
    </div>
  );
}

/**
 * Barra de presupuesto: muestra gastado sobre aprobado, y si se paso del 100%
 * dibuja el exceso en rojo fuera de la escala.
 */
export function BarraPresupuesto({
  gastado,
  aprobado,
}: {
  gastado: number;
  aprobado: number;
}) {
  const p = aprobado > 0 ? (100 * gastado) / aprobado : 0;
  const dentro = Math.min(p, 100);
  const exceso = Math.max(p - 100, 0);

  return (
    <div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full ${p >= 90 ? "bg-amber-500" : "bg-emerald-500"}`}
          style={{ width: `${dentro}%` }}
        />
        {exceso > 0 && (
          <div
            className="absolute inset-y-0 bg-red-500"
            style={{ left: `${Math.max(0, 100 - Math.min(exceso, 100))}%`, width: `${Math.min(exceso, 100)}%` }}
          />
        )}
      </div>
      <div className="mt-1 flex justify-between text-xs tabular-nums">
        <span className={p >= 90 ? "font-medium text-red-600" : "text-slate-500"}>
          {soles(gastado)}
        </span>
        <span className="text-slate-400">de {soles(aprobado)}</span>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- tarjetas */

export function Tarjeta({
  titulo,
  valor,
  detalle,
  alerta = false,
  acento = false,
}: {
  titulo: string;
  valor: string | number;
  detalle?: string;
  alerta?: boolean;
  acento?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        alerta ? "border-red-200 bg-red-50/40" : "border-slate-200 bg-white"
      }`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{titulo}</p>
      <p
        className={`mt-1.5 font-semibold tabular-nums ${acento ? "text-3xl" : "text-2xl"} ${
          alerta ? "text-red-700" : "text-slate-900"
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

/* ----------------------------------------------------------------- vacios */

export function Cargando({ que = "datos" }: { que?: string }) {
  return (
    <div className="space-y-2 p-1">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-10 animate-pulse rounded-md bg-slate-100" />
      ))}
      <p className="pt-1 text-xs text-slate-400">Cargando {que}…</p>
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

export function Vacio({ mensaje, accion }: { mensaje: string; accion?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50/50 px-6 py-12 text-center">
      <p className="text-sm text-slate-500">{mensaje}</p>
      {accion && <div className="mt-3">{accion}</div>}
    </div>
  );
}

/* ---------------------------------------------------------------- seccion */

export function Seccion({
  titulo,
  pregunta,
  children,
  accion,
}: {
  titulo?: string;
  /** La pregunta del producto que responde este bloque. */
  pregunta?: string;
  children: React.ReactNode;
  accion?: React.ReactNode;
}) {
  return (
    <section>
      {(titulo || pregunta) && (
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            {pregunta && (
              <h2 className="text-sm font-semibold text-slate-900">{pregunta}</h2>
            )}
            {titulo && <p className="text-xs text-slate-500">{titulo}</p>}
          </div>
          {accion}
        </div>
      )}
      {children}
    </section>
  );
}
