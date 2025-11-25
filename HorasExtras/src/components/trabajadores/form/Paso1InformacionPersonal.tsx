import React from 'react';
import type { CrearTrabajadorDto } from '../../../types/trabajadores';

interface Paso1Props {
  form: CrearTrabajadorDto;
  errors: {[key: string]: string};
  loading: boolean;
  imagenPreview: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
}

export const Paso1InformacionPersonal: React.FC<Paso1Props> = ({
  form,
  errors,
  loading,
  imagenPreview,
  fileInputRef,
  onChange,
  onImageChange,
  onRemoveImage
}) => {
  return (
    <div className="form-step">
      <div className="step-header">
        <h4>👤 Información Personal</h4>
        <p>Datos básicos del trabajador</p>
      </div>
      
      <div className="form-grid">
        {/* Sección de imagen */}
        <div className="form-group full-width">
          <label className="form-label">Foto del Trabajador (Opcional)</label>
          <div className="image-upload-container">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onImageChange}
              className="image-input"
              disabled={loading}
            />
            
            {imagenPreview ? (
              <div className="image-preview">
                <img src={imagenPreview} alt="Vista previa" />
                <button 
                  type="button" 
                  className="remove-image-btn"
                  onClick={onRemoveImage}
                  disabled={loading}
                >
                  ❌
                </button>
              </div>
            ) : (
              <div className="image-placeholder">
                <div className="placeholder-icon">📷</div>
                <p>Haz clic para seleccionar una imagen</p>
                <small>Formatos: JPG, PNG, GIF (Máx. 5MB)</small>
              </div>
            )}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            Nombre Completo <span className="required">*</span>
          </label>
          <input
            name="nombre"
            placeholder="Ej: Juan Carlos Pérez"
            value={form.nombre}
            onChange={onChange}
            className={`form-input ${errors.nombre ? 'error' : ''}`}
            disabled={loading}
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
            value={form.cedula}
            onChange={onChange}
            className={`form-input ${errors.cedula ? 'error' : ''}`}
            disabled={loading}
          />
          {errors.cedula && <span className="error-text">{errors.cedula}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Tipo de Sangre</label>
          <select
            name="rh"
            value={form.rh}
            onChange={onChange}
            className="form-select"
            disabled={loading}
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
            value={form.fechaNacimiento}
            onChange={onChange}
            className={`form-input ${errors.fechaNacimiento ? 'error' : ''}`}
            disabled={loading}
          />
          {errors.fechaNacimiento && <span className="error-text">{errors.fechaNacimiento}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Edad</label>
          <input
            type="number"
            name="edad"
            value={form.edad || ''}
            onChange={onChange}
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
            value={form.genero}
            onChange={onChange}
            className={`form-select ${errors.genero ? 'error' : ''}`}
            disabled={loading}
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
            value={form.estadoCivil}
            onChange={onChange}
            className={`form-select ${errors.estadoCivil ? 'error' : ''}`}
            disabled={loading}
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
            value={form.cantidadHijos || ''}
            onChange={onChange}
            className="form-input"
            min="0"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Nivel de Escolaridad</label>
          <select
            name="nivelEscolaridad"
            value={form.nivelEscolaridad}
            onChange={onChange}
            className="form-select"
            disabled={loading}
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
  );
};