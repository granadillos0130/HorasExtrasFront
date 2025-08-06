// src/api/registrosService.ts
import { api } from "./api";
import type { Registro, RegistroConTipo } from "../types/registros";
import type { RegistroInputDto } from "../types/registros";
import type { ResumenSemana } from "../types/ResumenSemana";

// 🆕 NUEVO: Interfaz para el resumen detallado del día
export interface ResumenDia {
  fecha: string;
  jornadaEsperada: number;
  registrosNormales: number;
  ausencias: number;
  totalHorasTrabajadas: number;
  totalHorasAusencias: number;
  horasAusenciasRemuneradas: number;
  horasAusenciasNoRemuneradas: number;
  totalHorasNormales: number;
  totalHorasExtras: number;
  cumplioJornada: boolean;
}

// 🆕 NUEVO: Interfaz para respuesta del resumen completo
export interface RespuestaResumenCompleto {
  fechaInicio: string;
  fechaFin: string;
  trabajadorId?: number;
  totalRegistros: number;
  datos: Registro[];
}

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

  // Obtener registros por trabajador y rango de fechas
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
      
      if (res.data && typeof res.data === 'object' && 'data' in res.data) {
        return res.data.data;
      }
      
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

  // 🆕 MEJORADO: Obtener todos los registros por fecha (incluye ausencias)
  async obtenerTodosPorFecha(fecha: string): Promise<Registro[]> {
    try {
      const res = await api.get<any>("/registros/porFechaTodos", {
        params: { fecha },
      });
      
      // El nuevo endpoint devuelve un objeto con estructura mejorada
      if (res.data && typeof res.data === 'object' && 'registros' in res.data) {
        return res.data.registros;
      }
      
      // Mantener compatibilidad con la respuesta anterior
      return Array.isArray(res.data) ? res.data : [];
    } catch (error) {
      console.error('Error al obtener registros por fecha:', error);
      throw error;
    }
  },

  // 🆕 NUEVO: Obtener resumen detallado de un día específico
  async obtenerResumenDia(trabajadorId: number, fecha: string): Promise<{
    resumen: ResumenDia;
    detalleRegistros: any[];
  }> {
    try {
      const res = await api.get("/registros/resumenDia", {
        params: { trabajadorId, fecha },
      });
      return res.data;
    } catch (error) {
      console.error('Error al obtener resumen del día:', error);
      throw error;
    }
  },

  // 🆕 NUEVO: Obtener resumen completo (registros + ausencias) para un rango
  async obtenerResumenCompleto(
    fechaInicio: string,
    fechaFin: string,
    trabajadorId?: number
  ): Promise<RespuestaResumenCompleto> {
    try {
      const params: any = { fechaInicio, fechaFin };
      if (trabajadorId) {
        params.trabajadorId = trabajadorId;
      }

      const res = await api.get<RespuestaResumenCompleto>("/registros/resumenCompleto", {
        params,
      });
      return res.data;
    } catch (error) {
      console.error('Error al obtener resumen completo:', error);
      throw error;
    }
  },
};