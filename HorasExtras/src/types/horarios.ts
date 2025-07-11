export interface Horario {
  id: number;
  trabajadorId: number;
  trabajadorNombre: string;
  dia: string;
  horaInicio: string;
  horaFin: string;
  intensidadHoraria: number;
}

export interface HorarioDto {
  trabajadorId: number;
  dia: string;
  horaInicio: string;
  horaFin: string;
  intensidadHoraria: number;
}
