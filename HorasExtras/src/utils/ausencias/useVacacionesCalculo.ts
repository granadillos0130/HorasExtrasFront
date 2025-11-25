import { useState, useEffect, useCallback } from 'react';
import { validarDiasVacaciones, calcularFechaFinVacaciones } from '../../api/ausenciasService';
import type { ValidacionVacaciones } from '../../types/ausencia';

export const useVacacionesCalculo = (
  esVacaciones: boolean,
  trabajadorId: number,
  fechaInicio: Date,
  fechaFin: Date,
  tipoAusencia: string
) => {
  const [diasVacaciones, setDiasVacaciones] = useState<number>(1);
  const [fechaFinCalculada, setFechaFinCalculada] = useState<Date | null>(null);
  const [fechaRegresoCalculada, setFechaRegresoCalculada] = useState<Date | null>(null);
  const [loadingCalculo, setLoadingCalculo] = useState(false);
  const [validacionVacaciones, setValidacionVacaciones] = useState<ValidacionVacaciones | null>(null);
  const [loadingValidacion, setLoadingValidacion] = useState(false);

  // Calcular fecha fin basada en días de vacaciones
  const calcularFechaFin = useCallback(async () => {
    if (!esVacaciones || !trabajadorId || !fechaInicio || diasVacaciones < 1) {
      setFechaFinCalculada(null);
      setFechaRegresoCalculada(null);
      return;
    }

    setLoadingCalculo(true);
    try {
      const resultado = await calcularFechaFinVacaciones({
        fechaInicio: fechaInicio,
        diasVacaciones: diasVacaciones,
        trabajadorId: trabajadorId
      });

      const fechaFin = new Date(resultado.fechaFin);
      const fechaRegreso = new Date(resultado.fechaRegreso);

      setFechaFinCalculada(fechaFin);
      setFechaRegresoCalculada(fechaRegreso);

      return fechaFin;
    } catch (error) {
      console.error("Error al calcular fecha fin:", error);
      setFechaFinCalculada(null);
      setFechaRegresoCalculada(null);
      return null;
    } finally {
      setLoadingCalculo(false);
    }
  }, [esVacaciones, trabajadorId, fechaInicio, diasVacaciones]);

  // Validar vacaciones
  const validarVacacionesSiAplica = useCallback(async () => {
    if (!esVacaciones || !trabajadorId || !fechaInicio || !fechaFin) {
      setValidacionVacaciones(null);
      return;
    }

    setLoadingValidacion(true);
    try {
      const validacion = await validarDiasVacaciones({
        fechaInicio: fechaInicio,
        fechaFin: fechaFin,
        tipoAusencia: tipoAusencia,
        trabajadorId: trabajadorId
      });
      setValidacionVacaciones(validacion);
    } catch (error) {
      console.error("Error al validar vacaciones:", error);
      setValidacionVacaciones(null);
    } finally {
      setLoadingValidacion(false);
    }
  }, [esVacaciones, trabajadorId, fechaInicio, fechaFin, tipoAusencia]);

  // Effect para calcular fecha fin
  useEffect(() => {
    if (esVacaciones && trabajadorId && fechaInicio && diasVacaciones >= 1) {
      const timeoutId = setTimeout(() => {
        calcularFechaFin();
      }, 500);

      return () => clearTimeout(timeoutId);
    } else {
      setFechaFinCalculada(null);
      setFechaRegresoCalculada(null);
    }
  }, [esVacaciones, calcularFechaFin, trabajadorId, fechaInicio, diasVacaciones]);

  // Effect para validar vacaciones
  useEffect(() => {
    if (esVacaciones && trabajadorId && fechaInicio && fechaFin) {
      const timeoutId = setTimeout(() => {
        validarVacacionesSiAplica();
      }, 500);

      return () => clearTimeout(timeoutId);
    } else {
      setValidacionVacaciones(null);
    }
  }, [esVacaciones, validarVacacionesSiAplica, trabajadorId, fechaInicio, fechaFin]);

  const resetVacaciones = () => {
    setDiasVacaciones(1);
    setFechaFinCalculada(null);
    setFechaRegresoCalculada(null);
    setValidacionVacaciones(null);
  };

  return {
    diasVacaciones,
    setDiasVacaciones,
    fechaFinCalculada,
    fechaRegresoCalculada,
    loadingCalculo,
    validacionVacaciones,
    loadingValidacion,
    calcularFechaFin,
    resetVacaciones,
  };
};