export interface Centro {
  id: string;
  nombreCentro: string;
  fechaInicio: string;
  fechaFinal?: string | null;
  clienteId: string;
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
// Nuevos tipos para el endpoint por-mes
export interface TrabajadorCentro {
  trabajadorId: number;
  nombre: string;
  totalHoras: number;
  horasNormales: number;
  extrasDiurnas: number;
  extrasNocturnas: number;
}

export interface CentroPorMes {
  centroId: string;
  centroNombre: string;
  fechaInicio: string;
  fechaFinal?: string | null;
  trabajadores: TrabajadorCentro[];
}