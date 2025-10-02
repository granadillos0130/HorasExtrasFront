import React, { useEffect, useState } from "react";
import { horariosRotativosService } from "../../api/horariosRotativosService";
import CrearHorarioModal from "./CrearHorarioModal";
import DetalleHorarioModal from "./DetalleHorarioModal";
import type { HorarioRotativo } from "../../types/horariosRotativos";

const CatalogoHorarios: React.FC = () => {
  const [horarios, setHorarios] = useState<HorarioRotativo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCrearModal, setShowCrearModal] = useState(false);
  const [horarioSeleccionado, setHorarioSeleccionado] = useState<number | null>(null);

  const cargarHorarios = async () => {
    try {
      setLoading(true);
      const data = await horariosRotativosService.getCatalogo();
      setHorarios(data);
      setError(null);
    } catch (err) {
      setError("Error al cargar el catálogo de horarios");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarHorarios();
  }, []);

  const handleCrearSuccess = () => {
    setShowCrearModal(false);
    cargarHorarios();
  };

  const handleVerDetalle = (horarioId: number) => {
    setHorarioSeleccionado(horarioId);
  };

  if (loading) {
    return (
      <div className="content-card">
        <div className="loading-message">
          Cargando catálogo de horarios...
        </div>
      </div>
    );
  }

  return (
    <div className="catalogo-horarios">
      <div className="catalogo-header">
        <div>
          <h3>Catálogo de Horarios Rotativos</h3>
          <p className="catalogo-description">
            Gestiona los horarios disponibles para asignar a trabajadores
          </p>
        </div>
        <button
          className="btn-nuevo"
          onClick={() => setShowCrearModal(true)}
        >
          + Crear Horario
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {horarios.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📚</div>
          <h3>No hay horarios en el catálogo</h3>
          <p>
            Crea tu primer horario rotativo para poder asignarlo a trabajadores.
            Los horarios rotativos alternan semanalmente entre dos configuraciones.
          </p>
          <button
            className="empty-state-action"
            onClick={() => setShowCrearModal(true)}
          >
            Crear Primer Horario
          </button>
        </div>
      ) : (
        <div className="horarios-grid">
          {horarios.map((horario) => (
            <div key={horario.id} className="horario-card">
              <div className="horario-card-header">
                <h4>{horario.nombre}</h4>
                <span className={`badge ${horario.activo ? 'badge-success' : 'badge-inactive'}`}>
                  {horario.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              
              {horario.descripcion && (
                <p className="horario-description">{horario.descripcion}</p>
              )}
              
              <div className="horario-stats">
                <div className="stat-item">
                  <span className="stat-icon">📅</span>
                  <span className="stat-text">{horario.totalDetalles} días configurados</span>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">📆</span>
                  <span className="stat-text">
                    Creado: {new Date(horario.fechaCreacion).toLocaleDateString('es-ES')}
                  </span>
                </div>
              </div>

              <div className="horario-actions">
                <button
                  className="btn-action btn-view"
                  onClick={() => handleVerDetalle(horario.id)}
                >
                  Ver Detalles
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modales */}
      {showCrearModal && (
        <CrearHorarioModal
          onClose={() => setShowCrearModal(false)}
          onSuccess={handleCrearSuccess}
        />
      )}

      {horarioSeleccionado && (
        <DetalleHorarioModal
          horarioId={horarioSeleccionado}
          onClose={() => setHorarioSeleccionado(null)}
          onUpdate={cargarHorarios}
        />
      )}
    </div>
  );
};

export default CatalogoHorarios;