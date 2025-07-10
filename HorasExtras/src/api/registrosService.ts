// src/api/registrosService.ts
import { api } from "./api";
import type { Registro } from "../types/registros";

export const registrosService = {
  // Buscar registros detallados
  async buscarPorTrabajadorMesSemana(
    trabajadorId: number,
    mes: number,
    semana: number
  ): Promise<Registro[]> {
    const res = await api.get<Registro[]>("/registros/porTrabajadorMesSemana", {
      params: { trabajadorId, mes, semana },
    });
    return res.data;
  },

  // Buscar resumen semanal
  async buscarPorSemana(
    trabajadorId: number,
    mes: number,
    semana: number
  ): Promise<any> {
    const res = await api.get("/registros/porSemana", {
      params: { trabajadorId, mes, semana },
    });
    return res.data;
  },
};
