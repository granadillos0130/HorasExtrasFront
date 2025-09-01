import React, { useState, useEffect } from "react";
import { crearAusencia } from "../../api/ausenciasService";
import { trabajadoresService } from "../../api/trabajadoresService";
import { crearDiagnostico } from "../../api/ausenciasService";
import { api } from "../../api/api"; // 🆕 Importar api para validación
import TrabajadorBuscador from "../shared/TrabajadorBuscador";
import DiagnosticoBuscador from "../shared/DiagnosticoBuscador";
import type { AusenciaDto } from "../../types/ausencia";
import type { Trabajador } from "../../types/trabajadores";
import type { Diagnostico } from "../../types/diagnostico";
import "../../styles/components/ausencias/AusenciaForm.css";

// 🆕 Interfaces para validación de vacaciones
interface ValidarVacacionesDto {
  fechaInicio: Date;
  fechaFin: Date;
  tipoAusencia: string;
  trabajadorId: number;
}

interface DetalleDia {
  fecha: string;
  diaSemana: string;
  esLaborable: boolean;
  esFestivo: boolean;
  tieneRegistros: boolean;
  motivo: string;
}

interface ValidacionVacaciones {
  fechaInicio: string;
  fechaFin: string;
  totalDias: number;
  diasLaborables: number;
  diasNoLaborables: number;
  diasADescontar: number;
  detalleDias: DetalleDia[];
  mensaje: string;
  explicacion: {
    domingos: string;
    sabados: string;
    festivos: string;
  };
}

// Estilos adicionales
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

.form-message {
  white-space: pre-line;
  line-height: 1.6;
  text-align: left;
  max-width: 100%;
  word-wrap: break-word;
}

.form-message.success {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  border: 2px solid #10b981;
  color: #064e3b;
  padding: 20px;
  border-radius: 12px;
  margin-top: 20px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

.form-message.error {
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  border: 2px solid #ef4444;
  color: #7f1d1d;
  padding: 20px;
  border-radius: 12px;
  margin-top: 20px;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
}

.message-icon {
  font-size: 1.2rem;
  margin-right: 10px;
  display: inline-block;
}

.integration-info {
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  border: 2px solid #3b82f6;
  border-radius: 15px;
  padding: 20px;
  margin: 25px 0;
  position: relative;
  overflow: hidden;
}

.integration-info::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #3b82f6, #1d4ed8, #3b82f6);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.integration-info h4 {
  color: #1d4ed8;
  margin: 0 0 15px 0;
  font-size: 1.2rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
}

.integration-info p {
  color: #1e40af;
  margin: 0 0 10px 0;
  line-height: 1.6;
}

.integration-info ul {
  color: #1e40af;
  margin: 10px 0;
  padding-left: 20px;
}

.integration-info li {
  margin: 5px 0;
}

.diagnostico-section {
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
  border: 2px solid #0ea5e9;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 15px;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.diagnostico-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  color: #0c4a6e;
  font-size: 1.1rem;
  font-weight: 600;
}

.diagnostico-help {
  display: block;
  margin-top: 8px;
  color: #0369a1;
  font-size: 0.85rem;
  font-style: italic;
  background: rgba(255, 255, 255, 0.7);
  padding: 8px 12px;
  border-radius: 6px;
  border-left: 3px solid #0ea5e9;
}

/* 🆕 Estilos para validación de vacaciones */
.validacion-vacaciones {
  background: linear-gradient(135deg, #fefbf3, #fef3c7);
  border: 2px solid #f59e0b;
  border-radius: 12px;
  padding: 20px;
  margin: 15px 0;
  animation: slideIn 0.3s ease-out;
}

.validacion-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  color: #92400e;
  font-size: 1.1rem;
  font-weight: 600;
}

.validacion-content {
  color: #78350f;
  line-height: 1.6;
}

.validacion-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin: 15px 0;
}

.validacion-item {
  background: rgba(255, 255, 255, 0.8);
  padding: 12px;
  border-radius: 8px;
  border-left: 4px solid #f59e0b;
}

.validacion-item strong {
  display: block;
  color: #92400e;
  font-size: 0.9rem;
  margin-bottom: 4px;
}

.validacion-item span {
  font-size: 1.1rem;
  font-weight: 600;
  color: #78350f;
}

.fecha-regreso {
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  border: 2px solid #22c55e;
  border-radius: 10px;
  padding: 15px;
  margin-top: 15px;
  text-align: center;
}

