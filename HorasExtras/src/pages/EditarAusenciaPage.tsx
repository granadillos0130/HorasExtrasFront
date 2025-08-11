import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ausenciasService } from "../api/ausenciasService";
import type { Ausencia, AusenciaDto } from "../types/ausencia";
import "../styles/pages/EditarAusenciaPage.css"

export function EditarAusenciaPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [ausencia, setAusencia] = useState<Ausencia | null>(null);
  const [error, setError] = useState<string>("");

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
    dx: ""
  });

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
        
        // Llenar el formulario con los datos existentes
        setFormData({
          fecha: ausenciaData.fecha.split('T')[0], // Convertir a formato YYYY-MM-DD
          tipoAusencia: ausenciaData.tipoAusencia,
          descripcion: ausenciaData.descripcion,
          trabajadorNombre: ausenciaData.trabajadorNombre,
          cargo: ausenciaData.cargo,
          fechaInicio: ausenciaData.fechaInicio.split('T')[0],
          fechaFin: ausenciaData.fechaFin.split('T')[0],
          horaInicio: ausenciaData.horaInicio,
          horaFin: ausenciaData.horaFin,
          remunerado: ausenciaData.remunerado,
          dx: ausenciaData.dx || ""
        });
      } catch (error) {
        console.error("Error al cargar ausencia:", error);
        setError("Error al cargar los datos de la ausencia");
      } finally {
        setLoading(false);
      }
    };

    cargarAusencia();
  }, [id]);

  // Manejar cambios en los inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
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
        dx: formData.dx || undefined
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
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="ausencia-form">
        <div className="form-grid">
          {/* Fecha */}
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

          {/* Trabajador */}
          <div className="form-group">
            <label htmlFor="trabajadorNombre">👤 Nombre del Trabajador</label>
            <input
              type="text"
              id="trabajadorNombre"
              name="trabajadorNombre"
              value={formData.trabajadorNombre}
              onChange={handleInputChange}
              required
              placeholder="Nombre completo del trabajador"
            />
          </div>

          {/* Cargo */}
          <div className="form-group">
            <label htmlFor="cargo">💼 Cargo</label>
            <input
              type="text"
              id="cargo"
              name="cargo"
              value={formData.cargo}
              onChange={handleInputChange}
              required
              placeholder="Cargo del trabajador"
            />
          </div>

          {/* Tipo de Ausencia */}
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

          {/* Fecha Inicio */}
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

          {/* Fecha Fin */}
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

          {/* Hora Inicio */}
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

          {/* Hora Fin */}
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

        {/* Descripción */}
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

        {/* Diagnóstico */}
        <div className="form-group full-width">
          <label htmlFor="dx">🏥 Diagnóstico (Opcional)</label>
          <textarea
            id="dx"
            name="dx"
            value={formData.dx}
            onChange={handleInputChange}
            rows={2}
            placeholder="Diagnóstico médico si aplica..."
          />
        </div>

        {/* Remunerado */}
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