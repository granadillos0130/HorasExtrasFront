// types/ausencia.ts - REEMPLAZAR COMPLETAMENTE EL ARCHIVO EXISTENTE
export interface Ausencia {
  id: number;
  fecha: string;
  fechaSolicitud?: string;
  fechaInicio: string;
  fechaFin: string;
  horaInicio: string;
  horaFin: string;
  tipoAusencia: string;
  descripcion: string;
  trabajadorNombre: string;
  cargo: string;
  remunerado: boolean;
  // 🆕 Campos de diagnóstico actualizados
  diagnosticoId?: number;
  diagnosticoCodigo?: string;
  diagnosticoDescripcion?: string;
}

export interface AusenciaDto {
  id: number;
  fecha: Date;
  tipoAusencia: string;
  descripcion: string;
  trabajadorNombre: string;
  cargo: string;
  fechaInicio: Date;
  fechaFin: Date;
  horaInicio: string;
  horaFin: string;
  remunerado: boolean;
  // 🆕 Campos de diagnóstico actualizados  
  diagnosticoId?: number;
  diagnosticoCodigo?: string;
  diagnosticoDescripcion?: string;
}

// ===== TIPOS PARA ESTADÍSTICAS DE TRABAJADORES =====

export interface EstadisticaTrabajadorTipo {
  tipoAusencia: string;
  cantidad: number;
  totalHoras: number;
  remuneradas: number;
  noRemuneradas: number;
  porcentaje: number;
}

export interface EstadisticaTrabajadorDiagnostico {
  diagnosticoCodigo: string;
  diagnosticoDescripcion: string;
  cantidad: number;
  totalHoras: number;
  remuneradas: number;
  noRemuneradas: number;
  porcentaje: number;
  promedioDuracion: number;
}

export interface TendenciaTrabajadorMensual {
  año: number;
  mes: number;
  nombreMes: string;
  cantidad: number;
  totalHoras: number;
  remuneradas: number;
  noRemuneradas: number;
}

export interface AusenciaDetalle {
  id: number;
  fecha: string;
  tipoAusencia: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  horaInicio: string;
  horaFin: string;
  duracion: number;
  remunerado: boolean;
  diagnosticoCodigo?: string;
  diagnosticoDescripcion?: string;
  cargo?: string;
}

export interface EstadisticasTrabajador {
  trabajadorId: number;
  trabajadorNombre: string;
  totalAusencias: number;
  totalHoras: number;
  ausenciasRemuneradas: number;
  ausenciasNoRemuneradas: number;
  diagnosticosUnicos: number;
  promedioDuracion: number;
  ausencias: AusenciaDetalle[];
  estadisticasPorTipo: EstadisticaTrabajadorTipo[];
  estadisticasPorDiagnostico: EstadisticaTrabajadorDiagnostico[];
  tendenciaMensual: TendenciaTrabajadorMensual[];
  fechaConsulta: string;
}

export interface ResumenTrabajador {
  trabajadorId: number;
  trabajadorNombre: string;
  totalAusencias: number;
  ausenciasEsteAño: number;
  ultimaAusencia?: {
    fecha: string;
    tipo: string;
    descripcion: string;
  };
}

// Props para componentes
export interface TrabajadorAusenciasProps {
  trabajador: {
    id: number;
    nombre: string;
    cedula: string;
    cargo?: string;
    estado: string;
  };
}

// Estados de vista
export type VistaAusencias = 'resumen' | 'tipos' | 'diagnosticos' | 'historial' | 'tendencia';

// Utilidad para formatear datos
export interface FormatHelper {
  formatearFecha: (fecha: string) => string;
  formatearHoras: (horas: number) => string;
  formatearPorcentaje: (valor: number) => string;
}
// 🆕 Interface para validar vacaciones
export interface ValidarVacacionesDto {
  fechaInicio: Date;
  fechaFin: Date;
  tipoAusencia: string;
  trabajadorId: number;
}

export interface DetalleDia {
  fecha: string;
  diaSemana: string;
  esLaborable: boolean;
  esFestivo: boolean;
  tieneRegistros: boolean;
  motivo: string;
}

