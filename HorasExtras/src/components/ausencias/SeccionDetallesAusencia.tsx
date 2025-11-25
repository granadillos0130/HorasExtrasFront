import React from 'react';
import DiagnosticoBuscador from '../shared/DiagnosticoBuscador';
import type { Diagnostico } from '../../types/diagnostico';
import { mostrarCampoDiagnostico } from '../../utils/ausencias/ausenciaUtils';

interface SeccionDetallesAusenciaProps {
  tipoAusencia: string;
  descripcion: string;
  diagnosticoId?: number;
  diagnosticoBuscadorKey: number;
  esVacaciones: boolean;
  onChange: (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => void;
  onDiagnosticoSelect: (id: number | undefined, diagnostico?: Diagnostico) => void;
  onCrearDiagnostico: () => void;
}

export const SeccionDetallesAusencia: React.FC<SeccionDetallesAusenciaProps> = ({
  tipoAusencia,
  descripcion,
  diagnosticoId,
  diagnosticoBuscadorKey,
  esVacaciones,
  onChange,
  onDiagnosticoSelect,
  onCrearDiagnostico
}) => {
  return (
    <div className="form-section">
      <h3 className="section-title">
        <span className="section-icon">📅</span>
        Detalles de la Ausencia
      </h3>
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">
            Tipo de Ausencia <span className="required">*</span>
          </label>
          <select
            name="tipoAusencia"
            value={tipoAusencia}
            onChange={onChange}
            className="form-select"
            required
          >
            <option value="">Seleccionar tipo</option>
            <option value="Vacaciones">Vacaciones</option>
            <option value="Cita médica general">Cita médica general</option>
            <option value="Accidente laboral">Accidente laboral</option>
            <option value="Enfermedad común">Enfermedad común</option>
            <option value="Cita Seguimiento EO">Cita Seguimiento EO</option>
            <option value="Enfermedad Laboral">Enfermedad Laboral</option>
            <option value="Accidente Origen Comun">Accidente Origen Comun</option>
            <option value="Diligencias personales">Diligencias personales</option>
          </select>
        </div>

        <div className="form-group full-width">
          <label className="form-label">
            Descripción / Justificación <span className="required">*</span>
          </label>
          <textarea
            name="descripcion"
            value={descripcion}
            onChange={onChange}
            className="form-textarea"
            placeholder={esVacaciones
              ? "Describa el motivo de las vacaciones (ej: Vacaciones anuales programadas, descanso familiar, etc.)"
              : "Describa el motivo de la ausencia..."
            }
            required
          />
        </div>

        {mostrarCampoDiagnostico(tipoAusencia) && (
          <div className="form-group full-width">
            <div className="diagnostico-section">
              <div className="diagnostico-header">
                <span style={{ fontSize: '1.5rem' }}>🏥</span>
                <strong>Diagnóstico Médico (CIE-10)</strong>
              </div>

              <DiagnosticoBuscador
                key={diagnosticoBuscadorKey}
                value={diagnosticoId}
                onChange={onDiagnosticoSelect}
                placeholder="Buscar por código (ej: A09) o descripción (ej: diarrea)..."
                label=""
                required={false}
                showSelectedInfo={true}
              />

              <button
                type="button"
                className="crear-diagnostico-btn"
                onClick={onCrearDiagnostico}
              >
                <span>➕</span>
                Crear Nuevo Diagnóstico
              </button>

              <small className="diagnostico-help">
                Puedes buscar por código CIE-10 (ejemplo: "A09") o por descripción (ejemplo: "diarrea", "cefalea").
                Si no encuentras el diagnóstico que necesitas, puedes crear uno nuevo haciendo clic en el botón de arriba.
              </small>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};