export function Marca({ tam = 32 }: { tam?: number }) {
  return (
    <svg
      width={tam}
      height={tam}
      viewBox="0 0 32 32"
      fill="none"
      role="img"
      aria-label="Portafolio"
    >
      <rect x="4" y="6" width="24" height="5.5" rx="2.75" fill="#6b4df6" />
      <rect x="4" y="13.5" width="16" height="5.5" rx="2.75" fill="#2a78d6" />
      <rect x="4" y="21" width="9" height="5.5" rx="2.75" fill="#1baf7a" />
    </svg>
  );
}

export function MarcaConNombre() {
  return (
    <span className="flex items-center gap-2.5">
      <Marca tam={30} />
      <span className="text-[17px] font-semibold tracking-tight text-white">
        Portafolio
      </span>
    </span>
  );
}
