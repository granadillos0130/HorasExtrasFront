import { api } from "./api";
import type { Arl } from "../types/arl";

export const arlService = {
  async getAll(): Promise<Arl[]> {
    const res = await api.get<Arl[]>("/arls");
    return res.data;
  },

  getById(id: number): Promise<Arl> {
    return api.get(`/arls/${id}`).then(res => res.data);
  },

  crear(data: Omit<Arl, "id">): Promise<void> {
    return api.post("/arls", data);
  },

  actualizar(id: number, data: Omit<Arl, "id">): Promise<void> {
    return api.put(`/arls/${id}`, data);
  },

  eliminar(id: number): Promise<void> {
    return api.delete(`/arls/${id}`);
  }
};
