import React, { useState } from "react";
import { horariosRotativosService } from "../../api/horariosRotativosService";
import type { CrearHorarioDto } from "../../types/horariosRotativos";
import "../../styles/components/horario/Modal.css";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const CrearHorarioModal: React.FC<Props> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState<CrearHorarioDto>({
    nombre: "",
    descripcion: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre.trim()) {
      setError("El nombre es obligatorio");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await horariosRotativosService.crearHorario(formData);
      alert("Horario creado correctamente");
      onSuccess();
    } catch (err) {
      setError("Error al crear el horario");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Crear Horario Rotativo</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label>Nombre del Horario *</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
              placeholder="Ej: Horario A - Sin Sábados"
              required
              disabled={loading}
            />
            <small>Nombre descriptivo para identificar el horario</small>
          </div>

          <div className="form-group">
            <label>Descripción (Opcional)</label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
              placeholder="Ej: L-V: 7:12-17:30 (8.8h/día), Total: 44h semanales"
              rows={3}
              disabled={loading}
            />
            <small>Detalle del horario para referencia rápida</small>
          </div>

          <div className="info-box">
            <strong>Siguiente paso:</strong> Después de crear el horario, podrás agregar los detalles de cada día (Lunes a Domingo).
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? "Creando..." : "Crear Horario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearHorarioModal;