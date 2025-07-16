import { api } from "./api";
import type { Eps } from "../types/eps";

export const epsService = {
  async getAll(): Promise<Eps[]> {
    const res = await api.get<Eps[]>("/eps");
    return res.data;
  },

  getById(id: number): Promise<Eps> {
    return api.get(`/eps/${id}`).then(res => res.data);
  },

  crear(data: Omit<Eps, "id">): Promise<void> {
    return api.post("/eps", data);
  },

  actualizar(id: number, data: Omit<Eps, "id">): Promise<void> {
    return api.put(`/eps/${id}`, data);
  },

  eliminar(id: number): Promise<void> {
    return api.delete(`/eps/${id}`);
  }
};