export interface ValidacionVacacionesResponse {
  fechaInicio: string;
  fechaFin: string;
  totalDias: number;
  diasLaborables: number;
  diasNoLaborables: number;
  diasADescontar: number;
  detalleDias: DetalleDia[];
  mensaje: string;
  explicacion: {
    domingos: string;
    sabados: string;
    festivos: string;
  };
}
// 🆕 Interfaces para validación de vacaciones
export interface ValidarVacacionesDto {
  fechaInicio: Date;
  fechaFin: Date;
  tipoAusencia: string;
  trabajadorId: number;
}

export interface DetalleDia {
  fecha: string;
  diaSemana: string;
  esLaborable: boolean;
  esFestivo: boolean;
  tieneRegistros: boolean;
  motivo: string;
}

export interface ValidacionVacaciones {
  fechaInicio: string;
  fechaFin: string;
  totalDias: number;
  diasLaborables: number;
  diasNoLaborables: number;
  diasADescontar: number;
  detalleDias: DetalleDia[];
  mensaje: string;
  explicacion: {
    domingos: string;
    sabados: string;
    festivos: string;
  };
}
// Interfaz para las estadísticas de horas por tipo
export interface EstadisticaHoras {
  tipoAusencia: string;
  totalHoras: number;
}

// Interfaz para las estadísticas de horas por área
export interface EstadisticaHorasArea {
  area: string;
  totalHoras: number;
}

// 🆕 Interface para estadísticas por diagnóstico
export interface EstadisticaDiagnostico {
  diagnosticoCodigo: string;
  diagnosticoDescripcion: string;
  cantidadAusencias: number;
  totalHoras: number;
}

// 🆕 Interfaces adicionales para las nuevas estadísticas
export interface EstadisticaMensual {
  mes: number;
  anio: number;
  nombreMes: string;
  totalAusencias: number;
  totalHoras: number;
  manoObraPerdida: number;
  citasMedicas: number;
  incapacidades: number;
  permisos: number;
  otros: number;
  trabajadoresAfectados: number;
  ausenciasRemuneradas: number;
  ausenciasNoRemuneradas: number;
}

export interface EstadisticaTipoDetallado {
  tipoAusencia: string;
  totalAusencias: number;
  totalHoras: number;
  manoObraPerdida: number;
  trabajadoresAfectados: number;
  remuneradas: number;
  noRemuneradas: number;
  diagnosticosMasFrecuentes: {
    codigo: string;
    descripcion: string;
    cantidad: number;
  }[];
}

export interface EstadisticaDiagnosticoDetallado {
  diagnosticoCodigo: string;
  diagnosticoDescripcion: string;
  cantidadAusencias: number;
  totalHoras: number;
  manoObraPerdida: number;
  trabajadoresAfectados: number;
  promedioDuracion: number;
  tiposAusencia: {
    tipo: string;
    cantidad: number;
  }[];
  distribucionMensual: {
    mes: number;
    cantidad: number;
  }[];
}

export interface TendenciaAusencia {
  anio: number;
  mes: number;
  fecha: string;
  totalAusencias: number;
  totalHoras: number;
  manoObraPerdida: number;
  trabajadoresAfectados: number;
  diagnosticosPrincipales: {
    codigo: string;
    cantidad: number;
  }[];
}

export interface ResumenEjecutivo {
  anio: number;
  resumenGeneral: {
    totalAusencias: number;
    totalHoras: number;
    manoObraPerdida: number;
    trabajadoresAfectados: number;
    totalTrabajadores: number;
    porcentajeTrabajadoresAfectados: number;
    promedioHorasPorAusencia: number;
  };
  porTipoAusencia: {
    tipo: string;
    cantidad: number;
    porcentaje: number;
  }[];
  topDiagnosticos: {
    codigo: string;
    descripcion: string;
    cantidad: number;
    porcentaje: number;
  }[];
  tendenciaMensual: {
    mes: number;
    nombreMes: string;
    cantidad: number;
    manoObraPerdida: number;
  }[];
}
