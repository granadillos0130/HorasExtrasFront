import axios from "axios";
import { authService } from "./authService";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5117/api",
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true"
  }
});

// Interceptor para agregar el token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores 401 (no autenticado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Si recibe 401, cerrar sesión y redirigir al login
      authService.logout();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);