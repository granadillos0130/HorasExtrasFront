/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { huelleroService } from '../api/huelleroService';

export const useHuellero = () => {
  const [sincronizando, setSincronizando] = useState(false);

  const sincronizarAsistencia = async (
    fecha: string,
    onSuccess?: () => void
  ): Promise<boolean> => {
    if (!fecha) return false;

    const confirmacion = confirm(
      `¿Sincronizar registros desde el huellero para esta fecha?\n\n` +
      `Esto creará automáticamente los registros de todos los trabajadores que marcaron entrada/salida ese día.`
    );

    if (!confirmacion) return false;

    setSincronizando(true);
    try {
      const resultado = await huelleroService.sincronizarAsistencia(fecha, true);
      
      const mensaje = `✅ Sincronización completada!\n\n` +
        `📊 Resumen:\n` +
        `• Registros completos: ${resultado.registrosCreados}\n` +
        `• Con estimación: ${resultado.registrosConFallback}\n` +
        `• Omitidos: ${resultado.registrosOmitidos}\n` +
        `• Total: ${resultado.resumen.total}`;
      
      alert(mensaje);

      if (onSuccess) {
        onSuccess();
      }

      return true;
    } catch (error: any) {
      console.error("Error al sincronizar huellero:", error);
      const errorMsg = error?.response?.data?.error || error?.message || "Error desconocido";
      alert(`❌ Error al sincronizar:\n\n${errorMsg}`);
      return false;
    } finally {
      setSincronizando(false);
    }
  };

  return {
    sincronizando,
    sincronizarAsistencia
  };
};