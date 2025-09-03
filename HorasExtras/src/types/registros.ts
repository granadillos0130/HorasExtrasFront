
import type { Curso } from "./curso";

export type TipoDestino = 'centro' | 'curso';

export type FiltroTipoRegistro = 'TODOS' | 'TRABAJO' | 'AUSENCIA';

export type TipoRegistro = 'CENTRO' | 'CURSO' | 'AUSENCIA' | 'FESTIVO';


export interface RegistroInputDto {
  Trabajador_ID: number;
  
  // Campos para CENTROS
  Centro_ID: string;
  Nombr_Centro: string;
  
  // Campos para CURSOS
  CursoId?: number;
  CursoNombre?: string;
  CursoDescripcion?: string;
  
  // Campos de tiempo
  Fecha: string; // "YYYY-MM-DD"
  Hora_Ingreso: string; // "HH:mm"
  Hora_Salida: string; // "HH:mm"
  Tiempo_Almuerzo: string; // "HH:mm:ss"
  
  // Campos de desplazamiento
  desplazamientoIda?: string;
  desplazamientoRegreso?: string;
  EsConductor: boolean;
  
  // Otros campos
  AnalistaId?: number;
}

export interface RegistroActualizacionDto {
  Id: number; // ID del registro a actualizar
  Trabajador_ID: number;
  
  // Campos para CENTROS
  Centro_ID: string;
  Nombr_Centro: string;
  
  // Campos para CURSOS
  CursoId?: number;
  CursoNombre?: string;
  CursoDescripcion?: string;
  
  // Campos de tiempo
  Fecha: string; // "YYYY-MM-DD"
  Hora_Ingreso: string; // "HH:mm"
  Hora_Salida: string; // "HH:mm"
  Tiempo_Almuerzo: string; // "HH:mm:ss"
  
  // Campos de desplazamiento
  desplazamientoIda?: string;
  desplazamientoRegreso?: string;
  EsConductor: boolean;
  
  // Otros campos
  AnalistaId?: number;
}

// ===============================
// INTERFAZ PRINCIPAL DE REGISTRO
// ===============================

export interface Registro {
  id: number;
  trabajadorId: number;
  trabajadorNombre: string;
  centroId: number | string;
  nombreCentro: string;
  
  // Campos para identificar tipo de registro
  tipoRegistro?: TipoRegistro;
  esCurso?: boolean;
  cursoId?: number;
  esCentroNormal?: boolean;
  esFestivo?: boolean;
  esAusencia?: boolean;
  
  // Información de orden de compra
  ordenCompraId: number;
  ordenCompraNumero: string;
  ordenCompraDescripcion: string;
  
  // Información de tiempo
  fecha: string;
  semana: number;
  diaSemana: string;
  horaIngreso: string;
  horaSalida: string;
  tiempoAlmuerzo: string;
  
  // Cálculos de horas
  intensidadHoraria: number;
  horasNormales: number;
  horasExtrasDiurnas: number;
  horasExtrasNocturnas: number;
  extrasDominicalesDiurnas: number;
  extrasDominicalesNocturnas: number;
  totalHoras: number;
  
  // Información de desplazamiento y conductor
  desplazamientoIda?: string;
  desplazamientoRegreso?: string;
  esConductor: boolean;
  
  // Campos de ausencias (si aplica)
  horasAusente?: number;
  esRemunerada?: boolean;
  tipoAusencia?: string;
  
  // Valores históricos del trabajador
  salarioAlMomento?: number;
  auxilioTransporteAlMomento?: number;
  valorHoraCalculado?: number;
  formulaUsada?: string;
  
  // ID del analista
  analistaId?: number;
}

// ===============================
// INTERFACES EXTENDIDAS
// ===============================

export interface RegistroConTipo extends Omit<Registro, 'tipoRegistro'> {
  tipoRegistro: 'TRABAJO' | 'AUSENCIA';
  ausenciaInfo?: {
    id: number;
    tipoAusencia: string;
    descripcion: string;
    remunerado: boolean;
    horasAusente: number;
  };
}

export interface RegistroDetallado extends Registro {
  // Información adicional del trabajador
  trabajadorInfo?: {
    cedula: string;
    salarioActual: number;
    auxilioTransporteActual: number;
  };
  
  // Información adicional del centro/curso
  destinoInfo?: {
    tipo: 'CENTRO' | 'CURSO';
    descripcion?: string;
    ubicacion?: string;
  };
  
  // Información semanal
  informacionSemanal?: {
    inicioSemana: string;
    finSemana: string;
    horasNormalesUsadasSemana: number;
    horasNormalesDisponiblesSemana: number;
    porcentajeSemanaCubierto: number;
  };
}

// ===============================
// INTERFACES PARA RESPUESTAS DE API
// ===============================

export interface RespuestaPorFecha {
  fecha: string;
  totalRegistros: number;
  registros: RegistroConTipo[];
}

