import React, { useEffect, useState } from "react";
import { horariosRotativosService } from "../../api/horariosRotativosService";
import AsignarHorarioModal from "./AsignarHorarioModal";
import type { AsignacionRotativa } from "../../types/horariosRotativos";

const AsignacionesRotativas: React.FC = () => {
  const [asignaciones, setAsignaciones] = useState<AsignacionRotativa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAsignarModal, setShowAsignarModal] = useState(false);

  const cargarAsignaciones = async () => {
    try {
      setLoading(true);
      const data = await horariosRotativosService.getTrabajadoresConHorario();
      setAsignaciones(data);
      setError(null);
    } catch (err) {
      setError("Error al cargar las asignaciones");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };
  const handleCerrarAsignacion = async (trabajadorId: number, asignacionId: number) => {
    const fechaFin = prompt("Fecha de fin (YYYY-MM-DD):", new Date().toISOString().split('T')[0]);

    if (!fechaFin) return;

    if (confirm("¿Cerrar esta asignación de horario?")) {
      try {
        await horariosRotativosService.cerrarAsignacion(asignacionId, fechaFin);
        alert("Asignación cerrada correctamente");
        cargarAsignaciones();
      } catch (err) {
        alert("Error al cerrar la asignación");
        console.error(err);
      }
    }
  };

  useEffect(() => {
    cargarAsignaciones();
  }, []);

  const handleAsignarSuccess = () => {
    setShowAsignarModal(false);
    cargarAsignaciones();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading) {
    return (
      <div className="content-card">
        <div className="loading-message">
          Cargando asignaciones...
        </div>
      </div>
    );
  }

  return (
    <div className="asignaciones-rotativas">
      <div className="asignaciones-header">
        <div>
          <h3>Asignaciones Activas</h3>
          <p className="asignaciones-description">
            Trabajadores con horarios rotativos asignados
          </p>
        </div>
        <button
          className="btn-nuevo"
          onClick={() => setShowAsignarModal(true)}
        >
          + Asignar Horario
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {asignaciones.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <h3>No hay asignaciones activas</h3>
          <p>
            Asigna horarios rotativos a tus trabajadores para que alteren entre dos configuraciones semanalmente.
            Primero debes tener horarios creados en el catálogo.
          </p>
          <button
            className="empty-state-action"
            onClick={() => setShowAsignarModal(true)}
          >
            Asignar Primer Horario
          </button>
        </div>
      ) : (
        <>
          <div className="asignaciones-stats">
            <div className="stat-card">
              <div className="stat-number">{asignaciones.length}</div>
              <div className="stat-label">Trabajadores Activos</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {asignaciones.filter(a => a.tipoSemanaActual === "Par").length}
              </div>
              <div className="stat-label">En Semana Par</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {asignaciones.filter(a => a.tipoSemanaActual === "Impar").length}
              </div>
              <div className="stat-label">En Semana Impar</div>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="asignaciones-table">
              <thead>
                <tr>
                  <th>Trabajador</th>
                  <th>Horario Par</th>
                  <th>Horario Impar</th>
                  <th>Desde</th>
                  <th>Semana Actual</th>
                  <th>Días Activo</th>
                  <th>Acciones</th>
                </tr>

              </thead>
              <tbody>
                {asignaciones.map((asignacion) => (
                  <tr key={asignacion.trabajadorId}>
                    <td>
                      <div className="worker-info">
                        <div className="worker-avatar">
                          {getInitials(asignacion.trabajadorNombre)}
                        </div>
                        <div className="worker-name">
                          {asignacion.trabajadorNombre}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="horario-badge horario-par">
                        {asignacion.horarioPar}
                      </span>
                    </td>
                    <td>
                      <span className="horario-badge horario-impar">
                        {asignacion.horarioImpar}
                      </span>
                    </td>
                    <td>
                      {new Date(asignacion.fechaInicio).toLocaleDateString('es-ES')}
                    </td>
                    <td>
                      <span className={`semana-badge semana-${asignacion.tipoSemanaActual.toLowerCase()}`}>
                        Semana {asignacion.semanaActual} ({asignacion.tipoSemanaActual})
                      </span>
                    </td>
                    <td>
                      <span className="dias-badge">
                        {asignacion.diasActivo} días
                      </span>
                    </td>
                    {/* ✅ NUEVA COLUMNA DE ACCIONES */}
                    <td>
                      <button
                        className="btn-action btn-delete"
                        onClick={() => handleCerrarAsignacion(asignacion.trabajadorId, asignacion.id)}
                      >
                        Cerrar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modal */}
      {showAsignarModal && (
        <AsignarHorarioModal
          onClose={() => setShowAsignarModal(false)}
          onSuccess={handleAsignarSuccess}
        />
      )}
    </div>
  );
};

export default AsignacionesRotativas;