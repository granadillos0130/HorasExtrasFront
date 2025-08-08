// src/types/registros.ts - VERSIÓN ACTUALIZADA

export interface RegistroInputDto {
  Trabajador_ID: number;
  Centro_ID: string;
  Nombr_Centro: string;
  Fecha: string; // "YYYY-MM-DD"
  Hora_Ingreso: string; // "HH:mm"
  Hora_Salida: string; // "HH:mm"
  Tiempo_Almuerzo: string; // "HH:mm:ss"
  desplazamientoIda?: string;
  desplazamientoRegreso?: string;
  AnalistaId?: number;
}

// 🆕 NUEVO: DTO para actualización de registros (incluye ID)
export interface RegistroActualizacionDto {
  Id: number; // ID del registro a actualizar
  Trabajador_ID: number;
  Centro_ID: string;
  Nombr_Centro: string;
  Fecha: string; // "YYYY-MM-DD"
  Hora_Ingreso: string; // "HH:mm"
  Hora_Salida: string; // "HH:mm"
  Tiempo_Almuerzo: string; // "HH:mm:ss"
  desplazamientoIda?: string;
  desplazamientoRegreso?: string;
  AnalistaId?: number;
}

export interface Registro {
  id: number;
  trabajadorId: number;
  trabajadorNombre: string;
  centroId: number | string;
  nombreCentro: string;
  ordenCompraId: number;
  ordenCompraNumero: string;
  ordenCompraDescripcion: string;
  fecha: string;
  semana: number;
  diaSemana: string;
  horaIngreso: string;
  horaSalida: string;
  tiempoAlmuerzo: string;
  intensidadHoraria: number;
  horasNormales: number;
  horasExtrasDiurnas: number;
  horasExtrasNocturnas: number;
  extrasDominicalesDiurnas: number;
  extrasDominicalesNocturnas: number;
  totalHoras: number;
  desplazamientoIda?: string;
  desplazamientoRegreso?: string;
  tipoRegistro?: 'TRABAJO' | 'AUSENCIA';
  ausenciaInfo?: {
    id: number;
    tipoAusencia: string;
    descripcion: string;
    remunerado: boolean;
    horasAusente: number;
  };
}

export interface RegistroConTipo extends Registro {
  tipoRegistro: 'TRABAJO' | 'AUSENCIA';
  ausenciaInfo?: {
    id: number;
    tipoAusencia: string;
    descripcion: string;
    remunerado: boolean;
    horasAusente: number;
  };
}

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

export type FiltroTipoRegistro = 'TODOS' | 'TRABAJO' | 'AUSENCIA';

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

// 🆕 NUEVO: Estado de edición de registro
export interface EstadoEdicionRegistro {
  id: number;
  editando: boolean;
  guardando: boolean;
  errores: string[];
  datosOriginales: Registro;
  datosEditados: Partial<RegistroActualizacionDto>;
}

// 🆕 NUEVO: Configuración para edición en lote
export interface ConfiguracionEdicionLote {
  mostrarSoloSeleccionados: boolean;
  aplicarATodos: boolean;
  camposAEditar: string[];
  filtros: {
    trabajadorId?: number;
    fechaInicio?: string;
    fechaFin?: string;
    centroId?: string;
  };
}