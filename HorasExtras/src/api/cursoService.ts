import { api } from "./api";
import type { Curso } from "../types/curso";
export const cursosService = {
  
  async getAll(): Promise<Curso[]> {
    try {
      const res = await api.get("/cursos");
      return res.data.map((c: any) => ({
        id: c.idCurso,
        nombre: c.nombreCurso,
        descripcion: c.descripcion
      }));
    } catch (error) {
      console.error("Error al obtener cursos:", error);
      throw error;
    }
  },

  // Obtener curso por ID
  async getById(id: number): Promise<Curso> {
    try {
      const res = await api.get(`/cursos/${id}`);
      const c = res.data;
      return {
        id: c.idCurso,
        nombre: c.nombreCurso,
        descripcion: c.descripcion
      };
    } catch (error) {
      console.error("Error al obtener curso por ID:", error);
      throw error;
    }
  },

  // Buscar cursos por nombre
  async buscarPorNombre(nombre: string): Promise<Curso[]> {
    try {
      const res = await api.get("/cursos/buscar", { params: { nombre } });
      return res.data.map((c: any) => ({
        id: c.idCurso,
        nombre: c.nombreCurso,
        descripcion: c.descripcion
      }));
    } catch (error) {
      console.error("Error al buscar cursos por nombre:", error);
      throw error;
    }
  },

  // Crear curso
  async crear(curso: Omit<Curso, "id">): Promise<Curso> {
    try {
      const res = await api.post("/cursos", {
        nombreCurso: curso.nombre,
        descripcion: curso.descripcion
      });
      const c = res.data;
      return {
        id: c.idCurso,
        nombre: c.nombreCurso,
        descripcion: c.descripcion
      };
    } catch (error) {
      console.error("Error al crear curso:", error);
      throw error;
    }
  },

  // Actualizar curso
  async actualizar(id: number, curso: Partial<Curso>): Promise<Curso> {
    try {
      const res = await api.put(`/cursos/${id}`, {
        nombreCurso: curso.nombre,
        descripcion: curso.descripcion
      });
      const c = res.data;
      return {
        id: c.idCurso,
        nombre: c.nombreCurso,
        descripcion: c.descripcion
      };
    } catch (error) {
      console.error("Error al actualizar curso:", error);
      throw error;
    }
  },

  // Eliminar curso
  async eliminar(id: number): Promise<void> {
    try {
      await api.delete(`/cursos/${id}`);
    } catch (error) {
      console.error("Error al eliminar curso:", error);
      throw error;
    }
  },
  async getEstadisticasGenerales() {
    try {
      const res = await api.get("/cursos/estadisticas");
      return res.data;
    } catch (error) {
      console.error("Error al obtener estadísticas generales:", error);
      throw error;
    }
  },

  // Obtener estadísticas específicas de un curso
  async getEstadisticasCurso(idCurso: number) {
    try {
      const res = await api.get(`/cursos/${idCurso}/estadisticas`);
      return res.data;
    } catch (error) {
      console.error("Error al obtener estadísticas del curso:", error);
      throw error;
    }
  },

  // Obtener resumen rápido de cursos
  async getResumenRapido() {
    try {
      const res = await api.get("/cursos/estadisticas/resumen");
      return res.data;
    } catch (error) {
      console.error("Error al obtener resumen rápido:", error);
      throw error;
    }
  },

  // Obtener total de horas de un curso
  async getHorasCurso(idCurso: number, fechaInicio?: string, fechaFin?: string) {
    try {
      const params: any = {};
      if (fechaInicio) params.fechaInicio = fechaInicio;
      if (fechaFin) params.fechaFin = fechaFin;
      
      const res = await api.get(`/cursos/${idCurso}/horas`, { params });
      return res.data;
    } catch (error) {
      console.error("Error al obtener horas del curso:", error);
      throw error;
    }
  },

  // Obtener todos los cursos para el selector
  async getAllCursos() {
    try {
      const res = await api.get("/cursos");
      return res.data.map((c: any) => ({
        id: c.idCurso,
        nombre: c.nombreCurso,
        descripcion: c.descripcion
      }));
    } catch (error) {
      console.error("Error al obtener cursos:", error);
      throw error;
    }
  }
};
