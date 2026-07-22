import React from "react";
import type { TrabajadorEditFormData } from "../../../hooks/trabajadores/useTrabajadorEdit";

interface Props {
  formData: TrabajadorEditFormData;
  expanded: boolean;
  saving: boolean;
  onToggle: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export const SeccionContacto: React.FC<Props> = ({
  formData,
  expanded,
  saving,
  onToggle,
  onChange,
}) => {
  return (
    <div className="form-section">
      <div className="section-header" onClick={onToggle}>
        <div className="section-title">
          <span className="section-icon">📞</span>
          <h3>Contacto de Emergencia</h3>
          <span className="optional-badge">Opcional</span>
        </div>
        <span className={`chevron ${expanded ? 'expanded' : ''}`}>▼</span>
      </div>

      {expanded && (
        <div className="section-content">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Persona de Contacto</label>
              <input
                name="personaContacto"
                placeholder="Nombre completo"
                value={formData.personaContacto}
                onChange={onChange}
                className="form-input"
                disabled={saving}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Teléfono de Contacto</label>
              <input
                name="telefonoContacto"
                placeholder="3001234567"
                value={formData.telefonoContacto}
                onChange={onChange}
                className="form-input"
                disabled={saving}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Parentesco</label>
              <select
                name="parentescoContacto"
                value={formData.parentescoContacto}
                onChange={onChange}
                className="form-select"
                disabled={saving}
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
            </div>

            <div className="form-group">
              <label className="form-label">Dirección de Contacto</label>
              <input
                name="direccionContacto"
                placeholder="Dirección completa"
                value={formData.direccionContacto}
                onChange={onChange}
                className="form-input"
                disabled={saving}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
