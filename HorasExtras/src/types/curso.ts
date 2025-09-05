export interface Curso {
  id: number;
  nombre: string;         
  descripcion?: string;    
}


export interface CursoCreateDto {
  nombre: string;
  descripcion?: string;
}

export interface CursoUpdateDto {
  id: number;
  nombre?: string;
  descripcion?: string;
}

// ===============================
// INTERFACES AUXILIARES PARA CURSOS
// ===============================

export interface CursoConEstadisticas extends Curso {
  totalRegistros?: number;
  horasTotales?: number;
  trabajadoresParticipantes?: number;
  ultimoRegistro?: string;
}

export interface RespuestaBusquedaCursos {
  cursos: Curso[];
  total: number;
  terminoBuscado: string;
}

// ===============================
// FILTROS Y OPCIONES PARA CURSOS
// ===============================

export interface FiltrosCursos {
  nombre?: string;
  conDescripcion?: boolean;
  ids?: number[];
}

export interface OpcionesCursos {
  incluirEstadisticas?: boolean;
  ordenarPor?: 'nombre' | 'id' | 'fechaCreacion';
  orden?: 'asc' | 'desc';
}
export interface Curso {
  id: number;
  nombre: string;
  descripcion?: string;
}

export interface CursoCompleto extends Curso {
  trabajadores?: Trabajador[];
}

export interface Trabajador {
  id: number;
  nombre: string;
  cedula: string;
  cargoDesempenado: string;
  estado: string;
  area?: string;
}

export interface EstadisticasGeneralesCursos {
  totalCursos: number;
  totalTrabajadoresEnCursos: number;
  promedioTrabajadoresPorCurso: number;
  cursoConMasTrabajadores: {
    idCurso: number;
    nombreCurso: string;
    cantidadTrabajadores: number;
  } | null;
  cursoConMenosTrabajadores: {
    idCurso: number;
    nombreCurso: string;
    cantidadTrabajadores: number;
  } | null;
  detallesCursos: DetalleCurso[];
}

export interface DetalleCurso {
  idCurso: number;
  nombreCurso: string;
  descripcion: string;
  cantidadTrabajadores: number;
}

export interface EstadisticasCursoDetalle {
  idCurso: number;
  nombreCurso: string;
  descripcion: string;
  cantidadTrabajadores: number;
  trabajadoresInscritos: Trabajador[];
}

export interface HorasCurso {
  idCurso: number;
  nombreCurso: string;
  cantidadTrabajadores: number;
  totalHorasCurso: number;
  periodoConsultado: {
    fechaInicio: string;
    fechaFin: string;
  };
}

export interface ResumenRapidoCursos {
  totalCursos: number;
  totalInscripciones: number;
  cursoMasPopular: {
    nombreCurso: string;
    cantidadTrabajadores: number;
  } | null;
  fechaConsulta: string;
}