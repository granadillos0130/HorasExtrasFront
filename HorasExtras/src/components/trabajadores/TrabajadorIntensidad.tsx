import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useIntensidadHoraria } from "../../hooks/trabajadores/useIntensidadHoraria";
import { useExportExcelIntensidad } from "../../hooks/trabajadores/useExportIntensidad";
import { formatDateForInput, getCurrentWeekRange, getRangoFechasTexto } from "../../utils/trabajadores/fechaUtils";
import { FiltrosIntensidad } from "../intensidad/FiltrosIntensidad";
import { CentrosVisitados } from "../intensidad/CentrosVisitados";
import { BancoHorasInfo } from "../intensidad/BancoHorasInfo";
import { TablaRegistros } from "../intensidad/TablaRegistros";
import { EmptyStates } from "../intensidad/EmptyStates";
import type { Trabajador } from "../../types/trabajadores";

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
      <div style={pageContainerStyle}>
        <div style={loadingContainerStyle}>
          <div style={loadingSpinnerStyle}></div>
          <h3 style={{ margin: '16px 0 8px 0', color: '#1e293b', fontSize: '1.2rem' }}>
            Cargando información...
          </h3>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
            Procesando datos del trabajador
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={pageContainerStyle}>
      <div style={contentWrapperStyle}>
        {/* Header compacto */}
        <div style={headerContainerStyle}>
          <button style={backButtonStyle} onClick={() => navigate("/trabajadores")}>
            ← Regresar
          </button>
          <h1 style={titleStyle}>
            INTENSIDAD HORARIA POR TRABAJADOR
          </h1>
        </div>

        {/* Filtros */}
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

        {/* Mensajes de error y loading */}
        {error && (
          <div style={errorMessageStyle}>
            ❌ {error}
          </div>
        )}

        {loadingRegistros && (
          <div style={loadingMessageStyle}>
            <div style={smallSpinnerStyle}></div>
            <span>Cargando registros de intensidad horaria...</span>
          </div>
        )}

        {/* Contenido principal */}
        {trabajadorSeleccionado > 0 && !loadingRegistros && (
          <>
            {registros.length > 0 ? (
              <>
                {/* Header del resumen con botón de exportar */}
                <div style={resumenHeaderStyle}>
                  <div>
                    <h3 style={resumenTitleStyle}>RESUMEN DEL PERÍODO</h3>
                    <p style={resumenSubtitleStyle}>
                      {trabajadorActual?.nombre} • {getRangoFechasTexto(fechaInicio, fechaFin)} • {registros.length} registro{registros.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <button style={exportButtonStyle} onClick={handleExportarExcel}>
                    <span>📥</span>
                    <span>Exportar Excel</span>
                  </button>
                </div>

                <CentrosVisitados centros={getCentrosVisitados()} />

                {metadatosVista && (
                  <BancoHorasInfo
                    metadatosVista={metadatosVista}
                    bancoInfo={bancoInfo}
                    compensadosInfo={compensadosInfo}
                  />
                )}

                <TablaRegistros registros={registros} resumen={resumen} />
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

// Estilos
const pageContainerStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: '#f1f5f9',
  padding: '20px',
};

const contentWrapperStyle: React.CSSProperties = {
  maxWidth: '1600px',
  margin: '0 auto',
};

const headerContainerStyle: React.CSSProperties = {
  textAlign: 'center',
  marginBottom: '30px',
  position: 'relative',
};

const backButtonStyle: React.CSSProperties = {
  position: 'absolute',
  left: 0,
  top: '50%',
  transform: 'translateY(-50%)',
  padding: '8px 16px',
  background: 'white',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  fontSize: '0.9rem',
  fontWeight: '500',
  color: '#475569',
  cursor: 'pointer',
  transition: 'all 0.2s',
};

const titleStyle: React.CSSProperties = {
  fontSize: '2rem',
  fontWeight: '700',
  color: '#1e293b',
  margin: 0,
};

const loadingContainerStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: '12px',
  padding: '60px',
  textAlign: 'center',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
};

const loadingSpinnerStyle: React.CSSProperties = {
  width: '48px',
  height: '48px',
  border: '4px solid #e2e8f0',
  borderTop: '4px solid #3b82f6',
  borderRadius: '50%',
  margin: '0 auto',
  animation: 'spin 1s linear infinite',
};

const errorMessageStyle: React.CSSProperties = {
  background: 'white',
  border: '2px solid #fee2e2',
  borderRadius: '12px',
  padding: '16px 20px',
  marginBottom: '20px',
  color: '#991b1b',
  fontSize: '0.9rem',
  fontWeight: '500',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const loadingMessageStyle: React.CSSProperties = {
  background: 'white',
  border: '2px solid #dbeafe',
  borderRadius: '12px',
  padding: '16px 20px',
  marginBottom: '20px',
  color: '#1e40af',
  fontSize: '0.9rem',
  fontWeight: '500',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
};

const smallSpinnerStyle: React.CSSProperties = {
  width: '20px',
  height: '20px',
  border: '3px solid #dbeafe',
  borderTop: '3px solid #3b82f6',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
};

const resumenHeaderStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: '12px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  padding: '20px 28px',
  marginBottom: '20px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '16px',
};

const resumenTitleStyle: React.CSSProperties = {
  margin: '0 0 4px 0',
  fontSize: '1.1rem',
  fontWeight: '700',
  color: '#1e293b',
};

const resumenSubtitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.875rem',
  color: '#64748b',
};

const exportButtonStyle: React.CSSProperties = {
  padding: '10px 20px',
  background: '#3b82f6',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '0.9rem',
  fontWeight: '600',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  transition: 'all 0.2s',
};

export default TrabajadorIntensidad;