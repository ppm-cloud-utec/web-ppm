"use client";

/**
 * Login con selector de organizacion.
 *
 * El selector existe porque la demo cambia entre tenants. En un SaaS real el
 * tenant se deduce del subdominio (acme.portafolio.com) y este desplegable no
 * estaria.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { FalloApi, guardarSesion, llamar, USAR_MOCKS } from "@/lib/api";
import { TENANTS } from "@/lib/mock";

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

  // El correo del admin se deduce del tenant elegido, para que la demo sea
  // de un clic y no haya que recordar los dominios.
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
      // El nombre sale del selector que ya cargamos, no de una tabla fija.
      const org = tenants?.find((t) => t.tenant_id === tenantId);
      guardarSesion(datos.token, { ...datos.usuario, tenant_nombre: org?.nombre });
      router.push("/dashboard");
    } catch (e) {
      setError(e instanceof FalloApi ? e.message : "Error inesperado");
      setEntrando(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden p-6">
      {/* Franja de marca: da identidad sin robarle atencion al formulario. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-marca-tenue to-transparent"
      />
      <div className="relative w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-marca text-lg font-bold text-white shadow-elevada">
            P
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-tinta">Portafolio</h1>
          <p className="mt-1 text-sm text-tinta-media">
            Gestión de portafolios, proyectos, recursos y presupuestos
          </p>
        </div>

        <form
          onSubmit={entrar}
          className="space-y-4 rounded-2xl border border-borde bg-superficie p-6 shadow-elevada"
        >
          <div>
            <label className="block text-sm font-medium text-tinta-media">
              Organización
            </label>
            <select
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-borde-fuerte bg-white px-3 py-2 text-sm transition-colors placeholder:text-tinta-suave hover:border-marca/40"
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
            <label className="block text-sm font-medium text-tinta-media">
              Correo
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-borde-fuerte bg-white px-3 py-2 text-sm transition-colors placeholder:text-tinta-suave hover:border-marca/40"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-tinta-media">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-borde-fuerte bg-white px-3 py-2 text-sm transition-colors placeholder:text-tinta-suave hover:border-marca/40"
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
            className="w-full rounded-lg bg-marca px-4 py-2.5 text-sm font-semibold text-white shadow-carta transition-colors hover:bg-marca-fuerte disabled:cursor-not-allowed disabled:opacity-50"
          >
            {entrando ? "Entrando..." : "Entrar"}
          </button>
        </form>

        {USAR_MOCKS && (
          <p className="mt-4 text-center text-xs text-amber-700">
            Modo de datos simulados activo (NEXT_PUBLIC_USAR_MOCKS=true)
          </p>
        )}
      </div>
    </main>
  );
}
