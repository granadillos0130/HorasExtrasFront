import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ausenciasService } from "../api/ausenciasService";
import type { Ausencia } from "../types/ausencia";
import "../styles/pages/AusenciasPage.css";

const meses = [
  "Enero", "Febrero", "Marzo", "Abril",
  "Mayo", "Junio", "Julio", "Agosto",
  "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export function AusenciasPage() {
  const [anio] = useState(new Date().getFullYear());
  const [mesSeleccionado, setMesSeleccionado] = useState<number | null>(null);
  const [ausencias, setAusencias] = useState<Ausencia[]>([]);
  const [loading, setLoading] = useState(false);
  const [ausenciaAEliminar, setAusenciaAEliminar] = useState<Ausencia | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const navigate = useNavigate();

  const cargarAusencias = async (mes: number) => {
    setMesSeleccionado(mes);
    setLoading(true);
    try {
      const data = await ausenciasService.getPorMes(anio, mes + 1);
      console.log("Datos recibidos:", data);
      setAusencias(data);
    } catch (error) {
      console.error("Error al cargar ausencias:", error);
    } finally {
      setLoading(false);
    }
  };

  const confirmarEliminacion = (ausencia: Ausencia) => {
    setAusenciaAEliminar(ausencia);
  };

  const eliminarAusencia = async () => {
    if (!ausenciaAEliminar) return;
    
    setEliminando(true);
    try {
      await ausenciasService.eliminarAusencia(ausenciaAEliminar.id);
      
      setAusencias(prev => prev.filter(a => a.id !== ausenciaAEliminar.id));
      setAusenciaAEliminar(null);
      
      console.log(`✅ Ausencia ${ausenciaAEliminar.id} eliminada correctamente`);
    } catch (error) {
      console.error("Error al eliminar ausencia:", error);
      alert("Error al eliminar la ausencia. Por favor, intenta de nuevo.");
    } finally {
      setEliminando(false);
    }
  };

  const editarAusencia = (ausencia: Ausencia) => {
    navigate(`/ausencias/editar/${ausencia.id}`);
  };

  const getTipoBadgeClass = (tipo: string): string => {
    switch (tipo) {
      case "Cita médica general":
      case "Cita Seguimiento EO":
        return "medica";
      case "Enfermedad común":
      case "Enfermedad Laboral":
        return "enfermedad";
      case "Accidente laboral":
      case "Accidente Origen Comun":
        return "accidente";
      case "Diligencias personales":
        return "personal";
      default:
        return "default";
    }
  };

  const getTipoIcon = (tipo: string): string => {
    switch (tipo) {
      case "Cita médica general":
      case "Cita Seguimiento EO":
        return "🏥";
      case "Enfermedad común":
      case "Enfermedad Laboral":
        return "🤒";
      case "Accidente laboral":
      case "Accidente Origen Comun":
        return "⚠️";
      case "Diligencias personales":
        return "📋";
      default:
        return "📅";
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

  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="ausencias-container">
      <div className="ausencias-header">
        <h1 className="ausencias-title">Ausencias por Mes - {anio}</h1>
        <div className="header-buttons">
          <button 
            className="estadisticas-btn" 
            onClick={() => navigate("/ausencias/estadisticas")}
          >
            📊 Ver Estadísticas
          </button>
           <button 
            className="compensados-btn" 
            onClick={() => navigate("/compensados/nueva")}
          >
            💳 Crear Compensado
          </button>
          <button 
            className="compensados-btn" 
            onClick={() => navigate("/compensados/ver")}
          >
            💳 Ver Compensados
          </button>
          <button 
            className="crear-ausencia-btn" 
            onClick={() => navigate("/ausencias/nueva")}
          >
            + Crear Ausencia
          </button>
        </div>
      </div>

      <div className="meses-grid">
        {meses.map((mes, i) => (
          <button
            key={i}
            className={`mes-btn ${mesSeleccionado === i ? "seleccionado" : ""}`}
            onClick={() => cargarAusencias(i)}
          >
            {mes}
          </button>
        ))}
      </div>

      {mesSeleccionado !== null && (
        <div className="resultado-ausencias">
          <h2 className="ausencias-subtitle">
            Ausencias en {meses[mesSeleccionado]}
          </h2>

          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p className="loading-text">Cargando ausencias de {meses[mesSeleccionado]}...</p>
            </div>
          ) : ausencias.length === 0 ? (
            <div className="no-data-container">
              <div className="no-data-icon">📭</div>
              <p className="no-data-text">
                No hay ausencias registradas en {meses[mesSeleccionado]}.
              </p>
              <button 
                className="crear-primera-btn"
                onClick={() => navigate("/ausencias/nueva")}
              >
                ➕ Registrar Primera Ausencia
              </button>
            </div>
          ) : (
            <div className="table-container">
              {/* 🆕 Estadísticas rápidas actualizadas */}
              <div className="stats-summary">
                <span className="total-ausencias">
                  📊 Total: <strong>{ausencias.length}</strong>
                </span>
                <span className="badge badge-success">
                  💰 Remuneradas: <strong>{ausencias.filter(a => a.remunerado).length}</strong>
                </span>
                <span className="badge badge-warning">
                  🚫 No remuneradas: <strong>{ausencias.filter(a => !a.remunerado).length}</strong>
                </span>
                <span className="badge badge-info">
                  🏥 Con Diagnóstico: <strong>{ausencias.filter(a => a.diagnosticoCodigo).length}</strong>
                </span>
              </div>

              <table className="ausencias-table">
                <thead>
                  <tr>
                    <th><span className="header-icon">👤</span>Nombre</th>
                    <th><span className="header-icon">💼</span>Cargo</th>
                    <th><span className="header-icon">📋</span>Tipo de Ausencia</th>
                    <th><span className="header-icon">📝</span>Descripción</th>
                    <th><span className="header-icon">🏥</span>Diagnóstico</th>
                    <th><span className="header-icon">📅</span>Fecha Inicio</th>
                    <th><span className="header-icon">📅</span>Fecha Fin</th>
                    <th><span className="header-icon">🕐</span>Hora Inicio</th>
                    <th><span className="header-icon">🕐</span>Hora Fin</th>
                    <th><span className="header-icon">💰</span>Remunerado</th>
                    <th><span className="header-icon">⚙️</span>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {ausencias.map((a, index) => (
                    <tr 
                      key={a.id} 
                      className={`table-row ${index % 2 === 0 ? 'even' : 'odd'}`}
                    >
                      {/* Trabajador */}
                      <td className="trabajador-cell">
                        <div className="trabajador-info">
                          <span className="trabajador-avatar">👤</span>
                          <div>
                            <div className="trabajador-nombre">{a.trabajadorNombre}</div>
                            <small style={{ color: '#6b7280' }}>ID: {a.id}</small>
                          </div>
                        </div>
                      </td>

                      {/* Cargo */}
                      <td className="cargo-cell">
                        <span className="cargo-badge">{a.cargo}</span>
                      </td>

                      {/* Tipo de Ausencia */}
                      <td>
                        <div className="tipo-ausencia">
                          <span className={`tipo-badge ${getTipoBadgeClass(a.tipoAusencia)}`}>
                            {getTipoIcon(a.tipoAusencia)} {a.tipoAusencia}
                          </span>
                        </div>
                      </td>

                      {/* Descripción */}
                      <td className="descripcion-cell">
                        <div 
                          className="descripcion-tooltip"
                          title={a.descripcion.length > 50 ? a.descripcion : undefined}
                        >
                          {truncateText(a.descripcion, 50)}
                        </div>
                      </td>

                      {/* 🆕 Diagnóstico - Actualizado */}
                      <td className="dx-cell">
                        {a.diagnosticoCodigo && a.diagnosticoDescripcion ? (
                          <div 
                            title={`${a.diagnosticoCodigo}: ${a.diagnosticoDescripcion}`}
                            className="diagnostico-info"
                          >
                            <span className="diagnostico-badge">
                              🏥 {a.diagnosticoCodigo}
                            </span>
                            <div className="diagnostico-descripcion">
                              {truncateText(a.diagnosticoDescripcion, 30)}
                            </div>
                          </div>
                        ) : (
                          <span className="diagnostico-empty">N/A</span>
                        )}
                      </td>

                      {/* Fecha Inicio */}
                      <td className="fecha-cell">
                        <span className="fecha-badge">
                          📅 {formatFecha(a.fechaInicio)}
                        </span>
                      </td>

                      {/* Fecha Fin */}
                      <td className="fecha-cell">
                        <span className="fecha-badge">
                          📅 {formatFecha(a.fechaFin)}
                        </span>
                      </td>

                      {/* Hora Inicio */}
                      <td className="hora-cell">
                        <span className="hora-badge ingreso">🕐 {a.horaInicio}</span>
                      </td>

                      {/* Hora Fin */}
                      <td className="hora-cell">
                        <span className="hora-badge salida">🕐 {a.horaFin}</span>
                      </td>

                      {/* Remunerado */}
                      <td>
                        <span className={`remunerado-badge ${a.remunerado ? 'si' : 'no'}`}>
                          {a.remunerado ? '💰 Sí' : '🚫 No'}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="acciones-cell">
                        <div className="acciones-buttons">
                          <button
                            className="btn-editar"
                            onClick={() => editarAusencia(a)}
                            title="Editar ausencia"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn-eliminar"
                            onClick={() => confirmarEliminacion(a)}
                            title="Eliminar ausencia"
                          >
                            🗑️
                          </button>
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
                📊 Mostrando {ausencias.length} ausencia{ausencias.length !== 1 ? 's' : ''} 
                de {meses[mesSeleccionado]} {anio}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de confirmación para eliminar */}
      {ausenciaAEliminar && (
        <div className="modal-overlay" onClick={() => setAusenciaAEliminar(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🗑️ Confirmar Eliminación</h3>
              <button 
                className="modal-close"
                onClick={() => setAusenciaAEliminar(null)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <p>¿Estás seguro de que quieres eliminar esta ausencia?</p>
              
              <div className="ausencia-details">
                <div className="detail-row">
                  <span className="detail-label">👤 Trabajador:</span>
                  <span className="detail-value">{ausenciaAEliminar.trabajadorNombre}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">📋 Tipo:</span>
                  <span className="detail-value">{ausenciaAEliminar.tipoAusencia}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">📅 Período:</span>
                  <span className="detail-value">
                    {formatFecha(ausenciaAEliminar.fechaInicio)} - {formatFecha(ausenciaAEliminar.fechaFin)}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">📝 Descripción:</span>
                  <span className="detail-value">{ausenciaAEliminar.descripcion}</span>
                </div>
                {/* 🆕 Mostrar diagnóstico en el modal si existe */}
                {ausenciaAEliminar.diagnosticoCodigo && (
                  <div className="detail-row">
                    <span className="detail-label">🏥 Diagnóstico:</span>
                    <span className="detail-value">
                      {ausenciaAEliminar.diagnosticoCodigo} - {ausenciaAEliminar.diagnosticoDescripcion}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="warning-message">
                ⚠️ <strong>Esta acción no se puede deshacer.</strong> Se eliminarán también los registros de trabajo relacionados.
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-cancelar"
                onClick={() => setAusenciaAEliminar(null)}
                disabled={eliminando}
              >
                Cancelar
              </button>
              <button 
                className="btn-confirmar-eliminar"
                onClick={eliminarAusencia}
                disabled={eliminando}
              >
                {eliminando ? "Eliminando..." : "🗑️ Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}