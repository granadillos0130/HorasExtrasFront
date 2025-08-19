import { api } from "./api";
import type { 
  Ausencia, 
  AusenciaDto, 
  EstadisticasTrabajador, 
  ResumenTrabajador 
} from "../types/ausencia";
import type { Diagnostico } from "../types/diagnostico";

// Interfaz para las estadísticas de horas por tipo
interface EstadisticaHoras {
  tipoAusencia: string;
  totalHoras: number;
}

// Interfaz para las estadísticas de horas por área
interface EstadisticaHorasArea {
  area: string;
  totalHoras: number;
}

// 🆕 Interface para estadísticas por diagnóstico
interface EstadisticaDiagnostico {
  diagnosticoCodigo: string;
  diagnosticoDescripcion: string;
  cantidadAusencias: number;
  totalHoras: number;
}

// 🆕 Interfaces adicionales para las nuevas estadísticas
interface EstadisticaMensual {
  mes: number;
  anio: number;
  nombreMes: string;
  totalAusencias: number;
  totalHoras: number;
  manoObraPerdida: number;
  citasMedicas: number;
  incapacidades: number;
  permisos: number;
  otros: number;
  trabajadoresAfectados: number;
  ausenciasRemuneradas: number;
  ausenciasNoRemuneradas: number;
}

interface EstadisticaTipoDetallado {
  tipoAusencia: string;
  totalAusencias: number;
  totalHoras: number;
  manoObraPerdida: number;
  trabajadoresAfectados: number;
  remuneradas: number;
  noRemuneradas: number;
  diagnosticosMasFrecuentes: {
    codigo: string;
    descripcion: string;
    cantidad: number;
  }[];
}

interface EstadisticaDiagnosticoDetallado {
  diagnosticoCodigo: string;
  diagnosticoDescripcion: string;
  cantidadAusencias: number;
  totalHoras: number;
  manoObraPerdida: number;
  trabajadoresAfectados: number;
  promedioDuracion: number;
  tiposAusencia: {
    tipo: string;
    cantidad: number;
  }[];
  distribucionMensual: {
    mes: number;
    cantidad: number;
  }[];
}

interface TendenciaAusencia {
  anio: number;
  mes: number;
  fecha: string;
  totalAusencias: number;
  totalHoras: number;
  manoObraPerdida: number;
  trabajadoresAfectados: number;
  diagnosticosPrincipales: {
    codigo: string;
    cantidad: number;
  }[];
}

interface ResumenEjecutivo {
  anio: number;
  resumenGeneral: {
    totalAusencias: number;
    totalHoras: number;
    manoObraPerdida: number;
    trabajadoresAfectados: number;
    totalTrabajadores: number;
    porcentajeTrabajadoresAfectados: number;
    promedioHorasPorAusencia: number;
  };
  porTipoAusencia: {
    tipo: string;
    cantidad: number;
    porcentaje: number;
  }[];
  topDiagnosticos: {
    codigo: string;
    descripcion: string;
    cantidad: number;
    porcentaje: number;
  }[];
  tendenciaMensual: {
    mes: number;
    nombreMes: string;
    cantidad: number;
    manoObraPerdida: number;
  }[];
}

// ===== FUNCIONES EXISTENTES =====

export async function getPorMes(anio: number, mes: number) {
  const response = await api.get<Ausencia[]>(`/ausencias/mes/${anio}/${mes}`);
  return response.data;
}

export async function crearAusencia(data: AusenciaDto) {
  // Crear el objeto que coincida con CrearAusenciaDto del backend
  const ausenciaDto = {
    fecha: data.fecha,
    tipoAusencia: data.tipoAusencia,
    descripcion: data.descripcion,
    trabajadorNombre: data.trabajadorNombre,
    cargo: data.cargo,
    fechaInicio: data.fechaInicio,
    fechaFin: data.fechaFin,
    horaInicio: data.horaInicio,
    horaFin: data.horaFin,
    remunerado: data.remunerado,
    diagnosticoId: data.diagnosticoId // 🆕 Incluir diagnóstico
  };

  const response = await api.post<AusenciaDto>("/ausencias", ausenciaDto);
  return response.data;
}

export async function getAll() {
  const response = await api.get<Ausencia[]>("/ausencias");
  return response.data;
}

export async function getById(id: number) {
  const response = await api.get<Ausencia>(`/ausencias/${id}`);
  return response.data;
}

