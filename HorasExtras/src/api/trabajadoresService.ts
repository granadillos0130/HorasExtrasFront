import { api } from "../api/api";
import type { Trabajador, CrearTrabajadorDto } from "../types/trabajadores";

// Tipo para la respuesta de creación con imagen
interface CrearTrabajadorResponse {
  mensaje: string;
  trabajadorId: number;
  imagenUrl?: string;
  calculoValorHora: object;
  serviciosCreados: {
    eps: boolean;
    arl: boolean;
    pension: boolean;
    banco: boolean;
    clinica: boolean;
  };
}

export const trabajadoresService = {
  // Obtener todos los trabajadores
  async getAll(): Promise<Trabajador[]> {
    const res = await api.get<Trabajador[]>("/trabajadores");
    return res.data;
  },
  
  async getAnalistas(): Promise<{ id: number; nombreCompleto: string }[]> {
    const res = await api.get("/trabajadores/analistas");
    return res.data;
  },

  // Obtener un trabajador por ID
  async getById(id: number): Promise<Trabajador> {
    const res = await api.get<Trabajador>(`/trabajadores/${id}`);
    return res.data;
  },

  // Crear trabajador (con posibilidad de incluir imagen)
  async create(data: CrearTrabajadorDto): Promise<Trabajador> {
    const res = await api.post<Trabajador>("/trabajadores", data);
    return res.data;
  },

  // ✅ CORREGIDO: Crear trabajador con imagen usando FormData
  async createWithImage(data: CrearTrabajadorDto, imagen?: File): Promise<CrearTrabajadorResponse> {
    const formData = new FormData();
    
    // Agregar todos los campos del trabajador al FormData
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        // Convertir a string solo si no es ya un string
        const stringValue = typeof value === 'string' ? value : value.toString();
        formData.append(key, stringValue);
      }
    });

    // Agregar imagen si existe
    if (imagen) {
      formData.append('imagen', imagen);
      console.log('Imagen agregada al FormData:', imagen.name, imagen.size);
    } else {
      console.log('No hay imagen para agregar');
    }

    // Log para debugging
    console.log('FormData entries:');
    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }

    const res = await api.post<CrearTrabajadorResponse>("/trabajadores", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  async update(id: number, data: CrearTrabajadorDto): Promise<Trabajador> {
    console.log('Enviando al backend:', data);
    
    const res = await api.put<Trabajador>(`/trabajadores/${id}`, data);
    return res.data;
  },
  
  // ✅ NUEVO: Subir imagen a trabajador existente
  async subirImagen(id: number, imagen: File): Promise<{ mensaje: string; imagenUrl: string }> {
    const formData = new FormData();
    formData.append('imagen', imagen);

    const res = await api.post(`/trabajadores/${id}/imagen`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  // ✅ NUEVO: Eliminar imagen de trabajador
  async eliminarImagen(id: number): Promise<{ mensaje: string }> {
    const res = await api.delete(`/trabajadores/${id}/imagen`);
    return res.data;
  },

  // ✅ NUEVO: Obtener trabajadores no vigentes
  async getNoVigentes(): Promise<Trabajador[]> {
    const res = await api.get<Trabajador[]>("/trabajadores/novigentes");
    return res.data;
  },
  
  // Eliminar un trabajador
  async delete(id: number): Promise<void> {
    await api.delete(`/trabajadores/${id}`);
  },
  
  // Cambiar estado del trabajador
  async cambiarEstado(id: number, nuevoEstado: string): Promise<{
    mensaje: string;
    estado: string;
    fechaTerminacion?: string;
    cambioRealizado: string;
  }> {
    const res = await api.put(`/trabajadores/${id}/estado`, JSON.stringify(nuevoEstado), {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return res.data;
  }
};