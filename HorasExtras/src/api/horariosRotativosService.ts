/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "./api";
import type {
  HorarioRotativo,
  HorarioDetalleCompleto,
  AsignacionRotativa,
  CrearHorarioDto,
  DetalleHorarioDto,
  AsignarHorarioDto,
} from "../types/horariosRotativos";

export const horariosRotativosService = {
  // Catálogo
  async getCatalogo(): Promise<HorarioRotativo[]> {
    const res = await api.get("/horarios/catalogo");
    return res.data;
  },

  async getHorarioPorId(id: number): Promise<HorarioDetalleCompleto> {
    const res = await api.get(`/horarios/catalogo/${id}`);
    return res.data;
  },

  async crearHorario(data: CrearHorarioDto): Promise<void> {
    await api.post("/horarios/catalogo", data);
  },

  async agregarDetalle(horarioId: number, data: DetalleHorarioDto): Promise<void> {
    await api.post(`/horarios/catalogo/${horarioId}/detalles`, data);
  },

  async eliminarDetalle(detalleId: number): Promise<void> {
    await api.delete(`/horarios/detalles/${detalleId}`);
  },

  // Asignaciones
  async getTrabajadoresConHorario(): Promise<AsignacionRotativa[]> {
    const res = await api.get("/horarios/trabajadores-con-horario");
    return res.data.trabajadores;
  },

  async asignarHorarioATrabajador(data: AsignarHorarioDto): Promise<void> {
    await api.post("/horarios/asignar-trabajador", data);
  },

  async obtenerHorarioVigente(trabajadorId: number, fecha?: string): Promise<any> {
    const params = fecha ? { fecha } : {};
    const res = await api.get(`/horarios/trabajador/${trabajadorId}/vigente`, { params });
    return res.data;
  },
};