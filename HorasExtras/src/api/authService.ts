import { api } from "./api";
import type { LoginRequest, LoginResponse, TrabajadorDto } from "../types/auth";

export const authService = {
  // Login
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>("/auth/login", credentials);
    
    // Si el login es exitoso, guardar token y usuario
    if (data.success && data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.trabajador));
    }
    
    return data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  // Obtener token
  getToken: (): string | null => {
    return localStorage.getItem("token");
  },

  // Obtener usuario actual
  getCurrentUser: (): TrabajadorDto | null => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  // Verificar si está autenticado
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("token");
  }
};