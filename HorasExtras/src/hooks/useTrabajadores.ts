import { useEffect, useState } from "react";
import { trabajadoresService } from "../api/trabajadoresService";
import type { Trabajador } from "../types/trabajadores";

export const useTrabajadores = () => {
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrabajadores = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await trabajadoresService.getAll();
      setTrabajadores(data);
    } catch (err) {
      setError("Error al cargar trabajadores.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrabajadores();
  }, []);

  return {
    trabajadores,
    loading,
    error,
    refetch: fetchTrabajadores,
  };
};
