// Agregar al archivo src/types/registros.ts

export interface RegistroInputDto {
  Trabajador_ID: number;
  Centro_ID: number;
  Orden_Compra_ID: number;
  Fecha: string; // formato: "YYYY-MM-DD"
  Hora_Ingreso: string; // formato: "HH:mm"
  Hora_Salida: string; // formato: "HH:mm"
  Tiempo_Almuerzo: string; // formato: "HH:mm"
}

export interface Registro {
  id: number;
  trabajadorId: number;
  trabajadorNombre: string;
  centroId: number;
  centroNombre: string;
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
}