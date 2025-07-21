import React, { useState, useEffect } from "react";
import { trabajadoresService } from "../../api/trabajadoresService";
import { horariosService } from "../../api/horariosService";
import type { Trabajador } from "../../types/trabajadores";
import type { Horario, HorarioDto } from "../../types/horarios";
import "../../styles/components/horario/HorarioEditModal.css";

interface Props {
  horario: Horario | null;
  onClose: () => void;
  onSave: () => void;
}

const diasSemana = [
  { value: "Lunes", label: "Lunes" },
  { value: "Martes", label: "Martes" },
  { value: "Miércoles", label: "Miércoles" },
  { value: "Jueves", label: "Jueves" },
  { value: "Viernes", label: "Viernes" },
  { value: "Sábado", label: "Sábado" },
  { value: "Domingo", label: "Domingo" }
];

const HorarioEditModal: React.FC<Props> = ({ horario, onClose, onSave }) => {
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTrabajadores, setLoadingTrabajadores] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<HorarioDto>({
    trabajadorId: 0,
    dia: "Lunes",
    horaInicio: "08:00",
    horaFin: "17:00",
    intensidadHoraria: 8
  });

  // Cargar trabajadores
  useEffect(() => {
    const cargarTrabajadores = async () => {
      try {
        setLoadingTrabajadores(true);
        const res = await trabajadoresService.getAll();
        setTrabajadores(res);
        setError(null);
      } catch (err) {
        setError("Error al cargar trabajadores");
        console.error("Error:", err);
      } finally {
        setLoadingTrabajadores(false);
      }
    };
    cargarTrabajadores();
  }, []);

  // Inicializar formulario con datos del horario
  useEffect(() => {
    if (horario) {
      setFormData({
        trabajadorId: horario.trabajadorId,
        dia: horario.dia,
        horaInicio: horario.horaInicio.substring(0, 5), // Solo HH:MM
        horaFin: horario.horaFin.substring(0, 5), // Solo HH:MM
        intensidadHoraria: horario.intensidadHoraria
      });
    }
  }, [horario]);

  // Calcular intensidad horaria automáticamente
  useEffect(() => {
    if (formData.horaInicio && formData.horaFin) {
      const inicio = new Date(`2000-01-01T${formData.horaInicio}`);
      const fin = new Date(`2000-01-01T${formData.horaFin}`);
      
      let diffMs = fin.getTime() - inicio.getTime();
      
      // Si el horario pasa a través de medianoche
      if (diffMs < 0) {
        diffMs += 24 * 60 * 60 * 1000; // Agregar 24 horas
      }
      
      const diffHours = diffMs / (1000 * 60 * 60);
      setFormData(prev => ({ ...prev, intensidadHoraria: Math.round(diffHours * 10) / 10 }));
    }
  }, [formData.horaInicio, formData.horaFin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!horario) return;

    if (formData.trabajadorId === 0) {
      setError("Por favor seleccione un trabajador");
      return;
    }

    if (formData.intensidadHoraria <= 0) {
      setError("La intensidad horaria debe ser mayor a 0");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      await horariosService.actualizar(horario.id, formData);
      alert("Horario actualizado correctamente");
      onSave();
      onClose();
    } catch (err) {
      setError("Error al actualizar el horario. Verifique que no exista un horario duplicado para este trabajador en este día.");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof HorarioDto, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  const getSelectedWorkerName = () => {
    const worker = trabajadores.find(t => t.id === formData.trabajadorId);
    return worker ? worker.nombre : "";
  };

  if (!horario) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-icon">✏️</div>
          <div className="modal-title-section">
            <h2>Editar Horario</h2>
            <p>Modifica los datos del horario de trabajo</p>
          </div>
          <button className="btn-close" onClick={onClose}>
            ❌
          </button>
        </div>

        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-section">
            <h3>Trabajador</h3>
            <div className="form-group">
              <label className="form-label">Seleccionar Trabajador</label>
              <select
                value={formData.trabajadorId}
                onChange={(e) => handleChange("trabajadorId", Number(e.target.value))}
                className="form-select"
                disabled={loadingTrabajadores}
                required
              >
                <option value={0}>
                  {loadingTrabajadores ? "Cargando trabajadores..." : "Seleccione un trabajador"}
                </option>
                {trabajadores.map(t => (
                  <option key={t.id} value={t.id}>{t.nombre}</option>
                ))}
              </select>
              {getSelectedWorkerName() && (
                <div className="selected-worker">
                  👤 Trabajador seleccionado: <strong>{getSelectedWorkerName()}</strong>
                </div>
              )}
            </div>
          </div>

          <div className="form-section">
            <h3>Día de la Semana</h3>
            <div className="days-grid">
              {diasSemana.map(dia => (
                <label key={dia.value} className="day-option">
                  <input
                    type="radio"
                    name="dia"
                    value={dia.value}
                    checked={formData.dia === dia.value}
                    onChange={(e) => handleChange("dia", e.target.value)}
                  />
                  <span className="day-label">{dia.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h3>Horario de Trabajo</h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Hora de Inicio</label>
                <input
                  type="time"
                  value={formData.horaInicio}
                  onChange={(e) => handleChange("horaInicio", e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Hora de Fin</label>
                <input
                  type="time"
                  value={formData.horaFin}
                  onChange={(e) => handleChange("horaFin", e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Intensidad Horaria</label>
                <div className="intensity-display">
                  <span className="intensity-number">{formData.intensidadHoraria}</span>
                  <span className="intensity-unit">horas</span>
                </div>
                <small className="form-help">
                  Se calcula automáticamente según las horas ingresadas
                </small>
              </div>
            </div>
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
              disabled={loading || formData.trabajadorId === 0}
            >
              {loading ? "Actualizando..." : "✅ Actualizar Horario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HorarioEditModal;