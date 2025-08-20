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
      
      if (Array.isArray(data)) {
        setTrabajadores(data);
      } else {
        setTrabajadores([]);
        setError("Los datos recibidos no tienen el formato esperado");
      }
    } catch (err) {
      setError(`Error al cargar trabajadores: ${err instanceof Error ? err.message : 'Error desconocido'}`);
      setTrabajadores([]);
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