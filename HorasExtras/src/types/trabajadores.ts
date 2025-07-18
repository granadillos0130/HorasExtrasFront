export interface Trabajador {
  id: number;
  nombre: string;
  cedula: string;
  rh: string;
  fechaNacimiento: string; // formato ISO
  edad: number;
  estado: string; // "Activo", "Inactivo", etc.
  estadoCivil: string;
  genero: string;
  cantidadHijos: number;
  nivelEscolaridad: string;
  salario: number;
  fechaContratacion: string;
  tipoContratacion: string;
  correo: string;

  personaContacto: string;
  telefonoContacto: string;
  direccionContacto: string;
  parentescoContacto: string;

  fechaCreacion: string;
  fechaActualizacion: string;

  eps?: {
    id: number;
    nombre: string;
    trabajadorId: number;
    fechaInicio: string;
    fechaFin?: string;
  };

  pension?: {
    id: number;
    nombre: string;
    trabajadorId: number;
    fechaInicio: string;
    fechaFin?: string;
  };

  arl?: {
    id: number;
    nombre: string;
    trabajadorId: number;
    fechaInicio: string;
    fechaFin?: string;
  };

  banco?: {
    id: number;
    nombre: string;
    numeroCuenta: string;
    trabajadorId: number;
  };

  clinica?: {
    id: number;
    nombre: string;
    trabajadorId: number;
    fechaInicio: string;
    fechaFin?: string;
  };
}

export interface CrearTrabajadorDto {
  nombre: string;
  cedula: string;
  rh: string;
  fechaNacimiento: string;
  edad: number;
  estadoCivil: string;
  genero: string;
  cantidadHijos: number;
  nivelEscolaridad: string;
  salario: number;
  fechaContratacion: string;
  correo: string;
  personaContacto: string;
  telefonoContacto: string;
  direccionContacto: string;
  parentescoContacto: string;
  tipoContratacion: string;
}