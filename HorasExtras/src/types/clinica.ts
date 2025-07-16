export interface Clinica {
  id: number;
  nombre: string;
  trabajadorId: number;
  fechaInicio: string;
  fechaFin?: string;
}

export interface CrearClinicaDto {
  nombre: string;
  trabajadorId: number;
  fechaInicio: string;
  fechaFin?: string;
}
