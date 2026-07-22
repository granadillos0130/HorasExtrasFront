/* eslint-disable @typescript-eslint/no-explicit-any */
// src/api/registrosService.ts - VERSIÓN ACTUALIZADA
import { api } from "./api";
import type { Registro, RespuestaIntensidadHoraria, ResumenDia} from "../types/registros";
import type { RegistroInputDto } from "../types/registros";
import type { ResumenSemana } from "../types/ResumenSemana";
import type { RespuestaConsolidadoIntensidad } from "../types/consolidado";


export const registrosService = {
  // 🆕 NUEVO: Obtener un registro por ID
  async obtenerPorId(id: number): Promise<Registro> {
    try {
      const res = await api.get<Registro>(`/registros/${id}`);
      return res.data;
    } catch (error) {
      console.error('Error al obtener registro por ID:', error);
      throw error;
    }
  },

  // Crear registro
  async crear(data: RegistroInputDto): Promise<void> {
    await api.post("/registros", data);
  },

  // 🆕 MEJORADO: Actualizar registro individual
  async actualizar(id: number, data: RegistroInputDto): Promise<{
    mensaje: string;
    registro: Registro;
    resumenDia: ResumenDia;
  }> {
    try {
      const res = await api.put(`/registros/${id}`, data);
      return res.data;
    } catch (error) {
      console.error('Error al actualizar registro:', error);
      throw error;
    }
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
): Promise<RespuestaIntensidadHoraria> {
  try {
    const res = await api.get<RespuestaIntensidadHoraria>("/registros/porTrabajadorRangoFechas", {
      params: { trabajadorId, fechaInicio, fechaFin },
    });
    
    // Si el backend envía la nueva estructura completa con metadatos
    if (res.data && typeof res.data === 'object' && 'tipoVista' in res.data) {
      return res.data;
    }
    
    // Fallback para mantener compatibilidad con respuesta antigua
    // Si solo recibe un array de registros o estructura antigua
    const registros = Array.isArray(res.data) 
      ? res.data 
      : (res.data as any)?.data || [];
    
    return {
      success: true,
      tipoVista: "Desconocido",
      trabajadorUsaBanco: false,
      valoresMostrados: "Valores originales (compatibilidad)",
      data: registros,
      total: registros.length,
      filtros: {
        trabajadorId,
        fechaInicio,
        fechaFin,
        diasEnRango: 1
      }
    };
    
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
    
    // ✅ CORRECCIÓN: El backend devuelve directamente un array
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    console.error('Error al obtener registros por fecha:', error);
    throw error;
  }
},

async obtenerRegistrosMesCompleto(año: number, mes: number): Promise<{
  año: number;
  mes: number;
  registros: Registro[];
  totalRegistros: number;
}> {
  try {
    const res = await api.get("/registros/registros-mes", {
      params: { año, mes }
    });
    return res.data;
  } catch (error) {
    console.error('Error al obtener registros del mes completo:', error);
    throw error;
  }
},
async obtenerConsolidadoRangoFechas(
    fechaInicio: string,
    fechaFin: string,
    estado?: string,
    busqueda?: string
  ): Promise<RespuestaConsolidadoIntensidad> {
    try {
      const params: any = { 
        fechaInicio, 
        fechaFin 
      };
      
      if (estado && estado !== 'todos') {
        params.estado = estado;
      }
      
      if (busqueda && busqueda.trim() !== '') {
        params.busqueda = busqueda.trim();
      }

      const res = await api.get<RespuestaConsolidadoIntensidad>(
        "/registros/consolidadoRangoFechas",
        { params }
      );
      
      return res.data;
    } catch (error) {
      console.error('Error al obtener consolidado de intensidad horaria:', error);
      throw error;
    }
  },
};