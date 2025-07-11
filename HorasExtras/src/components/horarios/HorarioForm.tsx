import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { trabajadoresService } from "../../api/trabajadoresService";
import { horariosService } from "../../api/horariosService";
import type { Trabajador } from "../../types/trabajadores";
import type { HorarioDto } from "../../types/horarios";
import "../../styles/components/HorariosForm.css"

interface Props {
  onSuccess?: () => void;
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



const HorariosForm: React.FC<Props> = ({ onSuccess }) => {
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTrabajadores, setLoadingTrabajadores] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState<HorarioDto>({
    trabajadorId: 0,
    dia: "Lunes",
    horaInicio: "08:00",
    horaFin: "17:00",
    intensidadHoraria: 8
  });

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
      await horariosService.crear(formData);
      alert("Horario creado correctamente");
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/horarios");
      }
      
      // Limpiar formulario
      setFormData({
        trabajadorId: 0,
        dia: "Lunes",
        horaInicio: "08:00",
        horaFin: "17:00",
        intensidadHoraria: 8
      });
    } catch (err) {
      setError("Error al crear el horario. Verifique que no exista un horario para este trabajador en este día.");
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

  return (
    <div className="horario-form-page">
      <div className="page-container">
        <div className="page-header">
          <h1>Crear Nuevo Horario</h1>
          <p className="page-subtitle">
            Asigna horarios de trabajo a tus empleados
          </p>
        </div>

        <div className="form-card">
          <div className="form-header">
            <div className="form-icon">⏰</div>
            <div>
              <h2>Información del Horario</h2>
              <p>Complete los datos para crear un nuevo horario de trabajo</p>
            </div>
          </div>

          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="horario-form">
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

            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate("/horarios")}
                disabled={loading}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn-primary"
                disabled={loading || formData.trabajadorId === 0}
              >
                {loading ? "Creando..." : "✅ Crear Horario"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HorariosForm;