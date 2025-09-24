import React, { useState, useEffect } from "react";
import { compensadoService } from "../../api/compensadosService";
import { api } from "../../api/api";
import TrabajadorBuscador from "../shared/TrabajadorBuscador";
import type { CrearCompensado, HorasDisponibles } from "../../types/compensado";
import type { Trabajador } from "../../types/trabajadores";
import "../../styles/components/compensado/CompensadoForm.css";

// Interfaces para centros (asumiendo estructura similar)
interface Centro {
  id: string;
  nombreCentro: string;
  estado?: boolean;
}

// Estilos específicos para compensados
const compensadoStyles = `
.compensado-form-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  min-height: 100vh;
}

.form-header {
  text-align: center;
  margin-bottom: 30px;
  padding: 30px 20px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 20px;
  color: white;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}

.form-title {
  font-size: 2.5rem;
  margin: 0 0 15px 0;
  font-weight: 800;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.form-icon {
  font-size: 3rem;
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
}

.form-subtitle {
  font-size: 1.2rem;
  margin: 0;
  opacity: 0.95;
  font-weight: 400;
}

.compensado-form {
  background: white;
  border-radius: 20px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.form-section {
  padding: 30px;
  border-bottom: 2px solid #f1f5f9;
}

.form-section:last-child {
  border-bottom: none;
}

.section-title {
  font-size: 1.4rem;
  margin: 0 0 25px 0;
  color: #1e293b;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 3px solid #e2e8f0;
}

.section-icon {
  font-size: 1.6rem;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.form-group {
  margin-bottom: 0;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #374151;
  font-size: 0.95rem;
}

.required {
  color: #ef4444;
}

.form-input, .form-select, .form-textarea {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.2s;
  background: #fafafa;
  box-sizing: border-box;
}

.form-input:focus, .form-select:focus, .form-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  background: white;
}

.form-textarea {
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
}

.form-actions {
  padding: 30px;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 14px 28px;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 140px;
  justify-content: center;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
}

.btn-secondary {
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
  color: #475569;
  border: 2px solid #cbd5e1;
}

.btn-secondary:hover:not(:disabled) {
  background: linear-gradient(135deg, #e2e8f0, #cbd5e1);
  transform: translateY(-1px);
}

.btn-outline {
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-outline:hover:not(:disabled) {
  background: #667eea;
  color: white;
  transform: translateY(-1px);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.btn-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
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
  margin: 20px 30px;
  padding: 20px;
  border-radius: 12px;
}

.form-message.success {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  border: 2px solid #10b981;
  color: #064e3b;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

.form-message.error {
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  border: 2px solid #ef4444;
  color: #7f1d1d;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
}

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

/* Horas disponibles section */
.horas-disponibles-section {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border: 2px solid #f59e0b;
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
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

.horas-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  color: #92400e;
  font-size: 1.1rem;
  font-weight: 600;
}

.horas-content {
  color: #78350f;
  line-height: 1.6;
}

.horas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin: 15px 0;
}

.horas-item {
  background: rgba(255, 255, 255, 0.8);
  padding: 12px;
  border-radius: 8px;
  border-left: 4px solid #f59e0b;
}

.horas-item strong {
  display: block;
  color: #92400e;
  font-size: 0.9rem;
  margin-bottom: 4px;
}

.horas-item span {
  font-size: 1.1rem;
  font-weight: 600;
  color: #78350f;
}

.compensados-existentes {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  padding: 15px;
  margin-top: 15px;
  max-height: 200px;
  overflow-y: auto;
}

.compensado-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f3f4f6;
  font-size: 0.85rem;
}

.compensado-item:last-child {
  border-bottom: none;
}

.vista-previa {
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  border: 2px solid #22c55e;
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
}

.vista-previa h4 {
  margin: 0 0 15px 0;
  color: #15803d;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 10px;
}

.vista-previa-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  font-size: 0.9rem;
  color: #166534;
}

.vista-previa-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.vista-previa-item strong {
  color: #15803d;
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

.warning-message {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border: 2px solid #f59e0b;
  border-radius: 10px;
  padding: 15px;
  margin: 15px 0;
  color: #92400e;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 0.9rem;
  line-height: 1.5;
}

.warning-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
  margin-top: 2px;
}

.help-text {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
  margin-top: 8px;
  font-size: 0.85rem;
  color: #64748b;
  line-height: 1.4;
}
`;

// Inyectar estilos
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = compensadoStyles;
  document.head.appendChild(styleElement);
}

