import { api } from "./api";
import type { Pension } from "../types/pension";

export const pensionService = {
  async getAll(): Promise<Pension[]> {
    const res = await api.get<Pension[]>("/PensionEmpleado");
    return res.data;
  },

  getById(id: number): Promise<Pension> {
    return api.get(`/PensionEmpleado/${id}`).then(res => res.data);
  },

  crear(data: Omit<Pension, "id">): Promise<void> {
    return api.post("/PensionEmpleado", data);
  },

  actualizar(id: number, data: Omit<Pension, "id">): Promise<void> {
    return api.put(`/PensionEmpleado/${id}`, data);
  },

  eliminar(id: number): Promise<void> {
    return api.delete(`/PensionEmpleado/${id}`);
  }
};
