
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useIntensidadHoraria } from "../../hooks/trabajadores/useIntensidadHoraria";
import { useExportExcelIntensidad } from "../../hooks/trabajadores/useExportIntensidad";
import { formatDateForInput, getCurrentWeekRange, getRangoFechasTexto } from "../../utils/trabajadores/fechaUtils";
import { FiltrosIntensidad } from "../intensidad/FiltrosIntensidad";
import { ResumenHoras } from "../intensidad/ResumenHoras";
import { CentrosVisitados } from "../intensidad/CentrosVisitados";
import { BancoHorasInfo } from "../intensidad/BancoHorasInfo";
import { TablaRegistros } from "../intensidad/TablaRegistros";
import { EmptyStates } from "../intensidad/EmptyStates";
import type { Trabajador } from "../../types/trabajadores";
import "../../styles/components/trabajador/TrabajadorIntensidad.css";

const TrabajadorIntensidad: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const currentWeek = getCurrentWeekRange();
  const [fechaInicio, setFechaInicio] = useState<string>(formatDateForInput(currentWeek.inicio));
  const [fechaFin, setFechaFin] = useState<string>(formatDateForInput(currentWeek.fin));
  const [rangoPreseleccionado, setRangoPreseleccionado] = useState<string>("semana_actual");

  const {
    registros,
    trabajadores,
    trabajadorSeleccionado,
    trabajadorActual,
    loading,
    loadingRegistros,
    error,
    metadatosVista,
    setTrabajadorSeleccionado,
    setTrabajadorActual,
    getBancoHorasInfo,
    getCompensadosInfo,
    getResumenHoras,
    getCentrosVisitados,
  } = useIntensidadHoraria(id, fechaInicio, fechaFin);

  const { exportarExcel } = useExportExcelIntensidad();

  const handleTrabajadorChange = (trabajadorId: number, trabajador?: Trabajador) => {
    setTrabajadorSeleccionado(trabajadorId);
    setTrabajadorActual(trabajador || null);

    if (trabajadorId > 0) {
      navigate(`/trabajadores/${trabajadorId}/intensidad`, { replace: true });
    }
  };

  const handleRangoPreseleccionado = (rango: string) => {
    setRangoPreseleccionado(rango);
    const today = new Date();

    switch (rango) {
      case "hoy": {
        setFechaInicio(formatDateForInput(today));
        setFechaFin(formatDateForInput(today));
        break;
      }
      case "ayer": {
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        setFechaInicio(formatDateForInput(yesterday));
        setFechaFin(formatDateForInput(yesterday));
        break;
      }
      case "semana_actual": {
        const thisWeek = getCurrentWeekRange();
        setFechaInicio(formatDateForInput(thisWeek.inicio));
        setFechaFin(formatDateForInput(thisWeek.fin));
        break;
      }
      case "semana_pasada": {
        const lastWeekEnd = new Date(today);
        lastWeekEnd.setDate(today.getDate() - today.getDay() - 1);
        const lastWeekStart = new Date(lastWeekEnd);
        lastWeekStart.setDate(lastWeekEnd.getDate() - 6);
        setFechaInicio(formatDateForInput(lastWeekStart));
        setFechaFin(formatDateForInput(lastWeekEnd));
        break;
      }
      case "mes_actual": {
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        setFechaInicio(formatDateForInput(firstDayOfMonth));
        setFechaFin(formatDateForInput(lastDayOfMonth));
        break;
      }
      case "mes_pasado": {
        const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        setFechaInicio(formatDateForInput(firstDayLastMonth));
        setFechaFin(formatDateForInput(lastDayLastMonth));
        break;
      }
      case "personalizado":
        break;
      default:
        break;
    }
  };

  const handleExportarExcel = async () => {
    if (!trabajadorActual || registros.length === 0) return;
    
    const resumen = getResumenHoras();
    const centrosVisitados = getCentrosVisitados();
    
    await exportarExcel(
      trabajadorActual,
      registros,
      fechaInicio,
      fechaFin,
      centrosVisitados,
      resumen
    );
  };

  const resumen = getResumenHoras();
  const bancoInfo = getBancoHorasInfo();
  const compensadosInfo = getCompensadosInfo();

  if (loading) {
    return (
      <div className="trabajador-intensidad-page">
        <div className="page-container">
          <div className="loading-state">
            <div className="loading-spinner-large"></div>
            <h3>Cargando información...</h3>
            <p>Por favor espere un momento</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="trabajador-intensidad-page">
      <div className="page-container">
        <div className="page-header">
          <button className="btn-back" onClick={() => navigate("/trabajadores")}>
            ← Volver a Trabajadores
          </button>
          <h1>Intensidad Horaria por Trabajador</h1>
          <p className="page-subtitle">
            Consulta detallada de las horas trabajadas por período
          </p>
        </div>

        <FiltrosIntensidad
          trabajadores={trabajadores}
          trabajadorSeleccionado={trabajadorSeleccionado}
          onTrabajadorChange={handleTrabajadorChange}
          fechaInicio={fechaInicio}
          fechaFin={fechaFin}
          onFechaInicioChange={(fecha) => {
            setFechaInicio(fecha);
            setRangoPreseleccionado('personalizado');
          }}
          onFechaFinChange={(fecha) => {
            setFechaFin(fecha);
            setRangoPreseleccionado('personalizado');
          }}
          rangoPreseleccionado={rangoPreseleccionado}
          onRangoPreseleccionado={handleRangoPreseleccionado}
        />

        {trabajadorActual && (
          <div className="worker-info-card">
            <div className="worker-avatar-large">
              {trabajadorActual.nombre
                ?.split(' ')
                .map(word => word?.[0] || '')
                .join('')
                .toUpperCase()
                .substring(0, 2) || 'N/A'}
            </div>
            <div className="worker-details">
              <h3>{trabajadorActual.nombre}</h3>
              <div className="worker-meta">
                <span>CC: {trabajadorActual.cedula}</span>
                <span>ID: {trabajadorActual.id}</span>
                <span>{getRangoFechasTexto(fechaInicio, fechaFin)}</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}

        {loadingRegistros && (
          <div className="loading-message">
            🔄 Cargando registros de intensidad horaria...
          </div>
        )}

        {trabajadorSeleccionado > 0 && !loadingRegistros && (
          <>
            {registros.length > 0 ? (
              <>
                <ResumenHoras
                  resumen={resumen}
                  fechaInicio={fechaInicio}
                  fechaFin={fechaFin}
                  totalRegistros={registros.length}
                  onExportarExcel={handleExportarExcel}
                />

                <CentrosVisitados centros={getCentrosVisitados()} />

                {metadatosVista && (
                  <BancoHorasInfo
                    metadatosVista={metadatosVista}
                    bancoInfo={bancoInfo}
                    compensadosInfo={compensadosInfo}
                  />
                )}

                <TablaRegistros registros={registros} />
              </>
            ) : (
              <EmptyStates type="no-registros" trabajador={trabajadorActual!} />
            )}
          </>
        )}

        {trabajadorSeleccionado === 0 && !loading && (
          <EmptyStates type="no-seleccion" />
        )}
      </div>
    </div>
  );
};

export default TrabajadorIntensidad;
