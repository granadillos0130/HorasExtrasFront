import { api } from "./api";
import type { Clinica } from "../types/clinica";

export const clinicaService = {
  async getAll(): Promise<Clinica[]> {
    const res = await api.get<Clinica[]>("/clinicas");
    return res.data;
  },

  getById(id: number): Promise<Clinica> {
    return api.get(`/clinicas/${id}`).then(res => res.data);
  },

  crear(data: Clinica): Promise<void> {
    return api.post("/clinicas", data);
  },

  actualizar(id: number, data: Clinica): Promise<void> {
    return api.put(`/clinicas/${id}`, data);
  },

  eliminar(id: number): Promise<void> {
    return api.delete(`/clinicas/${id}`);
  }
};
