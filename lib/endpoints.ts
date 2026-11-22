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
 *   aws cloudformation describe-stacks --stack-name infra-compartida-dev \
 *     --query "Stacks[0].Outputs[?OutputKey=='ApiUrl'].OutputValue" --output text
 */
// Una sola API Gateway para los 6 microservicios; cada uno vive bajo su
// prefijo. Las rutas internas no cambian: llamar("portafolios", "/proyectos")
// sigue funcionando porque el prefijo ya va en la base del servicio.
const API = "https://t8wutxmr7b.execute-api.us-east-1.amazonaws.com/dev";

export const ENDPOINTS = {
  identidad: `${API}/identidad`,
  portafolios: `${API}/portafolios`,
  tareas: `${API}/tareas`,
  recursos: `${API}/recursos`,
  presupuestos: `${API}/presupuestos`,
  analitico: `${API}/analitico`,
} as const;
