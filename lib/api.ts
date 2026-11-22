
import { ENDPOINTS } from "./endpoints";

export type Respuesta<T> = {
  ok: true;
  datos: T;
  meta?: Record<string, unknown>;
};

export type ErrorApi = {
  ok: false;
  error: { codigo: string; mensaje: string };
};

export const SERVICIOS = {
  identidad: process.env.NEXT_PUBLIC_API_IDENTIDAD ?? ENDPOINTS.identidad,
  portafolios: process.env.NEXT_PUBLIC_API_PORTAFOLIOS ?? ENDPOINTS.portafolios,
  tareas: process.env.NEXT_PUBLIC_API_TAREAS ?? ENDPOINTS.tareas,
  recursos: process.env.NEXT_PUBLIC_API_RECURSOS ?? ENDPOINTS.recursos,
  presupuestos: process.env.NEXT_PUBLIC_API_PRESUPUESTOS ?? ENDPOINTS.presupuestos,
  analitico: process.env.NEXT_PUBLIC_API_ANALITICO ?? ENDPOINTS.analitico,
} as const;

export type Servicio = keyof typeof SERVICIOS;

export const USAR_MOCKS = process.env.NEXT_PUBLIC_USAR_MOCKS === "true";

const CLAVE_TOKEN = "ppm_token";
const CLAVE_SESION = "ppm_sesion";

export type Sesion = {
  usuario_id: string;
  email: string;
  nombre: string;
  rol: "admin" | "pmo" | "pm" | "miembro";
  tenant_id: string;
  tenant_nombre?: string;
};

export function guardarSesion(token: string, sesion: Sesion) {
  localStorage.setItem(CLAVE_TOKEN, token);
  localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
}

export function token(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CLAVE_TOKEN);
}

export function sesion(): Sesion | null {
  if (typeof window === "undefined") return null;
  const bruto = localStorage.getItem(CLAVE_SESION);
  return bruto ? (JSON.parse(bruto) as Sesion) : null;
}

export function cerrarSesion() {
  localStorage.removeItem(CLAVE_TOKEN);
  localStorage.removeItem(CLAVE_SESION);
  window.location.href = "/";
}

export class FalloApi extends Error {
  codigo: string;
  estado: number;
  constructor(codigo: string, mensaje: string, estado: number) {
    super(mensaje);
    this.codigo = codigo;
    this.estado = estado;
  }
}

type Opciones = {
  metodo?: "GET" | "POST" | "PUT" | "DELETE";
  cuerpo?: unknown;
  sinToken?: boolean;
};

export async function llamar<T>(
  servicio: Servicio,
  ruta: string,
  opciones: Opciones = {},
): Promise<{ datos: T; meta?: Record<string, unknown> }> {
  const base = SERVICIOS[servicio];
  if (!base) {
    throw new FalloApi(
      "SIN_CONFIGURAR",
      `Falta NEXT_PUBLIC_API_${servicio.toUpperCase()} en el entorno`,
      0,
    );
  }

  const cabeceras: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (!opciones.sinToken) {
    const t = token();
    if (!t) throw new FalloApi("SIN_SESION", "No hay sesion activa", 401);
    cabeceras.Authorization = `Bearer ${t}`;
  }

  let r: Response;
  try {
    r = await fetch(`${base}${ruta}`, {
      method: opciones.metodo ?? "GET",
      headers: cabeceras,
      body: opciones.cuerpo ? JSON.stringify(opciones.cuerpo) : undefined,
    });
  } catch {
    throw new FalloApi(
      "SIN_RED",
      `No se pudo contactar a ${servicio}. Revisa que este desplegado y que el CORS permita este origen.`,
      0,
    );
  }

  if (r.status === 401 && !opciones.sinToken) {
    cerrarSesion();
    throw new FalloApi("SESION_VENCIDA", "La sesion vencio", 401);
  }

  const cuerpo = (await r.json().catch(() => null)) as
    | Respuesta<T>
    | ErrorApi
    | { message?: string }
    | null;

  if (!cuerpo) {
    throw new FalloApi(
      "RESPUESTA_INVALIDA",
      `${servicio} respondió ${r.status} sin JSON.`,
      r.status,
    );
  }

  if ((cuerpo as Respuesta<T>).ok === true) {
    const okCuerpo = cuerpo as Respuesta<T>;
    return { datos: okCuerpo.datos, meta: okCuerpo.meta };
  }

  const propio = (cuerpo as ErrorApi).error;

  if (r.status === 403) {
    throw new FalloApi(
      propio?.codigo ?? "PROHIBIDO",
      propio?.mensaje ??
        "No tienes permiso sobre este recurso. Puede pertenecer a otra organizacion o tu rol no lo permite.",
      403,
    );
  }

  if (propio?.codigo) {
    throw new FalloApi(propio.codigo, propio.mensaje, r.status);
  }

  const generico = (cuerpo as { message?: string }).message;
  if (r.status >= 500) {
    throw new FalloApi(
      "ERROR_SERVIDOR",
      `${servicio} devolvió un error interno (${r.status}). ` +
        "Si estás en AWS Academy, revisa que el Learner Lab esté encendido.",
      r.status,
    );
  }
  throw new FalloApi(
    "ERROR_INESPERADO",
    generico || `${servicio} respondió ${r.status}.`,
    r.status,
  );
}

export function soles(n: number | string | null | undefined): string {
  const v = Number(n ?? 0);
  return v.toLocaleString("es-PE", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 0,
  });
}

export function pct(n: number | string | null | undefined): string {
  return `${Number(n ?? 0).toFixed(1)}%`;
}
