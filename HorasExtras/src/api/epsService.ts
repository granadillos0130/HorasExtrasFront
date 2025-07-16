import { api } from "./api";
import type { Eps } from "../types/eps";

export const epsService = {
  async getAll(): Promise<Eps[]> {
    const res = await api.get<Eps[]>("/EpsEmpleado");
    return res.data;
  },

  getById(id: number): Promise<Eps> {
    return api.get(`/EpsEmpleado/${id}`).then(res => res.data);
  },

  crear(data: Omit<Eps, "id">): Promise<void> {
    return api.post("/EpsEmpleado", data);
  },

  actualizar(id: number, data: Omit<Eps, "id">): Promise<void> {
    return api.put(`/EpsEmpleado/${id}`, data);
  },

  eliminar(id: number): Promise<void> {
    return api.delete(`/EpsEmpleado/${id}`);
  }
};
