import { useState } from "react";
import { registrosService } from "../api/registrosService";
import type { ResumenSemana } from "../types/ResumenSemana";

export const useResumenSemana = () => {
  const [resumen, setResumen] = useState<ResumenSemana | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buscarResumen = async (trabajadorId: number, mes: number, semana: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await registrosService.buscarPorSemana(trabajadorId, mes, semana);
      setResumen(data);
    } catch (err) {
      setError("No se encontró resumen.");
      setResumen(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    resumen,
    loading,
    error,
    buscarResumen,
  };
};
