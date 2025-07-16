import { api } from "./api";
import type { Banco } from "../types/banco";

export const bancoService = {
  async getAll(): Promise<Banco[]> {
    const res = await api.get<Banco[]>("/BancoEmpleado");
    return res.data;
  },

  getById(id: number): Promise<Banco> {
    return api.get(`/BancoEmpleado/${id}`).then(res => res.data);
  },

  crear(data: Omit<Banco, "id">): Promise<void> {
    return api.post("/BancoEmpleado", data);
  },

  actualizar(id: number, data: Omit<Banco, "id">): Promise<void> {
    return api.put(`/BancoEmpleado/${id}`, data);
  },

  eliminar(id: number): Promise<void> {
    return api.delete(`/BancoEmpleado/${id}`);
  }
};
