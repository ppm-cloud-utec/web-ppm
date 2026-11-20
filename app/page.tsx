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

  // La entrada es la unica pantalla oscura: es una portada, se ve dos
  // segundos y es donde la marca puede hablar fuerte. El resto de la
  // aplicacion se usa horas seguidas leyendo cifras y se queda en claro,
  // que es como se leen numeros durante horas sin cansarse.
  return (
    <main className="relative min-h-screen bg-[#0d0f14] text-white">
      <div className="mx-auto grid min-h-screen max-w-5xl items-center gap-12 px-6 py-16 lg:grid-cols-[1.1fr_auto]">
        <div>
          <span className="flex w-fit items-center gap-3">
            <Marca tam={38} />
            <span className="text-lg font-semibold tracking-tight">Portafolio</span>
          </span>

          <h1 className="mt-10 max-w-[14ch] text-[2.6rem] font-semibold leading-[1.05] tracking-tight sm:text-[3.4rem]">
            Decide qué obra va primero.
          </h1>
          <p className="mt-5 max-w-[46ch] text-base leading-relaxed text-white/70">
            Portafolios, proyectos, recursos y presupuestos de toda la
            organización en una sola cartera, priorizada y al día.
          </p>

          {/* Las cuatro marcas: dicen que esto sirve a varias organizaciones
              antes de que nadie entre a verlo. */}
          <div className="mt-12">
            <p className="text-sm text-white/45">Organizaciones en esta instalación</p>
            <ul className="mt-4 flex flex-wrap items-center gap-x-7 gap-y-4">
              {[
                ["t-acme", "Acme Ingeniería"],
                ["t-globex", "Globex Consulting"],
                ["t-initech", "Initech Software"],
                ["t-umbrella", "Umbrella Corp"],
              ].map(([id, nombre]) => (
                <li key={id} className="flex items-center gap-2 text-sm text-white/70">
                  <MarcaOrganizacion tenantId={id} nombre={nombre} tam={20} />
                  {nombre}
                </li>
              ))}
            </ul>
          </div>
        </div>

      <div className="relative w-full max-w-sm">

        <form
          onSubmit={entrar}
          className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur"
        >
          <div>
            <label className="block text-sm font-medium text-white/60">
              Organización
            </label>
            <select
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white transition-colors placeholder:text-white/35 hover:border-white/30 focus:border-marca"
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
            <label className="block text-sm font-medium text-white/60">
              Correo
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white transition-colors placeholder:text-white/35 hover:border-white/30 focus:border-marca"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/60">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white transition-colors placeholder:text-white/35 hover:border-white/30 focus:border-marca"
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
            className="w-full rounded-lg bg-marca px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-marca-fuerte disabled:cursor-not-allowed disabled:opacity-50"
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
    </main>
  );
}
