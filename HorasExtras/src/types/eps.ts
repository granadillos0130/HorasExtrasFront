export interface Eps {
  id: number;
  nombre: string;
  trabajadorId: number;
  fechaInicio: string;
  fechaFin?: string;
}

export interface CrearEpsDto {
  nombre: string;
  trabajadorId: number;
  fechaInicio: string;
  fechaFin?: string;
}
