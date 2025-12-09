/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/trabajadores/useIntensidadConsolidada.ts
import { useState, useEffect } from 'react';
import { registrosService } from '../../api/registrosService';
import type { 
  RespuestaConsolidadoIntensidad,
  TrabajadorConsolidado,
  TotalesHoras 
} from '../../types/consolidado'; // o de donde los hayas puesto

interface UseIntensidadConsolidadaReturn {
  trabajadores: TrabajadorConsolidado[];
  totalesGenerales: TotalesHoras | null;
  loading: boolean;
  error: string | null;
  totalTrabajadores: number;
  diasEnRango: number;
  refetch: () => Promise<void>;
}

export const useIntensidadConsolidada = (
  fechaInicio: string,
  fechaFin: string,
  estadoFiltro: string = 'todos',
  busqueda: string = ''
): UseIntensidadConsolidadaReturn => {
  const [trabajadores, setTrabajadores] = useState<TrabajadorConsolidado[]>([]);
  const [totalesGenerales, setTotalesGenerales] = useState<TotalesHoras | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalTrabajadores, setTotalTrabajadores] = useState(0);
  const [diasEnRango, setDiasEnRango] = useState(0);

  const fetchData = async () => {
    // Validación básica de fechas
    if (!fechaInicio || !fechaFin) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response: RespuestaConsolidadoIntensidad = 
        await registrosService.obtenerConsolidadoRangoFechas(
          fechaInicio,
          fechaFin,
          estadoFiltro,
          busqueda
        );

      if (response.success) {
        setTrabajadores(response.trabajadores);
        setTotalesGenerales(response.totalesGenerales);
        setTotalTrabajadores(response.metadata.totalTrabajadores);
        setDiasEnRango(response.metadata.diasEnRango);
      } else {
        setError('No se pudieron obtener los datos consolidados');
      }
    } catch (err: any) {
      console.error('Error en useIntensidadConsolidada:', err);
      setError(err?.message || 'Error al cargar datos consolidados');
      setTrabajadores([]);
      setTotalesGenerales(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fechaInicio, fechaFin, estadoFiltro, busqueda]);

  const refetch = async () => {
    await fetchData();
  };

  return {
    trabajadores,
    totalesGenerales,
    loading,
    error,
    totalTrabajadores,
    diasEnRango,
    refetch,
  };
};