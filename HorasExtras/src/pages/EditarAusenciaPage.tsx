import { useNavigate, useParams } from "react-router-dom";
import { calcularFechaRegreso } from "../api/ausenciasService";
import { calcularHorasTotales } from "../utils/ausencias/ausenciaUtils";
import TrabajadorBuscador from "../components/shared/TrabajadorBuscador";
import DiagnosticoBuscador from "../components/shared/DiagnosticoBuscador";
import { ValidacionVacacionesInfo } from "../components/ausencias/ValidacionVacacionesInfo";
import { useEditarAusencia } from "../hooks/ausencias/useEditarAusencia";
import "../styles/pages/EditarAusenciaPage.css";

// Lista de tipos de ausencia (incluye Vacaciones)
const tiposAusencia = [
  "Vacaciones",
  "Cita médica general",
  "Cita Seguimiento EO",
  "Enfermedad común",
  "Enfermedad Laboral",
  "Accidente laboral",
  "Accidente Origen Comun",
  "Diligencias personales"
];

export function EditarAusenciaPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    loading,
    guardando,
    ausencia,
    error,
    trabajadores,
    trabajadorSeleccionadoId,
    validacionVacaciones,
    loadingValidacion,
    formData,
    esVacaciones,
    mostrarCampoDiagnostico,
    handleInputChange,
    handleTrabajadorSelect,
    handleDiagnosticoSelect,
    handleSubmit,
  } = useEditarAusencia(id);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando datos de la ausencia...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">❌</div>
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate("/ausencias")} className="btn-volver">
          ← Volver a Ausencias
        </button>
      </div>
    );
  }

  if (!ausencia) {
    return (
      <div className="error-container">
        <div className="error-icon">🔍</div>
        <h2>Ausencia no encontrada</h2>
        <p>No se pudo encontrar la ausencia solicitada.</p>
        <button onClick={() => navigate("/ausencias")} className="btn-volver">
          ← Volver a Ausencias
        </button>
      </div>
    );
  }

  return (
    <div className="editar-ausencia-container">
      <div className="ausencia-header">
        <h1>✏️ Editar {esVacaciones() ? 'Vacaciones' : 'Ausencia'}</h1>
        <button
          onClick={() => navigate("/ausencias")}
          className="btn-volver"
        >
          ← Volver a Ausencias
        </button>
      </div>

      <div className="ausencia-info">
        <div className="info-card">
          <h3>📋 Información de la {esVacaciones() ? 'Vacaciones' : 'Ausencia'}</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">ID:</span>
              <span className="info-value">#{ausencia.id}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Fecha de solicitud:</span>
              <span className="info-value">
                {ausencia.fechaSolicitud ?
                  new Date(ausencia.fechaSolicitud).toLocaleDateString('es-ES')
                  : 'N/A'
                }
              </span>
            </div>
            {/* Mostrar diagnóstico actual si existe */}
            {ausencia.diagnosticoCodigo && (
              <div className="info-item full-width">
                <span className="info-label">🏥 Diagnóstico actual:</span>
                <span className="info-value diagnostico-actual">
                  {ausencia.diagnosticoCodigo} - {ausencia.diagnosticoDescripcion}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="ausencia-form">
        {/* Información del Trabajador */}
        <div className="form-section">
          <h3 className="section-title">
            <span className="section-icon">👤</span>
            Información del Trabajador
          </h3>
          <div className="form-group full-width">
            <TrabajadorBuscador
              trabajadores={trabajadores}
              value={trabajadorSeleccionadoId}
              onChange={handleTrabajadorSelect}
              placeholder="Buscar trabajador por nombre o cédula..."
              label="Seleccionar Trabajador"
              required={true}
              showSelectedInfo={true}
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="trabajadorNombre">👤 Nombre del Trabajador</label>
              <input
                type="text"
                id="trabajadorNombre"
                name="trabajadorNombre"
                value={formData.trabajadorNombre}
                onChange={handleInputChange}
                required
                readOnly
                disabled
              />
            </div>

            <div className="form-group">
              <label htmlFor="cargo">💼 Cargo</label>
              <input
                type="text"
                id="cargo"
                name="cargo"
                value={formData.cargo}
                onChange={handleInputChange}
                required
                readOnly
                disabled
              />
            </div>
          </div>
        </div>

        {/* Información de la Ausencia */}
        <div className="form-section">
          <h3 className="section-title">
            <span className="section-icon">📅</span>
            Detalles de la {esVacaciones() ? 'Vacaciones' : 'Ausencia'}
          </h3>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="fecha">📅 Fecha de {esVacaciones() ? 'Solicitud' : 'Ausencia'}</label>
              <input
                type="date"
                id="fecha"
                name="fecha"
                value={formData.fecha}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="tipoAusencia">📋 Tipo de Ausencia</label>
              <select
                id="tipoAusencia"
                name="tipoAusencia"
                value={formData.tipoAusencia}
                onChange={handleInputChange}
                required
              >
                <option value="">Seleccionar tipo...</option>
                {tiposAusencia.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="fechaInicio">📅 Fecha de Inicio</label>
              <input
                type="date"
                id="fechaInicio"
                name="fechaInicio"
                value={formData.fechaInicio}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="fechaFin">📅 Fecha de Fin</label>
              <input
                type="date"
                id="fechaFin"
                name="fechaFin"
                value={formData.fechaFin}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* CAMPOS DE HORA SOLO SI NO ES VACACIONES */}
            {!esVacaciones() && (
              <>
                <div className="form-group">
                  <label htmlFor="horaInicio">🕐 Hora de Inicio</label>
                  <input
                    type="time"
                    id="horaInicio"
                    name="horaInicio"
                    value={formData.horaInicio}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="horaFin">🕐 Hora de Fin</label>
                  <input
                    type="time"
                    id="horaFin"
                    name="horaFin"
                    value={formData.horaFin}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </>
            )}

            {/* MOSTRAR INFORMACIÓN ESPECIAL PARA VACACIONES */}
            {esVacaciones() && (
              <div className="form-group full-width">
                <div style={{
                  background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                  border: '2px solid #f59e0b',
                  borderRadius: '10px',
                  padding: '15px',
                  textAlign: 'center'
                }}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#92400e', fontSize: '1rem' }}>
                    🏖️ Vacaciones - Día Completo
                  </h4>
                  <p style={{ margin: '0', color: '#78350f', fontSize: '0.9rem' }}>
                    Las vacaciones se registran automáticamente como día completo (08:00 - 17:00).
                    <br/>Solo necesitas especificar las fechas de inicio y fin.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="form-group full-width">
            <label htmlFor="descripcion">📝 Descripción</label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              required
              rows={3}
              placeholder={esVacaciones()
                ? "Describa el motivo de las vacaciones (ej: Vacaciones anuales programadas, descanso familiar, etc.)"
                : "Describe la razón de la ausencia..."
              }
            />
          </div>

          {/* CAMPO DIAGNÓSTICO CON BUSCADOR */}
          {mostrarCampoDiagnostico() && (
            <div className="form-group full-width">
              <div className="diagnostico-section">
                <div className="diagnostico-header">
                  <span style={{ fontSize: '1.5rem' }}>🏥</span>
                  <strong>Diagnóstico Médico (CIE-10)</strong>
                </div>

                <DiagnosticoBuscador
                  value={formData.diagnosticoId}
                  onChange={handleDiagnosticoSelect}
                  placeholder="Buscar por código (ej: A09) o descripción (ej: diarrea)..."
                  label=""
                  required={false}
                  showSelectedInfo={true}
                />

                <small className="diagnostico-help">
                  💡 <strong>Ayuda:</strong> Puedes buscar por código CIE-10 (ejemplo: "A09") o por descripción (ejemplo: "diarrea", "cefalea").
                  Este campo es opcional pero recomendado para {
                    formData.tipoAusencia === "Cita médica general" || formData.tipoAusencia === "Cita Seguimiento EO"
                      ? "citas médicas"
                      : "casos de enfermedad"
                  }.
                </small>
              </div>
            </div>
          )}

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="remunerado"
                checked={formData.remunerado}
                onChange={handleInputChange}
              />
              <span className="checkbox-text">💰 {esVacaciones() ? 'Vacaciones' : 'Ausencia'} Remunerada</span>
            </label>
            <small style={{
              display: 'block',
              marginTop: '5px',
              color: '#6b7280',
              fontSize: '0.8rem',
              fontStyle: 'italic'
            }}>
              {formData.remunerado
                ? '💰 Contará como horas normales trabajadas'
                : '🚫 Se marcará como horas ausentes'
              }
            </small>
          </div>
        </div>

        {/* MOSTRAR VALIDACIÓN DE VACACIONES */}
        {loadingValidacion && esVacaciones() && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '1rem',
            background: '#f8f9fa',
            borderRadius: '10px',
            border: '2px dashed #dee2e6',
            justifyContent: 'center',
            color: '#6c757d',
            fontWeight: '500',
            margin: '15px 0'
          }}>
            <span style={{
              width: '20px',
              height: '20px',
              border: '2px solid #dee2e6',
              borderTop: '2px solid #667eea',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></span>
            Validando días de vacaciones...
          </div>
        )}

        <ValidacionVacacionesInfo validacionVacaciones={validacionVacaciones} fechaFin={formData.fechaFin} />

        {/* Vista previa de cálculos actualizados */}
        {formData.fechaInicio && formData.fechaFin && (
          <div style={{
            background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
            border: '2px solid #22c55e',
            borderRadius: '12px',
            padding: '15px',
            marginTop: '20px'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#15803d', fontSize: '1rem' }}>
              📊 Vista Previa {esVacaciones() ? 'de Vacaciones' : 'de la Ausencia'}
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '10px',
              fontSize: '0.9rem',
              color: '#166534'
            }}>
              <div>
                <strong>Días {esVacaciones() ? 'calendarios' : 'afectados'}:</strong> {
                  Math.ceil((new Date(formData.fechaFin).getTime() - new Date(formData.fechaInicio).getTime()) / (1000 * 60 * 60 * 24)) + 1
                }
              </div>
              {esVacaciones() && validacionVacaciones && (
                <div>
                  <strong>Días a descontar:</strong> {validacionVacaciones.diasADescontar}
                </div>
              )}
              <div>
                <strong>Total horas:</strong> {
                  esVacaciones()
                    ? (validacionVacaciones ? validacionVacaciones.diasADescontar * 8 : 'Calculando...')
                    : formData.horaInicio && formData.horaFin
                      ? calcularHorasTotales(
                          formData.horaInicio,
                          formData.horaFin,
                          Math.ceil((new Date(formData.fechaFin).getTime() - new Date(formData.fechaInicio).getTime()) / (1000 * 60 * 60 * 24)) + 1,
                          false
                        ).toFixed(2)
                      : '0'
                }
              </div>
              <div>
                <strong>Tipo:</strong> {formData.remunerado ? 'Remunerada' : 'No remunerada'}
              </div>
              {mostrarCampoDiagnostico() && formData.diagnosticoCodigo && (
                <div style={{ gridColumn: '1 / -1', marginTop: '10px', padding: '10px', background: 'rgba(255,255,255,0.8)', borderRadius: '6px' }}>
                  <strong>🏥 Diagnóstico:</strong> {formData.diagnosticoCodigo} - {formData.diagnosticoDescripcion}
                </div>
              )}
              {esVacaciones() && validacionVacaciones && (
                <div style={{ gridColumn: '1 / -1', marginTop: '10px', padding: '10px', background: 'rgba(255,255,255,0.8)', borderRadius: '6px' }}>
                  <strong>📅 Regresa el:</strong> {calcularFechaRegreso(new Date(formData.fechaFin)).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate("/ausencias")}
            className="btn-cancelar"
            disabled={guardando}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-guardar"
            disabled={guardando}
          >
            {guardando ? "Guardando..." : `💾 Guardar ${esVacaciones() ? 'Vacaciones' : 'Cambios'}`}
          </button>
        </div>

        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}
      </form>
    </div>
  );
}
