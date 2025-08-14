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