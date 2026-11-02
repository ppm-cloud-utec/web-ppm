/**
 * Datos simulados con la MISMA forma que devuelve la API.
 *
 * Existen para que el frontend no quede bloqueado esperando el backend: con
 * NEXT_PUBLIC_USAR_MOCKS=true las pantallas se pueden construir y revisar
 * antes de que los microservicios esten desplegados. Cuando el backend este
 * listo, se pone en false y nada mas cambia.
 */

export const TENANTS = [
  { tenant_id: "t-acme", nombre: "Acme Ingenieria", rubro: "construccion" },
  { tenant_id: "t-globex", nombre: "Globex Consulting", rubro: "consultoria TI" },
  { tenant_id: "t-initech", nombre: "Initech Software", rubro: "software" },
];

export const KPIS = {
  tenant_id: "t-acme",
  proyectos_creados: 500,
  tareas_creadas: 3400,
  tareas_completadas: 3000,
  avance_global_pct: 88.2,
  presupuesto_comprometido: 271540000,
  monto_gastado: 184392011,
  ejecucion_global_pct: 67.9,
  gastos: 1700,
  presupuestos_excedidos: 110,
  asignaciones: 900,
  horas_comprometidas: 20880,
  sobreasignaciones: 90,
  eventos_procesados: 10000,
};

export const SERIE = [
  { periodo: "2026-06", tareas_completadas: 210, monto_gastado: 12400000 },
  { periodo: "2026-07", tareas_completadas: 268, monto_gastado: 15100000 },
  { periodo: "2026-08", tareas_completadas: 241, monto_gastado: 13800000 },
  { periodo: "2026-09", tareas_completadas: 312, monto_gastado: 18900000 },
  { periodo: "2026-10", tareas_completadas: 355, monto_gastado: 21300000 },
  { periodo: "2026-11", tareas_completadas: 98, monto_gastado: 6100000 },
];

export const PROYECTOS = [
  { id: 1, codigo: "PRY-ACM-00001", nombre: "Edificio Comas", estado: "en_curso", prioridad_score: 88.4, avance_pct: 40, salud: "ambar", en_riesgo: false, presupuesto_estimado: 740000, portafolio: "Obras Lima Norte 2024-00" },
  { id: 2, codigo: "PRY-ACM-00002", nombre: "Puente Callao", estado: "en_curso", prioridad_score: 81.2, avance_pct: 92, salud: "verde", en_riesgo: false, presupuesto_estimado: 520000, portafolio: "Infraestructura Vial 2024-02" },
  { id: 3, codigo: "PRY-ACM-00003", nombre: "Via Ate", estado: "en_curso", prioridad_score: 76.9, avance_pct: 34, salud: "rojo", en_riesgo: true, presupuesto_estimado: 890000, portafolio: "Infraestructura Vial 2024-02" },
  { id: 4, codigo: "PRY-ACM-00004", nombre: "Colegio Lurin", estado: "aprobado", prioridad_score: 71.5, avance_pct: 0, salud: "verde", en_riesgo: false, presupuesto_estimado: 310000, portafolio: "Edificaciones Corporativas 2024-03" },
  { id: 5, codigo: "PRY-ACM-00005", nombre: "Reservorio Carabayllo", estado: "en_pausa", prioridad_score: 64.0, avance_pct: 48, salud: "ambar", en_riesgo: false, presupuesto_estimado: 455000, portafolio: "Saneamiento 2024-04" },
  { id: 6, codigo: "PRY-ACM-00006", nombre: "Mercado Chorrillos", estado: "cerrado", prioridad_score: 59.8, avance_pct: 100, salud: "verde", en_riesgo: false, presupuesto_estimado: 280000, portafolio: "Obras Lima Sur 2024-01" },
];

export const PROPUESTAS = [
  { id: 1, nombre: "Planta Villa El Salvador", problema: "Capacidad insuficiente en la zona sur", costo_estimado: 680000, beneficio_esperado: 1700000, valor_estrategico: 5, urgencia: 4, riesgo: 2, score: 86.3, portafolio: "Obras Lima Sur 2024-01" },
  { id: 2, nombre: "Parque Comas", problema: "Compromiso con el municipio", costo_estimado: 220000, beneficio_esperado: 330000, valor_estrategico: 3, urgencia: 5, riesgo: 1, score: 59.5, portafolio: "Obras Lima Norte 2024-00" },
  { id: 3, nombre: "Canal San Juan", problema: "Riesgo de desborde en temporada de lluvias", costo_estimado: 540000, beneficio_esperado: 900000, valor_estrategico: 4, urgencia: 5, riesgo: 3, score: 65.2, portafolio: "Saneamiento 2024-04" },
];

