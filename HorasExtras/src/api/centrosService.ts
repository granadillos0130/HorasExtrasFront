import { api } from "./api";
import type { Centro } from "../types/centros";

export const centrosService = {
  async getAll(): Promise<Centro[]> {
    const res = await api.get<Centro[]>("/centros");
    return res.data;
  },
   getById(id: number): Promise<Centro> {
    return api.get(`/centros/${id}`).then(res => res.data);
  },
  crear(data: Centro): Promise<void> {
    return api.post("/centros", data);
  },
  actualizar(id: number, data: Centro): Promise<void> {
    return api.put(`/centros/${id}`, data);
  },
  eliminar(id: number): Promise<void> {
    return api.delete(`/centros/${id}`);
  },
  asignarTrabajador(centroId: number, trabajadorId: number): Promise<void> {
    return api.post(`/centros/${centroId}/asignarTrabajador/${trabajadorId}`);
  },
  getEstadisticas(params: { centroId?: number; nombre?: string }): Promise<any> {
    return api.get(`/centros/estadisticas`, { params }).then(res => res.data);
  }
};
