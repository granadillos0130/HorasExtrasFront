export interface Pension {
  id: number;
  nombre: string;
  trabajadorId: number;
  fechaInicio: string;
  fechaFin?: string;
}

export interface CrearPensionDto {
  nombre: string;
  trabajadorId: number;
  fechaInicio: string;
  fechaFin?: string;
}
