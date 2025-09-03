// src/types/cursos.ts

// ===============================
// INTERFAZ PRINCIPAL DE CURSO
// (Coincide exactamente con CursoDto del backend)
// ===============================

export interface Curso {
  id: number;
  nombre: string;          // Coincide con "Nombre" del DTO
  descripcion?: string;    // Coincide con "Descripcion?" del DTO
}

// ===============================
// DTOs PARA CREAR Y ACTUALIZAR CURSOS
// ===============================

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