// src/api/registrosLoteService.ts
import { api } from "./api";
import type { RegistroInputDto } from "../types/registros";

export interface RegistroLoteResponse {
  mensaje: string;
  cantidad: number;
}

export const registrosLoteService = {
  // Crear múltiples registros en lote
  async crearLote(registros: RegistroInputDto[]): Promise<RegistroLoteResponse> {
    const res = await api.post<RegistroLoteResponse>("/registros/lote", registros);
    return res.data;
  },
};