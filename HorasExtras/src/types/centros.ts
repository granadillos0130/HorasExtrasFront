export interface Centro {
  id: string;
  nombreCentro: string;
  fechaHoraInicio?: string; // opcional
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
  horaInicio: string;
  horaFinal: string;
  totalTrabajadores: number;
  manoDeObraTotal: number;
  trabajadores: EstadisticaTrabajador[];
}