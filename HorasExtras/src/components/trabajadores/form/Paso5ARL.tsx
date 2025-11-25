import React from 'react';
import type { CrearTrabajadorDto } from '../../../types/trabajadores';

interface Paso5Props {
  form: CrearTrabajadorDto;
  errors: {[key: string]: string};
  loading: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export const Paso5ARL: React.FC<Paso5Props> = ({
  form,
  errors,
  loading,
  onChange
}) => {
  return (
    <div className="form-step">
      <div className="step-header">
        <h4>🦺 ARL (Administradora de Riesgos Laborales)</h4>
        <p>Información de la administradora de riesgos laborales</p>
      </div>
      
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">
            Nombre de ARL <span className="required">*</span>
          </label>
          <input
            name="arl"
            placeholder="Ej: Sura ARL, Positiva, Colmena"
            value={form.arl}
            onChange={onChange}
            className={`form-input ${errors.arl ? 'error' : ''}`}
            disabled={loading}
          />
          {errors.arl && <span className="error-text">{errors.arl}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">
            Fecha de Inicio <span className="required">*</span>
          </label>
          <input
            type="date"
            name="arlFechaInicio"
            value={form.arlFechaInicio}
            onChange={onChange}
            className={`form-input ${errors.arlFechaInicio ? 'error' : ''}`}
            disabled={loading}
          />
          {errors.arlFechaInicio && <span className="error-text">{errors.arlFechaInicio}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Fecha de Fin (Opcional)</label>
          <input
            type="date"
            name="arlFechaFin"
            value={form.arlFechaFin}
            onChange={onChange}
            className="form-input"
            disabled={loading}
          />
        </div>
      </div>
    </div>
  );
};