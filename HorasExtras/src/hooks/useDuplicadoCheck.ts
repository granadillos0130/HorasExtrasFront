import { useState, useEffect, useRef, useCallback } from "react";
import { registrosService } from "../api/registrosService";

interface RegistroExistente {
  id: number;
  trabajadorId: number;
  fecha: string;
}

// Verifica (con debounce de 300ms) si ya existen registros de un trabajador en una fecha dada.
// excluirId permite omitir el propio registro cuando se está editando uno existente.
export function useDuplicadoCheck(
  trabajadorId: number,
  fecha: string,
  excluirId?: number
) {
  const [registrosExistentes, setRegistrosExistentes] = useState<RegistroExistente[]>([]);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [verificandoRegistros, setVerificandoRegistros] = useState(false);

  const isMountedRef = useRef(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const verificar = useCallback(async (trabajadorIdActual: number, fechaActual: string) => {
    if (!isMountedRef.current || !trabajadorIdActual || !fechaActual) return;

    setVerificandoRegistros(true);
    try {
      const registros = await registrosService.obtenerTodosPorFecha(fechaActual);
      const registrosDelTrabajador = registros
        .filter((r: unknown) => {
          if (!r || typeof r !== "object" || !("trabajadorId" in r)) return false;
          const registro = r as { trabajadorId: number; id?: number };
          if (registro.trabajadorId !== trabajadorIdActual) return false;
          if (excluirId !== undefined && registro.id === excluirId) return false;
          return true;
        })
        .map((r: unknown) => r as RegistroExistente);

      if (isMountedRef.current) {
        setRegistrosExistentes(registrosDelTrabajador);
        setShowDuplicateWarning(registrosDelTrabajador.length > 0);
      }
    } catch (error) {
      console.error("Error al verificar registros existentes:", error);
      if (isMountedRef.current) {
        setRegistrosExistentes([]);
        setShowDuplicateWarning(false);
      }
    } finally {
      if (isMountedRef.current) {
        setVerificandoRegistros(false);
      }
    }
  }, [excluirId]);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (trabajadorId > 0 && fecha && isMountedRef.current) {
      timeoutRef.current = setTimeout(() => {
        verificar(trabajadorId, fecha);
      }, 300);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [trabajadorId, fecha, verificar]);

  return { registrosExistentes, showDuplicateWarning, verificandoRegistros };
}
