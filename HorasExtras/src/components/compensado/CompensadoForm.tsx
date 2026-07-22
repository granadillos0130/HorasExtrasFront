import { useState } from "react";
import TrabajadorBuscador from "../shared/TrabajadorBuscador";
import { useCompensadoForm } from "../../hooks/compensados/useCompensadoForm";
import { IntegrationInfo } from "./IntegrationInfo";
import { HorasDisponiblesInfo } from "./HorasDisponiblesInfo";
import { VistaPreviaCompensado } from "./VistaPreviaCompensado";
import "../../styles/components/compensado/CompensadoForm.css";

const CompensadoForm = () => {
  const [mostrarInfo, setMostrarInfo] = useState(false);

  const {
    formData,
    mensaje,
    isLoading,
    trabajadores,
    loadingTrabajadores,
    centros,
    loadingCentros,
    horasDisponibles,
    loadingHoras,
    validacionCompensado,
    loadingValidacion,
    handleChange,
    handleTrabajadorSelect,
    handleConsultarHoras,
    handleSubmit,
    handleLimpiar,
  } = useCompensadoForm();

  return (
    <div className="compensado-form-container">
      <div className="form-header">
        <h1 className="form-title">
          <span className="form-icon">💳</span>
          Crear Compensado
        </h1>
        <p className="form-subtitle">
          Utiliza horas excedentes acumuladas para trabajar en proyectos específicos
        </p>
      </div>

      <IntegrationInfo mostrarInfo={mostrarInfo} onToggle={() => setMostrarInfo(!mostrarInfo)} />

      <form className="compensado-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h3 className="section-title">
            <span className="section-icon">👤</span>
            Trabajador con Banco de Horas
          </h3>
          <div className="form-grid">
            <div className="form-group full-width">
              {loadingTrabajadores ? (
                <div className="loading-container">
                  <span className="loading-spinner"></span>
                  Cargando trabajadores con banco de horas...
                </div>
              ) : (
                <>
                  <TrabajadorBuscador
                    trabajadores={trabajadores}
                    value={formData.trabajadorId}
                    onChange={handleTrabajadorSelect}
                    placeholder="Buscar trabajador con banco de horas..."
                    label="Seleccionar Trabajador"
                    required={true}
                    showSelectedInfo={true}
                  />
                  {trabajadores.length === 0 && (
                    <div className="help-text">
                      ℹ️ No se encontraron trabajadores con banco de horas habilitado.
                      Solo los trabajadores con banco de horas pueden crear compensados.
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">
            <span className="section-icon">📅</span>
            Período Origen de las Horas Excedentes
          </h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                Fecha Inicio del Período <span className="required">*</span>
              </label>
              <input
                type="date"
                name="periodoOrigenInicio"
                value={formData.periodoOrigenInicio}
                onChange={handleChange}
                className="form-input"
                required
              />
              <div className="help-text">
                Fecha de inicio del período donde se generaron las horas excedentes
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Fecha Fin del Período <span className="required">*</span>
              </label>
              <input
                type="date"
                name="periodoOrigenFin"
                value={formData.periodoOrigenFin}
                onChange={handleChange}
                className="form-input"
                required
              />
              <div className="help-text">
                Fecha de fin del período donde se generaron las horas excedentes
              </div>
            </div>
          </div>

          {loadingHoras && (
            <div className="loading-container" style={{ margin: '15px 0' }}>
              <span className="loading-spinner"></span>
              Consultando horas disponibles...
            </div>
          )}

          <HorasDisponiblesInfo horasDisponibles={horasDisponibles} />
        </div>

        {horasDisponibles && horasDisponibles.tieneHorasDisponibles && (
          <div className="form-section">
            <h3 className="section-title">
              <span className="section-icon">🏢</span>
              Detalles del Compensado
            </h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  Centro de Trabajo <span className="required">*</span>
                </label>
                {loadingCentros ? (
                  <div className="loading-container">
                    <span className="loading-spinner"></span>
                    Cargando centros...
                  </div>
                ) : (
                  <select
                    name="centroId"
                    value={formData.centroId}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="">Seleccionar centro</option>
                    {centros.map(centro => (
                      <option key={centro.id} value={centro.id}>
                        {centro.nombreCentro}
                      </option>
                    ))}
                  </select>
                )}
                <div className="help-text">
                  Centro donde se registrará el trabajo compensado
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Fecha del Compensado <span className="required">*</span>
                </label>
                <input
                  type="date"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
                <div className="help-text">
                  Fecha en que se registrará el trabajo compensado
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Hora de Inicio <span className="required">*</span>
                </label>
                <input
                  type="time"
                  name="horaInicio"
                  value={formData.horaInicio}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Hora de Fin <span className="required">*</span>
                </label>
                <input
                  type="time"
                  name="horaFin"
                  value={formData.horaFin}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Horas a Compensar <span className="required">*</span>
                </label>
                <input
                  type="number"
                  name="horasCompensadas"
                  value={formData.horasCompensadas}
                  onChange={handleChange}
                  className="form-input"
                  min="0.1"
                  max="24"
                  step="0.01"
                  required
                />
                <div className="help-text">
                  Se calcula automáticamente según el horario seleccionado
                </div>
              </div>

              <div className="form-group full-width">
                <label className="form-label">
                  Descripción / Observaciones
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  className="form-textarea"
                  placeholder="Descripción del trabajo a realizar con las horas compensadas..."
                />
              </div>
            </div>

            <VistaPreviaCompensado
              fecha={formData.fecha}
              horaInicio={formData.horaInicio}
              horaFin={formData.horaFin}
              centroId={formData.centroId}
              centros={centros}
              horasDisponibles={horasDisponibles}
              loadingValidacion={loadingValidacion}
              validacionCompensado={validacionCompensado}
            />
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleLimpiar}
            disabled={isLoading}
          >
            <span>🔄</span>
            Limpiar
          </button>

          <button
            type="button"
            className="btn btn-outline"
            onClick={handleConsultarHoras}
            disabled={isLoading || !formData.trabajadorId || !formData.periodoOrigenInicio || !formData.periodoOrigenFin}
          >
            <span>🔍</span>
            Consultar Horas
          </button>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={
              isLoading ||
              !horasDisponibles ||
              !horasDisponibles.tieneHorasDisponibles ||
              !validacionCompensado ||
              !validacionCompensado.esValido ||
              !formData.centroId
            }
          >
            {isLoading ? (
              <>
                <span className="btn-spinner"></span>
                Creando...
              </>
            ) : (
              <>
                <span>💾</span>
                Crear Compensado
              </>
            )}
          </button>
        </div>

        {mensaje && (
          <div className={`form-message ${mensaje.startsWith('success:') ? 'success' : 'error'}`}>
            {mensaje.replace(/^(success:|error:)/, '')}
          </div>
        )}
      </form>
    </div>
  );
};

export default CompensadoForm;
