/**
 * Cliente HTTP unico para los 6 microservicios.
 *
 * Los 6 responden con la misma forma ({ok, datos, meta} / {ok, error}), asi
 * que basta un cliente. El token se manda en cada llamada; el tenant_id va
 * DENTRO del token y nunca en el body ni en la URL.
 */

export type Respuesta<T> = {
  ok: true;
  datos: T;
  meta?: Record<string, unknown>;
};

export type ErrorApi = {
  ok: false;
  error: { codigo: string; mensaje: string };
};

/** Los 6 microservicios, cada uno con su API Gateway. */
export const SERVICIOS = {
  identidad: process.env.NEXT_PUBLIC_API_IDENTIDAD,
  portafolios: process.env.NEXT_PUBLIC_API_PORTAFOLIOS,
  tareas: process.env.NEXT_PUBLIC_API_TAREAS,
  recursos: process.env.NEXT_PUBLIC_API_RECURSOS,
  presupuestos: process.env.NEXT_PUBLIC_API_PRESUPUESTOS,
  analitico: process.env.NEXT_PUBLIC_API_ANALITICO,
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

/**
 * Llama a un microservicio y devuelve { datos, meta } ya desempaquetados.
 *
 * Un 401 significa que el token vencio (duran 12 horas): se limpia la sesion y
 * se vuelve al login, en vez de dejar la pantalla con errores raros.
 */
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

  // Error con NUESTRA forma: { ok: false, error: { codigo, mensaje } }
  const propio = (cuerpo as ErrorApi).error;
  if (propio?.codigo) {
    throw new FalloApi(propio.codigo, propio.mensaje, r.status);
  }

  // Error generado por API GATEWAY, que tiene otra forma:
  //   { "message": "Internal server error" }
  // Leer error.codigo aqui reventaba con "Cannot read properties of
  // undefined", y el usuario veia un error de JavaScript en vez de saber
  // que el servidor fallo.
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

/** Formatea un monto en soles sin decimales, que es como se lee un presupuesto. */
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
