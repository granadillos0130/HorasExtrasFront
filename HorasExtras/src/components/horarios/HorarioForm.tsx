import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { trabajadoresService } from "../../api/trabajadoresService";
import { horariosService } from "../../api/horariosService";
import TrabajadorBuscador from "../shared/TrabajadorBuscador";
import type { Trabajador } from "../../types/trabajadores";
import type { HorarioDto } from "../../types/horarios";
import "../../styles/components/horario/HorariosForm.css"

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
  const [trabajadorSeleccionado, setTrabajadorSeleccionado] = useState<Trabajador | null>(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    trabajadorId: 0,
    diasSeleccionados: [] as string[],
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
        diffMs += 24 * 60 * 60 * 1000;
      }

      let diffHours = diffMs / (1000 * 60 * 60);

      // 👇 Aquí restás las 2 horas del almuerzo
      diffHours -= 2;

      // Asegurate de que no sea negativo (en caso de error)
      diffHours = Math.max(0, diffHours);

      setFormData(prev => ({
        ...prev,
        intensidadHoraria: Math.round(diffHours * 10) / 10
      }));
    }
  }, [formData.horaInicio, formData.horaFin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.trabajadorId === 0) {
      setError("Por favor seleccione un trabajador");
      return;
    }

    if (formData.diasSeleccionados.length === 0) {
      setError("Por favor seleccione al menos un día");
      return;
    }

    if (formData.intensidadHoraria <= 0) {
      setError("La intensidad horaria debe ser mayor a 0");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Crear array de horarios para cada día seleccionado
      const horariosDto: HorarioDto[] = formData.diasSeleccionados.map(dia => ({
        trabajadorId: formData.trabajadorId,
        dia,
        horaInicio: formData.horaInicio,
        horaFin: formData.horaFin,
        intensidadHoraria: formData.intensidadHoraria
      }));

      // Si es un solo día, usar el método individual, si son varios, usar el lote
      if (horariosDto.length === 1) {
        await horariosService.crear(horariosDto[0]);
      } else {
        await horariosService.crearLote(horariosDto);
      }

      const mensaje = horariosDto.length === 1 
        ? "Horario creado correctamente" 
        : `${horariosDto.length} horarios creados correctamente`;
      
      alert(mensaje);
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/horarios");
      }
      
      // Limpiar formulario
      setFormData({
        trabajadorId: 0,
        diasSeleccionados: [],
        horaInicio: "08:00",
        horaFin: "17:00",
        intensidadHoraria: 8
      });
      setTrabajadorSeleccionado(null);
    } catch (err) {
      setError("Error al crear los horarios. Verifique que no existan horarios duplicados para este trabajador en los días seleccionados.");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  const handleTrabajadorChange = (trabajadorId: number, trabajador?: Trabajador) => {
    setFormData(prev => ({
      ...prev,
      trabajadorId
    }));
    setTrabajadorSeleccionado(trabajador || null);
    setError(null);
  };

  const handleDayToggle = (dia: string) => {
    setFormData(prev => {
      const diasSeleccionados = prev.diasSeleccionados.includes(dia)
        ? prev.diasSeleccionados.filter(d => d !== dia)
        : [...prev.diasSeleccionados, dia];
      
      return {
        ...prev,
        diasSeleccionados
      };
    });
    setError(null);
  };

  const selectAllDays = () => {
    setFormData(prev => ({
      ...prev,
      diasSeleccionados: diasSemana.map(d => d.value)
    }));
  };

  const clearAllDays = () => {
    setFormData(prev => ({
      ...prev,
      diasSeleccionados: []
    }));
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
              
              {/* Reemplazamos el select tradicional con TrabajadorBuscador */}
              <TrabajadorBuscador
                trabajadores={trabajadores}
                value={formData.trabajadorId}
                onChange={handleTrabajadorChange}
                placeholder={loadingTrabajadores ? "Cargando trabajadores..." : "Buscar trabajador por nombre o cédula..."}
                label="Seleccionar Trabajador"
                disabled={loadingTrabajadores || loading}
                required={true}
                showSelectedInfo={true}
              />
            </div>

            <div className="form-section">
              <div className="days-header">
                <h3>Días de la Semana</h3>
                <div className="days-actions">
                  <button 
                    type="button" 
                    onClick={selectAllDays}
                    className="btn-link"
                    disabled={loading}
                  >
                    Seleccionar todos
                  </button>
                  <button 
                    type="button" 
                    onClick={clearAllDays}
                    className="btn-link"
                    disabled={loading}
                  >
                    Limpiar
                  </button>
                </div>
              </div>
              
              <div className="days-grid">
                {diasSemana.map(dia => (
                  <label key={dia.value} className={`day-option ${formData.diasSeleccionados.includes(dia.value) ? 'selected' : ''}`}>
                    <input
                      type="checkbox"
                      checked={formData.diasSeleccionados.includes(dia.value)}
                      onChange={() => handleDayToggle(dia.value)}
                    />
                    <span className="day-label">{dia.label}</span>
                  </label>
                ))}
              </div>
              
              {formData.diasSeleccionados.length > 0 && (
                <div className="selected-days-summary">
                  📅 Días seleccionados ({formData.diasSeleccionados.length}): {formData.diasSeleccionados.join(", ")}
                </div>
              )}
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

            {formData.diasSeleccionados.length > 1 && (
              <div className="batch-info">
                <div className="batch-icon">📋</div>
                <div>
                  <strong>Creación en lote</strong>
                  <p>Se crearán {formData.diasSeleccionados.length} horarios con la misma configuración horaria</p>
                </div>
              </div>
            )}

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
                disabled={loading || formData.trabajadorId === 0 || formData.diasSeleccionados.length === 0}
              >
                {loading ? "Creando..." : `✅ Crear ${formData.diasSeleccionados.length > 1 ? `${formData.diasSeleccionados.length} Horarios` : 'Horario'}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HorariosForm;