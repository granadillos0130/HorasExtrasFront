import React, { useEffect, useState } from "react";
import { horariosRotativosService } from "../../api/horariosRotativosService";
import AgregarDetalleForm from "./AgregarDetalleForm";
import type { HorarioDetalleCompleto } from "../../types/horariosRotativos";
import "../../styles/components/horario/Modal.css";

interface Props {
  horarioId: number;
  onClose: () => void;
  onUpdate: () => void;
}

const DetalleHorarioModal: React.FC<Props> = ({ horarioId, onClose, onUpdate }) => {
  const [horario, setHorario] = useState<HorarioDetalleCompleto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAgregarForm, setShowAgregarForm] = useState(false);

  const cargarDetalle = async () => {
    try {
      setLoading(true);
      const data = await horariosRotativosService.getHorarioPorId(horarioId);
      setHorario(data);
      setError(null);
    } catch (err) {
      setError("Error al cargar el detalle del horario");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDetalle();
  }, [horarioId]);

  const handleEliminarDetalle = async (detalleId: number, dia: string) => {
    if (!confirm(`¿Eliminar configuración del ${dia}?`)) return;

    try {
      await horariosRotativosService.eliminarDetalle(detalleId);
      alert("Detalle eliminado correctamente");
      cargarDetalle();
      onUpdate();
    } catch (err) {
      alert("Error al eliminar el detalle");
      console.error("Error:", err);
    }
  };

  const handleAgregarSuccess = () => {
    setShowAgregarForm(false);
    cargarDetalle();
    onUpdate();
  };

  const diasOrdenados = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
          <div className="loading-message">Cargando...</div>
        </div>
      </div>
    );
  }

  if (!horario) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>{horario.nombre}</h2>
            {horario.descripcion && (
              <p className="modal-subtitle">{horario.descripcion}</p>
            )}
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="error-message">{error}</div>
          )}

          <div className="detalle-header">
            <div className="detalle-stats">
              <div className="stat-item">
                <span className="stat-label">Total Horas Semana:</span>
                <span className="stat-value">{horario.totalHorasSemana}h</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Días Configurados:</span>
                <span className="stat-value">{horario.detalles.length}/7</span>
              </div>
            </div>
            <button
              className="btn-nuevo btn-small"
              onClick={() => setShowAgregarForm(true)}
            >
              + Agregar Día
            </button>
          </div>

          {showAgregarForm && (
            <AgregarDetalleForm
              horarioId={horarioId}
              diasExistentes={horario.detalles.map(d => d.diaSemana)}
              onSuccess={handleAgregarSuccess}
              onCancel={() => setShowAgregarForm(false)}
            />
          )}

          {horario.detalles.length === 0 ? (
            <div className="empty-state-small">
              <p>No hay días configurados. Agrega la configuración para cada día de la semana.</p>
            </div>
          ) : (
            <div className="detalles-table">
              <table>
                <thead>
                  <tr>
                    <th>Día</th>
                    <th>Hora Inicio</th>
                    <th>Hora Fin</th>
                    <th>Almuerzo</th>
                    <th>Horas</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {diasOrdenados.map(dia => {
                    const detalle = horario.detalles.find(d => d.diaSemana === dia);
                    if (!detalle) return null;
                    
                    return (
                      <tr key={detalle.id}>
                        <td>
                          <span className="day-badge">{detalle.diaSemana}</span>
                        </td>
                        <td>{detalle.horaInicio}</td>
                        <td>{detalle.horaFin}</td>
                        <td>{detalle.tiempoAlmuerzo}</td>
                        <td>
                          <strong>{detalle.intensidadHoraria}h</strong>
                        </td>
                        <td>
                          <button
                            className="btn-action btn-delete"
                            onClick={() => handleEliminarDetalle(detalle.id, detalle.diaSemana)}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetalleHorarioModal;