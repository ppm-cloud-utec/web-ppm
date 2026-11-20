/**
 * Marcas de las organizaciones de la demo.
 *
 * Cada empresa tiene un simbolo propio derivado de su oficio, no una inicial
 * dentro de un cuadro de color. En una aplicacion multi-tenant eso no es
 * adorno: al cambiar de organizacion delante de alguien, el cambio de marca
 * es la prueba visual de que de verdad son dos espacios distintos.
 *
 * Trazo geometrico, un color por empresa, sin degradados ni volumenes. Los
 * colores evitan el verde, el ambar y el rojo, reservados al semaforo de
 * salud.
 */

type Props = { tam?: number; className?: string };

/** Acme Ingenieria — obra civil. Una celosia: el tramo y sus diagonales. */
export function AcmeMarca({ tam = 24, className }: Props) {
  return (
    <svg width={tam} height={tam} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M2 7h20" stroke="#2a78d6" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M4 18 12 7l8 11" stroke="#2a78d6" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M12 7v11" stroke="#2a78d6" strokeWidth="2.4" strokeLinecap="round" opacity=".45" />
    </svg>
  );
}

/** Globex Consulting — marcos de analisis. Una matriz con un cuadrante lleno. */
export function GlobexMarca({ tam = 24, className }: Props) {
  return (
    <svg width={tam} height={tam} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="3" stroke="#6b4df6" strokeWidth="2.4" />
      <rect x="12" y="3" width="9" height="9" rx="3" fill="#6b4df6" />
    </svg>
  );
}

/** Initech Software — los dos signos que abren y cierran todo codigo. */
export function InitechMarca({ tam = 24, className }: Props) {
  return (
    <svg width={tam} height={tam} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M9 5 3 12l6 7" stroke="#0aa2c0" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 5l6 7-6 7" stroke="#0aa2c0" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Umbrella Corp — farmaceutica. El hexagono del anillo molecular. */
export function UmbrellaMarca({ tam = 24, className }: Props) {
  return (
    <svg width={tam} height={tam} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M12 2.5 20.5 7v10L12 21.5 3.5 17V7z" stroke="#d55181" strokeWidth="2.2" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" fill="#d55181" />
    </svg>
  );
}

const POR_TENANT: Record<string, (p: Props) => React.JSX.Element> = {
  "t-acme": AcmeMarca,
  "t-globex": GlobexMarca,
  "t-initech": InitechMarca,
  "t-umbrella": UmbrellaMarca,
};

/**
 * Marca de una organizacion. Si es una creada con la maquina de estados y
 * todavia no tiene simbolo propio, cae en la ficha de inicial: es mejor eso
 * que inventarle un logo que no es suyo.
 */
export function MarcaOrganizacion({
  tenantId,
  nombre,
  tam = 24,
}: {
  tenantId: string;
  nombre: string;
  tam?: number;
}) {
  const Logo = POR_TENANT[tenantId];
  if (Logo) return <Logo tam={tam} />;
  return (
    <span
      className="inline-flex items-center justify-center rounded-md font-semibold text-white"
      style={{ width: tam, height: tam, fontSize: tam * 0.45, background: "var(--id-2)" }}
      aria-hidden
    >
      {nombre.trim().charAt(0).toUpperCase()}
    </span>
  );
}
