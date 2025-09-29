import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { compensadoService } from "../api/compensadosService";
import type { Compensado } from "../types/compensado";
import "../styles/pages/CompensadosPage.css";

const meses = [
  "Enero", "Febrero", "Marzo", "Abril",
  "Mayo", "Junio", "Julio", "Agosto",
  "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export function CompensadosPage() {
  const [anio] = useState(new Date().getFullYear());
  const [mesSeleccionado, setMesSeleccionado] = useState<number | null>(null);
  const [compensados, setCompensados] = useState<Compensado[]>([]);
  const [loading, setLoading] = useState(false);
  const [compensadoACancelar, setCompensadoACancelar] = useState<Compensado | null>(null);
  const [cancelando, setCancelando] = useState(false);
  const navigate = useNavigate();

  const cargarCompensados = async (mes: number) => {
    setMesSeleccionado(mes);
    setLoading(true);
    try {
      const data = await compensadoService.getPorMes(anio, mes + 1);
      console.log("Compensados recibidos:", data);
      setCompensados(data);
    } catch (error) {
      console.error("Error al cargar compensados:", error);
    } finally {
      setLoading(false);
    }
  };

  const confirmarCancelacion = (compensado: Compensado) => {
    setCompensadoACancelar(compensado);
  };

  const cancelarCompensado = async () => {
    if (!compensadoACancelar) return;
    
    setCancelando(true);
    try {
      await compensadoService.cancelarCompensado(compensadoACancelar.id);
      
      setCompensados(prev => prev.map(c => 
        c.id === compensadoACancelar.id 
          ? { ...c, estado: "CANCELADO" }
          : c
      ));
      setCompensadoACancelar(null);
      
      console.log(`✅ Compensado ${compensadoACancelar.id} cancelado correctamente`);
    } catch (error) {
      console.error("Error al cancelar compensado:", error);
      alert("Error al cancelar el compensado. Por favor, intenta de nuevo.");
    } finally {
      setCancelando(false);
    }
  };

  const editarCompensado = (compensado: Compensado) => {
    navigate(`/compensados/editar/${compensado.id}`);
  };

  const getEstadoBadgeClass = (estado: string): string => {
    switch (estado) {
      case "ACTIVO":
        return "activo";
      case "CANCELADO":
        return "cancelado";
      default:
        return "default";
    }
  };

  const getEstadoIcon = (estado: string): string => {
    switch (estado) {
      case "ACTIVO":
        return "✅";
      case "CANCELADO":
        return "❌";
      default:
        return "❓";
    }
  };

  const formatFecha = (fechaString: string): string => {
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatPeriodoOrigen = (inicio: string, fin: string): string => {
    const fechaInicio = new Date(inicio);
    const fechaFin = new Date(fin);
    return `${fechaInicio.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })} - ${fechaFin.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}`;
  };

  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const calcularTotalHoras = () => {
    return compensados
      .filter(c => c.estado === "ACTIVO")
      .reduce((total, c) => total + c.horasCompensadas, 0);
  };

  return (
    <div className="compensados-container">
      <div className="compensados-header">
        <h1 className="compensados-title">Compensados por Mes - {anio}</h1>
        <div className="header-buttons">
          <button 
            className="estadisticas-btn" 
            onClick={() => navigate("/compensados/estadisticas")}
          >
            📊 Ver Estadísticas
          </button>
          <button 
            className="ausencias-btn" 
            onClick={() => navigate("/ausencias")}
          >
            📋 Ver Ausencias
          </button>
          <button 
            className="crear-compensado-btn" 
            onClick={() => navigate("/compensados/nueva")}
          >
            + Crear Compensado
          </button>
        </div>
      </div>

      <div className="meses-grid">
        {meses.map((mes, i) => (
          <button
            key={i}
            className={`mes-btn ${mesSeleccionado === i ? "seleccionado" : ""}`}
            onClick={() => cargarCompensados(i)}
          >
            {mes}
          </button>
        ))}
      </div>

      {mesSeleccionado !== null && (
        <div className="resultado-compensados">
          <h2 className="compensados-subtitle">
            Compensados en {meses[mesSeleccionado]}
          </h2>

          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p className="loading-text">Cargando compensados de {meses[mesSeleccionado]}...</p>
            </div>
          ) : compensados.length === 0 ? (
            <div className="no-data-container">
              <div className="no-data-icon">💳</div>
              <p className="no-data-text">
                No hay compensados registrados en {meses[mesSeleccionado]}.
              </p>
              <button 
                className="crear-primer-btn"
                onClick={() => navigate("/compensados/nueva")}
              >
                ➕ Registrar Primer Compensado
              </button>
            </div>
          ) : (
            <div className="table-container">
              {/* Estadísticas rápidas */}
              <div className="stats-summary">
                <span className="total-compensados">
                  📊 Total: <strong>{compensados.length}</strong>
                </span>
                <span className="badge badge-success">
                  ✅ Activos: <strong>{compensados.filter(c => c.estado === "ACTIVO").length}</strong>
                </span>
                <span className="badge badge-warning">
                  ❌ Cancelados: <strong>{compensados.filter(c => c.estado === "CANCELADO").length}</strong>
                </span>
                <span className="badge badge-info">
                  ⏰ Total Horas: <strong>{calcularTotalHoras()}h</strong>
                </span>
              </div>

              <table className="compensados-table">
                <thead>
                  <tr>
                    <th><span className="header-icon">👤</span>Trabajador</th>
                    <th><span className="header-icon">🏢</span>Centro</th>
                    <th><span className="header-icon">📅</span>Fecha Compensado</th>
                    <th><span className="header-icon">🕐</span>Horario</th>
                    <th><span className="header-icon">⏰</span>Horas Compensadas</th>
                    <th><span className="header-icon">📊</span>Período Origen</th>
                    <th><span className="header-icon">💰</span>Balance Usado</th>
                    <th><span className="header-icon">📝</span>Descripción</th>
                    <th><span className="header-icon">🔄</span>Estado</th>
                    <th><span className="header-icon">⚙️</span>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {compensados.map((c, index) => (
                    <tr 
                      key={c.id} 
                      className={`table-row ${index % 2 === 0 ? 'even' : 'odd'} ${c.estado === 'CANCELADO' ? 'cancelado' : ''}`}
                    >
                      {/* Trabajador */}
                      <td className="trabajador-cell">
                        <div className="trabajador-info">
                          <span className="trabajador-avatar">👤</span>
                          <div>
                            <div className="trabajador-nombre">{c.trabajadorNombre}</div>
                            <small style={{ color: '#6b7280' }}>ID: {c.id}</small>
                          </div>
                        </div>
                      </td>

                      {/* Centro */}
                      <td className="centro-cell">
                        <span className="centro-badge">{c.centroNombre}</span>
                      </td>

                      {/* Fecha Compensado */}
                      <td className="fecha-cell">
                        <span className="fecha-badge">
                          📅 {formatFecha(c.fecha)}
                        </span>
                      </td>

                      {/* Horario */}
                      <td className="horario-cell">
                        <div className="horario-info">
                          <span className="hora-badge ingreso">🕐 {c.horaInicio}</span>
                          <span className="separador">-</span>
                          <span className="hora-badge salida">🕐 {c.horaFin}</span>
                        </div>
                      </td>

                      {/* Horas Compensadas */}
                      <td className="horas-cell">
                        <span className="horas-badge">
                          ⏰ {c.horasCompensadas}h
                        </span>
                      </td>

                      {/* Período Origen */}
                      <td className="periodo-cell">
                        <div 
                          className="periodo-info"
                          title={`Período del cual se tomaron las horas: ${formatPeriodoOrigen(c.periodoOrigenInicio, c.periodoOrigenFin)}`}
                        >
                          <span className="periodo-badge">
                            📊 {formatPeriodoOrigen(c.periodoOrigenInicio, c.periodoOrigenFin)}
                          </span>
                        </div>
                      </td>

                      {/* Balance Usado */}
                      <td className="balance-cell">
                        <div className="balance-info">
                          <div className="balance-antes">
                            💰 Antes: <strong>{c.horasDisponiblesAntes}h</strong>
                          </div>
                          <div className="balance-despues">
                            💸 Después: <strong>{c.horasDisponiblesDespues}h</strong>
                          </div>
                        </div>
                      </td>

                      {/* Descripción */}
                      <td className="descripcion-cell">
                        <div 
                          className="descripcion-tooltip"
                          title={c.descripcion && c.descripcion.length > 30 ? c.descripcion : undefined}
                        >
                          {c.descripcion ? truncateText(c.descripcion, 30) : "Sin descripción"}
                        </div>
                      </td>

                      {/* Estado */}
                      <td>
                        <span className={`estado-badge ${getEstadoBadgeClass(c.estado)}`}>
                          {getEstadoIcon(c.estado)} {c.estado}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="acciones-cell">
                        <div className="acciones-buttons">
                          {c.estado === "ACTIVO" && (
                            <>
                              <button
                                className="btn-editar"
                                onClick={() => editarCompensado(c)}
                                title="Editar compensado"
                              >
                                ✏️
                              </button>
                              <button
                                className="btn-cancelar"
                                onClick={() => confirmarCancelacion(c)}
                                title="Cancelar compensado"
                              >
                                ❌
                              </button>
                            </>
                          )}
                          {c.estado === "CANCELADO" && (
                            <span className="estado-info" title="Compensado cancelado">
                              🚫 Cancelado
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Footer de la tabla */}
              <div style={{
                padding: '1rem',
                background: '#f9fafb',
                borderTop: '1px solid #e5e7eb',
                textAlign: 'center',
                color: '#6b7280',
                fontSize: '0.875rem'
              }}>
                📊 Mostrando {compensados.length} compensado{compensados.length !== 1 ? 's' : ''} 
                de {meses[mesSeleccionado]} {anio} - Total horas activas: {calcularTotalHoras()}h
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de confirmación para cancelar */}
      {compensadoACancelar && (
        <div className="modal-overlay" onClick={() => setCompensadoACancelar(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>❌ Confirmar Cancelación</h3>
              <button 
                className="modal-close"
                onClick={() => setCompensadoACancelar(null)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <p>¿Estás seguro de que quieres cancelar este compensado?</p>
              
              <div className="compensado-details">
                <div className="detail-row">
                  <span className="detail-label">👤 Trabajador:</span>
                  <span className="detail-value">{compensadoACancelar.trabajadorNombre}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">🏢 Centro:</span>
                  <span className="detail-value">{compensadoACancelar.centroNombre}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">📅 Fecha:</span>
                  <span className="detail-value">{formatFecha(compensadoACancelar.fecha)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">⏰ Horas compensadas:</span>
                  <span className="detail-value">{compensadoACancelar.horasCompensadas}h</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">📊 Período origen:</span>
                  <span className="detail-value">
                    {formatPeriodoOrigen(compensadoACancelar.periodoOrigenInicio, compensadoACancelar.periodoOrigenFin)}
                  </span>
                </div>
                {compensadoACancelar.descripcion && (
                  <div className="detail-row">
                    <span className="detail-label">📝 Descripción:</span>
                    <span className="detail-value">{compensadoACancelar.descripcion}</span>
                  </div>
                )}
              </div>
              
              <div className="warning-message">
                ⚠️ <strong>Esta acción no se puede deshacer.</strong> Se restaurarán las horas al banco y se eliminará el registro del día compensado.
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-cancelar-modal"
                onClick={() => setCompensadoACancelar(null)}
                disabled={cancelando}
              >
                Cancelar
              </button>
              <button 
                className="btn-confirmar-cancelar"
                onClick={cancelarCompensado}
                disabled={cancelando}
              >
                {cancelando ? "Cancelando..." : "❌ Cancelar Compensado"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}