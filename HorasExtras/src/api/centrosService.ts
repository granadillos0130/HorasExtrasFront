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
  },
   // Nuevo método para obtener centros por mes
  obtenerPorMes(anio: number, mes: number): Promise<any[]> {
    return api.get(`/centros/por-mes`, { 
      params: { anio, mes } 
    }).then(res => res.data);
  },
  obtenerManoObraTotal(centroId: string): Promise<{ centroId: string; manoObraTotal: number }> {
    return api.get(`/centros/${centroId}/mano-obra-total`).then(res => res.data);
  },

  obtenerManoObraPorTrabajador(centroId: string, trabajadorId: number): Promise<{
    centroId: string;
    trabajadorId: number;
    nombreTrabajador: string;
    manoObraTotal: number;
  }> {
    return api.get(`/centros/${centroId}/trabajador/${trabajadorId}/mano-obra`).then(res => res.data);
  },

  obtenerDetalleDiasTrabajador(centroId: string, trabajadorId: number): Promise<{
    centroId: string;
    trabajadorId: number;
    nombreTrabajador: string;
    detalleDias: Array<{
      fecha: string;
      horasNormales: number;
      extrasDiurnas: number;
      extrasNocturnas: number;
      dominicalesDiurnas: number;
      dominicalesNocturnas: number;
      totalHoras: number;
    }>;
  }> {
    return api.get(`/centros/${centroId}/trabajadores/${trabajadorId}/detalle-dias`).then(res => res.data);
  }

};
