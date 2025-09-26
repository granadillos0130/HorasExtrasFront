export interface TrabajadorEstadistica {
  trabajadorId: number;
  nombreTrabajador: string;
  totalHoras: number;
  horasNormales: number;
  horasExtrasDiurnas: number;
  horasExtrasNocturnas: number;
  extrasDominicalesDiurnas: number;
  extrasDominicalesNocturnas: number;
}

export interface Centro {
  id: string;
  nombreCentro: string;
}
// Interfaces para las estadísticas de ausencias
export interface EstadisticaAusenciaMensual {
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
}

export interface EstadisticaTipoAusencia {
  tipoAusencia: string;
  totalAusencias: number;
  totalHoras: number;
  manoObraPerdida: number;
}

export interface EstadisticaDiagnostico {
  diagnosticoCodigo: string;
  diagnosticoDescripcion: string;
  cantidadAusencias: number;
  totalHoras: number;
  manoObraPerdida: number;
}