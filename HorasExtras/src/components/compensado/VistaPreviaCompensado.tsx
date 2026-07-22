import React from "react";
import type { HorasDisponibles } from "../../types/compensado";
import type { Centro } from "../../types/centros";
import type { ValidacionCompensado } from "../../hooks/compensados/useCompensadoForm";

interface Props {
  fecha: string;
  horaInicio: string;
  horaFin: string;
  centroId: string;
  centros: Centro[];
  horasDisponibles: HorasDisponibles | null;
  loadingValidacion: boolean;
  validacionCompensado: ValidacionCompensado | null;
}

export const VistaPreviaCompensado: React.FC<Props> = ({
  fecha,
  horaInicio,
  horaFin,
  centroId,
  centros,
  horasDisponibles,
  loadingValidacion,
  validacionCompensado,
}) => {
  if (!fecha || !horaInicio || !horaFin || !horasDisponibles) {
    return null;
  }

  const centroSeleccionado = centros.find(c => c.id === centroId);

  return (
    <div className="vista-previa">
      <h4>
        <span>📊</span>
        Vista Previa del Compensado
      </h4>

      {loadingValidacion && (
        <div className="loading-container" style={{ margin: '10px 0' }}>
          <span className="loading-spinner"></span>
          Validando compensado...
        </div>
      )}

      {validacionCompensado && (
        <>
          <div className="vista-previa-grid">
            <div className="vista-previa-item">
              <strong>Fecha programada:</strong>
              <span>{new Date(fecha).toLocaleDateString('es-ES')}</span>
            </div>
            <div className="vista-previa-item">
              <strong>Centro de trabajo:</strong>
              <span>{centroSeleccionado?.nombreCentro || "Seleccionar centro"}</span>
            </div>
            <div className="vista-previa-item">
              <strong>Horario:</strong>
              <span>{horaInicio} - {horaFin}</span>
            </div>
            <div className="vista-previa-item">
              <strong>Horas brutas:</strong>
              <span>{validacionCompensado.horasBrutas.toFixed(2)}h</span>
            </div>
            {validacionCompensado.tiempoAlmuerzoDescontado > 0 && (
              <div className="vista-previa-item">
                <strong>Descuento almuerzo:</strong>
                <span style={{ color: '#f59e0b' }}>
                  -{validacionCompensado.tiempoAlmuerzoDescontado.toFixed(2)}h
                </span>
              </div>
            )}
            <div className="vista-previa-item">
              <strong>Horas efectivas:</strong>
              <span style={{ fontWeight: '700', color: '#667eea' }}>
                {validacionCompensado.horasEfectivas.toFixed(2)}h
              </span>
            </div>
            <div className="vista-previa-item">
              <strong>Horas disponibles:</strong>
              <span>{validacionCompensado.horasDisponibles.toFixed(2)}h</span>
            </div>
            <div className="vista-previa-item">
              <strong>Quedarían:</strong>
              <span style={{
                color: validacionCompensado.horasSobrantes >= 0 ? '#15803d' : '#dc2626',
                fontWeight: '700'
              }}>
                {validacionCompensado.horasSobrantes.toFixed(2)}h
              </span>
            </div>
          </div>

          {validacionCompensado.yaHayAlmuerzoEnOtraActividad && (
            <div className="warning-message" style={{
              background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
              borderColor: '#3b82f6'
            }}>
              <span className="warning-icon">ℹ️</span>
              <div>
                <strong>Sin descuento de almuerzo:</strong> Ya existe otro registro con almuerzo en esta fecha,
                por lo que las {validacionCompensado.horasBrutas.toFixed(2)}h se contarán completas.
              </div>
            </div>
          )}

          {validacionCompensado.tiempoAlmuerzoDescontado > 0 && !validacionCompensado.yaHayAlmuerzoEnOtraActividad && (
            <div className="warning-message" style={{
              background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
              borderColor: '#f59e0b'
            }}>
              <span className="warning-icon">🍽️</span>
              <div>
                <strong>Descuento de almuerzo:</strong> Se descontarán {validacionCompensado.tiempoAlmuerzoDescontado.toFixed(2)}h
                de almuerzo. Horas efectivas: {validacionCompensado.horasEfectivas.toFixed(2)}h
              </div>
            </div>
          )}

          {!validacionCompensado.esValido && (
            <div className="warning-message">
              <span className="warning-icon">⚠️</span>
              <div>
                <strong>Horas insuficientes:</strong> {validacionCompensado.mensaje}
              </div>
            </div>
          )}

          {validacionCompensado.esValido && (
            <div className="warning-message" style={{
              background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
              borderColor: '#10b981'
            }}>
              <span className="warning-icon">✅</span>
              <div>
                <strong>Compensado válido:</strong> {validacionCompensado.mensaje}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