export const CARGA = [
  { recurso_id: 1, nombre: "Ana Quispe", rol_tecnico: "Ingeniero residente", capacidad_horas_semana: 40, ocupacion_pct: 150, disponible_pct: 0, horas_comprometidas: 60, sobreasignado: true, n_asignaciones: 3 },
  { recurso_id: 2, nombre: "Luis Flores", rol_tecnico: "Maestro de obra", capacidad_horas_semana: 48, ocupacion_pct: 120, disponible_pct: 0, horas_comprometidas: 57.6, sobreasignado: true, n_asignaciones: 2 },
  { recurso_id: 3, nombre: "Carmen Rojas", rol_tecnico: "Topografo", capacidad_horas_semana: 40, ocupacion_pct: 100, disponible_pct: 0, horas_comprometidas: 40, sobreasignado: false, n_asignaciones: 1 },
  { recurso_id: 4, nombre: "Jose Vargas", rol_tecnico: "Supervisor SSOMA", capacidad_horas_semana: 40, ocupacion_pct: 60, disponible_pct: 40, horas_comprometidas: 24, sobreasignado: false, n_asignaciones: 2 },
  { recurso_id: 5, nombre: "Rosa Castillo", rol_tecnico: "Ingeniero de costos", capacidad_horas_semana: 40, ocupacion_pct: 20, disponible_pct: 80, horas_comprometidas: 8, sobreasignado: false, n_asignaciones: 1 },
  { recurso_id: 6, nombre: "Carlos Ramos", rol_tecnico: "Almacenero", capacidad_horas_semana: 48, ocupacion_pct: 0, disponible_pct: 100, horas_comprometidas: 0, sobreasignado: false, n_asignaciones: 0 },
];

// El proyecto 1 tiene 5 tareas con 2 completadas: su avance_pct es 40, y al
// completar una mas sube a 60. Los mocks tienen que ser CONSISTENTES entre si,
// o la demo con datos simulados muestra numeros que se contradicen.
export const TAREAS = [
  { tarea_id: "a1", nombre: "Excavacion sector A", tipo: "tarea", estado: "completada", fecha_fin: "2026-09-20", horas_estimadas: 40 },
  { tarea_id: "a2", nombre: "Encofrado nivel 1", tipo: "tarea", estado: "completada", fecha_fin: "2026-10-02", horas_estimadas: 24 },
  { tarea_id: "a3", nombre: "Vaciado de concreto nivel 1", tipo: "hito", estado: "en_progreso", fecha_fin: "2026-11-10", horas_estimadas: 80 },
  { tarea_id: "a4", nombre: "Instalaciones electricas nivel 1", tipo: "tarea", estado: "pendiente", fecha_fin: "2026-11-25", horas_estimadas: 40 },
  { tarea_id: "a5", nombre: "Acabados fachada", tipo: "tarea", estado: "pendiente", fecha_fin: "2026-12-15", horas_estimadas: 60 },
];

export const PRESUPUESTO = {
  proyecto_id: 1,
  codigo_proyecto: "PRY-ACM-00001",
  monto_aprobado: 740000,
  total_gastado: 662300,
  saldo: 77700,
  ejecutado_pct: 89.5,
  estado: "aprobado",
  n_gastos: 14,
  partidas: [
    { id: 1, nombre: "Materiales", monto_asignado: 370000, gastado: 348200 },
    { id: 2, nombre: "Mano de obra", monto_asignado: 222000, gastado: 201400 },
    { id: 3, nombre: "Equipos", monto_asignado: 148000, gastado: 112700 },
  ],
  ultimos_gastos: [
    { id: 1, concepto: "Compra de cemento", monto: 48200, fecha: "2026-10-28", proveedor: "Pacasmayo" },
    { id: 2, concepto: "Alquiler de maquinaria", monto: 31500, fecha: "2026-10-21", proveedor: "Ferreyros" },
    { id: 3, concepto: "Jornales", monto: 27800, fecha: "2026-10-15", proveedor: "Acme" },
  ],
};