.fecha-regreso-title {
  color: #15803d;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 1rem;
}

.fecha-regreso-date {
  color: #166534;
  font-size: 1.3rem;
  font-weight: 700;
}

.detalle-dias {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  padding: 15px;
  margin-top: 15px;
  max-height: 200px;
  overflow-y: auto;
}

.detalle-dias h5 {
  margin: 0 0 10px 0;
  color: #92400e;
  font-size: 0.95rem;
}

.dia-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid #f3f4f6;
  font-size: 0.85rem;
}

.dia-item:last-child {
  border-bottom: none;
}

.dia-fecha {
  font-weight: 600;
  color: #374151;
}

.dia-tipo {
  color: #6b7280;
}

.dia-laborable {
  color: #059669;
  font-weight: 600;
}

.dia-no-laborable {
  color: #dc2626;
  font-weight: 600;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-container {
  background: white;
  border-radius: 16px;
  padding: 0;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-50px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  background: linear-gradient(135deg, #1e40af, #3b82f6);
  color: white;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 16px 16px 0 0;
}

.modal-title {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal-close {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
  transition: background 0.2s;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.3);
}

.modal-body {
  padding: 30px;
  overflow-y: auto;
  max-height: calc(90vh - 140px);
}

.modal-form-group {
  margin-bottom: 20px;
}

.modal-form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #374151;
  font-size: 0.95rem;
}

.modal-form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.modal-form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.modal-form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  min-height: 80px;
  resize: vertical;
  transition: border-color 0.2s, box-shadow 0.2s;
  font-family: inherit;
  box-sizing: border-box;
}

.modal-form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.modal-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.modal-btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.modal-btn-secondary:hover:not(:disabled) {
  background: #e5e7eb;
}

.modal-btn-primary {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
}

.modal-btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.modal-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.modal-help-text {
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 20px;
  font-size: 0.9rem;
  color: #92400e;
}

.modal-help-text strong {
  color: #78350f;
}

.required {
  color: #ef4444;
}

.crear-diagnostico-btn {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  transition: all 0.2s;
}

