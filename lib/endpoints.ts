const API = "https://t8wutxmr7b.execute-api.us-east-1.amazonaws.com/dev";

export const ENDPOINTS = {
  identidad: `${API}/identidad`,
  portafolios: `${API}/portafolios`,
  tareas: `${API}/tareas`,
  recursos: `${API}/recursos`,
  presupuestos: `${API}/presupuestos`,
  analitico: `${API}/analitico`,
} as const;
