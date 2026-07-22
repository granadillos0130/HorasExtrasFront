import { api } from "./api";
import type {
  Ausencia,
  AusenciaDto,
  EstadisticaDiagnosticoDetallado,
  EstadisticaHoras,
  EstadisticaHorasArea,
  EstadisticaMensual,
  EstadisticasTrabajador,
  EstadisticaTipoDetallado,
  ResumenTrabajador,
  ValidacionVacacionesResponse,
  ValidarVacacionesDto
} from "../types/ausencia";
import type { Diagnostico } from "../types/diagnostico";



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
export async function validarDiasVacaciones(validacionDto: ValidarVacacionesDto) {
  const response = await api.post<ValidacionVacacionesResponse>("/ausencias/validar-dias-vacaciones", validacionDto);
  return response.data;
}

// 🆕 Función para calcular fecha de regreso
export function calcularFechaRegreso(fechaFin: Date): Date {
  const fechaRegreso = new Date(fechaFin);
  fechaRegreso.setDate(fechaRegreso.getDate() + 1);
  return fechaRegreso;
}

export const calcularFechaFinVacaciones = async (data: {
  fechaInicio: Date;
  diasVacaciones: number;
  trabajadorId: number;
}) => {
  const response = await api.post(
    "/Ausencias/calcular-fecha-fin-vacaciones",
    data
  );
  return response.data;
};

// ===== OBJETO EXPORTADO ACTUALIZADO =====
export const ausenciasService = {
  // Funciones existentes
  getPorMes,
  crearAusencia,
  getById,
  actualizarAusencia,
  eliminarAusencia,
  getEstadisticasHoras,
  getEstadisticasHorasPorArea,
  getAllDiagnosticos,
  crearDiagnostico,
  buscarDiagnosticos,
  getEstadisticasMensuales,
  getEstadisticasTiposDetallado,
  getEstadisticasDiagnosticosDetallado,
validarDiasVacaciones,
  calcularFechaRegreso,
  // 🆕 Nuevas funciones para trabajadores
  getEstadisticasTrabajador,
  getResumenTrabajador,
  exportarEstadisticasTrabajadorCSV
};