.crear-diagnostico-btn:hover {
  background: linear-gradient(135deg, #059669, #047857);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
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
  horaFin: "17:00", // 🆕 Cambio a día completo por defecto
  remunerado: false,
  diagnosticoId: undefined,
  diagnosticoCodigo: "",
  diagnosticoDescripcion: "",
};

// Interface para el nuevo diagnóstico
interface NuevoDiagnostico {
  codigo: string;
  descripcion: string;
}

const initialDiagnosticoState: NuevoDiagnostico = {
  codigo: "",
  descripcion: ""
};

// 🆕 Función para validar días de vacaciones
const validarDiasVacaciones = async (validacionDto: ValidarVacacionesDto): Promise<ValidacionVacaciones> => {
  const response = await api.post<ValidacionVacaciones>("/ausencias/validar-dias-vacaciones", validacionDto);
  return response.data;
};

// 🆕 Función para calcular fecha de regreso (próximo día laboral)
const calcularFechaRegreso = (fechaFin: Date): Date => {
  const fechaRegreso = new Date(fechaFin);
  fechaRegreso.setDate(fechaRegreso.getDate() + 1);
  
  // Si es sábado (6) o domingo (0), avanzar al lunes
  while (fechaRegreso.getDay() === 0 || fechaRegreso.getDay() === 6) {
    fechaRegreso.setDate(fechaRegreso.getDate() + 1);
  }
  
  return fechaRegreso;
};

// Componente Modal para crear diagnóstico
const CrearDiagnosticoModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onDiagnosticoCreated: (diagnostico: Diagnostico) => void;
}> = ({ isOpen, onClose, onDiagnosticoCreated }) => {
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
            <strong>💡 Información importante:</strong><br/>
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

const AusenciaForm = () => {
  const [formData, setFormData] = useState<AusenciaDto>(initialState);
  const [mensaje, setMensaje] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [trabajadorSeleccionadoId, setTrabajadorSeleccionadoId] = useState<number>(0);
  const [loadingTrabajadores, setLoadingTrabajadores] = useState(true);
  const [mostrarInfo, setMostrarInfo] = useState(false);
  
  // Estados para la modal de crear diagnóstico
  const [showCrearDiagnosticoModal, setShowCrearDiagnosticoModal] = useState(false);
  const [diagnosticoBuscadorKey, setDiagnosticoBuscadorKey] = useState(0);
  
  // 🆕 Estados para validación de vacaciones
  const [validacionVacaciones, setValidacionVacaciones] = useState<ValidacionVacaciones | null>(null);
  const [loadingValidacion, setLoadingValidacion] = useState(false);

  // 🆕 Función para verificar si es vacaciones (memoizada)
  const esVacaciones = React.useCallback(() => {
    return formData.tipoAusencia.toLowerCase().includes("vacacion");
  }, [formData.tipoAusencia]);

  // 🆕 Función para validar vacaciones cuando cambien fechas o trabajador (memoizada)
  const validarVacacionesSiAplica = React.useCallback(async () => {
    if (!esVacaciones() || !trabajadorSeleccionadoId || !formData.fechaInicio || !formData.fechaFin) {
      setValidacionVacaciones(null);
      return;
    }

    setLoadingValidacion(true);
    try {
      const validacion = await validarDiasVacaciones({
        fechaInicio: formData.fechaInicio,
        fechaFin: formData.fechaFin,
        tipoAusencia: formData.tipoAusencia,
        trabajadorId: trabajadorSeleccionadoId
      });
      setValidacionVacaciones(validacion);
    } catch (error) {
      console.error("Error al validar vacaciones:", error);
      setValidacionVacaciones(null);
    } finally {
      setLoadingValidacion(false);
    }
  }, [esVacaciones, trabajadorSeleccionadoId, formData.fechaInicio, formData.fechaFin, formData.tipoAusencia]);

  // 🆕 Effect para validar vacaciones cuando cambien las dependencias
  useEffect(() => {
    if (esVacaciones() && trabajadorSeleccionadoId && formData.fechaInicio && formData.fechaFin) {
      // Pequeño delay para evitar demasiadas llamadas
      const timeoutId = setTimeout(() => {
        validarVacacionesSiAplica();
      }, 500);
      
      return () => clearTimeout(timeoutId);
    } else {
      setValidacionVacaciones(null);
    }
  }, [esVacaciones, validarVacacionesSiAplica, trabajadorSeleccionadoId, formData.fechaInicio, formData.fechaFin]);

  const mostrarCampoDiagnostico = () => {
    const tiposConDiagnostico = [
      "Cita médica general",
      "Cita Seguimiento EO", 
      "Enfermedad común",
      "Enfermedad Laboral"
    ];
    
    return tiposConDiagnostico.includes(formData.tipoAusencia);
  };

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

    if (name === "tipoAusencia") {
      // 🆕 Cuando cambie el tipo de ausencia, ajustar horarios
      const nuevasHoras = value.toLowerCase().includes("vacacion") 
        ? { horaInicio: "08:00", horaFin: "17:00" } // Día completo para vacaciones
        : { horaInicio: "08:00", horaFin: "10:00" }; // Horas específicas para otras ausencias

      setFormData((prev) => ({
        ...prev,
        tipoAusencia: value as string,
        diagnosticoId: undefined,
        diagnosticoCodigo: "",
        diagnosticoDescripcion: "",
        ...nuevasHoras
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleTrabajadorSelect = (trabajadorId: number, trabajador?: Trabajador) => {
    setTrabajadorSeleccionadoId(trabajadorId);
    
    if (trabajador) {
      setFormData(prev => ({
        ...prev,
        trabajadorNombre: trabajador.nombre,
        cargo: trabajador.cargo || ""
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        trabajadorNombre: "",
        cargo: ""
      }));
    }
  };

  const handleDiagnosticoSelect = (diagnosticoId: number | undefined, diagnostico?: Diagnostico) => {
    setFormData(prev => ({
      ...prev,
      diagnosticoId: diagnosticoId,
      diagnosticoCodigo: diagnostico?.codigo || "",
      diagnosticoDescripcion: diagnostico?.descripcion || ""
    }));
  };

  // Manejar cuando se crea un nuevo diagnóstico
  const handleDiagnosticoCreated = (nuevoDiagnostico: Diagnostico) => {
    setFormData(prev => ({
      ...prev,
      diagnosticoId: nuevoDiagnostico.id,
      diagnosticoCodigo: nuevoDiagnostico.codigo,
      diagnosticoDescripcion: nuevoDiagnostico.descripcion
    }));
    
    setDiagnosticoBuscadorKey(prev => prev + 1);
    setMensaje("success:🎉 ¡Diagnóstico creado exitosamente!\n\nSe ha seleccionado automáticamente en el formulario.");
    
    setTimeout(() => {
      setMensaje("");
    }, 5000);
  };

  const calcularDiasAusencia = (fechaInicio: Date, fechaFin: Date): number => {
    const tiempoTranscurrido = fechaFin.getTime() - fechaInicio.getTime();
    const diasTranscurridos = Math.ceil(tiempoTranscurrido / (1000 * 60 * 60 * 24));
    return diasTranscurridos + 1;
  };

  const calcularHorasTotales = (horaInicio: string, horaFin: string, dias: number): number => {
    // 🆕 Para vacaciones, calcular horas de jornada completa
    if (esVacaciones()) {
      return dias * 8; // Asumir 8 horas por día de vacaciones
    }
    
    const [horaInicioH, horaInicioM] = horaInicio.split(':').map(Number);
    const [horaFinH, horaFinM] = horaFin.split(':').map(Number);
    
    const minutosInicio = horaInicioH * 60 + horaInicioM;
    const minutosFin = horaFinH * 60 + horaFinM;
    
    const horasPorDia = (minutosFin - minutosInicio) / 60;
    return horasPorDia * dias;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMensaje("");

    try {
      const nuevaAusencia = {
        ...formData,
        fecha: new Date(),
      };

      await crearAusencia(nuevaAusencia);
      
      const diasAusencia = calcularDiasAusencia(formData.fechaInicio, formData.fechaFin);
      const horasTotales = calcularHorasTotales(formData.horaInicio, formData.horaFin, diasAusencia);
      
      // 🆕 Mensaje específico para vacaciones
      let mensajeExito = "";
      
      if (esVacaciones()) {
        const diasADescontar = validacionVacaciones?.diasADescontar || diasAusencia;
        const fechaRegreso = calcularFechaRegreso(formData.fechaFin);
        
        mensajeExito = `success:🎉 ¡Vacaciones registradas exitosamente!

📅 DETALLES DE LAS VACACIONES:
• Período solicitado: ${formData.fechaInicio.toLocaleDateString('es-ES')} - ${formData.fechaFin.toLocaleDateString('es-ES')}
• Días calendarios: ${diasAusencia} días
• Días laborables a descontar: ${diasADescontar} días
• Fecha de regreso: ${fechaRegreso.toLocaleDateString('es-ES')}

📋 INTEGRACIÓN AUTOMÁTICA CON REGISTROS:
• Se crearon automáticamente ${diasAusencia} registro${diasAusencia > 1 ? 's' : ''} de vacaciones
• Horario: Día completo (08:00 - 17:00)
• Total de horas: ${horasTotales.toFixed(2)} horas

${formData.remunerado 
  ? `💰 VACACIONES REMUNERADAS:
• Las horas contarán como horas normales trabajadas
• Se incluirán en el cálculo de jornada completa` 
  : `🚫 VACACIONES NO REMUNERADAS:
• Las horas se marcarán como horas ausentes
• No contarán para horas normales trabajadas`
}

🔍 DÓNDE VER LOS REGISTROS:
• Ve al Dashboard de Registros → Selecciona las fechas de vacaciones
• Los registros aparecerán marcados como "AUSENCIA - Vacaciones"`;
      } else {
        mensajeExito = `success:🎉 ¡Ausencia registrada exitosamente!

📋 INTEGRACIÓN AUTOMÁTICA CON REGISTROS:
• Se crearon automáticamente ${diasAusencia} registro${diasAusencia > 1 ? 's' : ''} en el sistema de horas
• Fechas afectadas: ${formData.fechaInicio.toLocaleDateString('es-ES')} - ${formData.fechaFin.toLocaleDateString('es-ES')}
• Horario de ausencia: ${formData.horaInicio} - ${formData.horaFin}
• Total de horas: ${horasTotales.toFixed(2)} horas
${formData.diagnosticoCodigo ? `• Diagnóstico: ${formData.diagnosticoCodigo} - ${formData.diagnosticoDescripcion}` : ''}

${formData.remunerado 
  ? `💰 AUSENCIA REMUNERADA:
• Las horas contarán como horas normales trabajadas
• Se incluirán en el cálculo de jornada completa
• Aparecerán con fondo amarillo en el dashboard de registros` 
  : `🚫 AUSENCIA NO REMUNERADA:
• Las horas se marcarán como horas ausentes
• No contarán para horas normales trabajadas
• Se identificarán claramente en reportes y estadísticas`
}

🔍 DÓNDE VER LOS REGISTROS:
• Ve al Dashboard de Registros → Selecciona las fechas de la ausencia
• Los registros aparecerán marcados como "AUSENCIA - ${formData.tipoAusencia}"
• Podrás filtrar entre registros de trabajo y ausencias`;
      }

      setMensaje(mensajeExito);
      
      // Reiniciar el formulario
      setFormData(initialState);
      setTrabajadorSeleccionadoId(0);
      setValidacionVacaciones(null); // 🆕 Limpiar validación
      setDiagnosticoBuscadorKey(prev => prev + 1);
      
      // Scroll hacia el mensaje
      setTimeout(() => {
        const messageElement = document.querySelector('.form-message');
        if (messageElement) {
          messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      
    } catch (error) {
      console.error("Error al registrar la ausencia:", error);
      setMensaje("error:❌ Error al guardar la ausencia.\n\nPor favor, verifica que todos los campos estén correctos e intenta nuevamente.\n\nSi el problema persiste, contacta al administrador del sistema.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLimpiar = () => {
    setFormData(initialState);
    setTrabajadorSeleccionadoId(0);
    setMensaje("");
    setValidacionVacaciones(null); // 🆕 Limpiar validación
    setDiagnosticoBuscadorKey(prev => prev + 1);
  };

  // Componente de información sobre integración
  const IntegrationInfoComponent = () => (
    <div className="integration-info">
      <h4>
        🔗 Integración Automática con Sistema de Registros
        <button 
          type="button"
          onClick={() => setMostrarInfo(!mostrarInfo)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            marginLeft: 'auto',
            fontSize: '1rem',
            color: '#1d4ed8'
          }}
        >
          {mostrarInfo ? '🔼' : '🔽'}
        </button>
      </h4>
      
      {mostrarInfo && (
        <div>
          <p>
            <strong>¿Qué sucede cuando registras una ausencia?</strong>
          </p>
          <ul>
            <li>Se crean automáticamente registros en el sistema de horas para cada día de la ausencia</li>
            <li>Las ausencias aparecen junto con los registros normales de trabajo</li>
            <li>Si es <strong>remunerada</strong>: cuenta como horas normales trabajadas</li>
            <li>Si <strong>no es remunerada</strong>: se marca como horas ausentes</li>
            <li><strong>Para vacaciones</strong>: se registra automáticamente como día completo (8 horas)</li>
            <li><strong>Para citas médicas y enfermedades</strong>: puedes agregar el diagnóstico CIE-10 correspondiente</li>
          </ul>
        </div>
      )}
    </div>
  );

  // 🆕 Componente para mostrar validación de vacaciones
  const ValidacionVacacionesComponent = () => {
    if (!esVacaciones() || !validacionVacaciones) return null;

    const fechaRegreso = calcularFechaRegreso(formData.fechaFin);

    return (
      <div className="validacion-vacaciones">
        <div className="validacion-header">
          <span>🏖️</span>
          <strong>Validación de Vacaciones</strong>
        </div>
        
        <div className="validacion-content">
          <p style={{ marginBottom: '15px', fontWeight: '600' }}>
            {validacionVacaciones.mensaje}
          </p>
          
          <div className="validacion-grid">
            <div className="validacion-item">
              <strong>Total de días</strong>
              <span>{validacionVacaciones.totalDias}</span>
            </div>
            <div className="validacion-item">
              <strong>Días laborables</strong>
              <span>{validacionVacaciones.diasLaborables}</span>
            </div>
            <div className="validacion-item">
              <strong>Días no laborables</strong>
              <span>{validacionVacaciones.diasNoLaborables}</span>
            </div>
            <div className="validacion-item">
              <strong>Se descontarán</strong>
              <span>{validacionVacaciones.diasADescontar} días</span>
            </div>
          </div>

          <div className="fecha-regreso">
            <div className="fecha-regreso-title">📅 Fecha de regreso al trabajo:</div>
            <div className="fecha-regreso-date">
              {fechaRegreso.toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>

          {validacionVacaciones.detalleDias && validacionVacaciones.detalleDias.length > 0 && (
            <div className="detalle-dias">
              <h5>📋 Detalle por días:</h5>
              {validacionVacaciones.detalleDias.map((dia, index) => (
                <div key={index} className="dia-item">
                  <span className="dia-fecha">
                    {new Date(dia.fecha).toLocaleDateString('es-ES')} - {dia.diaSemana}
                  </span>
                  <span className="dia-tipo">{dia.motivo}</span>
                  <span className={dia.esLaborable ? "dia-laborable" : "dia-no-laborable"}>
                    {dia.esLaborable ? "✅ Se descuenta" : "⭕ No se descuenta"}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div style={{ 
            background: 'rgba(255, 255, 255, 0.9)', 
            padding: '12px', 
            borderRadius: '8px', 
            marginTop: '15px',
            fontSize: '0.85rem',
            color: '#78350f'
          }}>
            <strong>ℹ️ Explicación del cálculo:</strong><br/>
            • {validacionVacaciones.explicacion.domingos}<br/>
            • {validacionVacaciones.explicacion.sabados}<br/>
            • {validacionVacaciones.explicacion.festivos}
          </div>
        </div>
      </div>
    );
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

      <IntegrationInfoComponent />

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
                <option value="Vacaciones">Vacaciones</option>
                <option value="Cita médica general">Cita médica general</option>
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
                placeholder={esVacaciones() 
                  ? "Describa el motivo de las vacaciones (ej: Vacaciones anuales programadas, descanso familiar, etc.)" 
                  : "Describa el motivo de la ausencia..."
                }
                required
              />
            </div>

            {/* CAMPO DIAGNÓSTICO CON BUSCADOR Y OPCIÓN DE CREAR */}
            {mostrarCampoDiagnostico() && (
              <div className="form-group full-width">
                <div className="diagnostico-section">
                  <div className="diagnostico-header">
                    <span style={{ fontSize: '1.5rem' }}>🏥</span>
                    <strong>Diagnóstico Médico (CIE-10)</strong>
                  </div>
                  
                  <DiagnosticoBuscador
                    key={diagnosticoBuscadorKey}
                    value={formData.diagnosticoId}
                    onChange={handleDiagnosticoSelect}
                    placeholder="Buscar por código (ej: A09) o descripción (ej: diarrea)..."
                    label=""
                    required={false}
                    showSelectedInfo={true}
                  />
                  
                  <button
                    type="button"
                    className="crear-diagnostico-btn"
                    onClick={() => setShowCrearDiagnosticoModal(true)}
                  >
                    <span>➕</span>
                    Crear Nuevo Diagnóstico
                  </button>
                  
                  <small className="diagnostico-help">
                    💡 <strong>Ayuda:</strong> Puedes buscar por código CIE-10 (ejemplo: "A09") o por descripción (ejemplo: "diarrea", "cefalea"). 
                    Si no encuentras el diagnóstico que necesitas, puedes crear uno nuevo haciendo clic en el botón de arriba.
                    Este campo es opcional pero recomendado para {
                      formData.tipoAusencia === "Cita médica general" || formData.tipoAusencia === "Cita Seguimiento EO" 
                        ? "citas médicas" 
                        : "casos de enfermedad"
                    } ya que permite un mejor seguimiento estadístico.
                  </small>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fechas y Horarios */}
        <div className="form-section">
          <h3 className="section-title">
            <span className="section-icon">⏰</span>
            {esVacaciones() ? "Fechas de Vacaciones" : "Fechas y Horarios"}
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

            {/* 🆕 CAMPOS DE HORA SOLO SI NO ES VACACIONES */}
            {!esVacaciones() && (
              <>
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
              </>
            )}

            {/* 🆕 MOSTRAR INFORMACIÓN ESPECIAL PARA VACACIONES */}
            {esVacaciones() && (
              <div className="form-group full-width">
                <div style={{
                  background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                  border: '2px solid #f59e0b',
                  borderRadius: '10px',
                  padding: '15px',
                  textAlign: 'center'
                }}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#92400e', fontSize: '1rem' }}>
                    🏖️ Vacaciones - Día Completo
                  </h4>
                  <p style={{ margin: '0', color: '#78350f', fontSize: '0.9rem' }}>
                    Las vacaciones se registran automáticamente como día completo (08:00 - 17:00).
                    <br/>Solo necesitas especificar las fechas de inicio y fin.
                  </p>
                </div>
              </div>
            )}

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
              <small style={{ 
                display: 'block', 
                marginTop: '5px', 
                color: '#6b7280', 
                fontSize: '0.8rem',
                fontStyle: 'italic'
              }}>
                {formData.remunerado 
                  ? '💰 Contará como horas normales trabajadas' 
                  : '🚫 Se marcará como horas ausentes'
                }
              </small>
            </div>
          </div>

          {/* 🆕 MOSTRAR VALIDACIÓN DE VACACIONES */}
          {loadingValidacion && esVacaciones() && (
            <div className="loading-container" style={{ margin: '15px 0' }}>
              <span className="loading-spinner"></span>
              Validando días de vacaciones...
            </div>
          )}

          <ValidacionVacacionesComponent />

          {/* Vista previa de cálculos */}
          {formData.fechaInicio && formData.fechaFin && (
            esVacaciones() ? (
              // 🆕 Vista previa específica para vacaciones
              <div style={{
                background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                border: '2px solid #22c55e',
                borderRadius: '12px',
                padding: '15px',
                marginTop: '20px'
              }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#15803d', fontSize: '1rem' }}>
                  🏖️ Vista Previa de Vacaciones
                </h4>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                  gap: '10px',
                  fontSize: '0.9rem',
                  color: '#166534'
                }}>
                  <div>
                    <strong>Días calendarios:</strong> {calcularDiasAusencia(formData.fechaInicio, formData.fechaFin)}
                  </div>
                  <div>
                    <strong>Días a descontar:</strong> {validacionVacaciones?.diasADescontar || 'Calculando...'}
                  </div>
                  <div>
                    <strong>Total horas:</strong> {validacionVacaciones ? validacionVacaciones.diasADescontar * 8 : calcularDiasAusencia(formData.fechaInicio, formData.fechaFin) * 8}
                  </div>
                  <div>
                    <strong>Tipo:</strong> {formData.remunerado ? 'Remuneradas' : 'No remuneradas'}
                  </div>
                  {validacionVacaciones && (
                    <div style={{ gridColumn: '1 / -1', marginTop: '10px', padding: '10px', background: 'rgba(255,255,255,0.8)', borderRadius: '6px' }}>
                      <strong>📅 Regresa el:</strong> {calcularFechaRegreso(formData.fechaFin).toLocaleDateString('es-ES', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Vista previa normal para otras ausencias
              formData.horaInicio && formData.horaFin && (
                <div style={{
                  background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                  border: '2px solid #22c55e',
                  borderRadius: '12px',
                  padding: '15px',
                  marginTop: '20px'
                }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#15803d', fontSize: '1rem' }}>
                    📊 Vista Previa de la Ausencia
                  </h4>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                    gap: '10px',
                    fontSize: '0.9rem',
                    color: '#166534'
                  }}>
                    <div>
                      <strong>Días afectados:</strong> {calcularDiasAusencia(formData.fechaInicio, formData.fechaFin)}
                    </div>
                    <div>
                      <strong>Horas por día:</strong> {calcularHorasTotales(formData.horaInicio, formData.horaFin, 1).toFixed(2)}
                    </div>
                    <div>
                      <strong>Total horas:</strong> {calcularHorasTotales(formData.horaInicio, formData.horaFin, calcularDiasAusencia(formData.fechaInicio, formData.fechaFin)).toFixed(2)}
                    </div>
                    <div>
                      <strong>Tipo:</strong> {formData.remunerado ? 'Remunerada' : 'No remunerada'}
                    </div>
                    {mostrarCampoDiagnostico() && formData.diagnosticoCodigo && (
                      <div style={{ gridColumn: '1 / -1', marginTop: '10px', padding: '10px', background: 'rgba(255,255,255,0.8)', borderRadius: '6px' }}>
                        <strong>🏥 Diagnóstico:</strong> {formData.diagnosticoCodigo} - {formData.diagnosticoDescripcion}
                      </div>
                    )}
                  </div>
                </div>
              )
            )
          )}
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
                {esVacaciones() ? 'Registrar Vacaciones' : 'Guardar Ausencia'}
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

      {/* Modal para crear diagnóstico */}
      <CrearDiagnosticoModal
        isOpen={showCrearDiagnosticoModal}
        onClose={() => setShowCrearDiagnosticoModal(false)}
        onDiagnosticoCreated={handleDiagnosticoCreated}
      />
    </div>
  );
};

export default AusenciaForm;