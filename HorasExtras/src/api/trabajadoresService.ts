import { api } from "../api/api";
import type { Trabajador,CrearTrabajadorDto } from "../types/trabajadores";


export const trabajadoresService = {
  // Obtener todos los trabajadores
  async getAll(): Promise<Trabajador[]> {
    const res = await api.get<Trabajador[]>("/trabajadores");
    return res.data;
  },

  // Obtener un trabajador por ID
  async getById(id: number): Promise<Trabajador> {
    const res = await api.get<Trabajador>(`/trabajadores/${id}`);
    return res.data;
  },

  // Crear un trabajador
  async create(data: Partial<Trabajador>): Promise<Trabajador> {
    const res = await api.post<Trabajador>("/trabajadores", data);
    return res.data;
  },

   async update(id: number, data: CrearTrabajadorDto): Promise<Trabajador> {
    console.log('Enviando al backend:', data); // Para debugging
    
    const res = await api.put<Trabajador>(`/trabajadores/${id}`, data);
    return res.data;
  },
  // Eliminar un trabajador
  async delete(id: number): Promise<void> {
    await api.delete(`/trabajadores/${id}`);
  },
  
  async cambiarEstado(id: number, nuevoEstado: string): Promise<void> {
  await api.put(`/trabajadores/${id}/estado`, JSON.stringify(nuevoEstado), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
};