export async function actualizarAusencia(id: number, data: AusenciaDto) {
  const ausenciaDto = {
    fecha: data.fecha,
    tipoAusencia: data.tipoAusencia,
    descripcion: data.descripcion,
    trabajadorNombre: data.trabajadorNombre,
    cargo: data.cargo,
    fechaInicio: data.fechaInicio,
    fechaFin: data.fechaFin,
    horaInicio: data.horaInicio,
    horaFin: data.horaFin,
    remunerado: data.remunerado,
    diagnosticoId: data.diagnosticoId // 🆕 Incluir diagnóstico
  };

  const response = await api.put(`/ausencias/${id}`, ausenciaDto);
  return response.data;
}

export async function eliminarAusencia(id: number) {
  const response = await api.delete(`/ausencias/${id}`);
  return response.data;
}

export async function getEstadisticasHoras() {
  const response = await api.get<EstadisticaHoras[]>("/ausencias/estadisticas/horas-por-tipo");
  return response.data;
}

export async function getEstadisticasHorasPorArea() {
  const response = await api.get<EstadisticaHorasArea[]>("/ausencias/estadisticas/horas-ausencia-por-area");
  return response.data;
}

// 🆕 FUNCIONES PARA DIAGNÓSTICOS
export async function getAllDiagnosticos() {
  const response = await api.get<Diagnostico[]>("/ausencias/diagnosticos");
  return response.data;
}
export async function crearDiagnostico(diagnostico: Omit<Diagnostico, "id">) {
  const response = await api.post<Diagnostico>(`/ausencias/CrearDiagnostico`, diagnostico);
  return response.data;
}
export async function buscarDiagnosticos(termino: string) {
  const response = await api.get<Diagnostico[]>(`/ausencias/diagnosticos/buscar/${termino}`);
  return response.data;
}

export async function getEstadisticasPorDiagnostico() {
  const response = await api.get<EstadisticaDiagnostico[]>("/ausencias/estadisticas/por-diagnostico");
  return response.data;
}

// ===== 🆕 NUEVAS FUNCIONES PARA ESTADÍSTICAS AVANZADAS =====

// Obtener estadísticas mensuales de un año
export async function getEstadisticasMensuales(anio: number) {
  const response = await api.get<EstadisticaMensual[]>(`/ausencias/estadisticas/mensual/${anio}`);
  return response.data;
}

// Obtener estadísticas detalladas por tipo de ausencia
export async function getEstadisticasTiposDetallado() {
  const response = await api.get<EstadisticaTipoDetallado[]>("/ausencias/estadisticas/tipos-detallado");
  return response.data;
}

// Obtener estadísticas detalladas por diagnóstico
export async function getEstadisticasDiagnosticosDetallado() {
  const response = await api.get<EstadisticaDiagnosticoDetallado[]>("/ausencias/estadisticas/diagnosticos-detallado");
  return response.data;
}

// Obtener tendencias de ausencias por período
export async function getTendenciasAusencias(anioInicio: number, anioFin: number) {
  const response = await api.get<TendenciaAusencia[]>("/ausencias/estadisticas/tendencias", {
    params: { anioInicio, anioFin }
  });
  return response.data;
}

// Obtener resumen ejecutivo de ausencias
export async function getResumenEjecutivo(anio?: number) {
  const response = await api.get<ResumenEjecutivo>("/ausencias/estadisticas/resumen-ejecutivo", {
    params: anio ? { anio } : {}
  });
  return response.data;
}

// 🆕 Función para calcular métricas adicionales en el frontend
export function calcularMetricasAusencias(ausencias: Ausencia[]) {
  const totalHoras = ausencias.reduce((total, ausencia) => {
    if (ausencia.horaInicio && ausencia.horaFin) {
      const inicio = new Date(`1970-01-01T${ausencia.horaInicio}`);
      const fin = new Date(`1970-01-01T${ausencia.horaFin}`);
      return total + (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60);
    }
    return total;
  }, 0);

  const trabajadoresUnicos = new Set(ausencias.map(a => a.trabajadorNombre)).size;
  
  const ausenciasRemuneradas = ausencias.filter(a => a.remunerado).length;
  const ausenciasNoRemuneradas = ausencias.filter(a => !a.remunerado).length;

  const diagnosticosUnicos = new Set(
    ausencias
      .filter(a => a.diagnosticoCodigo)
      .map(a => a.diagnosticoCodigo)
  ).size;

  return {
    totalAusencias: ausencias.length,
    totalHoras: Math.round(totalHoras * 100) / 100,
    trabajadoresAfectados: trabajadoresUnicos,
    ausenciasRemuneradas,
    ausenciasNoRemuneradas,
    diagnosticosUnicos,
    promedioDuracion: ausencias.length > 0 ? Math.round((totalHoras / ausencias.length) * 100) / 100 : 0
  };
}

