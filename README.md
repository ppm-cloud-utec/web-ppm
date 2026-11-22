# web-ppm

Frontend de la plataforma Portafolio (proyecto final de Cloud Computing CS2032, Grupo 4). Hecho con Next.js 16 y TypeScript, exportado como sitio estatico y publicado en AWS Amplify.

Desplegado en: https://main.d1x0c0t0mq8zy7.amplifyapp.com

Consume los seis microservicios a traves de la API Gateway `ppm-api-dev`; las URLs estan en `lib/endpoints.ts`.

Pantallas: acceso, tablero, portafolios, proyectos, detalle de proyecto, kanban, carga del equipo y admision de propuestas.

## Desarrollo

```bash
npm install
npm run dev
```

## Build

```bash
npm run build   # genera out/, que se sube a Amplify
```
