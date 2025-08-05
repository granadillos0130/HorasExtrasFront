export interface Ausencia {
  id: number;
  fechaSolicitud: string; // ISO string
  fechaInicio: string;
  fechaFin: string;
  horaInicio: string;
  horaFin: string;
  motivo: string;
  trabajadorNombre: string;
  cargo: string;
}

export interface AusenciaDto{
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
}