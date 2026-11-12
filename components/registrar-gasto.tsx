"use client";

/**
 * Formulario de gasto. Llama solo a ms-presupuestos; si el gasto cruza el 90%
 * del presupuesto, ese servicio publica la alerta por SNS y otro microservicio
 * la consume. El frontend no interviene en esa parte.
 */

import { useState } from "react";

import { FalloApi, llamar, USAR_MOCKS } from "@/lib/api";

type Partida = { id: number; nombre: string };

export function RegistrarGasto({
  proyectoId,
  partidas,
  onRegistrado,
}: {
  proyectoId: string;
  partidas: Partida[];
  onRegistrado: (monto: number) => Promise<void> | void;
}) {
  const [partidaId, setPartidaId] = useState(String(partidas[0]?.id ?? ""));
  const [monto, setMonto] = useState("");
  const [concepto, setConcepto] = useState("");
  const [proveedor, setProveedor] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError("");
    try {
      const valor = Number(monto);
      if (!USAR_MOCKS) {
        await llamar("presupuestos", `/presupuestos/${proyectoId}/gastos`, {
          metodo: "POST",
          cuerpo: {
            partida_id: Number(partidaId),
            monto: valor,
            concepto: concepto.trim(),
            proveedor: proveedor.trim() || undefined,
          },
        });
      }
      await onRegistrado(valor);
      setMonto("");
      setConcepto("");
      setProveedor("");
    } catch (err) {
      setError(err instanceof FalloApi ? err.message : "No se pudo registrar el gasto");
    } finally {
      setEnviando(false);
    }
  }

  const campo =
    "mt-1 w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-sm focus:border-slate-400 focus:outline-none";
  const etiqueta = "text-[10px] font-medium uppercase text-slate-500";

  return (
    <form
      onSubmit={enviar}
      className="space-y-3 rounded-lg border border-slate-200 bg-white p-4"
    >
      <div>
        <label className={etiqueta}>Partida</label>
        <select value={partidaId} onChange={(e) => setPartidaId(e.target.value)} className={campo}>
          {partidas.map((p) => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={etiqueta}>Monto (S/)</label>
          <input
            required type="number" min="0.01" step="0.01"
            value={monto} onChange={(e) => setMonto(e.target.value)} className={campo}
          />
        </div>
        <div>
          <label className={etiqueta}>Proveedor</label>
          <input value={proveedor} onChange={(e) => setProveedor(e.target.value)} className={campo} />
        </div>
      </div>
      <div>
        <label className={etiqueta}>Concepto</label>
        <input
          required value={concepto} onChange={(e) => setConcepto(e.target.value)} className={campo}
        />
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={enviando || !partidaId || !monto || !concepto.trim()}
        className="w-full rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {enviando ? "Registrando…" : "Registrar gasto"}
      </button>
    </form>
  );
}
