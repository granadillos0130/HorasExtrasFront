import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://localhost:7042/api",
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true" // 🔧 Esto bypasea la advertencia
  }
});