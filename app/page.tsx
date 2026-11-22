"use client";


import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { FalloApi, guardarSesion, llamar, USAR_MOCKS } from "@/lib/api";
import { TENANTS } from "@/lib/mock";
import { Marca } from "@/components/marca";
import { MarcaOrganizacion } from "@/components/logos";

type Tenant = { tenant_id: string; nombre: string; rubro: string };

export default function Login() {
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [tenantId, setTenantId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [entrando, setEntrando] = useState(false);

  useEffect(() => {
    if (USAR_MOCKS) {
      setTenants(TENANTS);
      setTenantId(TENANTS[0].tenant_id);
      return;
    }
    llamar<Tenant[]>("identidad", "/tenants", { sinToken: true })
      .then(({ datos }) => {
        setTenants(datos);
        if (datos[0]) setTenantId(datos[0].tenant_id);
      })
      .catch((e: FalloApi) => setError(e.message));
  }, []);

  useEffect(() => {
    const dominios: Record<string, string> = {
      "t-acme": "admin@acme.com.pe",
      "t-globex": "admin@globex.com",
      "t-initech": "admin@initech.io",
    };
    if (dominios[tenantId]) setEmail(dominios[tenantId]);
  }, [tenantId]);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setEntrando(true);

    if (USAR_MOCKS) {
      guardarSesion("token-de-prueba", {
        usuario_id: "mock", email, nombre: "Admin de prueba",
        rol: "admin", tenant_id: tenantId,
        tenant_nombre: tenants.find((t) => t.tenant_id === tenantId)?.nombre,
      });
      router.push("/dashboard");
      return;
    }

    try {
      const { datos } = await llamar<{ token: string; usuario: any }>(
        "identidad",
        "/login",
        { metodo: "POST", sinToken: true,
          cuerpo: { tenant_id: tenantId, email, password } },
      );
      const org = tenants?.find((t) => t.tenant_id === tenantId);
      guardarSesion(datos.token, { ...datos.usuario, tenant_nombre: org?.nombre });
      router.push("/dashboard");
    } catch (e) {
      setError(e instanceof FalloApi ? e.message : "Error inesperado");
      setEntrando(false);
    }
  }

  return (
    <main className="relative min-h-screen bg-[#0d0f14] text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10 xl:max-w-7xl xl:px-12">
        <header className="shrink-0">
          <span className="flex w-fit items-center gap-3">
            <Marca tam={44} />
            <span className="text-xl font-semibold tracking-tight">Portafolio</span>
          </span>
        </header>

        <div className="grid flex-1 items-center gap-12 py-12 lg:grid-cols-[1.15fr_auto] lg:gap-20">
        <div>
          <h1 className="max-w-[13ch] text-[clamp(2.75rem,5.6vw,5.25rem)] font-semibold leading-[1.02] tracking-[-0.02em]">
            Decide qué obra va primero.
          </h1>
          <p className="mt-7 max-w-[44ch] text-[clamp(1rem,1.25vw,1.375rem)] leading-relaxed text-white/70">
            Portafolios, proyectos, recursos y presupuestos de toda la
            organización en una sola cartera, priorizada y al día.
          </p>

        </div>

      <div className="relative w-full lg:w-[25rem] xl:w-[27rem]">

        <form
          onSubmit={entrar}
          className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur xl:p-8"
        >
          <div>
            <label className="block text-sm font-medium text-white/65">
              Organización
            </label>
            <select
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              className="mt-2 w-full rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-[15px] text-white transition-colors placeholder:text-white/35 hover:border-white/30 focus:border-marca"
              required
            >
              <option value="">Elige una organización</option>
              {tenants.map((t) => (
                <option key={t.tenant_id} value={t.tenant_id}>
                  {t.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/65">
              Correo
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-[15px] text-white transition-colors placeholder:text-white/35 hover:border-white/30 focus:border-marca"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/65">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-[15px] text-white transition-colors placeholder:text-white/35 hover:border-white/30 focus:border-marca"
              required={!USAR_MOCKS}
            />
          </div>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={entrando || !tenantId}
            className="w-full rounded-lg bg-marca px-4 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-marca-fuerte disabled:cursor-not-allowed disabled:opacity-50"
          >
            {entrando ? "Entrando..." : "Entrar"}
          </button>
        </form>

        {USAR_MOCKS && (
          <p className="mt-4 text-center text-xs text-amber-300">
            Modo de datos simulados activo (NEXT_PUBLIC_USAR_MOCKS=true)
          </p>
        )}
        </div>
        </div>

        <footer className="shrink-0 border-t border-white/10 pt-6">
          <p className="text-[15px] text-white/40">Organizaciones en esta instalación</p>
          <ul className="mt-4 flex flex-wrap items-center gap-x-10 gap-y-4">
            {[
              ["t-acme", "Acme Ingeniería"],
              ["t-globex", "Globex Consulting"],
              ["t-initech", "Initech Software"],
              ["t-umbrella", "Umbrella Corp"],
            ].map(([id, nombre]) => (
              <li key={id} className="flex items-center gap-2.5 text-[15px] text-white/70">
                <MarcaOrganizacion tenantId={id} nombre={nombre} tam={26} />
                {nombre}
              </li>
            ))}
          </ul>
        </footer>
      </div>
    </main>
  );
}
