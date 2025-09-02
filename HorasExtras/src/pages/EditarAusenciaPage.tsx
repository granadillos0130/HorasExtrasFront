import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ausenciasService,
  validarDiasVacaciones,
  calcularFechaRegreso 
} from "../api/ausenciasService"; // 🆕 Usar funciones del servicio existente
import { trabajadoresService } from "../api/trabajadoresService";
import TrabajadorBuscador from "../components/shared/TrabajadorBuscador";
import DiagnosticoBuscador from "../components/shared/DiagnosticoBuscador";
import type { 
  Ausencia, 
  AusenciaDto, 
  ValidacionVacacionesResponse
} from "../types/ausencia"; // 🆕 Usar tipos existentes (removido ValidarVacacionesDto)
import type { Trabajador } from "../types/trabajadores";
import type { Diagnostico } from "../types/diagnostico";
import "../styles/pages/EditarAusenciaPage.css";

// 🆕 Usar el tipo ValidacionVacacionesResponse del servicio
type ValidacionVacaciones = ValidacionVacacionesResponse;

export function EditarAusenciaPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [ausencia, setAusencia] = useState<Ausencia | null>(null);
  const [error, setError] = useState<string>("");
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [trabajadorSeleccionadoId, setTrabajadorSeleccionadoId] = useState<number>(0);

  // 🆕 Estados para validación de vacaciones
  const [validacionVacaciones, setValidacionVacaciones] = useState<ValidacionVacaciones | null>(null);
  const [loadingValidacion, setLoadingValidacion] = useState(false);

  // Estados del formulario
  const [formData, setFormData] = useState({
    fecha: "",
    tipoAusencia: "",
    descripcion: "",
    trabajadorNombre: "",
    cargo: "",
    fechaInicio: "",
    fechaFin: "",
    horaInicio: "",
    horaFin: "",
    remunerado: false,
    // 🆕 Campos de diagnóstico actualizados
    diagnosticoId: undefined as number | undefined,
    diagnosticoCodigo: "",
    diagnosticoDescripcion: ""
  });

  // 🆕 Función para verificar si es vacaciones (memoizada)
  const esVacaciones = useCallback(() => {
    return formData.tipoAusencia.toLowerCase().includes("vacacion");
  }, [formData.tipoAusencia]);

  // 🆕 Función para validar vacaciones cuando cambien fechas o trabajador (memoizada)
  const validarVacacionesSiAplica = useCallback(async () => {
    if (!esVacaciones() || !trabajadorSeleccionadoId || !formData.fechaInicio || !formData.fechaFin) {
      setValidacionVacaciones(null);
      return;
    }

    setLoadingValidacion(true);
    try {
      const validacion = await validarDiasVacaciones({
        fechaInicio: new Date(formData.fechaInicio),
        fechaFin: new Date(formData.fechaFin),
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
      const timeoutId = setTimeout(() => {
        validarVacacionesSiAplica();
      }, 500);
      
      return () => clearTimeout(timeoutId);
    } else {
      setValidacionVacaciones(null);
    }
  }, [esVacaciones, validarVacacionesSiAplica, trabajadorSeleccionadoId, formData.fechaInicio, formData.fechaFin]);

  // 🆕 Función para determinar si mostrar el campo diagnóstico
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
        const data = await trabajadoresService.getAll();
        setTrabajadores(data);
      } catch (error) {
        console.error("Error al cargar trabajadores:", error);
      }
    };

    cargarTrabajadores();
  }, []);

  // Cargar datos de la ausencia al montar el componente
  useEffect(() => {
    const cargarAusencia = async () => {
      if (!id) {
        setError("ID de ausencia no válido");
        setLoading(false);
        return;
      }

      try {
        const ausenciaData = await ausenciasService.getById(parseInt(id));
        setAusencia(ausenciaData);
        
        // Buscar el trabajador para obtener el ID
        const trabajador = trabajadores.find(t => t.nombre === ausenciaData.trabajadorNombre);
        if (trabajador) {
          setTrabajadorSeleccionadoId(trabajador.id);
        }
        
        // Llenar el formulario con los datos existentes
        setFormData({
          fecha: ausenciaData.fecha.split('T')[0],
          tipoAusencia: ausenciaData.tipoAusencia,
          descripcion: ausenciaData.descripcion,
          trabajadorNombre: ausenciaData.trabajadorNombre,
          cargo: ausenciaData.cargo,
          fechaInicio: ausenciaData.fechaInicio.split('T')[0],
          fechaFin: ausenciaData.fechaFin.split('T')[0],
          horaInicio: ausenciaData.horaInicio,
          horaFin: ausenciaData.horaFin,
          remunerado: ausenciaData.remunerado,
          // 🆕 Campos de diagnóstico actualizados
          diagnosticoId: ausenciaData.diagnosticoId,
          diagnosticoCodigo: ausenciaData.diagnosticoCodigo || "",
          diagnosticoDescripcion: ausenciaData.diagnosticoDescripcion || ""
        });
      } catch (error) {
        console.error("Error al cargar ausencia:", error);
        setError("Error al cargar los datos de la ausencia");
      } finally {
        setLoading(false);
      }
    };

    if (trabajadores.length > 0) {
      cargarAusencia();
    }
  }, [id, trabajadores]);

  // Manejar cambios en los inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name === "tipoAusencia") {
      // 🆕 Cuando cambie el tipo de ausencia, ajustar horarios
      const nuevasHoras = value.toLowerCase().includes("vacacion") 
        ? { horaInicio: "08:00", horaFin: "17:00" } // Día completo para vacaciones
        : { horaInicio: formData.horaInicio, horaFin: formData.horaFin }; // Mantener horas actuales para otras

      setFormData(prev => ({
        ...prev,
        tipoAusencia: value,
        // Limpiar diagnóstico cuando cambia el tipo
        diagnosticoId: undefined,
        diagnosticoCodigo: "",
        diagnosticoDescripcion: "",
        ...nuevasHoras
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  // Manejar selección de trabajador
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

  // 🆕 Manejar selección de diagnóstico
  const handleDiagnosticoSelect = (diagnosticoId: number | undefined, diagnostico?: Diagnostico) => {
    setFormData(prev => ({
      ...prev,
      diagnosticoId: diagnosticoId,
      diagnosticoCodigo: diagnostico?.codigo || "",
      diagnosticoDescripcion: diagnostico?.descripcion || ""
    }));
  };

  // 🆕 Componente para mostrar validación de vacaciones
  const ValidacionVacacionesComponent = () => {
    if (!esVacaciones() || !validacionVacaciones) return null;

    const fechaRegreso = calcularFechaRegreso(new Date(formData.fechaFin));

    return (
      <div style={{
        background: 'linear-gradient(135deg, #fefbf3, #fef3c7)',
        border: '2px solid #f59e0b',
        borderRadius: '12px',
        padding: '20px',
        margin: '15px 0',
        animation: 'slideIn 0.3s ease-out'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '15px',
          color: '#92400e',
          fontSize: '1.1rem',
          fontWeight: '600'
        }}>
          <span>🏖️</span>
          <strong>Validación de Vacaciones</strong>
        </div>
        
        <div style={{ color: '#78350f', lineHeight: '1.6' }}>
          <p style={{ marginBottom: '15px', fontWeight: '600' }}>
            {validacionVacaciones.mensaje}
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            margin: '15px 0'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.8)',
              padding: '12px',
              borderRadius: '8px',
              borderLeft: '4px solid #f59e0b'
            }}>
              <strong style={{ display: 'block', color: '#92400e', fontSize: '0.9rem', marginBottom: '4px' }}>
                Total de días
              </strong>
              <span style={{ fontSize: '1.1rem', fontWeight: '600', color: '#78350f' }}>
                {validacionVacaciones.totalDias}
              </span>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.8)',
              padding: '12px',
              borderRadius: '8px',
              borderLeft: '4px solid #f59e0b'
            }}>
              <strong style={{ display: 'block', color: '#92400e', fontSize: '0.9rem', marginBottom: '4px' }}>
                Días laborables
              </strong>
              <span style={{ fontSize: '1.1rem', fontWeight: '600', color: '#78350f' }}>
                {validacionVacaciones.diasLaborables}
              </span>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.8)',
              padding: '12px',
              borderRadius: '8px',
              borderLeft: '4px solid #f59e0b'
            }}>
              <strong style={{ display: 'block', color: '#92400e', fontSize: '0.9rem', marginBottom: '4px' }}>
                Se descontarán
              </strong>
              <span style={{ fontSize: '1.1rem', fontWeight: '600', color: '#78350f' }}>
                {validacionVacaciones.diasADescontar} días
              </span>
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
            border: '2px solid #22c55e',
            borderRadius: '10px',
            padding: '15px',
            marginTop: '15px',
            textAlign: 'center'
          }}>
            <div style={{ color: '#15803d', fontWeight: '600', marginBottom: '8px', fontSize: '1rem' }}>
              📅 Fecha de regreso al trabajo:
            </div>
            <div style={{ color: '#166534', fontSize: '1.3rem', fontWeight: '700' }}>
              {fechaRegreso.toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>

          {validacionVacaciones.detalleDias && validacionVacaciones.detalleDias.length > 0 && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '8px',
              padding: '15px',
              marginTop: '15px',
              maxHeight: '200px',
              overflowY: 'auto'
            }}>
              <h5 style={{ margin: '0 0 10px 0', color: '#92400e', fontSize: '0.95rem' }}>
                📋 Detalle por días:
              </h5>
              {validacionVacaciones.detalleDias.map((dia, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 0',
                  borderBottom: '1px solid #f3f4f6',
                  fontSize: '0.85rem'
                }}>
                  <span style={{ fontWeight: '600', color: '#374151' }}>
                    {new Date(dia.fecha).toLocaleDateString('es-ES')} - {dia.diaSemana}
                  </span>
                  <span style={{ color: '#6b7280' }}>{dia.motivo}</span>
                  <span style={{
                    color: dia.esLaborable ? '#059669' : '#dc2626',
                    fontWeight: '600'
                  }}>
                    {dia.esLaborable ? "✅ Se descuenta" : "⭕ No se descuenta"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id || !ausencia) return;

    setGuardando(true);
    setError("");

    try {
      const ausenciaDto: AusenciaDto = {
        id: ausencia.id,
        fecha: new Date(formData.fecha),
        tipoAusencia: formData.tipoAusencia,
        descripcion: formData.descripcion,
        trabajadorNombre: formData.trabajadorNombre,
        cargo: formData.cargo,
        fechaInicio: new Date(formData.fechaInicio),
        fechaFin: new Date(formData.fechaFin),
        horaInicio: formData.horaInicio,
        horaFin: formData.horaFin,
        remunerado: formData.remunerado,
        // 🆕 Campos de diagnóstico actualizados
        diagnosticoId: formData.diagnosticoId,
        diagnosticoCodigo: formData.diagnosticoCodigo,
        diagnosticoDescripcion: formData.diagnosticoDescripcion
      };

      await ausenciasService.actualizarAusencia(parseInt(id), ausenciaDto);
      
      console.log("✅ Ausencia actualizada correctamente");
      navigate("/ausencias", { 
        state: { 
          message: esVacaciones() 
            ? "Vacaciones actualizadas correctamente" 
            : "Ausencia actualizada correctamente",
          type: "success"
        }
      });
    } catch (error) {
      console.error("Error al actualizar ausencia:", error);
      setError("Error al actualizar la ausencia. Por favor, intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando datos de la ausencia...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">❌</div>
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate("/ausencias")} className="btn-volver">
          ← Volver a Ausencias
        </button>
      </div>
    );
  }

  if (!ausencia) {
    return (
      <div className="error-container">
        <div className="error-icon">🔍</div>
        <h2>Ausencia no encontrada</h2>
        <p>No se pudo encontrar la ausencia solicitada.</p>
        <button onClick={() => navigate("/ausencias")} className="btn-volver">
          ← Volver a Ausencias
        </button>
      </div>
    );
  }

  // 🆕 Lista actualizada de tipos de ausencia (incluye Vacaciones)
  const tiposAusencia = [
    "Vacaciones", // 🆕 Agregado
    "Cita médica general",
    "Cita Seguimiento EO",
    "Enfermedad común",
    "Enfermedad Laboral",
    "Accidente laboral",
    "Accidente Origen Comun",
    "Diligencias personales"
  ];

  return (
    <div className="editar-ausencia-container">
      <div className="ausencia-header">
        <h1>✏️ Editar {esVacaciones() ? 'Vacaciones' : 'Ausencia'}</h1>
        <button 
          onClick={() => navigate("/ausencias")}
          className="btn-volver"
        >
          ← Volver a Ausencias
        </button>
      </div>

      <div className="ausencia-info">
        <div className="info-card">
          <h3>📋 Información de la {esVacaciones() ? 'Vacaciones' : 'Ausencia'}</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">ID:</span>
              <span className="info-value">#{ausencia.id}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Fecha de solicitud:</span>
              <span className="info-value">
                {ausencia.fechaSolicitud ? 
                  new Date(ausencia.fechaSolicitud).toLocaleDateString('es-ES') 
                  : 'N/A'
                }
              </span>
            </div>
            {/* 🆕 Mostrar diagnóstico actual si existe */}
            {ausencia.diagnosticoCodigo && (
              <div className="info-item full-width">
                <span className="info-label">🏥 Diagnóstico actual:</span>
                <span className="info-value diagnostico-actual">
                  {ausencia.diagnosticoCodigo} - {ausencia.diagnosticoDescripcion}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="ausencia-form">
        {/* Información del Trabajador */}
        <div className="form-section">
          <h3 className="section-title">
            <span className="section-icon">👤</span>
            Información del Trabajador
          </h3>
          <div className="form-group full-width">
            <TrabajadorBuscador
              trabajadores={trabajadores}
              value={trabajadorSeleccionadoId}
              onChange={handleTrabajadorSelect}
              placeholder="Buscar trabajador por nombre o cédula..."
              label="Seleccionar Trabajador"
              required={true}
              showSelectedInfo={true}
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="trabajadorNombre">👤 Nombre del Trabajador</label>
              <input
                type="text"
                id="trabajadorNombre"
                name="trabajadorNombre"
                value={formData.trabajadorNombre}
                onChange={handleInputChange}
                required
                readOnly
                disabled
              />
            </div>

            <div className="form-group">
              <label htmlFor="cargo">💼 Cargo</label>
              <input
                type="text"
                id="cargo"
                name="cargo"
                value={formData.cargo}
                onChange={handleInputChange}
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
            Detalles de la {esVacaciones() ? 'Vacaciones' : 'Ausencia'}
          </h3>
          
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="fecha">📅 Fecha de {esVacaciones() ? 'Solicitud' : 'Ausencia'}</label>
              <input
                type="date"
                id="fecha"
                name="fecha"
                value={formData.fecha}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="tipoAusencia">📋 Tipo de Ausencia</label>
              <select
                id="tipoAusencia"
                name="tipoAusencia"
                value={formData.tipoAusencia}
                onChange={handleInputChange}
                required
              >
                <option value="">Seleccionar tipo...</option>
                {tiposAusencia.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="fechaInicio">📅 Fecha de Inicio</label>
              <input
                type="date"
                id="fechaInicio"
                name="fechaInicio"
                value={formData.fechaInicio}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="fechaFin">📅 Fecha de Fin</label>
              <input
                type="date"
                id="fechaFin"
                name="fechaFin"
                value={formData.fechaFin}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* 🆕 CAMPOS DE HORA SOLO SI NO ES VACACIONES */}
            {!esVacaciones() && (
              <>
                <div className="form-group">
                  <label htmlFor="horaInicio">🕐 Hora de Inicio</label>
                  <input
                    type="time"
                    id="horaInicio"
                    name="horaInicio"
                    value={formData.horaInicio}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="horaFin">🕐 Hora de Fin</label>
                  <input
                    type="time"
                    id="horaFin"
                    name="horaFin"
                    value={formData.horaFin}
                    onChange={handleInputChange}
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
          </div>

          <div className="form-group full-width">
            <label htmlFor="descripcion">📝 Descripción</label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              required
              rows={3}
              placeholder={esVacaciones() 
                ? "Describa el motivo de las vacaciones (ej: Vacaciones anuales programadas, descanso familiar, etc.)" 
                : "Describe la razón de la ausencia..."
              }
            />
          </div>

          {/* 🆕 CAMPO DIAGNÓSTICO CON BUSCADOR */}
          {mostrarCampoDiagnostico() && (
            <div className="form-group full-width">
              <div className="diagnostico-section">
                <div className="diagnostico-header">
                  <span style={{ fontSize: '1.5rem' }}>🏥</span>
                  <strong>Diagnóstico Médico (CIE-10)</strong>
                </div>
                
                <DiagnosticoBuscador
                  value={formData.diagnosticoId}
                  onChange={handleDiagnosticoSelect}
                  placeholder="Buscar por código (ej: A09) o descripción (ej: diarrea)..."
                  label=""
                  required={false}
                  showSelectedInfo={true}
                />
                
                <small className="diagnostico-help">
                  💡 <strong>Ayuda:</strong> Puedes buscar por código CIE-10 (ejemplo: "A09") o por descripción (ejemplo: "diarrea", "cefalea"). 
                  Este campo es opcional pero recomendado para {
                    formData.tipoAusencia === "Cita médica general" || formData.tipoAusencia === "Cita Seguimiento EO" 
                      ? "citas médicas" 
                      : "casos de enfermedad"
                  }.
                </small>
              </div>
            </div>
          )}

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="remunerado"
                checked={formData.remunerado}
                onChange={handleInputChange}
              />
              <span className="checkbox-text">💰 {esVacaciones() ? 'Vacaciones' : 'Ausencia'} Remunerada</span>
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
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '1rem',
            background: '#f8f9fa',
            borderRadius: '10px',
            border: '2px dashed #dee2e6',
            justifyContent: 'center',
            color: '#6c757d',
            fontWeight: '500',
            margin: '15px 0'
          }}>
            <span style={{
              width: '20px',
              height: '20px',
              border: '2px solid #dee2e6',
              borderTop: '2px solid #667eea',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></span>
            Validando días de vacaciones...
          </div>
        )}

        <ValidacionVacacionesComponent />

        {/* 🆕 Vista previa de cálculos actualizados */}
        {formData.fechaInicio && formData.fechaFin && (
          <div style={{
            background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
            border: '2px solid #22c55e',
            borderRadius: '12px',
            padding: '15px',
            marginTop: '20px'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#15803d', fontSize: '1rem' }}>
              📊 Vista Previa {esVacaciones() ? 'de Vacaciones' : 'de la Ausencia'}
            </h4>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '10px',
              fontSize: '0.9rem',
              color: '#166534'
            }}>
              <div>
                <strong>Días {esVacaciones() ? 'calendarios' : 'afectados'}:</strong> {
                  Math.ceil((new Date(formData.fechaFin).getTime() - new Date(formData.fechaInicio).getTime()) / (1000 * 60 * 60 * 24)) + 1
                }
              </div>
              {esVacaciones() && validacionVacaciones && (
                <div>
                  <strong>Días a descontar:</strong> {validacionVacaciones.diasADescontar}
                </div>
              )}
              <div>
                <strong>Total horas:</strong> {
                  esVacaciones() 
                    ? (validacionVacaciones ? validacionVacaciones.diasADescontar * 8 : 'Calculando...')
                    : formData.horaInicio && formData.horaFin 
                      ? ((new Date(`1970-01-01T${formData.horaFin}`).getTime() - new Date(`1970-01-01T${formData.horaInicio}`).getTime()) / (1000 * 60 * 60) * 
                        (Math.ceil((new Date(formData.fechaFin).getTime() - new Date(formData.fechaInicio).getTime()) / (1000 * 60 * 60 * 24)) + 1)).toFixed(2)
                      : '0'
                }
              </div>
              <div>
                <strong>Tipo:</strong> {formData.remunerado ? 'Remunerada' : 'No remunerada'}
              </div>
              {mostrarCampoDiagnostico() && formData.diagnosticoCodigo && (
                <div style={{ gridColumn: '1 / -1', marginTop: '10px', padding: '10px', background: 'rgba(255,255,255,0.8)', borderRadius: '6px' }}>
                  <strong>🏥 Diagnóstico:</strong> {formData.diagnosticoCodigo} - {formData.diagnosticoDescripcion}
                </div>
              )}
              {esVacaciones() && validacionVacaciones && (
                <div style={{ gridColumn: '1 / -1', marginTop: '10px', padding: '10px', background: 'rgba(255,255,255,0.8)', borderRadius: '6px' }}>
                  <strong>📅 Regresa el:</strong> {calcularFechaRegreso(new Date(formData.fechaFin)).toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate("/ausencias")}
            className="btn-cancelar"
            disabled={guardando}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-guardar"
            disabled={guardando}
          >
            {guardando ? "Guardando..." : `💾 Guardar ${esVacaciones() ? 'Vacaciones' : 'Cambios'}`}
          </button>
        </div>

        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}
      </form>
    </div>
  );
}