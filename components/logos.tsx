
type Props = { tam?: number; className?: string };

export function AcmeMarca({ tam = 24, className }: Props) {
  return (
    <svg width={tam} height={tam} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M2 7h20" stroke="#2a78d6" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M4 18 12 7l8 11" stroke="#2a78d6" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M12 7v11" stroke="#2a78d6" strokeWidth="2.4" strokeLinecap="round" opacity=".45" />
    </svg>
  );
}

export function GlobexMarca({ tam = 24, className }: Props) {
  return (
    <svg width={tam} height={tam} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="3" stroke="#6b4df6" strokeWidth="2.4" />
      <rect x="12" y="3" width="9" height="9" rx="3" fill="#6b4df6" />
    </svg>
  );
}

export function InitechMarca({ tam = 24, className }: Props) {
  return (
    <svg width={tam} height={tam} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M9 5 3 12l6 7" stroke="#0aa2c0" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 5l6 7-6 7" stroke="#0aa2c0" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

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
