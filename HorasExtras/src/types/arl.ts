export interface Arl {
  id: number;
  nombre: string;
  trabajadorId: number;
  fechaInicio: string;
  fechaFin?: string;
}

export interface CrearArlDto {
  nombre: string;
  trabajadorId: number;
  fechaInicio: string;
  fechaFin?: string;
}
