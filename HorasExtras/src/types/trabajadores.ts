export interface Trabajador {
  id: number;
  nombre: string;
  cedula: string;
  correo?: string;
  cargo?: string;
  edad?: number;
  genero?: string;
  fechaNacimiento?: string; // formato ISO
  estadoCivil?: string;
  cantidadHijos?: number;
  nivelEscolaridad?: string;
  tipoContratacion?: string;
  fechaContratacion?: string;
  salario?: number;
  auxilioTransporte?: number;
  valorHora?: number;
  rh?: string;
  estado: string; // "Vigente", "No Vigente"
  fechaCreacion?: string; // Cambiado de string a string optional para coincidir con DateTime? del backend
  fechaActualizacion?: string; // Cambiado de string a string optional para coincidir con DateTime? del backend
  fechaTerminacion?: string;
  imagen_Url?: string;
  personaContacto?: string;
  telefonoContacto?: string;
  direccionContacto?: string;
  parentescoContacto?: string;

  tipoBancoHoras?: boolean;
  eps?: {
    nombre: string;
    fechaInicio?: string;
    fechaFin?: string;
    activo?: boolean;
  };

  arl?: {
    nombre: string;
    fechaInicio?: string;
    fechaFin?: string;
    activo?: boolean;
  };

  pension?: {
    nombre: string;
    fechaInicio?: string;
    fechaFin?: string;
    activo?: boolean;
  };

  clinica?: {
    nombre: string;
    fechaInicio?: string;
    fechaFin?: string;
    activo?: boolean;
  };

  banco?: {
    nombre: string;
    numeroCuenta?: string;
    fechaInicio?: string;
    fechaFin?: string;
    activo?: boolean;
  };
}

// DTO para crear trabajador (este se mantiene igual)
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
  valorHora?: number; // OPCIONAL - el backend lo calcula automáticamente
  fechaContratacion: string;
  imagen_Url?: string;
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
  imagen_Url?: string;
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