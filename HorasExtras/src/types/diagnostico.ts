// types/diagnostico.ts
export interface Diagnostico {
  id: number;
  codigo: string;
  descripcion: string;
}

export interface DiagnosticoDto {
  id: number;
  codigo: string;
  descripcion: string;
}

// Interfaces para estadísticas de diagnósticos
export interface EstadisticaDiagnostico {
  diagnosticoCodigo: string;
  diagnosticoDescripcion: string;
  cantidadAusencias: number;
  totalHoras: number;
  manoObraPerdida?: number;
}

export interface EstadisticaDiagnosticoDetallado extends EstadisticaDiagnostico {
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