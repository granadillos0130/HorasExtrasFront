import React, { useState } from "react";
import { centrosService } from "../../api/centrosService";
import type { Centro } from "../../types/centros";
import "../../styles/components/CentroForm.css";

interface Props {
  onSuccess: () => void;
}

const CentroForm: React.FC<Props> = ({ onSuccess }) => {
  const [formData, setFormData] = useState<Centro>({
    id: "",
    nombreCentro: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.id.trim() || !formData.nombreCentro.trim()) {
      setError("Por favor, ingrese un ID válido y un nombre de centro.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await centrosService.crear(formData);
      alert("Centro creado correctamente.");
      onSuccess();
      setFormData({ id: "", nombreCentro: "" });
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError("Ya existe un centro con este ID. Por favor, use un ID diferente.");
      } else {
        setError("Error al crear el centro. Inténtelo de nuevo.");
      }
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="centro-form-container">
      <div className="form-header">
        <div className="form-icon">🏢</div>
        <div className="form-title-section">
          <h3>Crear Nuevo Centro</h3>
          <p>Complete la información para registrar un nuevo centro de trabajo</p>
        </div>
      </div>

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      <form className="centro-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">ID Centro</label>
              <input
                type="text"
                name="id"
                value={formData.id}
                onChange={handleChange}
                className="form-input"
                placeholder="Ej: 001, CTR-01"
                required
                disabled={loading}
              />
              <small className="form-help">
                Identificador único del centro
              </small>
            </div>

            <div className="form-group">
              <label className="form-label">Nombre del Centro</label>
              <input
                type="text"
                name="nombreCentro"
                value={formData.nombreCentro}
                onChange={handleChange}
                className="form-input"
                placeholder="Ej: Centro Principal"
                required
                disabled={loading}
                maxLength={100}
              />
              <small className="form-help">
                Nombre descriptivo del centro de trabajo
              </small>
            </div>
          </div>

          {/* Vista previa */}
          {(formData.id.trim() || formData.nombreCentro.trim()) && (
            <div className="preview-section">
              <h4>Vista Previa</h4>
              <div className="centro-preview">
                <div className="preview-icon">🏢</div>
                <div className="preview-content">
                  <div className="preview-name">
                    {formData.nombreCentro.trim() || "Nombre del centro"}
                  </div>
                  <div className="preview-id">
                    ID: {formData.id.trim() || "---"}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn-submit"
            disabled={loading || !formData.id.trim() || !formData.nombreCentro.trim()}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Creando...
              </>
            ) : (
              <>
                ✅ Crear Centro
              </>
            )}
          </button>
        </div>
      </form>

      {/* Información adicional */}
      <div className="info-section">
        <div className="info-item">
          <span className="info-icon">💡</span>
          <span className="info-text">
            <strong>Consejo:</strong> Use un ID corto y descriptivo que sea fácil de recordar.
          </span>
        </div>
        <div className="info-item">
          <span className="info-icon">🎯</span>
          <span className="info-text">
            <strong>Uso:</strong> Los centros ayudan a organizar trabajadores y registros por ubicación.
          </span>
        </div>
      </div>
    </div>
  );
};

export default CentroForm;