import React, { useState } from "react";
import { horariosRotativosService } from "../../api/horariosRotativosService";
import type { DetalleHorarioDto } from "../../types/horariosRotativos";

interface Props {
  horarioId: number;
  diasExistentes: string[];
  onSuccess: () => void;
  onCancel: () => void;
}

const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

const AgregarDetalleForm: React.FC<Props> = ({ horarioId, diasExistentes, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<DetalleHorarioDto>({
    diaSemana: "",
    horaInicio: "08:00",
    horaFin: "17:00",
    tiempoAlmuerzo: "01:30"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const diasDisponibles = diasSemana.filter(d => !diasExistentes.includes(d));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.diaSemana) {
      setError("Selecciona un día");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await horariosRotativosService.agregarDetalle(horarioId, formData);
      alert("Día agregado correctamente");
      onSuccess();
    } catch (err) {
      setError("Error al agregar el día");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="agregar-detalle-form">
      <h4>Agregar Día al Horario</h4>
      
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Día *</label>
            <select
              value={formData.diaSemana}
              onChange={(e) => setFormData(prev => ({ ...prev, diaSemana: e.target.value }))}
              required
              disabled={loading}
            >
              <option value="">Seleccionar día</option>
              {diasDisponibles.map(dia => (
                <option key={dia} value={dia}>{dia}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Hora Inicio *</label>
            <input
              type="time"
              value={formData.horaInicio}
              onChange={(e) => setFormData(prev => ({ ...prev, horaInicio: e.target.value }))}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Hora Fin *</label>
            <input
              type="time"
              value={formData.horaFin}
              onChange={(e) => setFormData(prev => ({ ...prev, horaFin: e.target.value }))}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Tiempo Almuerzo</label>
            <input
              type="time"
              value={formData.tiempoAlmuerzo}
              onChange={(e) => setFormData(prev => ({ ...prev, tiempoAlmuerzo: e.target.value }))}
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading || !formData.diaSemana}
          >
            {loading ? "Agregando..." : "Agregar Día"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AgregarDetalleForm;