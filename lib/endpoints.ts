/**
 * Direcciones del backend desplegado.
 *
 * Van aqui, en codigo versionado, y NO en un archivo .env:
 *
 * - No son secretos. Next incrusta cualquier NEXT_PUBLIC_* en el bundle
 *   estatico, asi que estas URLs son visibles para cualquiera que abra el
 *   sitio y mire el codigo fuente. Lo que protege estas APIs es el
 *   authorizer que valida el JWT, no ocultar la direccion.
 * - Un archivo .env esta ignorado por git a proposito, porque es donde van
 *   las credenciales. Meter ahi algo que el build NECESITA garantiza que
 *   tarde o temprano alguien compile sin el y publique un sitio que no
 *   encuentra su backend. Ya paso una vez.
 *
 * La variable de entorno sigue teniendo prioridad, para poder apuntar a otro
 * despliegue sin tocar el codigo.
 *
 * Si se redespliega la infraestructura y cambian los identificadores:
 *   aws cloudformation describe-stacks --stack-name ms-<servicio>-dev \
 *     --query "Stacks[0].Outputs[?OutputKey=='ServiceEndpoint'].OutputValue" \
 *     --output text
 */
const BASE = "execute-api.us-east-1.amazonaws.com/dev";

export const ENDPOINTS = {
  identidad: `https://hw5b5suj23.${BASE}`,
  portafolios: `https://c78c035rtl.${BASE}`,
  tareas: `https://yq369o7q4k.${BASE}`,
  recursos: `https://sitxbs7ytj.${BASE}`,
  presupuestos: `https://xqk5r0tbq3.${BASE}`,
  analitico: `https://dvynil8hte.${BASE}`,
} as const;
