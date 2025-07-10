import { useState } from "react";
import { registrosService } from "../api/registrosService";
import type { Registro } from "../types/registros";

export const useRegistros = () => {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buscarPorId = async (trabajadorId: number, mes: number, semana: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await registrosService.buscarPorSemana(trabajadorId, mes, semana);
      // Ojo: este endpoint devuelve un solo resumen, si quieres mostrar en tabla
      // deberías usar otro endpoint que devuelva lista
      setRegistros([data]); // Por ahora, lo guardamos en un array
    } catch (err) {
      setError("No se encontraron registros.");
      setRegistros([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    registros,
    loading,
    error,
    buscarPorId, // 👈 ESTE ES EL QUE faltaba exportar
  };
};
