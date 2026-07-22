import React from "react";
import type { TrabajadorEditFormData } from "../../../hooks/trabajadores/useTrabajadorEdit";

interface Props {
  formData: TrabajadorEditFormData;
  errors: { [key: string]: string };
  expanded: boolean;
  saving: boolean;
  onToggle: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export const SeccionPersonal: React.FC<Props> = ({
  formData,
  errors,
  expanded,
  saving,
  onToggle,
  onChange,
}) => {
  return (
    <div className="form-section">
      <div className="section-header" onClick={onToggle}>
        <div className="section-title">
          <span className="section-icon">👤</span>
          <h3>Información Personal</h3>
          <span className="required-badge">Requerido</span>
        </div>
        <span className={`chevron ${expanded ? 'expanded' : ''}`}>▼</span>
      </div>

      {expanded && (
        <div className="section-content">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                Nombre Completo <span className="required">*</span>
              </label>
              <input
                name="nombre"
                placeholder="Ej: Juan Carlos Pérez"
                value={formData.nombre}
                onChange={onChange}
                className={`form-input ${errors.nombre ? 'error' : ''}`}
                disabled={saving}
              />
              {errors.nombre && <span className="error-text">{errors.nombre}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Cédula <span className="required">*</span>
              </label>
              <input
                name="cedula"
                placeholder="Ej: 12345678"
                value={formData.cedula}
                onChange={onChange}
                className={`form-input ${errors.cedula ? 'error' : ''}`}
                disabled={saving}
              />
              {errors.cedula && <span className="error-text">{errors.cedula}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Tipo de Sangre</label>
              <select
                name="rh"
                value={formData.rh}
                onChange={onChange}
                className="form-select"
                disabled={saving}
              >
                <option value="">Seleccionar</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Fecha de Nacimiento <span className="required">*</span>
              </label>
              <input
                type="date"
                name="fechaNacimiento"
                value={formData.fechaNacimiento}
                onChange={onChange}
                className={`form-input ${errors.fechaNacimiento ? 'error' : ''}`}
                disabled={saving}
              />
              {errors.fechaNacimiento && <span className="error-text">{errors.fechaNacimiento}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Edad</label>
              <input
                type="number"
                name="edad"
                value={formData.edad || ''}
                className="form-input"
                disabled={true}
                placeholder="Se calcula automáticamente"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Género <span className="required">*</span>
              </label>
              <select
                name="genero"
                value={formData.genero}
                onChange={onChange}
                className={`form-select ${errors.genero ? 'error' : ''}`}
                disabled={saving}
              >
                <option value="">Seleccionar</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
              {errors.genero && <span className="error-text">{errors.genero}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Estado Civil <span className="required">*</span>
              </label>
              <select
                name="estadoCivil"
                value={formData.estadoCivil}
                onChange={onChange}
                className={`form-select ${errors.estadoCivil ? 'error' : ''}`}
                disabled={saving}
              >
                <option value="">Seleccionar</option>
                <option value="Soltero">Soltero(a)</option>
                <option value="Casado">Casado(a)</option>
                <option value="Divorciado">Divorciado(a)</option>
                <option value="Viudo">Viudo(a)</option>
                <option value="Unión Libre">Unión Libre</option>
              </select>
              {errors.estadoCivil && <span className="error-text">{errors.estadoCivil}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Cantidad de Hijos</label>
              <input
                type="number"
                name="cantidadHijos"
                value={formData.cantidadHijos || ''}
                onChange={onChange}
                className="form-input"
                min="0"
                disabled={saving}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nivel de Escolaridad</label>
              <select
                name="nivelEscolaridad"
                value={formData.nivelEscolaridad}
                onChange={onChange}
                className="form-select"
                disabled={saving}
              >
                <option value="">Seleccionar</option>
                <option value="Primaria">Primaria</option>
                <option value="Bachillerato">Bachillerato</option>
                <option value="Técnico">Técnico</option>
                <option value="Tecnológico">Tecnológico</option>
                <option value="Universitario">Universitario</option>
                <option value="Postgrado">Postgrado</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
