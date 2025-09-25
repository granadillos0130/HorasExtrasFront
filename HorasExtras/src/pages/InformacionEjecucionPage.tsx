import React, { useState, useEffect } from "react";
import MesesView from "../components/ejecucion/MesesView";
import EstadisticasView from "../components/ejecucion/EstadisticasView";
import TrabajadoresView from "../components/ejecucion/TrabajadoresView";
import TrabajadoresPorTipoView from "../components/ejecucion/TrabajadoresPorTipoView";
import DetalleView from "../components/ejecucion/DetalleView";
import { useEjecucionData } from "../hooks/useEjecucionData";
import type { VistaEjecucion } from "../types/ejecucion";
import type { TipoHora } from "../types/centros";

interface Props {
  centroId: string;
  centroNombre: string;
  onVolver: () => void;
}

const InformacionEjecucionPage: React.FC<Props> = ({ centroId, centroNombre, onVolver }) => {
  const [mesSeleccionado, setMesSeleccionado] = useState<number | null>(null);
  const [añoSeleccionado, setAñoSeleccionado] = useState<number>(new Date().getFullYear());
  const [vistaActual, setVistaActual] = useState<VistaEjecucion>('meses');
  const [tipoHoraSeleccionado, setTipoHoraSeleccionado] = useState<TipoHora | null>(null);

  const {
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
  } = useEjecucionData(centroId);

  useEffect(() => {
    cargarMesesConActividad(añoSeleccionado);
  }, [añoSeleccionado, cargarMesesConActividad]);

  // Función helper para obtener el nombre del mes
  const getNombreMesSeleccionado = () => {
    if (!mesSeleccionado) return '';
    const mesInfo = mesesConActividad.find(m => m.mes === mesSeleccionado);
    return mesInfo ? mesInfo.nombreMes : '';
  };

  // Handlers de navegación
  const handleSeleccionarMes = (mes: number) => {
    setMesSeleccionado(mes);
    setVistaActual('estadisticas');
    cargarEstadisticasMes(mes, añoSeleccionado);
    cargarManoObraTotal();
  };

  const handleVerTrabajadores = () => {
    if (mesSeleccionado) {
      setVistaActual('trabajadores');
      cargarTrabajadoresDelMes(mesSeleccionado, añoSeleccionado);
    }
  };

  const handleVerTrabajadoresPorTipo = (tipoHora: TipoHora) => {
    if (mesSeleccionado) {
      setTipoHoraSeleccionado(tipoHora);
      setVistaActual('trabajadores-tipo');
      cargarTrabajadoresPorTipo(mesSeleccionado, añoSeleccionado, tipoHora);
    }
  };

  const handleVerDetalle = (trabajadorId: number) => {
    setVistaActual('detalle');
    cargarDetalleTrabajador(trabajadorId);
  };

  // Funciones de navegación hacia atrás
  const volverAMeses = () => {
    setVistaActual('meses');
    setMesSeleccionado(null);
    setTipoHoraSeleccionado(null);
  };

  const volverAEstadisticas = () => {
    setVistaActual('estadisticas');
    setTipoHoraSeleccionado(null);
  };

  const volverATrabajadores = () => {
    setVistaActual('trabajadores');
  };

  // Renderizado condicional según la vista
  switch (vistaActual) {
    case 'meses':
      return (
        <MesesView
          centroNombre={centroNombre}
          añoSeleccionado={añoSeleccionado}
          onAñoChange={setAñoSeleccionado}
          mesesConActividad={mesesConActividad}
          loading={loading}
          onSeleccionarMes={handleSeleccionarMes}
          onVolver={onVolver}
        />
      );

    case 'estadisticas':
      return (
        <EstadisticasView
          centroNombre={centroNombre}
          mesNombre={getNombreMesSeleccionado()}
          año={añoSeleccionado}
          estadisticasMes={estadisticasMes}
          loading={loading}
          onVolver={volverAMeses}
          onVerTrabajadores={handleVerTrabajadores}
          onVerTrabajadoresPorTipo={handleVerTrabajadoresPorTipo}
        />
      );

    case 'trabajadores':
      return (
        <TrabajadoresView
          centroNombre={centroNombre}
          mesNombre={getNombreMesSeleccionado()}
          año={añoSeleccionado}
          trabajadores={trabajadoresDelMes}
          trabajadoresManoObra={trabajadoresManoObra}
          manoObraData={manoObraData}
          loading={loading}
          onVolver={volverAEstadisticas}
          onVerDetalle={handleVerDetalle}
        />
      );

    case 'trabajadores-tipo':
      return (
        <TrabajadoresPorTipoView
          centroNombre={centroNombre}
          mesNombre={getNombreMesSeleccionado()}
          año={añoSeleccionado}
          trabajadoresPorTipo={trabajadoresPorTipo}
          tipoHora={tipoHoraSeleccionado!}
          loading={loading}
          onVolver={volverAEstadisticas}
          onVerDetalle={handleVerDetalle}
        />
      );

    case 'detalle':
      return (
        <DetalleView
          centroNombre={centroNombre}
          mesNombre={getNombreMesSeleccionado()}
          año={añoSeleccionado}
          detalle={detalleActual}
          loading={loading}
          onVolver={volverATrabajadores}
        />
      );

    default:
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Vista no encontrada: {vistaActual}</h2>
          <button onClick={volverAMeses}>Volver a Meses</button>
        </div>
      );
  }
};

export default InformacionEjecucionPage;