import { api } from "../api/api";
import type { Centro, TrabajadorEstadistica } from "../types/estadisticas";

export const estadisticasService = {
  async getCentros(): Promise<Centro[]> {
    const res = await api.get<Centro[]>("/centros");
    return res.data;
  },

  async getEstadisticasPorCentro(centroId: number): Promise<TrabajadorEstadistica[]> {
    const res = await api.get(`/centros/estadisticas?centroId=${centroId}`);
    return res.data.trabajadores;
  }
};
