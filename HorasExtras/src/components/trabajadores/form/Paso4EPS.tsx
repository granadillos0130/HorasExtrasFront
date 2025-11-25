import React from 'react';
import type { CrearTrabajadorDto } from '../../../types/trabajadores';

interface Paso4Props {
  form: CrearTrabajadorDto;
  errors: {[key: string]: string};
  loading: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export const Paso4EPS: React.FC<Paso4Props> = ({
  form,
  errors,
  loading,
  onChange
}) => {
  return (
    <div className="form-step">
      <div className="step-header">
        <h4>⚕️ EPS (Entidad Promotora de Salud)</h4>
        <p>Información de la entidad de salud del trabajador</p>
      </div>
      
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">
            Nombre de EPS <span className="required">*</span>
          </label>
          <input
            name="eps"
            placeholder="Ej: Sanitas, Sura, Nueva EPS"
            value={form.eps}
            onChange={onChange}
            className={`form-input ${errors.eps ? 'error' : ''}`}
            disabled={loading}
          />
          {errors.eps && <span className="error-text">{errors.eps}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">
            Fecha de Inicio <span className="required">*</span>
          </label>
          <input
            type="date"
            name="epsFechaInicio"
            value={form.epsFechaInicio}
            onChange={onChange}
            className={`form-input ${errors.epsFechaInicio ? 'error' : ''}`}
            disabled={loading}
          />
          {errors.epsFechaInicio && <span className="error-text">{errors.epsFechaInicio}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Fecha de Fin (Opcional)</label>
          <input
            type="date"
            name="epsFechaFin"
            value={form.epsFechaFin}
            onChange={onChange}
            className="form-input"
            disabled={loading}
          />
        </div>
      </div>
    </div>
  );
};