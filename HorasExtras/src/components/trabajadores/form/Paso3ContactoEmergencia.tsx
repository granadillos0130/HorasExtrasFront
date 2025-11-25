import React from 'react';
import type { CrearTrabajadorDto } from '../../../types/trabajadores';

interface Paso3Props {
  form: CrearTrabajadorDto;
  errors: {[key: string]: string};
  loading: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export const Paso3ContactoEmergencia: React.FC<Paso3Props> = ({
  form,
  errors,
  loading,
  onChange
}) => {
  return (
    <div className="form-step">
      <div className="step-header">
        <h4>📞 Contacto de Emergencia</h4>
        <p>Información de contacto en caso de emergencia</p>
      </div>
      
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">
            Persona de Contacto <span className="required">*</span>
          </label>
          <input
            name="personaContacto"
            placeholder="Nombre completo"
            value={form.personaContacto}
            onChange={onChange}
            className={`form-input ${errors.personaContacto ? 'error' : ''}`}
            disabled={loading}
          />
          {errors.personaContacto && <span className="error-text">{errors.personaContacto}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">
            Teléfono de Contacto <span className="required">*</span>
          </label>
          <input
            name="telefonoContacto"
            placeholder="3001234567"
            value={form.telefonoContacto}
            onChange={onChange}
            className={`form-input ${errors.telefonoContacto ? 'error' : ''}`}
            disabled={loading}
          />
          {errors.telefonoContacto && <span className="error-text">{errors.telefonoContacto}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">
            Parentesco <span className="required">*</span>
          </label>
          <select
            name="parentescoContacto"
            value={form.parentescoContacto}
            onChange={onChange}
            className={`form-select ${errors.parentescoContacto ? 'error' : ''}`}
            disabled={loading}
          >
            <option value="">Seleccionar</option>
            <option value="Padre">Padre</option>
            <option value="Madre">Madre</option>
            <option value="Esposo(a)">Esposo(a)</option>
            <option value="Hermano(a)">Hermano(a)</option>
            <option value="Hijo(a)">Hijo(a)</option>
            <option value="Tío(a)">Tío(a)</option>
            <option value="Abuelo(a)">Abuelo(a)</option>
            <option value="Amigo(a)">Amigo(a)</option>
            <option value="Otro">Otro</option>
          </select>
          {errors.parentescoContacto && <span className="error-text">{errors.parentescoContacto}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Dirección de Contacto</label>
          <input
            name="direccionContacto"
            placeholder="Dirección completa"
            value={form.direccionContacto}
            onChange={onChange}
            className="form-input"
            disabled={loading}
          />
        </div>
      </div>
    </div>
  );
};