// src/hooks/useRegistrosLote.ts
import { useState } from "react";
import { registrosLoteService } from "../api/registrosLoteService";
import type { RegistroInputDto } from "../types/registros";
import type { RegistroLoteResponse } from "../api/registrosLoteService";

export const useRegistrosLote = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<RegistroLoteResponse | null>(null);

  const crearLote = async (registros: RegistroInputDto[]): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const response = await registrosLoteService.crearLote(registros);
      setResultado(response);
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data || 
                          "Error al crear registros en lote";
      setError(errorMessage);
      console.error("Error al crear registros en lote:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setError(null);
    setResultado(null);
  };

  return {
    loading,
    error,
    resultado,
    crearLote,
    reset,
  };
};