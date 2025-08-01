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
// Agregar estos types al archivo centros.ts existente

// Tipos de horas disponibles
export type TipoHora = 
  | 'normales' 
  | 'extrasdiurnas' 
  | 'extrasnocturnas' 
  | 'dominicalesdiurnas' 
  | 'dominicalesnocturnas';

// Estadísticas por tipo de hora
export interface EstadisticasTipoHora {
  totalHoras: number;
  totalTrabajadores: number;
  manoObra: number;
  multiplicador: number;
}

// Estadísticas completas del mes
export interface EstadisticasMes {
  centroId: string;
  mes: number;
  anio: number;
  nombreMes: string;
  totalHorasHombre: number;
  estadisticasPorTipo: {
    horasNormales: EstadisticasTipoHora;
    extrasDiurnas: EstadisticasTipoHora;
    extrasNocturnas: EstadisticasTipoHora;
    dominicalesDiurnas: EstadisticasTipoHora;
    dominicalesNocturnas: EstadisticasTipoHora;
  };
  manoObraTotal: number;
  totalTrabajadoresUnicos: number;
  totalRegistros: number;
  periodoActividad: {
    fechaInicio: string;
    fechaFin: string;
  };
}

// Detalle de horas por fecha para un trabajador
export interface DetalleHorasPorFecha {
  fecha: string;
  horas: number;
}

// Información de un trabajador por tipo de hora
export interface TrabajadorPorTipoHora {
  trabajadorId: number;
  nombreTrabajador: string;
  cargo?: string;
  valorHora: number;
  totalHoras: number;
  totalDias: number;
  manoObra: number;
  multiplicador: number;
  tipoHora: string;
  detalles: DetalleHorasPorFecha[];
}

// Respuesta completa de trabajadores por tipo de hora
export interface TrabajadoresPorTipoHora {
  centroId: string;
  mes: number;
  anio: number;
  tipoHora: string;
  totalTrabajadores: number;
  totalHoras: number;
  totalManoObra: number;
  trabajadores: TrabajadorPorTipoHora[];
}

// Configuración para mostrar tipos de horas en la UI
export interface ConfigTipoHora {
  key: TipoHora;
  nombre: string;
  icono: string;
  color: string;
  descripcion: string;
}

// Constantes para los tipos de horas
export const TIPOS_HORAS_CONFIG: Record<TipoHora, ConfigTipoHora> = {
  normales: {
    key: 'normales',
    nombre: 'Horas Normales',
    icono: '🕘',
    color: '#10b981',
    descripcion: 'Horas trabajadas en jornada normal (x1.0)'
  },
  extrasdiurnas: {
    key: 'extrasdiurnas',
    nombre: 'Extras Diurnas',
    icono: '☀️',
    color: '#f59e0b',
    descripcion: 'Horas extras trabajadas de día (x1.25)'
  },
  extrasnocturnas: {
    key: 'extrasnocturnas',
    nombre: 'Extras Nocturnas',
    icono: '🌙',
    color: '#6366f1',
    descripcion: 'Horas extras trabajadas de noche (x1.75)'
  },
  dominicalesdiurnas: {
    key: 'dominicalesdiurnas',
    nombre: 'Dominicales Diurnas',
    icono: '📅',
    color: '#ef4444',
    descripcion: 'Horas trabajadas domingos de día (x2.0)'
  },
  dominicalesnocturnas: {
    key: 'dominicalesnocturnas',
    nombre: 'Dominicales Nocturnas',
    icono: '🌜',
    color: '#8b5cf6',
    descripcion: 'Horas trabajadas domingos de noche (x2.1)'
  }
};