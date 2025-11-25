import React from 'react';
import type { CrearTrabajadorDto } from '../../../types/trabajadores';
import { formatearNumero, verificarAplicaAuxilio, DOS_SALARIOS_MINIMOS } from '../../../utils/trabajadores/trabajadorFormUtils';

interface Paso2Props {
  form: CrearTrabajadorDto;
  errors: {[key: string]: string};
  loading: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export const Paso2InformacionLaboral: React.FC<Paso2Props> = ({
  form,
  errors,
  loading,
  onChange
}) => {
  return (
    <div className="form-step">
      <div className="step-header">
        <h4>💼 Información Laboral</h4>
        <p>Datos relacionados con el trabajo</p>
      </div>
      
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">
            Correo Electrónico <span className="required">*</span>
          </label>
          <input
            type="email"
            name="correo"
            placeholder="ejemplo@correo.com"
            value={form.correo}
            onChange={onChange}
            className={`form-input ${errors.correo ? 'error' : ''}`}
            disabled={loading}
          />
          {errors.correo && <span className="error-text">{errors.correo}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">
            Tipo de Contratación <span className="required">*</span>
          </label>
          <select
            name="tipoContratacion"
            value={form.tipoContratacion}
            onChange={onChange}
            className={`form-select ${errors.tipoContratacion ? 'error' : ''}`}
            disabled={loading}
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

        <div className="form-group">
          <label className="form-label">
            Salario <span className="required">*</span>
          </label>
          <input
            type="text"
            name="salario"
            placeholder="1.500.000"
            value={form.salario ? formatearNumero(form.salario.toString()) : ''}
            onChange={onChange}
            className={`form-input ${errors.salario ? 'error' : ''}`}
            disabled={loading}
          />
          {errors.salario && <span className="error-text">{errors.salario}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Auxilio de Transporte</label>
          <input
            type="text"
            name="auxilioTransporte"
            placeholder="140.606"
            value={form.auxilioTransporte ? formatearNumero(form.auxilioTransporte.toString()) : ''}
            onChange={onChange}
            className={`form-input ${errors.auxilioTransporte ? 'error' : ''}`}
            disabled={loading}
          />
          {errors.auxilioTransporte && <span className="error-text">{errors.auxilioTransporte}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Valor Hora</label>
          <input
            type="text"
            name="valorHora"
            value="Se calculará automáticamente al crear el trabajador"
            className="form-input"
            disabled={true}
            placeholder="El backend calculará según la fecha actual"
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
            
            {form.salario > 0 && (
              <small style={{ 
                color: verificarAplicaAuxilio(form.salario) ? 'var(--success-color, #22c55e)' : 'var(--warning-color, #f59e0b)', 
                fontSize: '0.8rem',
                display: 'block',
                marginBottom: '4px',
                fontWeight: '500'
              }}>
                {verificarAplicaAuxilio(form.salario) ? (
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
              * El auxilio de transporte solo se incluye si el salario no supera dos salarios mínimos (${formatearNumero(DOS_SALARIOS_MINIMOS.toString())} en 2025)
            </small>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Fecha de Contratación</label>
          <input
            type="date"
            name="fechaContratacion"
            value={form.fechaContratacion}
            onChange={onChange}
            className="form-input"
            disabled={loading}
          />
        </div>
      </div>
    </div>
  );
};