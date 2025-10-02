export interface HorarioRotativo {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  fechaCreacion: string;
  totalDetalles: number;
}

export interface HorarioDetalleCompleto {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  fechaCreacion: string;
  detalles: DetalleHorario[];
  totalHorasSemana: number;
}

export interface DetalleHorario {
  id: number;
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
  tiempoAlmuerzo: string;
  intensidadHoraria: number;
}

export interface AsignacionRotativa {
  id: number;
  trabajadorId: number;
  trabajadorNombre: string;
  horarioPar: string;
  horarioImpar: string;
  fechaInicio: string;
  diasActivo: number;
  semanaActual: number;
  tipoSemanaActual: string;
}

export interface CrearHorarioDto {
  nombre: string;
  descripcion?: string;
}

export interface DetalleHorarioDto {
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
  tiempoAlmuerzo?: string;
}

export interface AsignarHorarioDto {
  trabajadorId: number;
  horarioParId: number;
  horarioImparId: number;
  fechaInicio: string;
}