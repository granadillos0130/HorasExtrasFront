import React from "react";
import {
  DOS_SALARIOS_MINIMOS,
  formatearNumero,
  verificarAplicaAuxilio,
} from "../../../utils/trabajadores/trabajadorFormUtils";
import { getEstadoStyle } from "../../../hooks/trabajadores/useTrabajadorEdit";
import type { TrabajadorEditFormData } from "../../../hooks/trabajadores/useTrabajadorEdit";
import type { Trabajador } from "../../../types/trabajadores";

interface Props {
  formData: TrabajadorEditFormData;
  errors: { [key: string]: string };
  expanded: boolean;
  saving: boolean;
  trabajador: Trabajador;
  onToggle: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export const SeccionLaboral: React.FC<Props> = ({
  formData,
  errors,
  expanded,
  saving,
  trabajador,
  onToggle,
  onChange,
}) => {
  return (
    <div className="form-section">
      <div className="section-header" onClick={onToggle}>
        <div className="section-title">
          <span className="section-icon">💼</span>
          <h3>Información Laboral</h3>
          <span className="required-badge">Requerido</span>
        </div>
        <span className={`chevron ${expanded ? 'expanded' : ''}`}>▼</span>
      </div>

      {expanded && (
        <div className="section-content">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                Correo Electrónico <span className="required">*</span>
              </label>
              <input
                type="email"
                name="correo"
                placeholder="ejemplo@correo.com"
                value={formData.correo}
                onChange={onChange}
                className={`form-input ${errors.correo ? 'error' : ''}`}
                disabled={saving}
              />
              {errors.correo && <span className="error-text">{errors.correo}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Tipo de Contratación <span className="required">*</span>
              </label>
              <select
                name="tipoContratacion"
                value={formData.tipoContratacion}
                onChange={onChange}
                className={`form-select ${errors.tipoContratacion ? 'error' : ''}`}
                disabled={saving}
              >
                <option value="">Seleccionar</option>
                <option value="Tiempo Completo">Tiempo Completo</option>
                <option value="Medio Tiempo">Medio Tiempo</option>
                <option value="Por Horas">Por Horas</option>
                <option value="Contratista">Contratista</option>
                <option value="Temporal">Temporal</option>
              </select>
              {errors.tipoContratacion && <span className="error-text">{errors.tipoContratacion}</span>}
            </div>

            {/* Estado Laboral - Solo vista */}
            <div className="form-group">
              <label className="form-label">Estado Laboral</label>
              <div
                className="form-input"
                style={{
                  ...getEstadoStyle(trabajador.estado),
                  textAlign: 'center',
                  fontWeight: '600',
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                {trabajador.estado}
              </div>
              <small style={{
                color: 'var(--text-secondary)',
                fontSize: '0.8rem',
                display: 'block',
                marginTop: '4px',
                fontStyle: 'italic'
              }}>
                * El estado se cambia desde la lista de trabajadores
              </small>
            </div>

            <div className="form-group">
              <label className="form-label">
                Salario <span className="required">*</span>
              </label>
              <input
                type="text"
                name="salario"
                placeholder="1.500.000"
                value={formData.salario ? formatearNumero(formData.salario.toString()) : ''}
                onChange={onChange}
                className={`form-input ${errors.salario ? 'error' : ''}`}
                disabled={saving}
              />
              {errors.salario && <span className="error-text">{errors.salario}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Auxilio de Transporte</label>
              <input
                type="text"
                name="auxilioTransporte"
                placeholder="140.606"
                value={formData.auxilioTransporte ? formatearNumero(formData.auxilioTransporte.toString()) : ''}
                onChange={onChange}
                className="form-input"
                disabled={saving}
              />
            </div>

            {/* Campo de Valor Hora */}
            <div className="form-group">
              <label className="form-label">Valor Hora</label>
              <input
                type="text"
                name="valorHora"
                value={formData.valorHora ? formatearNumero(formData.valorHora.toString()) : ''}
                className="form-input"
                disabled={true}
                style={{
                  fontStyle: 'italic',
                  color: 'var(--text-secondary)',
                  backgroundColor: 'var(--background-secondary)'
                }}
              />

              <div style={{ marginTop: '8px' }}>
                <small style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.8rem',
                  display: 'block',
                  marginBottom: '4px'
                }}>
                  📊 <strong>Fórmula:</strong> (Salario × 1.6544 + Auxilio*) ÷ {new Date() >= new Date(2025, 7, 1) ? '176' : '184'}
                </small>

                {formData.salario > 0 && (
                  <small style={{
                    color: verificarAplicaAuxilio(formData.salario) ? 'var(--success-color, #22c55e)' : 'var(--warning-color, #f59e0b)',
                    fontSize: '0.8rem',
                    display: 'block',
                    marginBottom: '4px',
                    fontWeight: '500'
                  }}>
                    {verificarAplicaAuxilio(formData.salario) ? (
                      <span>✅ <strong>Auxilio de transporte:</strong> SÍ aplica (salario ≤ ${formatearNumero(DOS_SALARIOS_MINIMOS.toString())})</span>
                    ) : (
                      <span>⚠️ <strong>Auxilio de transporte:</strong> NO aplica (salario {'>'} ${formatearNumero(DOS_SALARIOS_MINIMOS.toString())})</span>
                    )}
                  </small>
                )}

                <small style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  display: 'block',
                  fontStyle: 'italic'
                }}>
                  * El auxilio de transporte solo se incluye si el salario no supera dos salarios mínimos
                </small>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Fecha de Contratación</label>
              <input
                type="date"
                name="fechaContratacion"
                value={formData.fechaContratacion}
                onChange={onChange}
                className="form-input"
                disabled={saving}
              />
            </div>

            {/* Fecha de Terminación (editable) */}
            <div className="form-group">
              <label className="form-label">
                Fecha de Terminación
                {trabajador.estado === "No Vigente" && (
                  <span style={{ color: '#EF4444', fontWeight: 'bold' }}> *</span>
                )}
              </label>
              <input
                type="date"
                name="fechaTerminacion"
                value={formData.fechaTerminacion}
                onChange={onChange}
                className={`form-input ${errors.fechaTerminacion ? 'error' : ''}`}
                disabled={saving}
                style={trabajador.estado === "No Vigente" ? {
                  borderColor: '#EF4444',
                  backgroundColor: '#FEF2F2'
                } : {}}
              />
              {errors.fechaTerminacion && <span className="error-text">{errors.fechaTerminacion}</span>}
              <small style={{
                color: trabajador.estado === "No Vigente" ? '#B91C1C' : 'var(--text-secondary)',
                fontSize: '0.8rem',
                display: 'block',
                marginTop: '4px',
                fontStyle: 'italic'
              }}>
                {trabajador.estado === "No Vigente"
                  ? "* Campo importante para trabajadores en estado No Vigente"
                  : "Opcional - Solo llenar si el trabajador ya terminó su relación laboral"
                }
              </small>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
