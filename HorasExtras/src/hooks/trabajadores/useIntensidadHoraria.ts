import { useState, useEffect } from 'react';
import { registrosService } from '../../api/registrosService';
import { trabajadoresService } from '../../api/trabajadoresService';
import type { Registro, RespuestaIntensidadHoraria } from '../../types/registros';
import type { Trabajador } from '../../types/trabajadores';

export const useIntensidadHoraria = (trabajadorId?: string, fechaInicio?: string, fechaFin?: string) => {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [trabajadorSeleccionado, setTrabajadorSeleccionado] = useState<number>(0);
  const [trabajadorActual, setTrabajadorActual] = useState<Trabajador | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingRegistros, setLoadingRegistros] = useState(false);
  const [error, setError] = useState("");

  const [metadatosVista, setMetadatosVista] = useState<{
    tipoVista: string;
    trabajadorUsaBanco: boolean;
    valoresMostrados: string;
    informacionAdicional?: RespuestaIntensidadHoraria['informacionAdicional'];
  } | null>(null);

  // Cargar trabajadores al inicio
  useEffect(() => {
    const cargarTrabajadores = async () => {
      try {
        setLoading(true);
        const data = await trabajadoresService.getAll();
        setTrabajadores(data);

        if (trabajadorId) {
          const id = Number(trabajadorId);
          setTrabajadorSeleccionado(id);
          const trabajador = data.find(t => t.id === id);
          if (trabajador) {
            setTrabajadorActual(trabajador);
            if (fechaInicio && fechaFin) {
              await cargarRegistros(id, fechaInicio, fechaFin);
            }
          }
        }
      } catch (err) {
        setError("Error cargando trabajadores.");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    cargarTrabajadores();
  }, [trabajadorId, fechaInicio, fechaFin]);

  // Cargar registros cuando cambien las fechas
  useEffect(() => {
    if (trabajadorSeleccionado > 0 && fechaInicio && fechaFin) {
      cargarRegistros(trabajadorSeleccionado, fechaInicio, fechaFin);
    }
  }, [fechaInicio, fechaFin, trabajadorSeleccionado]);

  const cargarRegistros = async (id: number, inicio: string, fin: string) => {
    try {
      setLoadingRegistros(true);
      setError("");

      const response = await registrosService.buscarPorTrabajadorRangoFechas(
        id,
        inicio,
        fin
      ) as RespuestaIntensidadHoraria;

      setRegistros(response.data || []);

      if (response.tipoVista) {
        setMetadatosVista({
          tipoVista: response.tipoVista,
          trabajadorUsaBanco: response.trabajadorUsaBanco,
          valoresMostrados: response.valoresMostrados,
          informacionAdicional: response.informacionAdicional
        });
      } else {
        setMetadatosVista(null);
      }

    } catch (err) {
      console.error('Error cargando registros:', err);
      setError("Error cargando la intensidad horaria.");
      setRegistros([]);
      setMetadatosVista(null);
    } finally {
      setLoadingRegistros(false);
    }
  };

  const getBancoHorasInfo = () => {
    if (!metadatosVista?.informacionAdicional) return null;

    if (metadatosVista.tipoVista === "Semanal" && metadatosVista.informacionAdicional.semanaEspecifica) {
      const semana = metadatosVista.informacionAdicional.semanaEspecifica;
      const contexto = metadatosVista.informacionAdicional.contextoBanco;

      return {
        tipo: "semanal" as const,
        horasBase: semana.horasBase,
        horasTrabajadas: semana.horasTrabajadas,
        excesoDeficit: semana.excesoDeficit,
        estado: semana.estado,
        totalSegunExcel: contexto?.totalHorasSegunExcel || 0,
        horasSobrantes: contexto?.horasSobrantes || 0,
        horasFaltantes: contexto?.horasFaltantes || 0,
        mensaje: contexto?.mensaje || ''
      };
    }

    if (metadatosVista.tipoVista === "Mensual" && metadatosVista.informacionAdicional.bancoHoras) {
      return {
        tipo: "mensual" as const,
        bancoHoras: metadatosVista.informacionAdicional.bancoHoras,
        desgloseSemanas: metadatosVista.informacionAdicional.desgloseSemanas,
        resumenPeriodo: metadatosVista.informacionAdicional.resumenPeriodo
      };
    }

    return null;
  };

  const getCompensadosInfo = () => {
    if (!metadatosVista?.informacionAdicional?.compensados) return null;
    return metadatosVista.informacionAdicional.compensados;
  };

  const getResumenHoras = () => {
    const totales = registros.reduce(
      (acc, registro) => ({
        normales: acc.normales + (registro.horasNormales || 0),
        extrasDiurnas: acc.extrasDiurnas + (registro.horasExtrasDiurnas || 0),
        extrasNocturnas: acc.extrasNocturnas + (registro.horasExtrasNocturnas || 0),
        domDiurnas: acc.domDiurnas + (registro.extrasDominicalesDiurnas || 0),
        domNocturnas: acc.domNocturnas + (registro.extrasDominicalesNocturnas || 0),
        total: acc.total + (registro.totalHoras || 0),
      }),
      { normales: 0, extrasDiurnas: 0, extrasNocturnas: 0, domDiurnas: 0, domNocturnas: 0, total: 0 }
    );
    return totales;
  };

  const getCentrosVisitados = () => {
    const centrosUnicos = [...new Set(
      registros
        .filter(r => r.nombreCentro && r.nombreCentro !== 'Sin centro')
        .map(r => r.nombreCentro)
    )];
    return centrosUnicos;
  };

  return {
    // Estados
    registros,
    trabajadores,
    trabajadorSeleccionado,
    trabajadorActual,
    loading,
    loadingRegistros,
    error,
    metadatosVista,

    // Funciones
    setTrabajadorSeleccionado,
    setTrabajadorActual,
    cargarRegistros,
    getBancoHorasInfo,
    getCompensadosInfo,
    getResumenHoras,
    getCentrosVisitados,
  };
};