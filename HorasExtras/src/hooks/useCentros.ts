// src/hooks/useCentros.ts
import { useState, useEffect } from "react";
import { centrosService } from "../api/centrosService";
import type { Centro } from "../types/centros";

export const useCentros = () => {
  const [centros, setCentros] = useState<Centro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarCentros = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await centrosService.getAll();
      setCentros(data);
    } catch (err) {
      setError("Error al cargar centros");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCentros();
  }, []);

  return {
    centros,
    loading,
    error,
    refetch: cargarCentros,
  };
};