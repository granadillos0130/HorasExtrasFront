export interface Centro {
  id: string;
  nombreCentro: string;
  fechaInicio: string;
  fechaFinal?: string | null;
  clienteId: string;
  estado?: string;
  interventor?: string | null;
  vendedor?: string | null;
  valorOrden?: number;
  fechaFactura?: string | null;
  tipo?: string;
}

export interface EstadisticaTrabajador {
  trabajadorId: number;
  nombreTrabajador: string;
  totalHoras: number;
  horasNormales: number;
  horasExtrasDiurnas: number;
  horasExtrasNocturnas: number;
  extrasDominicalesDiurnas: number;
  extrasDominicalesNocturnas: number;
}

export interface CentroEstadisticas {
  centroId: string;
  centroNombre: string;
  fechaInicio: string;
  fechaFinal: string;
  totalTrabajadores: number;
  manoDeObraTotal: number;
  trabajadores: EstadisticaTrabajador[];
}

// Tipos para el endpoint por-mes
export interface TrabajadorCentro {
  trabajadorId: number;
  nombre: string;
  totalHoras: number;
  horasNormales: number;
  extrasDiurnas: number;
  extrasNocturnas: number;
  cargo?: string; // Añadido para el cargo del trabajador
}

export interface CentroPorMes {
  centroId: string;
  centroNombre: string;
  fechaInicio: string;
  fechaFinal?: string | null;
  trabajadores: TrabajadorCentro[];
}

// Nuevos tipos para información de ejecución
export interface ManoObraTotal {
  centroId: string;
  manoObraTotal: number;
}

export interface TrabajadorManoObra {
  centroId: string;
  trabajadorId: number;
  nombreTrabajador: string;
  manoObraTotal: number;
}

export interface DetalleDiaTrabajo {
  fecha: string;
  horasNormales: number;
  extrasDiurnas: number;
  extrasNocturnas: number;
  dominicalesDiurnas: number;
  dominicalesNocturnas: number;
  totalHoras: number;
}

export interface DetalleDiasTrabajador {
  centroId: string;
  trabajadorId: number;
  nombreTrabajador: string;
  detalleDias: DetalleDiaTrabajo[];
}
export interface MesConActividad {
  mes: number;
  nombreMes: string;
  totalTrabajadores: number;
  totalHoras: number;
  manoObraTotal: number;
  horasNormales: number;
  horasExtras: number;
  fechaPrimerRegistro: string;
  fechaUltimoRegistro: string;
}
