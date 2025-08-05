import React, { useState, useEffect } from "react";
import { crearAusencia } from "../../api/ausenciasService";
import { trabajadoresService } from "../../api/trabajadoresService";
import TrabajadorBuscador from "../shared/TrabajadorBuscador";
import type { AusenciaDto } from "../../types/ausencia";
import type { Trabajador } from "../../types/trabajadores";
import "../../styles/components/ausencias/AusenciaForm.css";

// Estilos adicionales para el loading
const loadingStyles = `
.loading-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 10px;
  border: 2px dashed #dee2e6;
  justify-content: center;
  color: #6c757d;
  font-weight: 500;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #dee2e6;
  border-top: 2px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

// Inyectar estilos
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = loadingStyles;
  document.head.appendChild(styleElement);
}

const initialState: AusenciaDto = {
  id: 0,
  fecha: new Date(),
  tipoAusencia: "",
  descripcion: "",
  trabajadorNombre: "",
  cargo: "",
  fechaInicio: new Date(),
  fechaFin: new Date(),
  horaInicio: "08:00",
  horaFin: "10:00",
  remunerado: false,
};

const AusenciaForm = () => {
  const [formData, setFormData] = useState<AusenciaDto>(initialState);
  const [mensaje, setMensaje] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [trabajadorSeleccionadoId, setTrabajadorSeleccionadoId] = useState<number>(0);
  const [loadingTrabajadores, setLoadingTrabajadores] = useState(true);

  // Cargar trabajadores al montar el componente
  useEffect(() => {
    const cargarTrabajadores = async () => {
      try {
        setLoadingTrabajadores(true);
        const data = await trabajadoresService.getAll();
        setTrabajadores(data);
      } catch (error) {
        console.error("Error al cargar trabajadores:", error);
        setMensaje("error:Error al cargar la lista de trabajadores.");
      } finally {
        setLoadingTrabajadores(false);
      }
    };

    cargarTrabajadores();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const target = e.target;
    const { name, value } = target;

    let newValue: unknown = value;

    if (target instanceof HTMLInputElement && target.type === "checkbox") {
      newValue = target.checked;
    }

    if (name === "fechaInicio" || name === "fechaFin") {
      newValue = new Date(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  // Manejar selección de trabajador
  const handleTrabajadorSelect = (trabajadorId: number, trabajador?: Trabajador) => {
    setTrabajadorSeleccionadoId(trabajadorId);
    
    if (trabajador) {
      setFormData(prev => ({
        ...prev,
        trabajadorNombre: trabajador.nombre,
        cargo: trabajador.cargo || "" // Usar el campo cargo del trabajador
      }));
    } else {
      // Si no hay trabajador seleccionado, limpiar los campos
      setFormData(prev => ({
        ...prev,
        trabajadorNombre: "",
        cargo: ""
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMensaje("");

    try {
      const nuevaAusencia = {
        ...formData,
        fecha: new Date(), // fecha de solicitud actual
      };

      await crearAusencia(nuevaAusencia);
      setMensaje("success:Ausencia registrada correctamente.");
      
      // Reiniciar el formulario
      setFormData(initialState);
      setTrabajadorSeleccionadoId(0);
    } catch (error) {
      console.error("Error al registrar la ausencia:", error);
      setMensaje("error:Hubo un error al guardar la ausencia.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLimpiar = () => {
    setFormData(initialState);
    setTrabajadorSeleccionadoId(0);
    setMensaje("");
  };

  return (
    <div className="ausencia-form-container">
      <div className="form-header">
        <h1 className="form-title">
          <span className="form-icon">📋</span>
          Registrar Ausencia
        </h1>
        <p className="form-subtitle">Complete el formulario para registrar una nueva ausencia</p>
      </div>

      <form className="ausencia-form" onSubmit={handleSubmit}>
        {/* Información del Trabajador */}
        <div className="form-section">
          <h3 className="section-title">
            <span className="section-icon">👤</span>
            Información del Trabajador
          </h3>
          <div className="form-grid">
            <div className="form-group full-width">
              {loadingTrabajadores ? (
                <div className="loading-container">
                  <span className="loading-spinner"></span>
                  Cargando trabajadores...
                </div>
              ) : (
                <TrabajadorBuscador
                  trabajadores={trabajadores}
                  value={trabajadorSeleccionadoId}
                  onChange={handleTrabajadorSelect}
                  placeholder="Buscar trabajador por nombre o cédula..."
                  label="Seleccionar Trabajador"
                  required={true}
                  showSelectedInfo={true}
                />
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                Nombre del trabajador <span className="required">*</span>
              </label>
              <input
                type="text"
                name="trabajadorNombre"
                value={formData.trabajadorNombre}
                onChange={handleChange}
                className="form-input"
                placeholder="Se llenará automáticamente"
                required
                readOnly
                disabled
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Cargo <span className="required">*</span>
              </label>
              <input
                type="text"
                name="cargo"
                value={formData.cargo}
                onChange={handleChange}
                className="form-input"
                placeholder="Se llenará automáticamente"
                required
                readOnly
                disabled
              />
            </div>
          </div>
        </div>

        {/* Información de la Ausencia */}
        <div className="form-section">
          <h3 className="section-title">
            <span className="section-icon">📅</span>
            Detalles de la Ausencia
          </h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                Tipo de Ausencia <span className="required">*</span>
              </label>
              <select
                name="tipoAusencia"
                value={formData.tipoAusencia}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="">Seleccionar tipo</option>
                <option value="Cita médica">Cita médica general</option>
                <option value="Accidente laboral">Accidente laboral</option>
                <option value="Enfermedad común">Enfermedad común</option>
                <option value="Cita Seguimiento EO">Cita Seguimiento EO</option>
                <option value="Enfermedad Laboral">Enfermedad Laboral</option>
                <option value="Accidente Origen Comun">Accidente Origen Comun</option>
                <option value="Diligencias personales">Diligencias personales</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label className="form-label">
                Descripción / Justificación <span className="required">*</span>
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                className="form-textarea"
                placeholder="Describa el motivo de la ausencia..."
                required
              />
            </div>
          </div>
        </div>

        {/* Fechas y Horarios */}
        <div className="form-section">
          <h3 className="section-title">
            <span className="section-icon">⏰</span>
            Fechas y Horarios
          </h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                Fecha de Inicio <span className="required">*</span>
              </label>
              <input
                type="date"
                name="fechaInicio"
                value={formData.fechaInicio.toISOString().split("T")[0]}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Fecha de Fin <span className="required">*</span>
              </label>
              <input
                type="date"
                name="fechaFin"
                value={formData.fechaFin.toISOString().split("T")[0]}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Hora de Inicio <span className="required">*</span>
              </label>
              <input
                type="time"
                name="horaInicio"
                value={formData.horaInicio}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Hora de Fin <span className="required">*</span>
              </label>
              <input
                type="time"
                name="horaFin"
                value={formData.horaFin}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="remunerado"
                  checked={formData.remunerado}
                  onChange={handleChange}
                  className="form-checkbox"
                />
                <span className="checkbox-custom"></span>
                <span className="checkbox-text">¿Es remunerado?</span>
              </label>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleLimpiar}
            disabled={isLoading}
          >
            <span className="btn-icon">🔄</span>
            Limpiar
          </button>
          
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading || !trabajadorSeleccionadoId}
          >
            {isLoading ? (
              <>
                <span className="btn-spinner"></span>
                Guardando...
              </>
            ) : (
              <>
                <span className="btn-icon">💾</span>
                Guardar Ausencia
              </>
            )}
          </button>
        </div>

        {/* Mensaje de resultado */}
        {mensaje && (
          <div className={`form-message ${mensaje.startsWith('success:') ? 'success' : 'error'}`}>
            <span className="message-icon">
              {mensaje.startsWith('success:') ? '✅' : '❌'}
            </span>
            {mensaje.replace(/^(success:|error:)/, '')}
          </div>
        )}
      </form>
    </div>
  );
};

export default AusenciaForm;