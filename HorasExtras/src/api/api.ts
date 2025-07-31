import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://localhost:7042/api",
  headers: {
    "Content-Type": "application/json"
  }
  // Puedes agregar más configuraciones aquí si es necesario
});