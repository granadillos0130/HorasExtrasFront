import React from 'react';
import type { CrearTrabajadorDto } from '../../../types/trabajadores';

interface Paso7Props {
  form: CrearTrabajadorDto;
  errors: {[key: string]: string};
  loading: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export const Paso7Banco: React.FC<Paso7Props> = ({
  form,
  errors,
  loading,
  onChange
}) => {
  return (
    <div className="form-step">
      <div className="step-header">
        <h4>🏦 Información Bancaria</h4>
        <p>Datos bancarios para pagos de nómina</p>
      </div>
      
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">
            Nombre del Banco <span className="required">*</span>
          </label>
          <input
            name="banco"
            placeholder="Ej: Bancolombia, Banco de Bogotá, Nequi"
            value={form.banco}
            onChange={onChange}
            className={`form-input ${errors.banco ? 'error' : ''}`}
            disabled={loading}
          />
          {errors.banco && <span className="error-text">{errors.banco}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">
            Número de Cuenta <span className="required">*</span>
          </label>
          <input
            name="numeroCuenta"
            placeholder="Ej: 12345678901"
            value={form.numeroCuenta}
            onChange={onChange}
            className={`form-input ${errors.numeroCuenta ? 'error' : ''}`}
            disabled={loading}
          />
          {errors.numeroCuenta && <span className="error-text">{errors.numeroCuenta}</span>}
        </div>
      </div>
    </div>
  );
};