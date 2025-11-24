/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "./api";

export const huelleroService = {
  // Obtener asistencia de un día específico
  async obtenerAsistenciaDia(fecha: string): Promise<any> {
    const res = await api.get(`/huellero/asistencia?fecha=${fecha}`);
    return res.data;
  },

  // Sincronizar registros del huellero a la BD
  async sincronizarAsistencia(fecha: string, usarFallback: boolean = true): Promise<any> {
    const res = await api.post(`/huellero/sincronizar-asistencia?fecha=${fecha}&usarHorarioFallback=${usarFallback}`);
    return res.data;
  },

  // Obtener personas del huellero
  async obtenerPersonas(): Promise<any> {
    const res = await api.get("/huellero/personas");
    return res.data;
  },

  // Obtener estado de sincronización de empleados
  async obtenerEstadoSincronizacion(): Promise<any> {
    const res = await api.get("/huellero/sincronizar/estado");
    return res.data;
  }
};