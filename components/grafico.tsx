"use client";


export const EJE = {
  fontSize: 11,
  tickLine: false,
  axisLine: false,
  stroke: "var(--eje)",
} as const;

export const REJILLA = {
  strokeDasharray: "2 4",
  stroke: "var(--rejilla)",
  vertical: false,
} as const;

export const CURSOR = { fill: "var(--dato-tenue)", fillOpacity: 0.45 } as const;

export function Tooltip_({
  active,
  payload,
  label,
  formato,
}: {
  active?: boolean;
  payload?: { name?: string; value?: number | string; color?: string }[];
  label?: string | number;
  formato?: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-borde bg-superficie px-3 py-2 shadow-elevada">
      <p className="text-xs font-medium text-tinta-suave">
        {label}
      </p>
      {payload.map((p, i) => (
        <p key={i} className="mt-1 flex items-center gap-2 text-sm text-tinta">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ background: p.color }}
          />
          <span className="text-tinta-media">{p.name}</span>
          <span className="tabular ml-auto font-semibold">
            {formato ? formato(Number(p.value)) : p.value}
          </span>
        </p>
      ))}
    </div>
  );
}
