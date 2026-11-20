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
  // Rellenos verificados con el validador de paleta: el par ambar/rojo
  // pasa de 4.9 a 24.4 de separacion en deuteranopia.
  const punto: Record<string, string> = {
    verde: "bg-estado-bien",
    ambar: "bg-estado-alerta",
    rojo: "bg-estado-critico",
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
        estilos[salud] ?? "bg-slate-50 text-tinta-media ring-slate-500/20"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${punto[salud] ?? "bg-slate-400"}`} />
      {salud}
    </span>
  );
}

const ESTADO_COLOR: Record<string, string> = {
  propuesto: "bg-slate-50 text-tinta-media ring-slate-500/15",
  aprobado: "bg-blue-50 text-blue-700 ring-blue-600/15",
  en_curso: "bg-indigo-50 text-indigo-700 ring-indigo-600/15",
  en_pausa: "bg-amber-50 text-amber-700 ring-amber-600/15",
  cerrado: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  cancelado: "bg-slate-50 text-tinta-suave line-through ring-slate-500/15",
  pendiente: "bg-slate-50 text-tinta-media ring-slate-500/15",
  en_progreso: "bg-indigo-50 text-indigo-700 ring-indigo-600/15",
  completada: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  bloqueada: "bg-red-50 text-red-700 ring-red-600/15",
};

export function Estado({ estado }: { estado: string }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
        ESTADO_COLOR[estado] ?? "bg-slate-50 text-tinta-media ring-slate-500/15"
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
  const color = texto ? COLORES[semilla % COLORES.length] : "bg-slate-100 text-tinta-suave";
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
        <p className="truncate text-sm text-tinta">{nombre || "Sin asignar"}</p>
        {detalle && <p className="truncate text-xs text-tinta-media">{detalle}</p>}
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
  if (!valor) return <span className="text-tinta-suave">—</span>;

  const d = new Date(valor);
  if (Number.isNaN(d.getTime())) return <span className="text-tinta-suave">—</span>;

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
      className={atrasado ? "font-medium text-red-600" : "text-tinta-media"}
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
  let color = "bg-estado-bien";
  let estado = "en rango";
  if (invertido) {
    if (valor >= umbralRojo) { color = "bg-estado-critico"; estado = "excedido"; }
    else if (valor >= umbralAmbar) { color = "bg-estado-alerta"; estado = "cerca del limite"; }
  } else if (valor < 40) {
    color = "bg-estado-alerta";
    estado = "avance bajo";
  }

  return (
    <div className="flex items-center gap-2">
      {/* role+aria: con etiqueta={false} el color seria el unico canal, y
          quien no lo distingue se queda sin el dato. */}
      <div
        role="meter"
        aria-valuenow={Math.round(v)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${Math.round(valor)}% · ${estado}`}
        title={`${Math.round(valor)}% · ${estado}`}
        className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200"
      >
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${v}%` }} />
      </div>
      {etiqueta && (
        <span className="w-11 shrink-0 text-right text-xs tabular-nums text-tinta-media">
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
          className={`h-full ${p >= 90 ? "bg-estado-alerta" : "bg-estado-bien"}`}
          style={{ width: `${dentro}%` }}
        />
        {exceso > 0 && (
          <div
            className="absolute inset-y-0 bg-estado-critico"
            style={{ left: `${Math.max(0, 100 - Math.min(exceso, 100))}%`, width: `${Math.min(exceso, 100)}%` }}
          />
        )}
      </div>
      <div className="mt-1 flex justify-between text-xs tabular-nums">
        {/* La tinta sigue al relleno: antes la barra se ponia ambar al 90% y
            el texto rojo a la vez, dando dos estados distintos para un solo
            hecho. */}
        <span
          className={
            exceso > 0
              ? "font-semibold text-rojo"
              : p >= 90
                ? "font-medium text-ambar"
                : "text-tinta-media"
          }
        >
          {soles(gastado)}
        </span>
        <span className="text-tinta-suave">de {soles(aprobado)}</span>
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
      className={`rounded-dato border p-4 ${
        alerta ? "border-red-200 bg-red-50/50" : "border-borde bg-superficie"
      }`}
    >
      <p className="text-xs text-tinta-media">{titulo}</p>
      <p
        className={`tabular mt-2 font-semibold tracking-tight ${
          acento ? "text-[2rem] leading-none" : "text-2xl leading-none"
        } ${alerta ? "text-rojo" : "text-tinta"}`}
      >
        {valor}
      </p>
      {detalle && <p className="mt-1.5 text-xs text-tinta-media">{detalle}</p>}
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
        <div
          key={i}
          className="h-10 animate-pulse rounded-lg bg-slate-200/70"
          // Un escalonado corto da sensacion de carga progresiva en vez de
          // tres barras latiendo a la vez.
          style={{ animationDelay: `${i * 120}ms`, opacity: 1 - i * 0.18 }}
        />
      ))}
      <p className="pt-1 text-xs text-tinta-suave">Cargando {que}…</p>
    </div>
  );
}

export function Error_({ mensaje }: { mensaje: string }) {
  return (
    <div className="rounded-dato border border-red-200 bg-red-50 p-4 text-sm text-red-800">
      <p className="font-semibold">No se pudo cargar</p>
      <p className="mt-0.5">{mensaje}</p>
    </div>
  );
}

export function Vacio({ mensaje, accion }: { mensaje: string; accion?: React.ReactNode }) {
  return (
    <div className="rounded-dato border border-dashed border-borde-fuerte px-6 py-14 text-center">
      <p className="text-sm text-tinta-media">{mensaje}</p>
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
              <h2 className="text-[15px] font-semibold tracking-tight text-tinta">
                {pregunta}
              </h2>
            )}
            {titulo && <p className="mt-0.5 text-xs text-tinta-media">{titulo}</p>}
          </div>
          {accion}
        </div>
      )}
      {children}
    </section>
  );
}