export interface RespuestaRangoFechas {
  success: boolean;
  data: Registro[];
  total: number;
  filtros: {
    trabajadorId: number;
    fechaInicio: string;
    fechaFin: string;
    diasEnRango: number;
  };
}

export interface RespuestaResumenCompleto {
  fechaInicio: string;
  fechaFin: string;
  trabajadorId?: number;
  totalRegistros: number;
  datos: Registro[];
}

export interface RespuestaEdicionLote {
  mensaje: string;
  registrosActualizados: number;
  totalProcesados: number;
  errores: string[];
  detalleResultados: Array<{
    id: number;
    exito: boolean;
    mensaje: string;
  }>;
}

export interface RespuestaCreacionRegistro {
  mensaje: string;
  registro: Registro;
  resumenDia: ResumenDia;
  informacionRegistro: {
    tipoRegistro: 'CENTRO' | 'CURSO';
    centroIdGuardado: string;
    nombreRegistro: string;
    esCurso: boolean;
    esCentro: boolean;
    patronUsado: string;
  };
  informacionHistorica?: {
    salarioUsado: number;
    auxilioTransporteUsado: number;
    valorHoraCalculado: number;
    formulaUsada: string;
  };
  informacionSemanal?: {
    horasNormalesDisponiblesSemana: number;
    horasNormalesAsignadas: number;
    horasExtrasAsignadas: number;
    totalHorasRegistro: number;
    explicacionLogica: string;
  };
}

// ===============================
// INTERFACES PARA RESÚMENES
// ===============================

export interface ResumenDia {
  fecha: string;
  jornadaEsperada: number;
  
  // Contadores por tipo
  registrosNormales: number;
  registrosCentros: number;
  registrosCursos: number;
  registrosFestivos: number;
  ausencias: number;
  
  // Horas por tipo
  totalHorasTrabajadas: number;
  horasCentros: number;
  horasCursos: number;
  horasFestivos: number;
  totalHorasAusencias: number;
  horasAusenciasRemuneradas: number;
  horasAusenciasNoRemuneradas: number;
  totalHorasNormales: number;
  totalHorasExtras: number;
  cumplioJornada: boolean;
  
  // Detalles de ausencias
  detalleAusencias?: Array<{
    tipo: string;
    esRemunerada: boolean;
    horas: number;
    horaInicio?: string;
    horaFin?: string;
  }>;
  
  // Detalles de cursos
  detalleCursos?: Array<{
    cursoId?: number;
    horas: number;
    horasNormales: number;
    horasExtras: number;
    horaInicio?: string;
    horaFin?: string;
  }>;
  
  // Información semanal
  informacionSemanal?: {
    inicioSemana: string;
    finSemana: string;
    horasNormalesUsadasSemana: number;
    horasNormalesDisponiblesSemana: number;
    horasNormalesRestantesSemana: number;
    porcentajeSemanaCubierto: number;
  };
}

export interface ResumenSemanal {
  trabajadorId: number;
  fechaConsultada: string;
  inicioSemana: string;
  finSemana: string;
  
  resumenHoras: {
    horasNormalesMaximas: number;
    horasNormalesUsadas: number;
    horasNormalesDisponibles: number;
    horasExtrasUsadas: number;
    totalHorasTrabajadas: number;
    porcentajeSemanaCubierto: number;
  };
  
  detalleRegistros: Array<{
    id: number;
    fecha: string;
    diaSemana: string;
    centro: string;
    tipoRegistro: TipoRegistro;
    esCurso: boolean;
    cursoId?: number;
    horasNormales: number;
    horasExtrasDiurnas: number;
    horasExtrasNocturnas: number;
    extrasDominicalesDiurnas: number;
    extrasDominicalesNocturnas: number;
    totalHoras: number;
  }>;
  
  ausencias?: Array<{
    id: number;
    fecha: string;
    diaSemana: string;
    tipo: string;
    intensidadHoraria: number;
    horasAusente: number;
    esRemunerada: boolean;
  }>;
}

export interface EstadisticasDia {
  fecha: string;
  totalRegistros: number;
  registrosTrabajo: number;
  registrosAusencia: number;
  trabajadoresUnicos: number;
  horasTotales: number;
  horasNormales: number;
  horasExtras: number;
  horasAusenciasRemuneradas: number;
  horasAusenciasNoRemuneradas: number;
}

export interface EstadisticasPorTipo {
  resumen: {
    totalRegistros: number;
    registrosCentros: number;
    registrosCursos: number;
    registrosFestivos: number;
    registrosAusencias: number;
  };
  distribucionHoras: {
    horasTotales: number;
    horasCentros: number;
    horasCursos: number;
    horasFestivos: number;
    horasAusencias: number;
  };
}

// ===============================
// INTERFACES PARA EDICIÓN
// ===============================

export interface EstadoEdicionRegistro {
  id: number;
  editando: boolean;
  guardando: boolean;
  errores: string[];
  datosOriginales: Registro;
  datosEditados: Partial<RegistroActualizacionDto>;
}

