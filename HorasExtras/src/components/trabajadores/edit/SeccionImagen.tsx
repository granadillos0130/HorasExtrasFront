import React from "react";
import { getImageUrl } from "../../../utils/imageUtils";
import { getInitials } from "../../../utils/formatters";
import type { Trabajador } from "../../../types/trabajadores";

interface Props {
  trabajador: Trabajador | null;
  expanded: boolean;
  saving: boolean;
  imageError: boolean;
  uploadingImage: boolean;
  imagePreview: string | null;
  onToggle: () => void;
  onImageError: () => void;
  onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageDelete: () => void;
}

export const SeccionImagen: React.FC<Props> = ({
  trabajador,
  expanded,
  saving,
  imageError,
  uploadingImage,
  imagePreview,
  onToggle,
  onImageError,
  onFileInputChange,
  onImageDelete,
}) => {
  return (
    <div className="form-section">
      <div className="section-header" onClick={onToggle}>
        <div className="section-title">
          <span className="section-icon">🖼️</span>
          <h3>Imagen del Trabajador</h3>
          <span className="optional-badge">Opcional</span>
        </div>
        <span className={`chevron ${expanded ? 'expanded' : ''}`}>▼</span>
      </div>

      {expanded && (
        <div className="section-content">
          <div className="image-management-container">

            {/* Vista previa de la imagen */}
            <div className="image-preview-section">
              <div className="image-preview-container">
                <div className="worker-avatar-large">
                  {(imagePreview || (trabajador?.imagen_Url && !imageError)) ? (
                    <img
                      src={imagePreview || getImageUrl(trabajador?.imagen_Url)!}
                      alt={trabajador?.nombre}
                      className="avatar-image-preview"
                      onError={onImageError}
                    />
                  ) : (
                    <div className="avatar-initials-large">
                      {trabajador?.nombre ? getInitials(trabajador.nombre) : 'NA'}
                    </div>
                  )}

                  {/* Overlay de carga */}
                  {uploadingImage && (
                    <div className="upload-overlay">
                      <div className="upload-spinner"></div>
                      <span>Procesando...</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="image-info">
                <p className="image-status">
                  {trabajador?.imagen_Url ? "✅ Imagen configurada" : "📷 Sin imagen"}
                </p>
                <small className="image-requirements">
                  Formatos: JPG, PNG, GIF • Tamaño máximo: 5MB
                </small>
              </div>
            </div>

            {/* Acciones de imagen */}
            <div className="image-actions">

              {/* Input de archivo oculto */}
              <input
                type="file"
                id="imageInput"
                accept="image/jpeg,image/jpg,image/png,image/gif"
                onChange={onFileInputChange}
                style={{ display: 'none' }}
                disabled={uploadingImage}
              />

              {/* Botón para subir/cambiar imagen */}
              <button
                type="button"
                className="btn-image-upload"
                onClick={() => document.getElementById('imageInput')?.click()}
                disabled={uploadingImage || saving}
              >
                <span className="btn-icon">📤</span>
                <span>{trabajador?.imagen_Url ? 'Cambiar Imagen' : 'Subir Imagen'}</span>
              </button>

              {/* Botón para eliminar imagen */}
              {trabajador?.imagen_Url && (
                <button
                  type="button"
                  className="btn-image-delete"
                  onClick={onImageDelete}
                  disabled={uploadingImage || saving}
                >
                  <span className="btn-icon">🗑️</span>
                  <span>Eliminar Imagen</span>
                </button>
              )}
            </div>

            {/* Mensaje de ayuda */}
            <div className="image-help">
              <p>💡 <strong>Consejo:</strong> Una buena imagen mejora la identificación del trabajador en el sistema.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
