import React, { useState, useEffect } from "react";
import { crearAusencia, validarDiasVacaciones, calcularFechaFinVacaciones } from "../../api/ausenciasService";
import { trabajadoresService } from "../../api/trabajadoresService";
import { crearDiagnostico } from "../../api/ausenciasService";
import TrabajadorBuscador from "../shared/TrabajadorBuscador";
import DiagnosticoBuscador from "../shared/DiagnosticoBuscador";
import type { AusenciaDto, ValidacionVacaciones } from "../../types/ausencia";
import type { Trabajador } from "../../types/trabajadores";
import type { Diagnostico } from "../../types/diagnostico";
import "../../styles/components/ausencias/AusenciaForm.css";

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
  horaFin: "17:00",
  remunerado: false,
  diagnosticoId: undefined,
  diagnosticoCodigo: "",
  diagnosticoDescripcion: "",
};

interface NuevoDiagnostico {
  codigo: string;
  descripcion: string;
}

const initialDiagnosticoState: NuevoDiagnostico = {
  codigo: "",
  descripcion: ""
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

  // Estados para validación de vacaciones
  const [validacionVacaciones, setValidacionVacaciones] = useState<ValidacionVacaciones | null>(null);
  const [loadingValidacion, setLoadingValidacion] = useState(false);

  // NUEVO: Estados para el cálculo de vacaciones
  const [diasVacaciones, setDiasVacaciones] = useState<number>(1);
  const [fechaFinCalculada, setFechaFinCalculada] = useState<Date | null>(null);
  const [fechaRegresoCalculada, setFechaRegresoCalculada] = useState<Date | null>(null);
  const [loadingCalculo, setLoadingCalculo] = useState(false);

  const esVacaciones = React.useCallback(() => {
    return formData.tipoAusencia.toLowerCase().includes("vacacion");
  }, [formData.tipoAusencia]);

  // NUEVO: Función para calcular fecha fin basada en días de vacaciones
  const calcularFechaFin = React.useCallback(async () => {
    if (!esVacaciones() || !trabajadorSeleccionadoId || !formData.fechaInicio || diasVacaciones < 1) {
      setFechaFinCalculada(null);
      setFechaRegresoCalculada(null);
      return;
    }

    setLoadingCalculo(true);
    try {
      const resultado = await calcularFechaFinVacaciones({
        fechaInicio: formData.fechaInicio,
        diasVacaciones: diasVacaciones,
        trabajadorId: trabajadorSeleccionadoId
      });

      const fechaFin = new Date(resultado.fechaFin);
      const fechaRegreso = new Date(resultado.fechaRegreso);

      setFechaFinCalculada(fechaFin);
      setFechaRegresoCalculada(fechaRegreso);

      // Actualizar formData con la fecha fin calculada
      setFormData(prev => ({
        ...prev,
        fechaFin: fechaFin
      }));
    } catch (error) {
      console.error("Error al calcular fecha fin:", error);
      setFechaFinCalculada(null);
      setFechaRegresoCalculada(null);
    } finally {
      setLoadingCalculo(false);
    }
  }, [esVacaciones, trabajadorSeleccionadoId, formData.fechaInicio, diasVacaciones]);

  // Effect para calcular fecha fin cuando cambian los días o fecha inicio
  useEffect(() => {
    if (esVacaciones() && trabajadorSeleccionadoId && formData.fechaInicio && diasVacaciones >= 1) {
      const timeoutId = setTimeout(() => {
        calcularFechaFin();
      }, 500);

      return () => clearTimeout(timeoutId);
    } else {
      setFechaFinCalculada(null);
      setFechaRegresoCalculada(null);
    }
  }, [esVacaciones, calcularFechaFin, trabajadorSeleccionadoId, formData.fechaInicio, diasVacaciones]);

  // Función para validar vacaciones cuando cambien fechas o trabajador
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

  // Effect para validar vacaciones cuando tengamos fecha fin calculada
  useEffect(() => {
    if (esVacaciones() && trabajadorSeleccionadoId && formData.fechaInicio && formData.fechaFin) {
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
      const nuevasHoras = value.toLowerCase().includes("vacacion")
        ? { horaInicio: "08:00", horaFin: "17:00" }
        : { horaInicio: "08:00", horaFin: "10:00" };

      setFormData((prev) => ({
        ...prev,
        tipoAusencia: value as string,
        diagnosticoId: undefined,
        diagnosticoCodigo: "",
        diagnosticoDescripcion: "",
        ...nuevasHoras
      }));

      // Resetear días de vacaciones cuando cambie el tipo
      if (!value.toLowerCase().includes("vacacion")) {
        setDiasVacaciones(1);
        setFechaFinCalculada(null);
        setFechaRegresoCalculada(null);
      }
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

  const handleDiagnosticoCreated = (nuevoDiagnostico: Diagnostico) => {
    setFormData(prev => ({
      ...prev,
      diagnosticoId: nuevoDiagnostico.id,
      diagnosticoCodigo: nuevoDiagnostico.codigo,
      diagnosticoDescripcion: nuevoDiagnostico.descripcion
    }));

    setDiagnosticoBuscadorKey(prev => prev + 1);
    setMensaje("success:Diagnóstico creado exitosamente y seleccionado automáticamente.");

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
    if (esVacaciones()) {
      return dias * 8;
    }

    const [horaInicioH, horaInicioM] = horaInicio.split(':').map(Number);
    const [horaFinH, horaFinM] = horaFin.split(':').map(Number);

    const minutosInicio = horaInicioH * 60 + horaInicioM;
    const minutosFin = horaFinH * 60 + horaFinM;

    let horasPorDia = (minutosFin - minutosInicio) / 60;

    const inicioAlmuerzoMinutos = 12 * 60 + 30;
    const finAlmuerzoMinutos = 14 * 60;
    const duracionAlmuerzo = 1.5;

    const incluyeAlmuerzo = minutosInicio < finAlmuerzoMinutos && minutosFin > inicioAlmuerzoMinutos;

    if (incluyeAlmuerzo) {
      const inicioDescuento = Math.max(minutosInicio, inicioAlmuerzoMinutos);
      const finDescuento = Math.min(minutosFin, finAlmuerzoMinutos);
      const tiempoAlmuerzoIncluido = (finDescuento - inicioDescuento) / 60;
      const descuentoReal = Math.min(tiempoAlmuerzoIncluido, duracionAlmuerzo);
      horasPorDia = Math.max(0, horasPorDia - descuentoReal);
    }

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

      let mensajeExito = "";

      if (esVacaciones()) {
        const diasADescontar = validacionVacaciones?.diasADescontar || diasAusencia;

        mensajeExito = `success:Vacaciones registradas exitosamente

DETALLES DE LAS VACACIONES:
• Días solicitados: ${diasVacaciones} días
• Período: ${formData.fechaInicio.toLocaleDateString('es-ES')} - ${formData.fechaFin.toLocaleDateString('es-ES')}
• Días calendarios totales: ${diasAusencia} días
• Días laborables a descontar: ${diasADescontar} días
• Fecha de regreso: ${fechaRegresoCalculada?.toLocaleDateString('es-ES') || 'No calculada'}

INTEGRACIÓN AUTOMÁTICA CON REGISTROS:
• Se crearon ${diasAusencia} registro${diasAusencia > 1 ? 's' : ''} de vacaciones
• Horario: Día completo (08:00 - 17:00)
• Total de horas: ${horasTotales.toFixed(2)} horas

${formData.remunerado
            ? `VACACIONES REMUNERADAS:
• Las horas contarán como horas normales trabajadas
• Se incluirán en el cálculo de jornada completa`
            : `VACACIONES NO REMUNERADAS:
• Las horas se marcarán como horas ausentes
• No contarán para horas normales trabajadas`
          }

Los registros aparecerán marcados como "AUSENCIA - Vacaciones" en el Dashboard de Registros.`;
      } else {
        mensajeExito = `success:Ausencia registrada exitosamente

INTEGRACIÓN AUTOMÁTICA CON REGISTROS:
• Se crearon ${diasAusencia} registro${diasAusencia > 1 ? 's' : ''} en el sistema de horas
• Fechas afectadas: ${formData.fechaInicio.toLocaleDateString('es-ES')} - ${formData.fechaFin.toLocaleDateString('es-ES')}
• Horario de ausencia: ${formData.horaInicio} - ${formData.horaFin}
• Total de horas: ${horasTotales.toFixed(2)} horas
${formData.diagnosticoCodigo ? `• Diagnóstico: ${formData.diagnosticoCodigo} - ${formData.diagnosticoDescripcion}` : ''}

${formData.remunerado
            ? `AUSENCIA REMUNERADA:
• Las horas contarán como horas normales trabajadas
• Se incluirán en el cálculo de jornada completa`
            : `AUSENCIA NO REMUNERADA:
• Las horas se marcarán como horas ausentes
• No contarán para horas normales trabajadas`
          }

Los registros aparecerán marcados como "AUSENCIA - ${formData.tipoAusencia}" en el Dashboard.`;
      }

      setMensaje(mensajeExito);

      // Reiniciar el formulario
      setFormData(initialState);
      setTrabajadorSeleccionadoId(0);
      setValidacionVacaciones(null);
      setDiasVacaciones(1);
      setFechaFinCalculada(null);
      setFechaRegresoCalculada(null);
      setDiagnosticoBuscadorKey(prev => prev + 1);

      setTimeout(() => {
        const messageElement = document.querySelector('.form-message');
        if (messageElement) {
          messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);

    } catch (error) {
      console.error("Error al registrar la ausencia:", error);
      setMensaje("error:Error al guardar la ausencia. Por favor, verifica que todos los campos estén correctos e intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLimpiar = () => {
    setFormData(initialState);
    setTrabajadorSeleccionadoId(0);
    setMensaje("");
    setValidacionVacaciones(null);
    setDiasVacaciones(1);
    setFechaFinCalculada(null);
    setFechaRegresoCalculada(null);
    setDiagnosticoBuscadorKey(prev => prev + 1);
  };

  const IntegrationInfoComponent = () => (
    <div className="integration-info">
      <h4>
        Integración Automática con Sistema de Registros
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
          {mostrarInfo ? '▲' : '▼'}
        </button>
      </h4>

      {mostrarInfo && (
        <div>
          <p>
            <strong>Qué sucede cuando registras una ausencia:</strong>
          </p>
          <ul>
            <li>Se crean automáticamente registros en el sistema de horas para cada día de la ausencia</li>
            <li>Se descuenta automáticamente el tiempo de almuerzo (12:30 PM - 2:00 PM) cuando la ausencia incluye este período</li>
            <li>Las ausencias aparecen junto con los registros normales de trabajo</li>
            <li>Si es <strong>remunerada</strong>: cuenta como horas normales trabajadas</li>
            <li>Si <strong>no es remunerada</strong>: se marca como horas ausentes</li>
            <li><strong>Para vacaciones</strong>: solo ingresas cuántos días y el sistema calcula automáticamente las fechas</li>
            <li><strong>Para citas médicas y enfermedades</strong>: puedes agregar el diagnóstico CIE-10 correspondiente</li>
          </ul>
        </div>
      )}
    </div>
  );

  const ValidacionVacacionesComponent = () => {
    if (!esVacaciones() || !validacionVacaciones) return null;

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

          {fechaRegresoCalculada && (
            <div className="fecha-regreso">
              <div className="fecha-regreso-title">Fecha de regreso al trabajo:</div>
              <div className="fecha-regreso-date">
                {fechaRegresoCalculada.toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          )}

          {validacionVacaciones.detalleDias && validacionVacaciones.detalleDias.length > 0 && (
            <div className="detalle-dias">
              <h5>Detalle por días:</h5>
              {validacionVacaciones.detalleDias.map((dia, index) => (
                <div key={index} className="dia-item">
                  <span className="dia-fecha">
                    {new Date(dia.fecha).toLocaleDateString('es-ES')} - {dia.diaSemana}
                  </span>
                  <span className="dia-tipo">{dia.motivo}</span>
                  <span className={dia.esLaborable ? "dia-laborable" : "dia-no-laborable"}>
                    {dia.esLaborable ? "Se descuenta" : "No se descuenta"}
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
            <strong>Explicación del cálculo:</strong><br />
            • {validacionVacaciones.explicacion.domingos}<br />
            • {validacionVacaciones.explicacion.sabados}<br />
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
                    Puedes buscar por código CIE-10 (ejemplo: "A09") o por descripción (ejemplo: "diarrea", "cefalea").
                    Si no encuentras el diagnóstico que necesitas, puedes crear uno nuevo haciendo clic en el botón de arriba.
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

            {esVacaciones() ? (
              <>
                {/* CAMPO DÍAS DE VACACIONES */}
                <div className="form-group">
                  <label className="form-label">
                    Días de Vacaciones <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={diasVacaciones}
                    onChange={(e) => setDiasVacaciones(parseInt(e.target.value) || 1)}
                    className="form-input"
                    required
                    style={{ fontSize: '1.1rem', fontWeight: '600' }}
                  />
                  <small style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                    Ingresa cuántos días de vacaciones deseas dar
                  </small>
                </div>

                {/* FECHA FIN CALCULADA (READONLY) */}
                {loadingCalculo ? (
                  <div className="form-group">
                    <label className="form-label">Fecha de Fin (calculando...)</label>
                    <div className="loading-container">
                      <span className="loading-spinner"></span>
                      Calculando...
                    </div>
                  </div>
                ) : fechaFinCalculada ? (
                  <div className="form-group">
                    <label className="form-label">
                      Fecha de Fin (calculada automáticamente)
                    </label>
                    <input
                      type="text"
                      value={fechaFinCalculada.toLocaleDateString('es-ES')}
                      className="form-input"
                      readOnly
                      disabled
                      style={{ background: '#f3f4f6', fontWeight: '600' }}
                    />
                  </div>
                ) : null}

                {/* FECHA DE REGRESO (READONLY) */}
                {fechaRegresoCalculada && (
                  <div className="form-group">
                    <label className="form-label">
                      Regresa al trabajo el:
                    </label>
                    <input
                      type="text"
                      value={fechaRegresoCalculada.toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                      className="form-input"
                      readOnly
                      disabled
                      style={{ background: '#ecfdf5', fontWeight: '600', color: '#065f46' }}
                    />
                  </div>
                )}

                {/* INFO VACACIONES */}
                <div className="form-group full-width">
                  <div style={{
                    background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                    border: '2px solid #f59e0b',
                    borderRadius: '10px',
                    padding: '15px',
                    textAlign: 'center'
                  }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#92400e', fontSize: '1rem' }}>
                      Vacaciones - Día Completo
                    </h4>
                    <p style={{ margin: '0', color: '#78350f', fontSize: '0.9rem' }}>
                      Las vacaciones se registran automáticamente como día completo (08:00 - 17:00).
                      <br />Solo necesitas especificar la fecha de inicio y cuántos días darás.
                      <br /><strong>El sistema calcula automáticamente la fecha de fin considerando fines de semana, festivos y horarios del trabajador.</strong>
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* PARA OTROS TIPOS: FECHA FIN MANUAL */}
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
              </>
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
                <span className="checkbox-text">Es remunerado</span>
              </label>
              <small style={{
                display: 'block',
                marginTop: '5px',
                color: '#6b7280',
                fontSize: '0.8rem',
                fontStyle: 'italic'
              }}>
                {formData.remunerado
                  ? 'Contará como horas normales trabajadas'
                  : 'Se marcará como horas ausentes'
                }
              </small>
            </div>
          </div>

          {loadingValidacion && esVacaciones() && (
            <div className="loading-container" style={{ margin: '15px 0' }}>
              <span className="loading-spinner"></span>
              Validando días de vacaciones...
            </div>
          )}

          <ValidacionVacacionesComponent />

          {formData.fechaInicio && formData.fechaFin && (
            esVacaciones() ? (
              <div style={{
                background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                border: '2px solid #22c55e',
                borderRadius: '12px',
                padding: '15px',
                marginTop: '20px'
              }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#15803d', fontSize: '1rem' }}>
                  Vista Previa de Vacaciones
                </h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '10px',
                  fontSize: '0.9rem',
                  color: '#166534'
                }}>
                  <div>
                    <strong>Días solicitados:</strong> {diasVacaciones}
                  </div>
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
                </div>
              </div>
            ) : (
              formData.horaInicio && formData.horaFin && (
                <div style={{
                  background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                  border: '2px solid #22c55e',
                  borderRadius: '12px',
                  padding: '15px',
                  marginTop: '20px'
                }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#15803d', fontSize: '1rem' }}>
                    Vista Previa de la Ausencia
                  </h4>

                  {(() => {
                    const horaInicioMinutos = parseInt(formData.horaInicio.split(':')[0]) * 60 + parseInt(formData.horaInicio.split(':')[1]);
                    const horaFinMinutos = parseInt(formData.horaFin.split(':')[0]) * 60 + parseInt(formData.horaFin.split(':')[1]);
                    const incluyeAlmuerzo = horaInicioMinutos < 840 && horaFinMinutos > 750;
                    const horasBrutas = (horaFinMinutos - horaInicioMinutos) / 60;
                    const horasNetas = calcularHorasTotales(formData.horaInicio, formData.horaFin, 1);

                    return incluyeAlmuerzo && (
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.8)',
                        padding: '12px',
                        borderRadius: '8px',
                        marginBottom: '15px',
                        border: '1px solid #f59e0b',
                        fontSize: '0.85rem',
                        color: '#92400e'
                      }}>
                        Descuento de Almuerzo Aplicado (12:30 PM - 2:00 PM):
                        Horas brutas: {horasBrutas.toFixed(2)}h → Horas netas: {horasNetas.toFixed(2)}h
                        (se descontaron {(horasBrutas - horasNetas).toFixed(2)}h de almuerzo)
                      </div>
                    );
                  })()}

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
                      <strong>Horas netas por día:</strong> {calcularHorasTotales(formData.horaInicio, formData.horaFin, 1).toFixed(2)}
                    </div>
                    <div>
                      <strong>Total horas netas:</strong> {calcularHorasTotales(formData.horaInicio, formData.horaFin, calcularDiasAusencia(formData.fechaInicio, formData.fechaFin)).toFixed(2)}
                    </div>
                    <div>
                      <strong>Tipo:</strong> {formData.remunerado ? 'Remunerada' : 'No remunerada'}
                    </div>
                    {mostrarCampoDiagnostico() && formData.diagnosticoCodigo && (
                      <div style={{ gridColumn: '1 / -1', marginTop: '10px', padding: '10px', background: 'rgba(255,255,255,0.8)', borderRadius: '6px' }}>
                        <strong>Diagnóstico:</strong> {formData.diagnosticoCodigo} - {formData.diagnosticoDescripcion}
                      </div>
                    )}
                  </div>
                </div>
              )
            )
          )}
        </div>

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

        {mensaje && (
          <div className={`form-message ${mensaje.startsWith('success:') ? 'success' : 'error'}`}>
            <span className="message-icon">
              {mensaje.startsWith('success:') ? '✅' : '❌'}
            </span>
            {mensaje.replace(/^(success:|error:)/, '')}
          </div>
        )}
      </form>

      <CrearDiagnosticoModal
        isOpen={showCrearDiagnosticoModal}
        onClose={() => setShowCrearDiagnosticoModal(false)}
        onDiagnosticoCreated={handleDiagnosticoCreated}
      />
    </div>
  );
};

export default AusenciaForm;