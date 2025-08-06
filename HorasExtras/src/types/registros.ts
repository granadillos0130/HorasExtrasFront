// src/types/registros.ts

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

// 🆕 FIXED: Added optional properties that were missing
export interface Registro {
  id: number;
  trabajadorId: number;
  trabajadorNombre: string;
  centroId: number | string; // ✅ FIX: Allow both number and string (for 'AUSENCIA')
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
  // 🆕 FIXED: Added missing optional properties for ausencia support
  tipoRegistro?: 'TRABAJO' | 'AUSENCIA'; // Optional in base interface
  ausenciaInfo?: {
    id: number;
    tipoAusencia: string;
    descripcion: string;
    remunerado: boolean;
    horasAusente: number;
  };
}

// 🆕 UPDATED: Now extends Registro with required tipoRegistro
export interface RegistroConTipo extends Registro {
  tipoRegistro: 'TRABAJO' | 'AUSENCIA'; // Required in this extended interface
  ausenciaInfo?: {
    id: number;
    tipoAusencia: string;
    descripcion: string;
    remunerado: boolean;
    horasAusente: number;
  };
}

// 🆕 NUEVO: Respuesta mejorada del endpoint por fecha
export interface RespuestaPorFecha {
  fecha: string;
  totalRegistros: number;
  registros: RegistroConTipo[];
}

// Nuevo tipo para la respuesta del API con rango de fechas
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

// 🆕 NUEVO: Filtros para tipos de registro
export type FiltroTipoRegistro = 'TODOS' | 'TRABAJO' | 'AUSENCIA';

// 🆕 NUEVO: Estadísticas de un día
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