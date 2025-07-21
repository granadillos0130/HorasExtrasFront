import { api } from "./api";
import type { Centro } from "../types/centros";

export const centrosService = {
  async getAll(): Promise<Centro[]> {
    const res = await api.get<Centro[]>("/centros");
    return res.data;
  },

  getById(id: string): Promise<Centro> {
    return api.get(`/centros/${id}`).then(res => res.data);
  },

  crear(data: Centro): Promise<void> {
    return api.post("/centros", data);
  },

  actualizar(id: string, data: Centro): Promise<void> {
    return api.put(`/centros/${id}`, data);
  },

  eliminar(id: string): Promise<void> {
    return api.delete(`/centros/${id}`);
  },

  asignarTrabajador(centroId: string, trabajadorId: number): Promise<void> {
    return api.post(`/centros/${centroId}/asignarTrabajador/${trabajadorId}`);
  },

  getEstadisticas(params: { centroId?: string; nombre?: string }): Promise<any> {
    return api.get(`/centros/estadisticas`, { params }).then(res => res.data);
  },
   obtenerPorCliente(clienteId: string): Promise<Centro[]> {
    return api.get(`/centros/por-cliente/${clienteId}`).then(res => res.data);
  },
   crearLote(data: Centro[]): Promise<void> {
    return api.post("/centros/lote", data);
  }
};
