import { api } from "./api";
import type { Horario } from "../types/horarios";

export const horariosService = {
  // Obtener todos los horarios
  async getAll(): Promise<Horario[]> {
    const res = await api.get<Horario[]>("/horarios");
    return res.data;
  },

  // Obtener horarios por trabajador
  async getByTrabajador(trabajadorId: number): Promise<Horario[]> {
    const res = await api.get<Horario[]>(`/horarios/porTrabajador/${trabajadorId}`);
    return res.data;
  },

  // Crear un horario
  async crear(data: Omit<Horario, "id" | "trabajadorNombre">): Promise<void> {
    await api.post("/horarios", data);
  },

  // Actualizar un horario
  async actualizar(id: number, data: Omit<Horario, "id" | "trabajadorNombre">): Promise<void> {
    await api.put(`/horarios/${id}`, data);
  },

  // Eliminar un horario
  async eliminar(id: number): Promise<void> {
    await api.delete(`/horarios/${id}`);
  },
};
