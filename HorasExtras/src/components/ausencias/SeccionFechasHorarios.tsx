import React from 'react';
import { ValidacionVacaciones } from './ValidacionVacaciones';
import type { ValidacionVacaciones as ValidacionVacacionesType } from '../../types/ausencia';
import { 
  calcularDiasAusencia, 
  calcularHorasTotales,
  verificaIncluyeAlmuerzo,
  calcularHorasBrutas
} from '../../utils/ausencias/ausenciaUtils';

interface SeccionFechasHorariosProps {
  esVacaciones: boolean;
  fechaInicio: Date;
  fechaFin: Date;
  horaInicio: string;
  horaFin: string;
  remunerado: boolean;
  diasVacaciones: number;
  fechaFinCalculada: Date | null;
  fechaRegresoCalculada: Date | null;
  loadingCalculo: boolean;
  validacionVacaciones: ValidacionVacacionesType | null;
  loadingValidacion: boolean;
  diagnosticoCodigo: string;
  diagnosticoDescripcion: string;
  tipoAusencia: string;
  mostrarDiagnostico: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDiasVacacionesChange: (dias: number) => void;
}

export const SeccionFechasHorarios: React.FC<SeccionFechasHorariosProps> = ({
  esVacaciones,
  fechaInicio,
  fechaFin,
  horaInicio,
  horaFin,
  remunerado,
  diasVacaciones,
  fechaFinCalculada,
  fechaRegresoCalculada,
  loadingCalculo,
  validacionVacaciones,
  loadingValidacion,
  diagnosticoCodigo,
  diagnosticoDescripcion,
  mostrarDiagnostico,
  onChange,
  onDiasVacacionesChange
}) => {
  return (
    <div className="form-section">
      <h3 className="section-title">
        <span className="section-icon">⏰</span>
        {esVacaciones ? "Fechas de Vacaciones" : "Fechas y Horarios"}
      </h3>
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">
            Fecha de Inicio <span className="required">*</span>
          </label>
          <input
            type="date"
            name="fechaInicio"
            value={fechaInicio.toISOString().split("T")[0]}
            onChange={onChange}
            className="form-input"
            required
          />
        </div>

        {esVacaciones ? (
          <>
            {/* CAMPO DÍAS DE VACACIONES */}
            <div className="form-group">
              <label className="form-label">
                Días de Vacaciones <span className="required">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="90"
                value={diasVacaciones}
                onChange={(e) => onDiasVacacionesChange(parseInt(e.target.value) || 1)}
                className="form-input"
                required
                style={{ fontSize: '1.1rem', fontWeight: '600' }}
              />
              <small style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                Ingresa cuántos días de vacaciones deseas dar
              </small>
            </div>

            {/* FECHA FIN CALCULADA */}
            {loadingCalculo ? (
              <div className="form-group">
                <label className="form-label">Fecha de Fin (calculando...)</label>
                <div className="loading-container">
                  <span className="loading-spinner"></span>
                  Calculando...
                </div>
              </div>
            ) : fechaFinCalculada ? (
              <div className="form-group">
                <label className="form-label">
                  Fecha de Fin (calculada automáticamente)
                </label>
                <input
                  type="text"
                  value={fechaFinCalculada.toLocaleDateString('es-ES')}
                  className="form-input"
                  readOnly
                  disabled
                  style={{ background: '#f3f4f6', fontWeight: '600' }}
                />
              </div>
            ) : null}

            {/* FECHA DE REGRESO */}
            {fechaRegresoCalculada && (
              <div className="form-group">
                <label className="form-label">
                  Regresa al trabajo el:
                </label>
                <input
                  type="text"
                  value={fechaRegresoCalculada.toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                  className="form-input"
                  readOnly
                  disabled
                  style={{ background: '#ecfdf5', fontWeight: '600', color: '#065f46' }}
                />
              </div>
            )}

            {/* INFO VACACIONES */}
            <div className="form-group full-width">
              <div style={{
                background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                border: '2px solid #f59e0b',
                borderRadius: '10px',
                padding: '15px',
                textAlign: 'center'
              }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#92400e', fontSize: '1rem' }}>
                  Vacaciones - Día Completo
                </h4>
                <p style={{ margin: '0', color: '#78350f', fontSize: '0.9rem' }}>
                  Las vacaciones se registran automáticamente como día completo (08:00 - 17:00).
                  <br />Solo necesitas especificar la fecha de inicio y cuántos días darás.
                  <br /><strong>El sistema calcula automáticamente la fecha de fin considerando fines de semana, festivos y horarios del trabajador.</strong>
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* PARA OTROS TIPOS: FECHA FIN MANUAL */}
            <div className="form-group">
              <label className="form-label">
                Fecha de Fin <span className="required">*</span>
              </label>
              <input
                type="date"
                name="fechaFin"
                value={fechaFin.toISOString().split("T")[0]}
                onChange={onChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Hora de Inicio <span className="required">*</span>
              </label>
              <input
                type="time"
                name="horaInicio"
                value={horaInicio}
                onChange={onChange}
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
                value={horaFin}
                onChange={onChange}
                className="form-input"
                required
              />
            </div>
          </>
        )}

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="remunerado"
              checked={remunerado}
              onChange={onChange}
              className="form-checkbox"
            />
            <span className="checkbox-custom"></span>
            <span className="checkbox-text">Es remunerado</span>
          </label>
          <small style={{
            display: 'block',
            marginTop: '5px',
            color: '#6b7280',
            fontSize: '0.8rem',
            fontStyle: 'italic'
          }}>
            {remunerado
              ? 'Contará como horas normales trabajadas'
              : 'Se marcará como horas ausentes'
            }
          </small>
        </div>
      </div>

      {loadingValidacion && esVacaciones && (
        <div className="loading-container" style={{ margin: '15px 0' }}>
          <span className="loading-spinner"></span>
          Validando días de vacaciones...
        </div>
      )}

      <ValidacionVacaciones
        esVacaciones={esVacaciones}
        validacionVacaciones={validacionVacaciones}
        fechaRegresoCalculada={fechaRegresoCalculada}
      />

      {fechaInicio && fechaFin && (
        esVacaciones ? (
          <div style={{
            background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
            border: '2px solid #22c55e',
            borderRadius: '12px',
            padding: '15px',
            marginTop: '20px'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#15803d', fontSize: '1rem' }}>
              Vista Previa de Vacaciones
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '10px',
              fontSize: '0.9rem',
              color: '#166534'
            }}>
              <div>
                <strong>Días solicitados:</strong> {diasVacaciones}
              </div>
              <div>
                <strong>Días calendarios:</strong> {calcularDiasAusencia(fechaInicio, fechaFin)}
              </div>
              <div>
                <strong>Días a descontar:</strong> {validacionVacaciones?.diasADescontar || 'Calculando...'}
              </div>
              <div>
                <strong>Total horas:</strong> {validacionVacaciones ? validacionVacaciones.diasADescontar * 8 : calcularDiasAusencia(fechaInicio, fechaFin) * 8}
              </div>
              <div>
                <strong>Tipo:</strong> {remunerado ? 'Remuneradas' : 'No remuneradas'}
              </div>
            </div>
          </div>
        ) : (
          horaInicio && horaFin && (
            <div style={{
              background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
              border: '2px solid #22c55e',
              borderRadius: '12px',
              padding: '15px',
              marginTop: '20px'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#15803d', fontSize: '1rem' }}>
                Vista Previa de la Ausencia
              </h4>

              {(() => {
                const incluyeAlmuerzo = verificaIncluyeAlmuerzo(horaInicio, horaFin);
                const horasBrutas = calcularHorasBrutas(horaInicio, horaFin);
                const horasNetas = calcularHorasTotales(horaInicio, horaFin, 1, false);

                return incluyeAlmuerzo && (
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.8)',
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '15px',
                    border: '1px solid #f59e0b',
                    fontSize: '0.85rem',
                    color: '#92400e'
                  }}>
                    Descuento de Almuerzo Aplicado (12:30 PM - 2:00 PM):
                    Horas brutas: {horasBrutas.toFixed(2)}h → Horas netas: {horasNetas.toFixed(2)}h
                    (se descontaron {(horasBrutas - horasNetas).toFixed(2)}h de almuerzo)
                  </div>
                );
              })()}

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '10px',
                fontSize: '0.9rem',
                color: '#166534'
              }}>
                <div>
                  <strong>Días afectados:</strong> {calcularDiasAusencia(fechaInicio, fechaFin)}
                </div>
                <div>
                  <strong>Horas netas por día:</strong> {calcularHorasTotales(horaInicio, horaFin, 1, false).toFixed(2)}
                </div>
                <div>
                  <strong>Total horas netas:</strong> {calcularHorasTotales(horaInicio, horaFin, calcularDiasAusencia(fechaInicio, fechaFin), false).toFixed(2)}
                </div>
                <div>
                  <strong>Tipo:</strong> {remunerado ? 'Remunerada' : 'No remunerada'}
                </div>
                {mostrarDiagnostico && diagnosticoCodigo && (
                  <div style={{ gridColumn: '1 / -1', marginTop: '10px', padding: '10px', background: 'rgba(255,255,255,0.8)', borderRadius: '6px' }}>
                    <strong>Diagnóstico:</strong> {diagnosticoCodigo} - {diagnosticoDescripcion}
                  </div>
                )}
              </div>
            </div>
          )
        )
      )}
    </div>
  );
};