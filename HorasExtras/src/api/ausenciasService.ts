import { api } from "./api";
import type { Ausencia,AusenciaDto } from "../types/ausencia";

export async function getPorMes(anio: number, mes: number) {
  const response = await api.get<Ausencia[]>(`/ausencias/mes/${anio}/${mes}`);
  return response.data;
}


export async function crearAusencia(data: AusenciaDto) {
  const response = await api.post<AusenciaDto>("/ausencias", data);
  return response.data;
}

export const ausenciasService = {
  getPorMes,
  crearAusencia,
};
