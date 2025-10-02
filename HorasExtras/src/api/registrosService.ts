/* eslint-disable @typescript-eslint/no-explicit-any */
// src/api/registrosService.ts - VERSIÓN ACTUALIZADA
import { api } from "./api";
import type { Registro, RespuestaEdicionLote, RespuestaIntensidadHoraria, RespuestaResumenCompleto, ResumenDia} from "../types/registros";
import type { RegistroInputDto, RegistroActualizacionDto } from "../types/registros";
import type { ResumenSemana } from "../types/ResumenSemana";


export const registrosService = {
  // Obtener todos los registros
  async obtenerTodos(): Promise<Registro[]> {
    const res = await api.get<Registro[]>("/registros");
    return res.data;
  },

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

  // 🆕 NUEVO: Actualizar registros en lote
  async actualizarLote(registros: RegistroActualizacionDto[]): Promise<RespuestaEdicionLote> {
    try {
      const res = await api.put<RespuestaEdicionLote>("/registros/lote", registros);
      return res.data;
    } catch (error) {
      console.error('Error al actualizar registros en lote:', error);
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

  // 🆕 NUEVO: Obtener múltiples registros por IDs (para edición en lote)
  async obtenerPorIds(ids: number[]): Promise<Registro[]> {
    try {
      const promesas = ids.map(id => this.obtenerPorId(id));
      const registros = await Promise.all(promesas);
      return registros;
    } catch (error) {
      console.error('Error al obtener registros por IDs:', error);
      throw error;
    }
  },
  // 🆕 NUEVO: Crear registros festivos para TODOS los trabajadores
async crearRegistrosFestivosTodosTrabajadores(
  año: number,
  mes?: number,
  confirmar: boolean = false
): Promise<any> {
  try {
    const res = await api.post("/registros/crear-registros-festivos-todos-trabajadores", null, {
      params: { año, mes, confirmar },
    });
    return res.data;
  } catch (error) {
    console.error("Error al crear registros festivos para todos los trabajadores:", error);
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
};