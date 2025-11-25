import React from 'react';
import type { CrearTrabajadorDto } from '../../../types/trabajadores';
import { formatearNumero, verificarAplicaAuxilio } from '../../../utils/trabajadores/trabajadorFormUtils';

interface Paso8Props {
  form: CrearTrabajadorDto;
  errors: {[key: string]: string};
  loading: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export const Paso8Clinica: React.FC<Paso8Props> = ({
  form,
  errors,
  loading,
  onChange
}) => {
  return (
    <div className="form-step">
      <div className="step-header">
        <h4>🏥 Clínica de Atención</h4>
        <p>Información de la clínica o centro médico de preferencia</p>
      </div>
      
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">
            Nombre de la Clínica <span className="required">*</span>
          </label>
          <input
            name="nombreClinica"
            placeholder="Ej: Clínica del Country, Hospital San Ignacio"
            value={form.nombreClinica}
            onChange={onChange}
            className={`form-input ${errors.nombreClinica ? 'error' : ''}`}
            disabled={loading}
          />
          {errors.nombreClinica && <span className="error-text">{errors.nombreClinica}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">
            Fecha de Inicio <span className="required">*</span>
          </label>
          <input
            type="date"
            name="clinicaFechaInicio"
            value={form.clinicaFechaInicio}
            onChange={onChange}
            className={`form-input ${errors.clinicaFechaInicio ? 'error' : ''}`}
            disabled={loading}
          />
          {errors.clinicaFechaInicio && <span className="error-text">{errors.clinicaFechaInicio}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Fecha de Fin (Opcional)</label>
          <input
            type="date"
            name="clinicaFechaFin"
            value={form.clinicaFechaFin}
            onChange={onChange}
            className="form-input"
            disabled={loading}
          />
        </div>
      </div>

      {/* Resumen final en el paso 8 */}
      <div className="form-summary">
        <h5>📋 Resumen del Trabajador</h5>
        <div className="summary-grid">
          <div className="summary-section">
            <h6>👤 Personal</h6>
            <p><strong>Nombre:</strong> {form.nombre}</p>
            <p><strong>Cédula:</strong> {form.cedula}</p>
            <p><strong>Edad:</strong> {form.edad} años</p>
            <p><strong>Género:</strong> {form.genero}</p>
          </div>
          
          <div className="summary-section">
            <h6>💼 Laboral</h6>
            <p><strong>Correo:</strong> {form.correo}</p>
            <p><strong>Salario:</strong> ${form.salario ? formatearNumero(form.salario.toString()) : '0'}</p>
            <p><strong>Auxilio Transporte:</strong> ${form.auxilioTransporte ? formatearNumero(form.auxilioTransporte.toString()) : '0'}</p>
            {form.salario > 0 && (
              <p style={{ 
                color: verificarAplicaAuxilio(form.salario) ? 'var(--success-color, #22c55e)' : 'var(--warning-color, #f59e0b)',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}>
                <strong>Auxilio en cálculo:</strong> {verificarAplicaAuxilio(form.salario) ? 'Sí aplica' : 'No aplica (>2SM)'}
              </p>
            )}
            <p><strong>Valor Hora:</strong> Se calculará automáticamente</p>
            <p><strong>Tipo:</strong> {form.tipoContratacion}</p>
          </div>

          <div className="summary-section">
            <h6>🏥 Servicios</h6>
            <p><strong>EPS:</strong> {form.eps}</p>
            <p><strong>ARL:</strong> {form.arl}</p>
            <p><strong>Pensión:</strong> {form.fondoPension}</p>
            <p><strong>Banco:</strong> {form.banco}</p>
            <p><strong>Clínica:</strong> {form.nombreClinica}</p>
          </div>
        </div>
      </div>
    </div>
  );
};