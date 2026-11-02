# web-ppm

FrontEnd del SaaS PPM. **Next.js 16 desplegado en AWS Amplify.**

- **Responsable:** @alxgr-08
- Vale **6 de los 20 puntos** de la rúbrica: es el entregable individual más pesado.

## Las 6 pantallas

| Ruta | Pantalla | Microservicios que consume |
|---|---|---|
| `/` | Login con selector de organización | ms-identidad |
| `/dashboard` | **Dashboard ejecutivo:** las 4 preguntas del producto | ms-analitico, ms-portafolios |
| `/admision` | Bandeja de admisión rankeada + panel de capacidad | ms-portafolios |
| `/proyectos` | Tabla filtrable y paginada | ms-portafolios |
| `/proyectos/{id}` | Detalle: tareas, partidas, historial | ms-portafolios, ms-tareas, ms-presupuestos |
| `/kanban` | Tablero por estado, arrastrable | ms-portafolios |
| `/carga` | **Workload:** ocupación de cada persona | ms-recursos |

## Arrancar

```bash
npm install
cp .env.local.example .env.local   # y pon las URLs reales
npm run dev
```

## Trabajar sin esperar al backend

```bash
# en .env.local
NEXT_PUBLIC_USAR_MOCKS=true
```

`lib/mock.ts` devuelve datos con **la misma forma** que la API. Las pantallas
se construyen y se revisan antes de que los microservicios estén desplegados;
cuando lo estén, se pone en `false` y nada más cambia.

Es lo que evita que el frontend quede para la última semana valiendo 6 puntos.

## Cómo hablan las pantallas con el backend

`lib/api.ts` es el único cliente HTTP. Los 6 microservicios responden igual:

```ts
{ ok: true,  datos: T, meta?: {...} }
{ ok: false, error: { codigo, mensaje } }
```

Tres cosas que hace el cliente y conviene saber:

1. **El token va en `Authorization: Bearer`** en toda llamada. El `tenant_id`
   está **dentro del token** — nunca se manda en el body ni en la URL.
2. **Un 401 cierra la sesión y vuelve al login.** Los tokens duran 12 horas; sin
   esto, al vencer quedaría una pantalla llena de errores raros.
3. **Un fallo de red da un mensaje útil** ("revisa que esté desplegado y que el
   CORS permita este origen") en vez de un `TypeError: Failed to fetch`.

## El momento clave de la demo

En `/proyectos/{id}`, el botón **Completar** llama **solo a ms-tareas**. El
avance del proyecto que se ve arriba lo recalcula **ms-portafolios** al recibir
`tarea.completada` por SQS. La pantalla espera un momento, recarga, y el
porcentaje ya cambió:

> *El avance pasó de 40.0% a 60.0% (3 de 5 tareas). El frontend nunca llamó a
> ms-portafolios.*

Eso es lo que demuestra que el sistema es event-driven y no un monolito
repartido.

## Desplegar en Amplify

1. Consola de Amplify → *Host a web app* → GitHub → repo `web-ppm` → rama `main`
2. Amplify detecta Next.js solo; `amplify.yml` ya está en el repo
3. En *App settings → Environment variables*, las 6 `NEXT_PUBLIC_API_*`
4. Deploy

La URL pública va en el informe.

## Verificado

- `npx tsc --noEmit` sin errores
- `npm run build` compila las 8 rutas
- Las 6 pantallas probadas en el navegador con datos simulados

## Documentación

- [Propuesta funcional](https://github.com/ppm-cloud-utec/infra-compartida/blob/main/docs/propuesta.md) — de dónde salen estas pantallas
- [Arquitectura general](https://github.com/ppm-cloud-utec/infra-compartida/blob/main/docs/arquitectura.md)
