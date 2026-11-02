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
      guardarSesion(datos.token, datos.usuario);
      router.push("/dashboard");
    } catch (e) {
      setError(e instanceof FalloApi ? e.message : "Error inesperado");
      setEntrando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-900">Portafolio</h1>
          <p className="mt-1 text-sm text-slate-500">
            Gestión de portafolios, proyectos, recursos y presupuestos
          </p>
        </div>

        <form
          onSubmit={entrar}
          className="space-y-4 rounded-lg border border-slate-200 bg-white p-6"
        >
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Organización
            </label>
            <select
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
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
            <label className="block text-sm font-medium text-slate-700">
              Correo
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              required={!USAR_MOCKS}
            />
          </div>

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={entrando || !tenantId}
            className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
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
