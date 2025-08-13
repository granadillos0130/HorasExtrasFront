// types/ausencia.ts (actualizado)
export interface Ausencia {
  id: number;
  fecha: string;
  fechaSolicitud?: string;
  fechaInicio: string;
  fechaFin: string;
  horaInicio: string;
  horaFin: string;
  tipoAusencia: string;
  descripcion: string;
  trabajadorNombre: string;
  cargo: string;
  remunerado: boolean;
  // 🆕 Campos de diagnóstico actualizados
  diagnosticoId?: number;
  diagnosticoCodigo?: string;
  diagnosticoDescripcion?: string;
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
  // 🆕 Campos de diagnóstico actualizados  
  diagnosticoId?: number;
  diagnosticoCodigo?: string;
  diagnosticoDescripcion?: string;
}