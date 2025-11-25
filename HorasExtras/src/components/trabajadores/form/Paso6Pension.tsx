import React from 'react';
import type { CrearTrabajadorDto } from '../../../types/trabajadores';

interface Paso6Props {
  form: CrearTrabajadorDto;
  errors: {[key: string]: string};
  loading: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export const Paso6Pension: React.FC<Paso6Props> = ({
  form,
  errors,
  loading,
  onChange
}) => {
  return (
    <div className="form-step">
      <div className="step-header">
        <h4>👴 Fondo de Pensión</h4>
        <p>Información del fondo de pensión del trabajador</p>
      </div>
      
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">
            Nombre del Fondo <span className="required">*</span>
          </label>
          <input
            name="fondoPension"
            placeholder="Ej: Protección, Porvenir, Colfondos"
            value={form.fondoPension}
            onChange={onChange}
            className={`form-input ${errors.fondoPension ? 'error' : ''}`}
            disabled={loading}
          />
          {errors.fondoPension && <span className="error-text">{errors.fondoPension}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">
            Fecha de Inicio <span className="required">*</span>
          </label>
          <input
            type="date"
            name="pensionFechaInicio"
            value={form.pensionFechaInicio}
            onChange={onChange}
            className={`form-input ${errors.pensionFechaInicio ? 'error' : ''}`}
            disabled={loading}
          />
          {errors.pensionFechaInicio && <span className="error-text">{errors.pensionFechaInicio}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Fecha de Fin (Opcional)</label>
          <input
            type="date"
            name="pensionFechaFin"
            value={form.pensionFechaFin}
            onChange={onChange}
            className="form-input"
            disabled={loading}
          />
        </div>
      </div>
    </div>
  );
};