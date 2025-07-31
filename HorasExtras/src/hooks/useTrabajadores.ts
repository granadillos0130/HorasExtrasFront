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
      
      // 🐛 Debug: Ver qué URL se está usando
      console.log('🌍 API Base URL:', import.meta.env.VITE_API_URL);
      console.log('🌍 Todas las variables:', import.meta.env);
      
      const data = await trabajadoresService.getAll();
      
      // 🐛 Debug: Ver qué datos llegan
      console.log('📦 Datos recibidos:', data);
      console.log('📦 Es array?:', Array.isArray(data));
      console.log('📦 Tipo:', typeof data);
      console.log('📦 Longitud:', data?.length);
      
      // ✅ Verificación extra de seguridad  
      if (Array.isArray(data)) {
        setTrabajadores(data);
      } else {
        console.error('⚠️ Los datos no son un array:', data);
        setTrabajadores([]);
        setError("Los datos recibidos no tienen el formato esperado");
      }
    } catch (err) {
      console.error('❌ Error completo:', err);
      setError(`Error al cargar trabajadores: ${err instanceof Error ? err.message : 'Error desconocido'}`);
      setTrabajadores([]); // ✅ Asegurar que siempre sea array
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