import { api } from "./api";
import type { Registro } from "../types/registros";
import type { ResumenSemana } from "../types/ResumenSemana";

export const registrosService = {
  // Endpoint que devuelve la LISTA de registros
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

  // Endpoint que devuelve el RESUMEN
  async buscarPorSemana(
    trabajadorId: number,
    mes: number,
    semana: number
  ): Promise<ResumenSemana> {
    const res = await api.get<ResumenSemana>("/registros/porSemana", {
      params: { trabajadorId, mes, semana },
    });
    return res.data;
  },
};
