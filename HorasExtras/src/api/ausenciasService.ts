import { api } from "./api";
import type { Ausencia, AusenciaDto } from "../types/ausencia";
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

// 🆕 NUEVAS FUNCIONES PARA DIAGNÓSTICOS
export async function getAllDiagnosticos() {
  const response = await api.get<Diagnostico[]>("/ausencias/diagnosticos");
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

export const ausenciasService = {
  getPorMes,
  crearAusencia,
  getAll,
  getById,
  actualizarAusencia,
  eliminarAusencia,
  getEstadisticasHoras,
  getEstadisticasHorasPorArea,
  // 🆕 Nuevos servicios para diagnósticos
  getAllDiagnosticos,
  buscarDiagnosticos,
  getEstadisticasPorDiagnostico
};