/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { registrosService } from "../api/registrosService";
import type { Registro } from "../types/registros";

export const useRegistros = () => {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buscarRegistros = async (trabajadorId: number, mes: number, semana: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await registrosService.buscarPorTrabajadorMesSemana(trabajadorId, mes, semana);
      setRegistros(data);
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
    buscarRegistros,
  };
};
