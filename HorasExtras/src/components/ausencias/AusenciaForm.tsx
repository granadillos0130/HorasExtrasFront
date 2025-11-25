import React, { useState, useEffect } from "react";
import { useAusenciaForm } from "../../utils/ausencias/useAusenciaForm";
import { useVacacionesCalculo } from "../../utils/ausencias/useVacacionesCalculo";
import { mostrarCampoDiagnostico } from "../../utils/ausencias/ausenciaUtils";
import { CrearDiagnosticoModal } from "./CrearDiagnosticoModal";
import { IntegrationInfo } from "./IntegrationInfo";
import { SeccionTrabajador } from "./SeccionTrabajador";
import { SeccionDetallesAusencia } from "./SeccionDetallesAusencia";
import { SeccionFechasHorarios } from "./SeccionFechasHorarios";
import "../../styles/components/ausencias/AusenciaForm.css";

const AusenciaForm = () => {
  const {
    formData,
    mensaje,
    isLoading,
    trabajadores,
    trabajadorSeleccionadoId,
    loadingTrabajadores,
    diagnosticoBuscadorKey,
    esVacaciones,
    handleChange,
    handleTrabajadorSelect,
    handleDiagnosticoSelect,
    handleDiagnosticoCreated,
    handleSubmit,
    handleLimpiar,
    setFormData,
  } = useAusenciaForm();

  const {
    diasVacaciones,
    setDiasVacaciones,
    fechaFinCalculada,
    fechaRegresoCalculada,
    loadingCalculo,
    validacionVacaciones,
    loadingValidacion,
    resetVacaciones,
  } = useVacacionesCalculo(
    esVacaciones(),
    trabajadorSeleccionadoId,
    formData.fechaInicio,
    formData.fechaFin,
    formData.tipoAusencia
  );

  const [showCrearDiagnosticoModal, setShowCrearDiagnosticoModal] = useState(false);

  // Effect para actualizar fechaFin cuando se calcula automáticamente
  useEffect(() => {
    if (fechaFinCalculada && esVacaciones()) {
      setFormData(prev => ({
        ...prev,
        fechaFin: fechaFinCalculada
      }));
    }
  }, [fechaFinCalculada, esVacaciones, setFormData]);

  const onSubmit = (e: React.FormEvent) => {
    handleSubmit(
      e,
      diasVacaciones,
      validacionVacaciones?.diasADescontar || 0,
      fechaRegresoCalculada,
      resetVacaciones
    );
  };

  const onLimpiar = () => {
    handleLimpiar(resetVacaciones);
  };

  return (
    <div className="ausencia-form-container">
      <div className="form-header">
        <h1 className="form-title">
          <span className="form-icon">📋</span>
          Registrar Ausencia
        </h1>
        <p className="form-subtitle">Complete el formulario para registrar una nueva ausencia</p>
      </div>

      <IntegrationInfo />

      <form className="ausencia-form" onSubmit={onSubmit}>
        <SeccionTrabajador
          trabajadores={trabajadores}
          trabajadorSeleccionadoId={trabajadorSeleccionadoId}
          onTrabajadorSelect={handleTrabajadorSelect}
          trabajadorNombre={formData.trabajadorNombre}
          cargo={formData.cargo}
          loadingTrabajadores={loadingTrabajadores}
        />

        <SeccionDetallesAusencia
          tipoAusencia={formData.tipoAusencia}
          descripcion={formData.descripcion}
          diagnosticoId={formData.diagnosticoId}
          diagnosticoBuscadorKey={diagnosticoBuscadorKey}
          esVacaciones={esVacaciones()}
          onChange={handleChange}
          onDiagnosticoSelect={handleDiagnosticoSelect}
          onCrearDiagnostico={() => setShowCrearDiagnosticoModal(true)}
        />

        <SeccionFechasHorarios
          esVacaciones={esVacaciones()}
          fechaInicio={formData.fechaInicio}
          fechaFin={formData.fechaFin}
          horaInicio={formData.horaInicio}
          horaFin={formData.horaFin}
          remunerado={formData.remunerado}
          diasVacaciones={diasVacaciones}
          fechaFinCalculada={fechaFinCalculada}
          fechaRegresoCalculada={fechaRegresoCalculada}
          loadingCalculo={loadingCalculo}
          validacionVacaciones={validacionVacaciones}
          loadingValidacion={loadingValidacion}
          diagnosticoCodigo={formData.diagnosticoCodigo || ""}
          diagnosticoDescripcion={formData.diagnosticoDescripcion || ""}
          tipoAusencia={formData.tipoAusencia}
          mostrarDiagnostico={mostrarCampoDiagnostico(formData.tipoAusencia)}
          onChange={handleChange}
          onDiasVacacionesChange={setDiasVacaciones}
        />

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onLimpiar}
            disabled={isLoading}
          >
            <span className="btn-icon">🔄</span>
            Limpiar
          </button>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading || !trabajadorSeleccionadoId}
          >
            {isLoading ? (
              <>
                <span className="btn-spinner"></span>
                Guardando...
              </>
            ) : (
              <>
                <span className="btn-icon">💾</span>
                {esVacaciones() ? 'Registrar Vacaciones' : 'Guardar Ausencia'}
              </>
            )}
          </button>
        </div>

        {mensaje && (
          <div className={`form-message ${mensaje.startsWith('success:') ? 'success' : 'error'}`}>
            <span className="message-icon">
              {mensaje.startsWith('success:') ? '✅' : '❌'}
            </span>
            {mensaje.replace(/^(success:|error:)/, '')}
          </div>
        )}
      </form>

      <CrearDiagnosticoModal
        isOpen={showCrearDiagnosticoModal}
        onClose={() => setShowCrearDiagnosticoModal(false)}
        onDiagnosticoCreated={handleDiagnosticoCreated}
      />
    </div>
  );
};
export default AusenciaForm;
