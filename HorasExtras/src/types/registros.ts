// Agregar al archivo src/types/registros.ts

export interface RegistroInputDto {
  Trabajador_ID: number;
  Centro_ID: string;
  Nombr_Centro: string;
  Fecha: string; // "YYYY-MM-DD"
  Hora_Ingreso: string; // "HH:mm"
  Hora_Salida: string; // "HH:mm"
  Tiempo_Almuerzo: string; // "HH:mm:ss"
  desplazamientoIda?: string;
  desplazamientoRegreso?: string;
   AnalistaId?: number;
}


export interface Registro {
  id: number;
  trabajadorId: number;
  trabajadorNombre: string;
  centroId: number;
  nombreCentro: string;
  ordenCompraId: number;
  ordenCompraNumero: string;
  ordenCompraDescripcion: string;
  fecha: string;
  semana: number;
  diaSemana: string;
  horaIngreso: string;
  horaSalida: string;
  tiempoAlmuerzo: string;
  intensidadHoraria: number;
  horasNormales: number;
  horasExtrasDiurnas: number;
  horasExtrasNocturnas: number;
  extrasDominicalesDiurnas: number;
  extrasDominicalesNocturnas: number;
  totalHoras: number;
   desplazamientoIda?: string;
  desplazamientoRegreso?: string;
}
// Nuevo tipo para la respuesta del API con rango de fechas
export interface RespuestaRangoFechas {
  success: boolean;
  data: Registro[];
  total: number;
  filtros: {
    trabajadorId: number;
    fechaInicio: string;
    fechaFin: string;
    diasEnRango: number;
  }
}