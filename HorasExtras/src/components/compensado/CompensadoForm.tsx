/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { compensadoService } from "../../api/compensadosService";
import { api } from "../../api/api";
import TrabajadorBuscador from "../shared/TrabajadorBuscador";
import type { CrearCompensado, HorasDisponibles } from "../../types/compensado";
import type { Trabajador } from "../../types/trabajadores";
import "../../styles/components/compensado/CompensadoForm.css";

// Interfaces para centros
interface Centro {
  id: string;
  nombreCentro: string;
  estado?: boolean;
}

// Interface para validación de compensado
interface ValidacionCompensado {
  esValido: boolean;
  horasBrutas: number;
  tiempoAlmuerzoDescontado: number;
  horasEfectivas: number;
  horasDisponibles: number;
  horasSobrantes: number;
  yaHayAlmuerzoEnOtraActividad: boolean;
  mensaje: string;
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
  
  // Estados para validación de compensado
  const [validacionCompensado, setValidacionCompensado] = useState<ValidacionCompensado | null>(null);
  const [loadingValidacion, setLoadingValidacion] = useState(false);
  
  // Estados para mostrar información
  const [mostrarInfo, setMostrarInfo] = useState(false);

  // Cargar trabajadores al montar
  useEffect(() => {
    const cargarTrabajadores = async () => {
      try {
        setLoadingTrabajadores(true);
        const data = await compensadoService.getTrabajadoresConBancoHoras();
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

  // Validar automáticamente cuando cambien los datos relevantes
  useEffect(() => {
    const validarAutomaticamente = async () => {
      if (
        !formData.trabajadorId ||
        !formData.centroId ||
        !formData.fecha ||
        !formData.horaInicio ||
        !formData.horaFin ||
        !formData.periodoOrigenInicio ||
        !formData.periodoOrigenFin ||
        !horasDisponibles
      ) {
        setValidacionCompensado(null);
        return;
      }

      setLoadingValidacion(true);
      try {
        const validacion = await compensadoService.validarCompensadoConAlmuerzo({
          trabajadorId: formData.trabajadorId,
          centroId: formData.centroId,
          fecha: formData.fecha,
          horaInicio: formData.horaInicio,
          horaFin: formData.horaFin,
          horasCompensadas: formData.horasCompensadas,
          periodoOrigenInicio: formData.periodoOrigenInicio,
          periodoOrigenFin: formData.periodoOrigenFin,
          descripcion: formData.descripcion,
          usuarioCreacion: formData.usuarioCreacion
        });
        setValidacionCompensado(validacion);
      } catch (error) {
        console.error("Error al validar compensado:", error);
        setValidacionCompensado(null);
      } finally {
        setLoadingValidacion(false);
      }
    };

    const timeoutId = setTimeout(validarAutomaticamente, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.trabajadorId, formData.centroId, formData.fecha, formData.horaInicio, formData.horaFin, formData.periodoOrigenInicio, formData.periodoOrigenFin, horasDisponibles, formData.horasCompensadas, formData.descripcion, formData.usuarioCreacion]);

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
    setHorasDisponibles(null);
    setValidacionCompensado(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMensaje("");

    try {
      const validacion = compensadoService.validarCompensado(formData);
      if (!validacion.valido) {
        setMensaje("error:" + validacion.errores.join("\n"));
        return;
      }

      if (!validacionCompensado || !validacionCompensado.esValido) {
        setMensaje(`error:${validacionCompensado?.mensaje || "No se pudo validar el compensado"}`);
        return;
      }

      await compensadoService.crear(formData);

      setMensaje(`success:🎉 ¡Compensado creado exitosamente!

📋 DETALLES DEL COMPENSADO:
- Trabajador: ${trabajadorSeleccionado?.nombre}
- Centro: ${centros.find(c => c.id === formData.centroId)?.nombreCentro}
- Fecha: ${new Date(formData.fecha).toLocaleDateString('es-ES')}
- Horario: ${formData.horaInicio} - ${formData.horaFin}
- Horas brutas: ${validacionCompensado.horasBrutas.toFixed(2)} horas
- Descuento almuerzo: ${validacionCompensado.tiempoAlmuerzoDescontado.toFixed(2)} horas
- Horas efectivas utilizadas: ${validacionCompensado.horasEfectivas.toFixed(2)} horas

💰 DESCUENTO DE BANCO DE HORAS:
- Horas disponibles antes: ${validacionCompensado.horasDisponibles.toFixed(2)} horas
- Horas utilizadas: ${validacionCompensado.horasEfectivas.toFixed(2)} horas
- Horas restantes: ${validacionCompensado.horasSobrantes.toFixed(2)} horas

📅 PERÍODO ORIGEN DE LAS HORAS:
- ${new Date(formData.periodoOrigenInicio).toLocaleDateString('es-ES')} - ${new Date(formData.periodoOrigenFin).toLocaleDateString('es-ES')}

🍽️ INFORMACIÓN DE ALMUERZO:
- ${validacionCompensado.yaHayAlmuerzoEnOtraActividad 
  ? "No se descontó almuerzo (ya existe en otro registro del día)" 
  : validacionCompensado.tiempoAlmuerzoDescontado > 0 
    ? `Se descontaron ${validacionCompensado.tiempoAlmuerzoDescontado.toFixed(2)}h de almuerzo`
    : "No se descontó almuerzo (jornada parcial)"}

🔗 INTEGRACIÓN AUTOMÁTICA:
- Se creó automáticamente un registro en RegistrosTrabajoDiarios
- Aparecerá como trabajo normal en el centro seleccionado
- Las horas se registran como "horas normales" (no generan extras)
- El registro estará marcado como "COMPENSADO" para identificación`);

      setFormData({
        ...initialCompensadoState,
        trabajadorId: formData.trabajadorId,
        periodoOrigenInicio: formData.periodoOrigenInicio,
        periodoOrigenFin: formData.periodoOrigenFin
      });

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
    setValidacionCompensado(null);
    setMensaje("");
  };

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

  const VistaPreviaComponent = () => {
    if (!formData.fecha || !formData.horaInicio || !formData.horaFin || !horasDisponibles) {
      return null;
    }

    const centroSeleccionado = centros.find(c => c.id === formData.centroId);

    return (
      <div className="vista-previa">
        <h4>
          <span>📊</span>
          Vista Previa del Compensado
        </h4>

        {loadingValidacion && (
          <div className="loading-container" style={{ margin: '10px 0' }}>
            <span className="loading-spinner"></span>
            Validando compensado...
          </div>
        )}

        {validacionCompensado && (
          <>
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
                <strong>Horas brutas:</strong>
                <span>{validacionCompensado.horasBrutas.toFixed(2)}h</span>
              </div>
              {validacionCompensado.tiempoAlmuerzoDescontado > 0 && (
                <div className="vista-previa-item">
                  <strong>Descuento almuerzo:</strong>
                  <span style={{ color: '#f59e0b' }}>
                    -{validacionCompensado.tiempoAlmuerzoDescontado.toFixed(2)}h
                  </span>
                </div>
              )}
              <div className="vista-previa-item">
                <strong>Horas efectivas:</strong>
                <span style={{ fontWeight: '700', color: '#667eea' }}>
                  {validacionCompensado.horasEfectivas.toFixed(2)}h
                </span>
              </div>
              <div className="vista-previa-item">
                <strong>Horas disponibles:</strong>
                <span>{validacionCompensado.horasDisponibles.toFixed(2)}h</span>
              </div>
              <div className="vista-previa-item">
                <strong>Quedarían:</strong>
                <span style={{ 
                  color: validacionCompensado.horasSobrantes >= 0 ? '#15803d' : '#dc2626',
                  fontWeight: '700'
                }}>
                  {validacionCompensado.horasSobrantes.toFixed(2)}h
                </span>
              </div>
            </div>

            {validacionCompensado.yaHayAlmuerzoEnOtraActividad && (
              <div className="warning-message" style={{ 
                background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
                borderColor: '#3b82f6'
              }}>
                <span className="warning-icon">ℹ️</span>
                <div>
                  <strong>Sin descuento de almuerzo:</strong> Ya existe otro registro con almuerzo en esta fecha, 
                  por lo que las {validacionCompensado.horasBrutas.toFixed(2)}h se contarán completas.
                </div>
              </div>
            )}

            {validacionCompensado.tiempoAlmuerzoDescontado > 0 && !validacionCompensado.yaHayAlmuerzoEnOtraActividad && (
              <div className="warning-message" style={{ 
                background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                borderColor: '#f59e0b'
              }}>
                <span className="warning-icon">🍽️</span>
                <div>
                  <strong>Descuento de almuerzo:</strong> Se descontarán {validacionCompensado.tiempoAlmuerzoDescontado.toFixed(2)}h 
                  de almuerzo. Horas efectivas: {validacionCompensado.horasEfectivas.toFixed(2)}h
                </div>
              </div>
            )}

            {!validacionCompensado.esValido && (
              <div className="warning-message">
                <span className="warning-icon">⚠️</span>
                <div>
                  <strong>Horas insuficientes:</strong> {validacionCompensado.mensaje}
                </div>
              </div>
            )}

            {validacionCompensado.esValido && (
              <div className="warning-message" style={{ 
                background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
                borderColor: '#10b981'
              }}>
                <span className="warning-icon">✅</span>
                <div>
                  <strong>Compensado válido:</strong> {validacionCompensado.mensaje}
                </div>
              </div>
            )}
          </>
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

          {loadingHoras && (
            <div className="loading-container" style={{ margin: '15px 0' }}>
              <span className="loading-spinner"></span>
              Consultando horas disponibles...
            </div>
          )}

          <HorasDisponiblesComponent />
        </div>

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
                  step="0.01"
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

            <VistaPreviaComponent />
          </div>
        )}

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
              !validacionCompensado ||
              !validacionCompensado.esValido ||
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