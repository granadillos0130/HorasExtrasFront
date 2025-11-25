export const SALARIO_MINIMO_2025 = 1400000;
export const DOS_SALARIOS_MINIMOS = SALARIO_MINIMO_2025 * 2;

export const formatearNumero = (valor: string): string => {
  const numeroLimpio = valor.replace(/\D/g, '');
  return numeroLimpio.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export const obtenerValorNumerico = (valorFormateado: string): number => {
  return parseInt(valorFormateado.replace(/\./g, '')) || 0;
};

export const verificarAplicaAuxilio = (salario: number): boolean => {
  return salario <= DOS_SALARIOS_MINIMOS;
};

export const getStepTitle = (step: number): string => {
  switch (step) {
    case 1: return "Información Personal";
    case 2: return "Información Laboral";
    case 3: return "Contacto de Emergencia";
    case 4: return "EPS";
    case 5: return "ARL";
    case 6: return "Pensión";
    case 7: return "Banco";
    case 8: return "Clínica";
    default: return "";
  }
};

export const getStepIcon = (step: number): string => {
  switch (step) {
    case 1: return "👤";
    case 2: return "💼";
    case 3: return "📞";
    case 4: return "⚕️";
    case 5: return "🦺";
    case 6: return "👴";
    case 7: return "🏦";
    case 8: return "🏥";
    default: return "📋";
  }
};

export const getStepLabel = (step: number): string => {
  switch (step) {
    case 1: return "Personal";
    case 2: return "Laboral";
    case 3: return "Contacto";
    case 4: return "EPS";
    case 5: return "ARL";
    case 6: return "Pensión";
    case 7: return "Banco";
    case 8: return "Clínica";
    default: return "";
  }
};

export const initialFormState = {
  nombre: "",
  cedula: "",
  rh: "",
  fechaNacimiento: "",
  edad: 0,
  estadoCivil: "",
  genero: "",
  cantidadHijos: 0,
  nivelEscolaridad: "",
  salario: 0,
  auxilioTransporte: 0,
  fechaContratacion: "",
  correo: "",
  personaContacto: "",
  telefonoContacto: "",
  direccionContacto: "",
  parentescoContacto: "",
  tipoContratacion: "",
  eps: "",
  epsFechaInicio: "",
  epsFechaFin: "",
  arl: "",
  arlFechaInicio: "",
  arlFechaFin: "",
  fondoPension: "",
  pensionFechaInicio: "",
  pensionFechaFin: "",
  banco: "",
  numeroCuenta: "",
  nombreClinica: "",
  clinicaFechaInicio: "",
  clinicaFechaFin: ""
};