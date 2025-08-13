import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ausenciasService } from "../api/ausenciasService";
import { trabajadoresService } from "../api/trabajadoresService";
import TrabajadorBuscador from "../components/shared/TrabajadorBuscador";
import DiagnosticoBuscador from "../components/shared/DiagnosticoBuscador";
import type { Ausencia, AusenciaDto } from "../types/ausencia";
import type { Trabajador } from "../types/trabajadores";
import type { Diagnostico } from "../types/diagnostico";
import "../styles/pages/EditarAusenciaPage.css";

export function EditarAusenciaPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [ausencia, setAusencia] = useState<Ausencia | null>(null);
  const [error, setError] = useState<string>("");
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [trabajadorSeleccionadoId, setTrabajadorSeleccionadoId] = useState<number>(0);

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

  // 🆕 Función para determinar si mostrar el campo diagnóstico
  const mostrarCampoDiagnostico = () => {
    return formData.tipoAusencia === "Cita médica general" || 
           formData.tipoAusencia === "Cita Seguimiento EO";
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
      setFormData(prev => ({
        ...prev,
        tipoAusencia: value,
        // Limpiar diagnóstico cuando cambia el tipo
        diagnosticoId: undefined,
        diagnosticoCodigo: "",
        diagnosticoDescripcion: ""
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
          message: "Ausencia actualizada correctamente",
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

  const tiposAusencia = [
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
        <h1>✏️ Editar Ausencia</h1>
        <button 
          onClick={() => navigate("/ausencias")}
          className="btn-volver"
        >
          ← Volver a Ausencias
        </button>
      </div>

      <div className="ausencia-info">
        <div className="info-card">
          <h3>📋 Información de la Ausencia</h3>
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
            Detalles de la Ausencia
          </h3>
          
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="fecha">📅 Fecha de Ausencia</label>
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
              placeholder="Describe la razón de la ausencia..."
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
                  Este campo es opcional pero recomendado para citas médicas.
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
              <span className="checkbox-text">💰 Ausencia Remunerada</span>
            </label>
          </div>
        </div>

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
            {guardando ? "Guardando..." : "💾 Guardar Cambios"}
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