const initialCompensadoState: CrearCompensado = {
  trabajadorId: 0,
  centroId: "",
  fecha: new Date().toISOString().split('T')[0],
  horaInicio: "08:00",
  horaFin: "12:00",
  horasCompensadas: 4.0,
  periodoOrigenInicio: "",
  periodoOrigenFin: "",
  descripcion: "",
  usuarioCreacion: ""
};

const CompensadoForm = () => {
  const [formData, setFormData] = useState<CrearCompensado>(initialCompensadoState);
  const [mensaje, setMensaje] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados para trabajadores
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [trabajadorSeleccionado, setTrabajadorSeleccionado] = useState<Trabajador | null>(null);
  const [loadingTrabajadores, setLoadingTrabajadores] = useState(true);
  
  // Estados para centros
  const [centros, setCentros] = useState<Centro[]>([]);
  const [loadingCentros, setLoadingCentros] = useState(true);
  
  // Estados para horas disponibles
  const [horasDisponibles, setHorasDisponibles] = useState<HorasDisponibles | null>(null);
  const [loadingHoras, setLoadingHoras] = useState(false);
  
  // Estados para mostrar información
  const [mostrarInfo, setMostrarInfo] = useState(false);

  // Cargar trabajadores al montar
  // Cambiar el useEffect:
useEffect(() => {
  const cargarTrabajadores = async () => {
    try {
      setLoadingTrabajadores(true);
      const data = await compensadoService.getTrabajadoresConBancoHoras(); // ← Usar nuevo método
      setTrabajadores(data);
    } catch (error) {
      console.error("Error al cargar trabajadores:", error);
      setMensaje("error:Error al cargar la lista de trabajadores con banco de horas.");
    } finally {
      setLoadingTrabajadores(false);
    }
  };

  cargarTrabajadores();
}, []);

  // Cargar centros al montar
  useEffect(() => {
    const cargarCentros = async () => {
      try {
        setLoadingCentros(true);
        const response = await api.get<Centro[]>("/centros");
        // Filtrar centros activos
        const centrosActivos = response.data.filter(c => c.estado !== false);
        setCentros(centrosActivos);
      } catch (error) {
        console.error("Error al cargar centros:", error);
        setMensaje("error:Error al cargar la lista de centros de trabajo.");
      } finally {
        setLoadingCentros(false);
      }
    };

    cargarCentros();
  }, []);

  // Consultar horas disponibles cuando cambien período y trabajador
  useEffect(() => {
    const consultarHoras = async () => {
      if (!formData.trabajadorId || !formData.periodoOrigenInicio || !formData.periodoOrigenFin) {
        setHorasDisponibles(null);
        return;
      }

      if (new Date(formData.periodoOrigenInicio) >= new Date(formData.periodoOrigenFin)) {
        setHorasDisponibles(null);
        return;
      }

      setLoadingHoras(true);
      try {
        const horas = await compensadoService.getHorasDisponibles(
          formData.trabajadorId,
          formData.periodoOrigenInicio,
          formData.periodoOrigenFin
        );
        setHorasDisponibles(horas);
      } catch (error) {
        console.error("Error al consultar horas disponibles:", error);
        setHorasDisponibles(null);
      } finally {
        setLoadingHoras(false);
      }
    };

    const timeoutId = setTimeout(consultarHoras, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.trabajadorId, formData.periodoOrigenInicio, formData.periodoOrigenFin]);

  // Calcular horas automáticamente cuando cambien las horas de inicio/fin
  useEffect(() => {
    if (formData.horaInicio && formData.horaFin) {
      const [horaInicioH, horaInicioM] = formData.horaInicio.split(':').map(Number);
      const [horaFinH, horaFinM] = formData.horaFin.split(':').map(Number);

      const minutosInicio = horaInicioH * 60 + horaInicioM;
      const minutosFin = horaFinH * 60 + horaFinM;

      if (minutosFin > minutosInicio) {
        const horas = (minutosFin - minutosInicio) / 60;
        setFormData(prev => ({
          ...prev,
          horasCompensadas: parseFloat(horas.toFixed(2))
        }));
      }
    }
  }, [formData.horaInicio, formData.horaFin]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTrabajadorSelect = (trabajadorId: number, trabajador?: Trabajador) => {
    setTrabajadorSeleccionado(trabajador || null);
    setFormData(prev => ({
      ...prev,
      trabajadorId: trabajadorId
    }));
    setHorasDisponibles(null); // Reset horas disponibles
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMensaje("");

    try {
      // Validaciones antes de enviar
      const validacion = compensadoService.validarCompensado(formData);
      if (!validacion.valido) {
        setMensaje("error:" + validacion.errores.join("\n"));
        return;
      }

      // Verificar horas disponibles
      if (!horasDisponibles || horasDisponibles.horasDisponibles < formData.horasCompensadas) {
        setMensaje(`error:Horas insuficientes para crear el compensado.\nDisponibles: ${horasDisponibles?.horasDisponibles || 0} horas\nSolicitadas: ${formData.horasCompensadas} horas`);
        return;
      }

      await compensadoService.crear(formData);

      setMensaje(`success:🎉 ¡Compensado creado exitosamente!

📋 DETALLES DEL COMPENSADO:
• Trabajador: ${trabajadorSeleccionado?.nombre}
• Centro: ${centros.find(c => c.id === formData.centroId)?.nombreCentro}
• Fecha: ${new Date(formData.fecha).toLocaleDateString('es-ES')}
• Horario: ${formData.horaInicio} - ${formData.horaFin}
• Horas utilizadas: ${formData.horasCompensadas} horas

💰 DESCUENTO DE BANCO DE HORAS:
• Horas disponibles antes: ${horasDisponibles.horasDisponibles} horas
• Horas utilizadas: ${formData.horasCompensadas} horas
• Horas restantes: ${(horasDisponibles.horasDisponibles - formData.horasCompensadas).toFixed(2)} horas

📅 PERÍODO ORIGEN DE LAS HORAS:
• ${new Date(formData.periodoOrigenInicio).toLocaleDateString('es-ES')} - ${new Date(formData.periodoOrigenFin).toLocaleDateString('es-ES')}

🔗 INTEGRACIÓN AUTOMÁTICA:
• Se creó automáticamente un registro en RegistrosTrabajoDiarios
• Aparecerá como trabajo normal en el centro seleccionado
• Las horas se registran como "horas normales" (no generan extras)
• El registro estará marcado como "COMPENSADO" para identificación

🔍 DÓNDE VERLO:
• Dashboard de Registros → Buscar por fecha del compensado
• El registro aparecerá en el centro de trabajo especificado
• Se identificará con el tipo "COMPENSADO"`);

      // Reiniciar formulario
      setFormData({
        ...initialCompensadoState,
        trabajadorId: formData.trabajadorId, // Mantener trabajador seleccionado
        periodoOrigenInicio: formData.periodoOrigenInicio,
        periodoOrigenFin: formData.periodoOrigenFin
      });

      // Actualizar horas disponibles
      setTimeout(() => {
        if (formData.trabajadorId && formData.periodoOrigenInicio && formData.periodoOrigenFin) {
          compensadoService.getHorasDisponibles(
            formData.trabajadorId,
            formData.periodoOrigenInicio,
            formData.periodoOrigenFin
          ).then(setHorasDisponibles);
        }
      }, 1000);

    } catch (error: any) {
      console.error("Error al crear compensado:", error);
      setMensaje(`error:❌ Error al crear el compensado.\n\n${error.response?.data?.error || error.message || "Error desconocido"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLimpiar = () => {
    setFormData(initialCompensadoState);
    setTrabajadorSeleccionado(null);
    setHorasDisponibles(null);
    setMensaje("");
  };

  // Componente de información sobre compensados
  const IntegrationInfoComponent = () => (
    <div className="integration-info">
      <h4>
        🔗 Sistema de Compensados
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
          <p><strong>¿Qué son los compensados?</strong></p>
          <ul>
            <li>Permite usar horas excedentes acumuladas en períodos anteriores</li>
            <li>Solo disponible para trabajadores con sistema de banco de horas</li>
            <li>Las horas se registran en un centro de trabajo específico</li>
            <li>Se integran automáticamente al sistema de registros diarios</li>
            <li>Las horas aparecen como "normales" (no generan extras adicionales)</li>
          </ul>
          <p><strong>¿Cómo funciona?</strong></p>
          <ul>
            <li>Consulta las horas disponibles de un período específico</li>
            <li>Crea el compensado especificando centro, fecha y horario</li>
            <li>El sistema descuenta automáticamente las horas del banco</li>
            <li>Se crea un registro de trabajo en la fecha especificada</li>
          </ul>
        </div>
      )}
    </div>
  );

  // Componente para mostrar horas disponibles
  const HorasDisponiblesComponent = () => {
    if (!horasDisponibles) return null;

    return (
      <div className="horas-disponibles-section">
        <div className="horas-header">
          <span>💳</span>
          <strong>Horas Disponibles en el Banco</strong>
        </div>

        <div className="horas-content">
          <p style={{ marginBottom: '15px', fontWeight: '600' }}>
            {horasDisponibles.mensaje}
          </p>

          <div className="horas-grid">
            <div className="horas-item">
              <strong>Balance total</strong>
              <span>{horasDisponibles.balanceTotal.toFixed(2)}h</span>
            </div>
            <div className="horas-item">
              <strong>Ya utilizadas</strong>
              <span>{horasDisponibles.horasYaUtilizadas.toFixed(2)}h</span>
            </div>
            <div className="horas-item">
              <strong>Disponibles</strong>
              <span>{horasDisponibles.horasDisponibles.toFixed(2)}h</span>
            </div>
            <div className="horas-item">
              <strong>Estado</strong>
              <span>{horasDisponibles.tieneHorasDisponibles ? "✅ Disponible" : "❌ Sin horas"}</span>
            </div>
          </div>

          {horasDisponibles.compensadosExistentes.length > 0 && (
            <div className="compensados-existentes">
              <h5 style={{ margin: '0 0 10px 0', color: '#92400e', fontSize: '0.95rem' }}>
                📋 Compensados ya creados en este período:
              </h5>
              {horasDisponibles.compensadosExistentes.map((comp, index) => (
                <div key={index} className="compensado-item">
                  <span>
                    {new Date(comp.fecha).toLocaleDateString('es-ES')} - {comp.centroNombre}
                  </span>
                  <span style={{ fontWeight: '600', color: '#92400e' }}>
                    {comp.horasUtilizadas}h - {comp.estado}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Componente de vista previa
  const VistaPreviaComponent = () => {
    if (!formData.fecha || !formData.horaInicio || !formData.horaFin || !horasDisponibles) {
      return null;
    }

    const horasRestantes = horasDisponibles.horasDisponibles - formData.horasCompensadas;
    const centroSeleccionado = centros.find(c => c.id === formData.centroId);

    return (
      <div className="vista-previa">
        <h4>
          <span>📊</span>
          Vista Previa del Compensado
        </h4>

        <div className="vista-previa-grid">
          <div className="vista-previa-item">
            <strong>Fecha programada:</strong>
            <span>{new Date(formData.fecha).toLocaleDateString('es-ES')}</span>
          </div>
          <div className="vista-previa-item">
            <strong>Centro de trabajo:</strong>
            <span>{centroSeleccionado?.nombreCentro || "Seleccionar centro"}</span>
          </div>
          <div className="vista-previa-item">
            <strong>Horario:</strong>
            <span>{formData.horaInicio} - {formData.horaFin}</span>
          </div>
          <div className="vista-previa-item">
            <strong>Horas a utilizar:</strong>
            <span>{formData.horasCompensadas}h</span>
          </div>
          <div className="vista-previa-item">
            <strong>Horas disponibles:</strong>
            <span>{horasDisponibles.horasDisponibles.toFixed(2)}h</span>
          </div>
          <div className="vista-previa-item">
            <strong>Quedarían:</strong>
            <span style={{ 
              color: horasRestantes >= 0 ? '#15803d' : '#dc2626',
              fontWeight: '700'
            }}>
              {horasRestantes.toFixed(2)}h
            </span>
          </div>
        </div>

        {horasRestantes < 0 && (
          <div className="warning-message">
            <span className="warning-icon">⚠️</span>
            <div>
              <strong>Horas insuficientes:</strong> No tienes suficientes horas disponibles para crear este compensado. 
              Reduce las horas solicitadas o selecciona un período con más horas excedentes.
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="compensado-form-container">
      <div className="form-header">
        <h1 className="form-title">
          <span className="form-icon">💳</span>
          Crear Compensado
        </h1>
        <p className="form-subtitle">
          Utiliza horas excedentes acumuladas para trabajar en proyectos específicos
        </p>
      </div>

      <IntegrationInfoComponent />

      <form className="compensado-form" onSubmit={handleSubmit}>
        {/* Selección del Trabajador */}
        <div className="form-section">
          <h3 className="section-title">
            <span className="section-icon">👤</span>
            Trabajador con Banco de Horas
          </h3>
          <div className="form-grid">
            <div className="form-group full-width">
              {loadingTrabajadores ? (
                <div className="loading-container">
                  <span className="loading-spinner"></span>
                  Cargando trabajadores con banco de horas...
                </div>
              ) : (
                <>
                  <TrabajadorBuscador
                    trabajadores={trabajadores}
                    value={formData.trabajadorId}
                    onChange={handleTrabajadorSelect}
                    placeholder="Buscar trabajador con banco de horas..."
                    label="Seleccionar Trabajador"
                    required={true}
                    showSelectedInfo={true}
                  />
                  {trabajadores.length === 0 && (
                    <div className="help-text">
                      ℹ️ No se encontraron trabajadores con banco de horas habilitado.
                      Solo los trabajadores con banco de horas pueden crear compensados.
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Período de Origen de Horas */}
        <div className="form-section">
          <h3 className="section-title">
            <span className="section-icon">📅</span>
            Período Origen de las Horas Excedentes
          </h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                Fecha Inicio del Período <span className="required">*</span>
              </label>
              <input
                type="date"
                name="periodoOrigenInicio"
                value={formData.periodoOrigenInicio}
                onChange={handleChange}
                className="form-input"
                required
              />
              <div className="help-text">
                Fecha de inicio del período donde se generaron las horas excedentes
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Fecha Fin del Período <span className="required">*</span>
              </label>
              <input
                type="date"
                name="periodoOrigenFin"
                value={formData.periodoOrigenFin}
                onChange={handleChange}
                className="form-input"
                required
              />
              <div className="help-text">
                Fecha de fin del período donde se generaron las horas excedentes
              </div>
            </div>
          </div>

          {/* Loading de consulta de horas */}
          {loadingHoras && (
            <div className="loading-container" style={{ margin: '15px 0' }}>
              <span className="loading-spinner"></span>
              Consultando horas disponibles...
            </div>
          )}

          {/* Mostrar horas disponibles */}
          <HorasDisponiblesComponent />
        </div>

        {/* Detalles del Compensado */}
        {horasDisponibles && horasDisponibles.tieneHorasDisponibles && (
          <div className="form-section">
            <h3 className="section-title">
              <span className="section-icon">🏢</span>
              Detalles del Compensado
            </h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  Centro de Trabajo <span className="required">*</span>
                </label>
                {loadingCentros ? (
                  <div className="loading-container">
                    <span className="loading-spinner"></span>
                    Cargando centros...
                  </div>
                ) : (
                  <select
                    name="centroId"
                    value={formData.centroId}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="">Seleccionar centro</option>
                    {centros.map(centro => (
                      <option key={centro.id} value={centro.id}>
                        {centro.nombreCentro}
                      </option>
                    ))}
                  </select>
                )}
                <div className="help-text">
                  Centro donde se registrará el trabajo compensado
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Fecha del Compensado <span className="required">*</span>
                </label>
                <input
                  type="date"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
                <div className="help-text">
                  Fecha en que se registrará el trabajo compensado
                </div>
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

              <div className="form-group">
                <label className="form-label">
                  Horas a Compensar <span className="required">*</span>
                </label>
                <input
                  type="number"
                  name="horasCompensadas"
                  value={formData.horasCompensadas}
                  onChange={handleChange}
                  className="form-input"
                  min="0.1"
                  max="24"
                  step="0.1"
                  required
                />
                <div className="help-text">
                  Se calcula automáticamente según el horario seleccionado
                </div>
              </div>

              <div className="form-group full-width">
                <label className="form-label">
                  Descripción / Observaciones
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  className="form-textarea"
                  placeholder="Descripción del trabajo a realizar con las horas compensadas..."
                />
              </div>
            </div>

            {/* Vista previa del compensado */}
            <VistaPreviaComponent />
          </div>
        )}

        {/* Botones de acción */}
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleLimpiar}
            disabled={isLoading}
          >
            <span>🔄</span>
            Limpiar
          </button>

          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              if (formData.trabajadorId && formData.periodoOrigenInicio && formData.periodoOrigenFin) {
                setLoadingHoras(true);
                compensadoService.getHorasDisponibles(
                  formData.trabajadorId,
                  formData.periodoOrigenInicio,
                  formData.periodoOrigenFin
                ).then(setHorasDisponibles)
                .finally(() => setLoadingHoras(false));
              }
            }}
            disabled={isLoading || !formData.trabajadorId || !formData.periodoOrigenInicio || !formData.periodoOrigenFin}
          >
            <span>🔍</span>
            Consultar Horas
          </button>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={
              isLoading || 
              !horasDisponibles || 
              !horasDisponibles.tieneHorasDisponibles ||
              horasDisponibles.horasDisponibles < formData.horasCompensadas ||
              !formData.centroId
            }
          >
            {isLoading ? (
              <>
                <span className="btn-spinner"></span>
                Creando...
              </>
            ) : (
              <>
                <span>💾</span>
                Crear Compensado
              </>
            )}
          </button>
        </div>

        {/* Mensaje de resultado */}
        {mensaje && (
          <div className={`form-message ${mensaje.startsWith('success:') ? 'success' : 'error'}`}>
            {mensaje.replace(/^(success:|error:)/, '')}
          </div>
        )}
      </form>
    </div>
  );
};

export default CompensadoForm;
