// src/api/registrosService.ts
import { api } from "./api";
import type { Registro } from "../types/registros";
import type { RegistroInputDto } from "../types/registros";
import type { ResumenSemana } from "../types/ResumenSemana";

export const registrosService = {
  // Obtener todos los registros
  async obtenerTodos(): Promise<Registro[]> {
    const res = await api.get<Registro[]>("/registros");
    return res.data;
  },

  // Crear registro
  async crear(data: RegistroInputDto): Promise<void> {
    await api.post("/registros", data);
  },

  // Actualizar registro
  async actualizar(id: number, data: RegistroInputDto): Promise<void> {
    await api.put(`/registros/${id}`, data);
  },

  // Eliminar registro
  async eliminar(id: number): Promise<void> {
    await api.delete(`/registros/${id}`);
  },

  // Obtener registros por trabajador, mes y semana
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

  // Obtener resumen de semana
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
   async obtenerTodosPorFecha(fecha: string): Promise<Registro[]> {
    const res = await api.get<Registro[]>("/registros/porFechaTodos", {
      params: { fecha },
    });
    return res.data;
  },
};