export interface ConfiguracionEdicionLote {
  mostrarSoloSeleccionados: boolean;
  aplicarATodos: boolean;
  camposAEditar: string[];
  filtros: {
    trabajadorId?: number;
    fechaInicio?: string;
    fechaFin?: string;
    centroId?: string;
    cursoId?: number;
    tipoRegistro?: TipoRegistro;
  };
}

// ===============================
// INTERFACES AUXILIARES
// ===============================

export interface OpcionDestino {
  id: string; // Para centros: el ID del centro, para cursos: "CURSO-{id}"
  nombre: string;
  tipo: 'CENTRO' | 'CURSO';
  descripcion?: string;
  centroId?: string; // Solo para centros
  cursoId?: number;   // Solo para cursos
}

export interface FormularioRegistroState {
  tipoDestino: TipoDestino;
  centroSeleccionado?: any; // Importarás el type Centro desde types/centros.ts
  cursoSeleccionado?: Curso;
}

// ===============================
// INTERFACES PARA VALIDACIONES
// ===============================

export interface ValidacionCompatibilidad {
  puedeCrear: boolean;
  advertencias: string[];
  registrosExistentes: Array<{
    id: number;
    tipo: string;
    nombre: string;
    horas: number;
  }>;
}

export interface RegistroExistente {
  id: number;
  trabajadorId: number;
  fecha: string;
  tipoRegistro?: TipoRegistro;
  nombreDestino?: string;
}

// ===============================
// INTERFACES PARA FESTIVOS
// ===============================

export interface InfoFestivosMes {
  trabajadorId: number;
  trabajadorNombre: string;
  año: number;
  mes: number;
  nombreMes: string;
  hayfestivos: boolean;
  resumen?: {
    totalFestivos: number;
    festivosConRegistro: number;
    festivosSinRegistro: number;
    puedeCrearRegistros: boolean;
  };
  festivosSinRegistro?: Array<{
    fecha: string;
    dia: number;
    diaSemana: string;
    nombreFestivo: string;
  }>;
  festivosConRegistro?: Array<{
    fecha: string;
    dia: number;
    diaSemana: string;
    nombreFestivo: string;
    tipoRegistro: string;
    esFestivo: boolean;
  }>;
}

export interface RespuestaCreacionFestivos {
  mensaje: string;
  trabajadorId: number;
  año: number;
  mes: number;
  nombreMes: string;
  registrosCreados: number;
  registrosExistentes: number;
  totalFestivosProcesados: number;
  errores?: string[];
  configuracionUsada: {
    centroId: string;
    tiempoAlmuerzo: string;
    todasHorasNormales: boolean;
    sinHorasExtras: boolean;
  };
}

// ===============================
// INTERFACES PARA RESUMEN DE SEMANA (legacy)
// ===============================

export interface ResumenSemana {
  trabajadorId: number;
  semana: number;
  horasNormales: number;
  extrasDiurnas: number;
  extrasNocturnas: number;
  extrasDomDiurnas: number;
  extrasDomNocturnas: number;
  total: number;
}

// ===============================
// INTERFACES PARA MIGRACIONES
// ===============================

export interface RespuestaMigracion {
  mensaje: string;
  registrosActualizados: number;
  totalRegistrosProcesados?: number;
  semanasLaboralesProcesadas?: number;
  errores?: string[];
  explicacion?: {
    logicaAplicada: string;
    distribucion: string;
    mantieneTotalHoras: string;
    cambiaDistribucion: string;
  };
}

export interface DiagnosticoValoresHistoricos {
  resumenGeneral: {
    totalRegistros: number;
    registrosConHistoricoCompleto: number;
    porcentajeCompleto: number;
    registrosSinValorHora: number;
    registrosSinFormula: number;
    registrosSinSalarioAlMomento: number;
  };
  analisisPorPeriodo: {
    antesDeAgosto2025: {
      cantidad: number;
      conHistorico: number;
      deberiaTenerFormula184: number;
      conFormulaIncorrecta: number;
    };
    despuesDeAgosto2025: {
      cantidad: number;
      conHistorico: number;
      deberiaTenerFormula176: number;
      conFormulaIncorrecta: number;
    };
  };
  distribucionFormulas: Array<{
    formula: string;
    cantidad: number;
    fechaMinima: string;
    fechaMaxima: string;
  }>;
  muestraRegistros: Array<{
    id: number;
    fecha: string;
    trabajadorId: number;
    trabajadorNombre?: string;
    centroId: string;
    salarioAlMomento: number;
    auxilioTransporteAlMomento: number;
    valorHoraCalculado: number;
    formulaUsada: string;
    tieneHistoricoCompleto: boolean;
  }>;
}

// ===============================
// RE-EXPORTAR CURSO PARA COMPATIBILIDAD
// ===============================
export type { Curso };