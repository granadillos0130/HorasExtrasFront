// services/compensadoService.ts

import { api } from "./api";
import type {
  Compensado,
  CrearCompensado,
  HorasDisponibles,
} from "../types/compensado";
import { getApiErrorField } from "../utils/errorUtils";
import type { Trabajador } from "../types/trabajadores";

export const compensadoService = {
  // Crear nuevo compensado
  crear(data: CrearCompensado): Promise<Compensado> {
    return api.post("/compensados", data).then(res => res.data);
  },

  // Eliminar (cancelar) compensado
  eliminar(id: number): Promise<{ mensaje: string; compensadoId: number; estado: string }> {
    return api.delete(`/compensados/${id}`).then(res => res.data);
  },

  // Consultar horas disponibles (GET con query params)
  async getHorasDisponibles(
    trabajadorId: number, 
    periodoInicio: string, 
    periodoFin: string
  ): Promise<HorasDisponibles> {
    const params = new URLSearchParams({
      periodoInicio,
      periodoFin
    });
    
    const res = await api.get<HorasDisponibles>(
      `/compensados/trabajador/${trabajadorId}/horas-disponibles?${params}`
    );
    return res.data;
  },

  // Validar formato de compensado antes de enviar
  validarCompensado(data: Partial<CrearCompensado>): { valido: boolean; errores: string[] } {
    const errores: string[] = [];

    if (!data.trabajadorId || data.trabajadorId <= 0) {
      errores.push("ID de trabajador requerido");
    }

    if (!data.centroId || data.centroId.trim() === '') {
      errores.push("Centro requerido");
    }

    if (!data.fecha) {
      errores.push("Fecha requerida");
    }

    if (!data.horaInicio || !data.horaFin) {
      errores.push("Horas de inicio y fin requeridas");
    } else {
      const inicio = data.horaInicio.split(':').map(Number);
      const fin = data.horaFin.split(':').map(Number);
      
      if (inicio.length !== 2 || fin.length !== 2) {
        errores.push("Formato de hora inválido (use HH:mm)");
      } else {
        const minutosInicio = inicio[0] * 60 + inicio[1];
        const minutosFin = fin[0] * 60 + fin[1];
        
        if (minutosInicio >= minutosFin) {
          errores.push("La hora de inicio debe ser menor que la hora de fin");
        }
      }
    }

    if (!data.horasCompensadas || data.horasCompensadas <= 0) {
      errores.push("Horas compensadas debe ser mayor a 0");
    } else if (data.horasCompensadas > 24) {
      errores.push("Horas compensadas no puede ser mayor a 24");
    }

    if (!data.periodoOrigenInicio || !data.periodoOrigenFin) {
      errores.push("Período origen requerido");
    } else if (new Date(data.periodoOrigenInicio) >= new Date(data.periodoOrigenFin)) {
      errores.push("Fecha de inicio del período debe ser menor que fecha fin");
    }

    return {
      valido: errores.length === 0,
      errores
    };
  },
  async getTrabajadoresConBancoHoras(): Promise<Trabajador[]> {
    const res = await api.get<Trabajador[]>("/trabajadores/con-banco-horas");
    return res.data;
},
async getPorMes(anio: number, mes: number): Promise<Compensado[]> {
    const res = await api.get<Compensado[]>(`/compensados/mes/${anio}/${mes}`);
    return res.data;
  },

  // NUEVO: Cancelar compensado (alias de eliminar)
  cancelarCompensado(id: number): Promise<{ mensaje: string; compensadoId: number; estado: string }> {
    return this.eliminar(id);
  },
  async validarCompensadoConAlmuerzo(data: CrearCompensado): Promise<{
  esValido: boolean;
  horasBrutas: number;
  tiempoAlmuerzoDescontado: number;
  horasEfectivas: number;
  horasDisponibles: number;
  horasSobrantes: number;
  yaHayAlmuerzoEnOtraActividad: boolean;
  mensaje: string;
}> {
  try {
    const res = await api.post("/compensados/validar", data);
    return res.data;
  } catch (error: unknown) {
    throw new Error(getApiErrorField(error, "error") || "Error al validar compensado");
  }
},
};
