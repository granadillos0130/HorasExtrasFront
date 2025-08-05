import { api } from "./api";
import type { Ausencia, AusenciaDto } from "../types/ausencia";

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
    remunerado: data.remunerado
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
    remunerado: data.remunerado
  };

  const response = await api.put(`/ausencias/${id}`, ausenciaDto);
  return response.data;
}

export async function eliminarAusencia(id: number) {
  const response = await api.delete(`/ausencias/${id}`);
  return response.data;
}

export const ausenciasService = {
  getPorMes,
  crearAusencia,
  getAll,
  getById,
  actualizarAusencia,
  eliminarAusencia,
};