// 🆕 Función para exportar datos de ausencias a CSV
export function exportarAusenciasCSV(ausencias: Ausencia[], filename: string = 'ausencias') {
  const headers = [
    'Fecha',
    'Trabajador',
    'Cargo',
    'Tipo Ausencia',
    'Descripción',
    'Fecha Inicio',
    'Fecha Fin',
    'Hora Inicio',
    'Hora Fin',
    'Remunerado',
    'Diagnóstico Código',
    'Diagnóstico Descripción'
  ];

  const csvContent = [
    headers.join(','),
    ...ausencias.map((ausencia: Ausencia) => [
      ausencia.fecha,
      `"${ausencia.trabajadorNombre}"`,
      `"${ausencia.cargo || ''}"`,
      `"${ausencia.tipoAusencia || ''}"`,
      `"${ausencia.descripcion || ''}"`,
      ausencia.fechaInicio,
      ausencia.fechaFin,
      ausencia.horaInicio || '',
      ausencia.horaFin || '',
      ausencia.remunerado ? 'Sí' : 'No',
      ausencia.diagnosticoCodigo || '',
      `"${ausencia.diagnosticoDescripcion || ''}"`
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// 🆕 FUNCIONES PARA ESTADÍSTICAS DE TRABAJADORES

// Obtener estadísticas completas de ausencias de un trabajador
export async function getEstadisticasTrabajador(trabajadorId: number) {
  const response = await api.get<EstadisticasTrabajador>(`/ausencias/trabajador/${trabajadorId}/estadisticas`);
  return response.data;
}

// Obtener resumen rápido de ausencias de un trabajador
export async function getResumenTrabajador(trabajadorId: number) {
  const response = await api.get<ResumenTrabajador>(`/ausencias/trabajador/${trabajadorId}/resumen`);
  return response.data;
}

// 🆕 Función para exportar estadísticas de trabajador a CSV
export function exportarEstadisticasTrabajadorCSV(estadisticas: EstadisticasTrabajador, filename?: string) {
  const nombreArchivo = filename || `ausencias_${estadisticas.trabajadorNombre.replace(/\s+/g, '_')}`;
  
  const headers = [
    'ID',
    'Fecha Registro',
    'Tipo Ausencia',
    'Descripción',
    'Fecha Inicio',
    'Fecha Fin',
    'Hora Inicio',
    'Hora Fin',
    'Duración (Horas)',
    'Remunerado',
    'Diagnóstico Código',
    'Diagnóstico Descripción',
    'Cargo'
  ];

  const csvContent = [
    `# Estadísticas de Ausencias - ${estadisticas.trabajadorNombre}`,
    `# Total de ausencias: ${estadisticas.totalAusencias}`,
    `# Total de horas: ${estadisticas.totalHoras}`,
    `# Remuneradas: ${estadisticas.ausenciasRemuneradas} | No remuneradas: ${estadisticas.ausenciasNoRemuneradas}`,
    `# Fecha de consulta: ${new Date(estadisticas.fechaConsulta).toLocaleDateString()}`,
    '',
    headers.join(','),
    ...estadisticas.ausencias.map(ausencia => [
      ausencia.id,
      ausencia.fecha,
      `"${ausencia.tipoAusencia || ''}"`,
      `"${ausencia.descripcion || ''}"`,
      ausencia.fechaInicio,
      ausencia.fechaFin,
      ausencia.horaInicio || '',
      ausencia.horaFin || '',
      ausencia.duracion,
      ausencia.remunerado ? 'Sí' : 'No',
      ausencia.diagnosticoCodigo || '',
      `"${ausencia.diagnosticoDescripcion || ''}"`,
      `"${ausencia.cargo || ''}"`
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${nombreArchivo}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// ===== OBJETO EXPORTADO ACTUALIZADO =====
export const ausenciasService = {
  // Funciones existentes
  getPorMes,
  crearAusencia,
  getAll,
  getById,
  actualizarAusencia,
  eliminarAusencia,
  getEstadisticasHoras,
  getEstadisticasHorasPorArea,
  getAllDiagnosticos,
  buscarDiagnosticos,
  getEstadisticasPorDiagnostico,
  getEstadisticasMensuales,
  getEstadisticasTiposDetallado,
  getEstadisticasDiagnosticosDetallado,
  getTendenciasAusencias,
  getResumenEjecutivo,
  calcularMetricasAusencias,
  exportarAusenciasCSV,

  // 🆕 Nuevas funciones para trabajadores
  getEstadisticasTrabajador,
  getResumenTrabajador,
  exportarEstadisticasTrabajadorCSV
};