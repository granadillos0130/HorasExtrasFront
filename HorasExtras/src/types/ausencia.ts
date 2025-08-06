export interface Ausencia {
  id: number;
  fecha: string; // ISO string
  fechaSolicitud?: string; // ISO string
  fechaInicio: string;
  fechaFin: string;
  horaInicio: string;
  horaFin: string;
  tipoAusencia: string;
  descripcion: string;
  trabajadorNombre: string;
  cargo: string;
  remunerado: boolean;
  dx?: string; // 🆕 Nuevo campo opcional para diagnóstico
}

export interface AusenciaDto {
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
  dx?: string; // 🆕 Nuevo campo opcional para diagnóstico
}