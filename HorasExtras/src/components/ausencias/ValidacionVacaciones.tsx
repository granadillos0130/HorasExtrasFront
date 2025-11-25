import React from 'react';
import type { ValidacionVacaciones as ValidacionVacacionesType } from '../../types/ausencia';

interface ValidacionVacacionesProps {
  esVacaciones: boolean;
  validacionVacaciones: ValidacionVacacionesType | null;
  fechaRegresoCalculada: Date | null;
}

export const ValidacionVacaciones: React.FC<ValidacionVacacionesProps> = ({
  esVacaciones,
  validacionVacaciones,
  fechaRegresoCalculada
}) => {
  if (!esVacaciones || !validacionVacaciones) return null;

  return (
    <div className="validacion-vacaciones">
      <div className="validacion-header">
        <span>🏖️</span>
        <strong>Validación de Vacaciones</strong>
      </div>

      <div className="validacion-content">
        <p style={{ marginBottom: '15px', fontWeight: '600' }}>
          {validacionVacaciones.mensaje}
        </p>

        <div className="validacion-grid">
          <div className="validacion-item">
            <strong>Total de días</strong>
            <span>{validacionVacaciones.totalDias}</span>
          </div>
          <div className="validacion-item">
            <strong>Días laborables</strong>
            <span>{validacionVacaciones.diasLaborables}</span>
          </div>
          <div className="validacion-item">
            <strong>Días no laborables</strong>
            <span>{validacionVacaciones.diasNoLaborables}</span>
          </div>
          <div className="validacion-item">
            <strong>Se descontarán</strong>
            <span>{validacionVacaciones.diasADescontar} días</span>
          </div>
        </div>

        {fechaRegresoCalculada && (
          <div className="fecha-regreso">
            <div className="fecha-regreso-title">Fecha de regreso al trabajo:</div>
            <div className="fecha-regreso-date">
              {fechaRegresoCalculada.toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        )}

        {validacionVacaciones.detalleDias && validacionVacaciones.detalleDias.length > 0 && (
          <div className="detalle-dias">
            <h5>Detalle por días:</h5>
            {validacionVacaciones.detalleDias.map((dia, index) => (
              <div key={index} className="dia-item">
                <span className="dia-fecha">
                  {new Date(dia.fecha).toLocaleDateString('es-ES')} - {dia.diaSemana}
                </span>
                <span className="dia-tipo">{dia.motivo}</span>
                <span className={dia.esLaborable ? "dia-laborable" : "dia-no-laborable"}>
                  {dia.esLaborable ? "Se descuenta" : "No se descuenta"}
                </span>
              </div>
            ))}
          </div>
        )}

        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '12px',
          borderRadius: '8px',
          marginTop: '15px',
          fontSize: '0.85rem',
          color: '#78350f'
        }}>
          <strong>Explicación del cálculo:</strong><br />
          • {validacionVacaciones.explicacion.domingos}<br />
          • {validacionVacaciones.explicacion.sabados}<br />
          • {validacionVacaciones.explicacion.festivos}
        </div>
      </div>
    </div>
  );
};