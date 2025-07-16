import { api } from "./api";
import type { Pension } from "../types/pension";

export const pensionService = {
  async getAll(): Promise<Pension[]> {
    const res = await api.get<Pension[]>("/pensiones");
    return res.data;
  },

  getById(id: number): Promise<Pension> {
    return api.get(`/pensiones/${id}`).then(res => res.data);
  },

  crear(data: Pension): Promise<void> {
    return api.post("/pensiones", data);
  },

  actualizar(id: number, data: Pension): Promise<void> {
    return api.put(`/pensiones/${id}`, data);
  },

  eliminar(id: number): Promise<void> {
    return api.delete(`/pensiones/${id}`);
  }
};
