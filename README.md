# web-ppm

FrontEnd del SaaS PPM. **Next.js desplegado en AWS Amplify.**

- **Responsable:** @alxgr-08
- Vale **6 de los 20 puntos** de la rúbrica: es el entregable individual más pesado.

## Arrancar

```bash
npx create-next-app@latest . --typescript --tailwind --app --eslint
npm run dev
```

## Las 6 pantallas

Tomadas de lo que coinciden monday.com, Smartsheet y Planview:

| Pantalla | Qué muestra | Microservicio |
|---|---|---|
| **Login + selector de tenant** | entrada, guarda el JWT | ms-identidad |
| **Bandeja de admisión** | propuestas pendientes, ranking por score, aprobar/rechazar | ms-portafolios |
| **Tabla de proyectos** | listado filtrable: estado, prioridad, avance, presupuesto | ms-portafolios |
| **Kanban** | proyectos o tareas en columnas por estado | ms-portafolios / ms-tareas |
| **Carga del equipo** | % de ocupación semanal por persona, rojo si pasa del 100% | ms-recursos |
| **Dashboard ejecutivo** | semáforo del portafolio, aprobado vs ejecutado, ranking | ms-analitico |

Opcional si sobra tiempo: **Gantt** con hitos y dependencias (es la más caro de
construir, se recorta primero).

## Reglas

1. **El token va en `Authorization: Bearer <jwt>`** en toda llamada. El
   `tenant_id` ya está dentro del token: **nunca lo mandes en el body ni en la
   URL**.
2. Todos los microservicios responden igual, así que un solo cliente HTTP
   sirve para los 6:
   ```ts
   { ok: true,  datos: T, meta?: { total: number } }
   { ok: false, error: { codigo: string, mensaje: string } }
   ```
3. Un `.env.local` con una variable por microservicio:
   ```
   NEXT_PUBLIC_API_IDENTIDAD=https://xxxx.execute-api.us-east-1.amazonaws.com/dev
   NEXT_PUBLIC_API_PORTAFOLIOS=...
   NEXT_PUBLIC_API_TAREAS=...
   NEXT_PUBLIC_API_RECURSOS=...
   NEXT_PUBLIC_API_PRESUPUESTOS=...
   NEXT_PUBLIC_API_ANALITICO=...
   ```
   En Amplify las mismas variables van en *Environment variables*.
4. **No esperes a que el backend esté listo.** Arranca con mocks en
   `lib/mock/` que devuelvan la forma de arriba, y cambia la URL cuando cada
   microservicio despliegue. Si esperas, el frontend queda para la semana 4 y
   vale 6 puntos.

## Deploy en Amplify

Consola de Amplify → *Host a web app* → GitHub → repo `web-ppm` → rama `main`.
Amplify detecta Next.js solo. Agregar las variables de entorno y desplegar.

La URL pública va en el informe.
