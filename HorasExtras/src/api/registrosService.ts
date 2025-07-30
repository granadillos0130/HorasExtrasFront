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

  // 🆕 NUEVO: Obtener registros por trabajador y rango de fechas
  async buscarPorTrabajadorRangoFechas(
    trabajadorId: number,
    fechaInicio: string,
    fechaFin: string
  ): Promise<Registro[]> {
    try {
      const res = await api.get<{
        success: boolean;
        data: Registro[];
        total: number;
        filtros: any;
      }>("/registros/porTrabajadorRangoFechas", {
        params: { trabajadorId, fechaInicio, fechaFin },
      });
      
      // Si el backend devuelve un objeto con 'data', extraerlo
      if (res.data && typeof res.data === 'object' && 'data' in res.data) {
        return res.data.data;
      }
      
      // Si devuelve directamente el array
      return Array.isArray(res.data) ? res.data : [];
    } catch (error) {
      console.error('Error al buscar registros por rango de fechas:', error);
      throw error;
    }
  },

  // Mantener compatibilidad: Obtener registros por trabajador, mes y semana
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

  // Obtener todos los registros por fecha
  async obtenerTodosPorFecha(fecha: string): Promise<Registro[]> {
    const res = await api.get<Registro[]>("/registros/porFechaTodos", {
      params: { fecha },
    });
    return res.data;
  },
};