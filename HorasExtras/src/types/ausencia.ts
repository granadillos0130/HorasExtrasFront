export interface Ausencia {
  id: number;
  fecha: string; // ISO string
  fechaSolicitud?: string; // ISO string
  fechaInicio: string;
  fechaFin: string;
  horaInicio: string;
  horaFin: string;
  tipoAusencia: string; // ✅ Cambiado de "motivo" a "tipoAusencia"
  descripcion: string;   // ✅ Agregado para que coincida con el backend
  trabajadorNombre: string;
  cargo: string;
  remunerado: boolean;   // ✅ Agregado para que coincida con el backend
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
}