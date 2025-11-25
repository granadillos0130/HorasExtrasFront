import React, { useState } from 'react';
import { crearDiagnostico } from '../../api/ausenciasService';
import type { Diagnostico } from '../../types/diagnostico';

interface NuevoDiagnostico {
  codigo: string;
  descripcion: string;
}

const initialDiagnosticoState: NuevoDiagnostico = {
  codigo: "",
  descripcion: ""
};

interface CrearDiagnosticoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDiagnosticoCreated: (diagnostico: Diagnostico) => void;
}

export const CrearDiagnosticoModal: React.FC<CrearDiagnosticoModalProps> = ({
  isOpen,
  onClose,
  onDiagnosticoCreated
}) => {
  const [formData, setFormData] = useState<NuevoDiagnostico>(initialDiagnosticoState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const nuevoDiagnostico = await crearDiagnostico(formData);
      onDiagnosticoCreated(nuevoDiagnostico);
      setFormData(initialDiagnosticoState);
      onClose();
    } catch (error) {
      console.error("Error al crear diagnóstico:", error);
      setError("Error al crear el diagnóstico. Verifique que el código no exista ya.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData(initialDiagnosticoState);
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            <span>🏥</span>
            Crear Nuevo Diagnóstico
          </h3>
          <button
            type="button"
            className="modal-close"
            onClick={handleClose}
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-help-text">
            <strong>💡 Información importante:</strong><br />
            Estás creando un nuevo diagnóstico CIE-10. Asegúrate de que el código sea correcto
            y que no exista ya en el sistema. Una vez creado, estará disponible para todos los usuarios.
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-form-group">
              <label className="modal-form-label">
                Código CIE-10 <span className="required">*</span>
              </label>
              <input
                type="text"
                name="codigo"
                value={formData.codigo}
                onChange={handleChange}
                className="modal-form-input"
                placeholder="Ej: A09, M79.1, K59.0"
                required
                maxLength={10}
                style={{ textTransform: 'uppercase' }}
              />
              <small style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                Formato típico: 1 letra + 2-3 números + opcional punto y más números
              </small>
            </div>

            <div className="modal-form-group">
              <label className="modal-form-label">
                Descripción <span className="required">*</span>
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                className="modal-form-textarea"
                placeholder="Descripción detallada del diagnóstico..."
                required
                maxLength={500}
              />
              <small style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                {formData.descripcion.length}/500 caracteres
              </small>
            </div>

            {error && (
              <div style={{
                background: '#fee2e2',
                border: '1px solid #ef4444',
                borderRadius: '8px',
                padding: '12px',
                color: '#7f1d1d',
                fontSize: '0.9rem',
                marginBottom: '20px'
              }}>
                <strong>❌ Error:</strong> {error}
              </div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                className="modal-btn modal-btn-secondary"
                onClick={handleClose}
                disabled={isLoading}
              >
                <span>❌</span>
                Cancelar
              </button>

              <button
                type="submit"
                className="modal-btn modal-btn-primary"
                disabled={isLoading || !formData.codigo.trim() || !formData.descripcion.trim()}
              >
                {isLoading ? (
                  <>
                    <span className="loading-spinner" style={{ width: '16px', height: '16px' }}></span>
                    Creando...
                  </>
                ) : (
                  <>
                    <span>💾</span>
                    Crear Diagnóstico
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};