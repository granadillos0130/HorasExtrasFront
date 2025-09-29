// services/compensadoService.ts

import { api } from "./api";
import type { 
  Compensado, 
  CrearCompensado, 
  ActualizarCompensado,
  HorasDisponibles,
  ConsultarHorasDisponibles,
  EstadisticasCompensados
} from "../types/compensado";
import type { Trabajador } from "../types/trabajadores";

export const compensadoService = {
  // Obtener todos los compensados
  async getAll(): Promise<Compensado[]> {
    const res = await api.get<Compensado[]>("/compensados");
    return res.data;
  },

  // Obtener compensado por ID
  getById(id: number): Promise<Compensado> {
    return api.get(`/compensados/${id}`).then(res => res.data);
  },

  // Crear nuevo compensado
  crear(data: CrearCompensado): Promise<Compensado> {
    return api.post("/compensados", data).then(res => res.data);
  },

  // Actualizar compensado
  actualizar(id: number, data: ActualizarCompensado): Promise<void> {
    return api.put(`/compensados/${id}`, data);
  },

  // Eliminar (cancelar) compensado
  eliminar(id: number): Promise<{ mensaje: string; compensadoId: number; estado: string }> {
    return api.delete(`/compensados/${id}`).then(res => res.data);
  },

  // Obtener compensados por trabajador
  getByTrabajador(trabajadorId: number): Promise<Compensado[]> {
    return api.get(`/compensados/trabajador/${trabajadorId}`).then(res => res.data);
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

  // Consultar horas disponibles (POST con body)
  consultarHorasDisponibles(
    trabajadorId: number, 
    data: ConsultarHorasDisponibles
  ): Promise<HorasDisponibles> {
    return api.post(`/compensados/trabajador/${trabajadorId}/horas-disponibles`, data)
      .then(res => res.data);
  },

  // Obtener estadísticas generales
  getEstadisticas(): Promise<EstadisticasCompensados> {
    return api.get("/compensados/estadisticas").then(res => res.data);
  },

  // Métodos utilitarios adicionales

  // Validar si un trabajador tiene horas disponibles
  async tieneHorasDisponibles(
    trabajadorId: number,
    periodoInicio: string,
    periodoFin: string,
    horasRequeridas: number
  ): Promise<{ valido: boolean; mensaje: string; horasDisponibles: number }> {
    try {
      const horasInfo = await this.getHorasDisponibles(trabajadorId, periodoInicio, periodoFin);
      
      const valido = horasInfo.horasDisponibles >= horasRequeridas;
      const mensaje = valido 
        ? `Tiene ${horasInfo.horasDisponibles} horas disponibles`
        : `Solo tiene ${horasInfo.horasDisponibles} horas disponibles, necesita ${horasRequeridas}`;

      return {
        valido,
        mensaje,
        horasDisponibles: horasInfo.horasDisponibles
      };
    } catch (error) {
      return {
        valido: false,
        mensaje: "Error al consultar horas disponibles",
        horasDisponibles: 0
      };
    }
  },

  // Obtener resumen de compensados activos de un trabajador
  async getResumenTrabajador(trabajadorId: number) {
    const compensados = await this.getByTrabajador(trabajadorId);
    const activos = compensados.filter(c => c.estado === 'ACTIVO');
    const cancelados = compensados.filter(c => c.estado === 'CANCELADO');
    
    return {
      total: compensados.length,
      activos: activos.length,
      cancelados: cancelados.length,
      horasUtilizadas: activos.reduce((sum, c) => sum + c.horasCompensadas, 0),
      ultimoCompensado: activos.length > 0 
        ? activos.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())[0]
        : null
    };
  },

  // Formatear fechas para el backend (yyyy-MM-dd)
  formatearFecha(fecha: Date): string {
    return fecha.toISOString().split('T')[0];
  },

  // Formatear hora para el backend (HH:mm)
  formatearHora(hora: string): string {
    // Asegurar formato HH:mm
    const time = hora.padStart(5, '0');
    return time.match(/^\d{2}:\d{2}$/) ? time : '08:00';
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
  }
};