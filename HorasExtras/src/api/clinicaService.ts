import { api } from "./api";
import type { Clinica } from "../types/clinica";

export const clinicaService = {
  async getAll(): Promise<Clinica[]> {
    const res = await api.get<Clinica[]>("/ClinicaEmpleado");
    return res.data;
  },

  getById(id: number): Promise<Clinica> {
    return api.get(`/ClinicaEmpleado/${id}`).then(res => res.data);
  },

  crear(data: Omit<Clinica, "id">): Promise<void> {
    return api.post("/ClinicaEmpleado", data);
  },

  actualizar(id: number, data: Omit<Clinica, "id">): Promise<void> {
    return api.put(`/ClinicaEmpleado/${id}`, data);
  },

  eliminar(id: number): Promise<void> {
    return api.delete(`/ClinicaEmpleado/${id}`);
  }
};
