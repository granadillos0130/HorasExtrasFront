import { api } from "./api";
import type { Cliente } from "../types/cliente";

export const clientesService = {
  async obtenerTodos(): Promise<Cliente[]> {
    const res = await api.get<Cliente[]>("/cliente");
    return res.data;
  },

  obtenerPorId(id: string): Promise<Cliente> {
    return api.get(`/cliente/${id}`).then(res => res.data);
  },

  crear(cliente: Cliente): Promise<void> {
    return api.post("/cliente", cliente);
  },

  actualizar(id: string, cliente: Cliente): Promise<void> {
    return api.put(`/cliente/${id}`, cliente);
  },

  eliminar(id: string): Promise<void> {
    return api.delete(`/cliente/${id}`);
  }
};