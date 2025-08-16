export interface Trabajador {
  id: number;
  nombre: string;
  cedula: string;
  cargo?: string;
  rh: string;
  fechaNacimiento: string; // formato ISO
  edad: number;
  estado: string; // "Vigente", "No Vigente"
  estadoCivil: string;
  genero: string;
  cantidadHijos: number;
  nivelEscolaridad: string;
  salario: number;
  auxilioTransporte?: number;
  valorHora?: number;
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

// ✅ DTO ACTUALIZADO - valorHora ahora es OPCIONAL porque el backend lo calcula automáticamente
export interface CrearTrabajadorDto {
  // ===== INFORMACIÓN BÁSICA DEL TRABAJADOR =====
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
  auxilioTransporte: number;
  valorHora?: number; // ✅ OPCIONAL - el backend lo calcula automáticamente
  fechaContratacion: string;
  correo: string;
  personaContacto: string;
  telefonoContacto: string;
  direccionContacto: string;
  parentescoContacto: string;
  tipoContratacion: string;

  // ===== INFORMACIÓN DE SERVICIOS DE SEGURIDAD SOCIAL =====
  
  // EPS
  eps: string;
  epsFechaInicio: string;
  epsFechaFin: string;

  // ARL
  arl: string;
  arlFechaInicio: string;
  arlFechaFin: string;

  // PENSIÓN
  fondoPension: string;
  pensionFechaInicio: string;
  pensionFechaFin: string;

  // BANCO
  banco: string;
  numeroCuenta: string;

  // CLÍNICA
  nombreClinica: string;
  clinicaFechaInicio: string;
  clinicaFechaFin: string;
}