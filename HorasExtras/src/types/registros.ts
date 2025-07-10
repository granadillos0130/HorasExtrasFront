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
