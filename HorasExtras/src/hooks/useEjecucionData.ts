import { useState, useCallback } from 'react';
import { centrosService } from '../api/centrosService';
import type { 
  MesConActividad, 
  EstadisticasMes, 
  TrabajadoresPorTipoHora, 
  TipoHora 
} from '../types/centros';
import type { 
  ManoObraData, 
  TrabajadorInfo, 
  TrabajadorManoObra, 
  DetalleDias, 
  CentroDelMes 
} from '../types/ejecucion';

export const useEjecucionData = (centroId: string) => {
  const [loading, setLoading] = useState(false);
  const [mesesConActividad, setMesesConActividad] = useState<MesConActividad[]>([]);
  const [estadisticasMes, setEstadisticasMes] = useState<EstadisticasMes | null>(null);
  const [trabajadoresPorTipo, setTrabajadoresPorTipo] = useState<TrabajadoresPorTipoHora | null>(null);
  const [manoObraData, setManoObraData] = useState<ManoObraData | null>(null);
  const [trabajadoresDelMes, setTrabajadoresDelMes] = useState<TrabajadorInfo[]>([]);
  const [trabajadoresManoObra, setTrabajadoresManoObra] = useState<TrabajadorManoObra[]>([]);
  const [detalleActual, setDetalleActual] = useState<DetalleDias | null>(null);

  const cargarMesesConActividad = useCallback(async (año: number) => {
    setLoading(true);
    try {
      const meses = await centrosService.obtenerMesesConActividad(centroId, año);
      setMesesConActividad(meses);
    } catch (error) {
      console.error("Error al cargar meses con actividad:", error);
      setMesesConActividad([]);
    } finally {
      setLoading(false);
    }
  }, [centroId]);

  const cargarEstadisticasMes = useCallback(async (mes: number, año: number) => {
    setLoading(true);
    try {
      const estadisticas = await centrosService.obtenerEstadisticasMes(centroId, mes, año);
      setEstadisticasMes(estadisticas);
    } catch (error) {
      console.error("Error al cargar estadísticas del mes:", error);
      setEstadisticasMes(null);
    } finally {
      setLoading(false);
    }
  }, [centroId]);

  const cargarTrabajadoresPorTipo = useCallback(async (mes: number, año: number, tipoHora: TipoHora) => {
    setLoading(true);
    try {
      const trabajadores = await centrosService.obtenerTrabajadoresPorTipoHora(centroId, mes, año, tipoHora);
      setTrabajadoresPorTipo(trabajadores);
    } catch (error) {
      console.error("Error al cargar trabajadores por tipo:", error);
      setTrabajadoresPorTipo(null);
    } finally {
      setLoading(false);
    }
  }, [centroId]);

  const cargarManoObraTotal = useCallback(async () => {
    setLoading(true);
    try {
      const data = await centrosService.obtenerManoObraTotal(centroId);
      setManoObraData(data);
    } catch (error) {
      console.error("Error al cargar mano de obra total:", error);
      setManoObraData(null);
    } finally {
      setLoading(false);
    }
  }, [centroId]);

  const cargarTrabajadoresDelMes = useCallback(async (mes: number, año: number) => {
    setLoading(true);
    try {
      const centrosData: CentroDelMes[] = await centrosService.obtenerPorMes(año, mes);
      const centroDelMes = centrosData.find(c => c.centroId === centroId);
      
      if (centroDelMes) {
        setTrabajadoresDelMes(centroDelMes.trabajadores);
        
        const manoObraPromises = centroDelMes.trabajadores.map((trabajador: TrabajadorInfo) =>
          centrosService.obtenerManoObraPorTrabajador(centroId, trabajador.trabajadorId)
        );
        
        const manoObraResults = await Promise.all(manoObraPromises);
        setTrabajadoresManoObra(manoObraResults);
      } else {
        setTrabajadoresDelMes([]);
        setTrabajadoresManoObra([]);
      }
    } catch (error) {
      console.error("Error al cargar trabajadores del mes:", error);
      setTrabajadoresDelMes([]);
      setTrabajadoresManoObra([]);
    } finally {
      setLoading(false);
    }
  }, [centroId]);

  const cargarDetalleTrabajador = useCallback(async (trabajadorId: number) => {
    setLoading(true);
    try {
      const detalle = await centrosService.obtenerDetalleDiasTrabajador(centroId, trabajadorId);
      // Adaptar la respuesta para que cumpla con DetalleDias
      setDetalleActual({
        centroId: detalle.centroId,
        centroCentroNombre: detalle.centroNombre,
        trabajadorId: detalle.trabajadorId,
        nombreTrabajador: detalle.nombreTrabajador,
        totalDias: detalle.detalleDias.length,
        detalleDias: detalle.detalleDias.map(d => ({
          fecha: d.fecha,
          diaSemana: '',
          horaIngreso: '',
          horaSalida: '',
          tiempoAlmuerzo: '',
          intensidadHoraria: 0,
          centroId: detalle.centroId,
          centroDia: '',
          horasNormales: d.horasNormales,
          extrasDiurnas: d.extrasDiurnas,
          extrasNocturnas: d.extrasNocturnas,
          dominicalesDiurnas: d.dominicalesDiurnas,
          dominicalesNocturnas: d.dominicalesNocturnas,
          totalHoras: d.totalHoras,
          desplazamientoIda: '',
          desplazamientoRegreso: '',
          esConductor: false,
          esCompensado: false,
          esFestivo: false,
          esAusencia: false
        }))
      });
    } catch (error) {
      console.error("Error al cargar detalle del trabajador:", error);
      setDetalleActual(null);
    } finally {
      setLoading(false);
    }
  }, [centroId]);

  return {
    loading,
    mesesConActividad,
    estadisticasMes,
    trabajadoresPorTipo,
    manoObraData,
    trabajadoresDelMes,
    trabajadoresManoObra,
    detalleActual,
    cargarMesesConActividad,
    cargarEstadisticasMes,
    cargarTrabajadoresPorTipo,
    cargarManoObraTotal,
    cargarTrabajadoresDelMes,
    cargarDetalleTrabajador
  };
};