import React, { useEffect, useState } from "react";
import { centrosService } from "../api/centrosService";
import { trabajadoresService } from "../api/trabajadoresService";
import { useNavigate } from "react-router-dom";
import type { Centro } from "../types/centros";
import type { Trabajador } from "../types/trabajadores";
import "../styles/pages/CentrosPage.css";

const CentrosPage: React.FC = () => {
  const [centros, setCentros] = useState<Centro[]>([]);
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [selectedCentro, setSelectedCentro] = useState<string>("");
  const [selectedTrabajador, setSelectedTrabajador] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [loadingAssign, setLoadingAssign] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  const cargarCentros = async () => {
    try {
      setLoading(true);
      const data = await centrosService.getAll();
      setCentros(data);
    } catch (error) {
      console.error("Error al cargar centros:", error);
    } finally {
      setLoading(false);
    }
  };

  const cargarTrabajadores = async () => {
    try {
      const data = await trabajadoresService.getAll();
      setTrabajadores(data);
    } catch (error) {
      console.error("Error al cargar trabajadores:", error);
    }
  };

  useEffect(() => {
    cargarCentros();
    cargarTrabajadores();
  }, []);

  const handleAsignar = async () => {
    if (selectedCentro === "" || selectedTrabajador === 0) {
      alert("Seleccione un centro y un trabajador");
      return;
    }
    
    setLoadingAssign(true);
    try {
      await centrosService.asignarTrabajador(selectedCentro, selectedTrabajador);
      alert("Trabajador asignado correctamente");
      setSelectedTrabajador(0);
    } catch (error) {
      console.error("Error al asignar trabajador:", error);
      alert("Error al asignar trabajador");
    } finally {
      setLoadingAssign(false);
    }
  };

  const handleEliminar = async (id: string, nombre: string) => {
    if (confirm(`¿Está seguro de eliminar el centro "${nombre}"?`)) {
      try {
        await centrosService.eliminar(id);
        cargarCentros();
        alert("Centro eliminado correctamente");
      } catch (error) {
        console.error("Error al eliminar centro:", error);
        alert("Error al eliminar centro");
      }
    }
  };

  const getSelectedCentroName = () => {
    const centro = centros.find(c => c.id === selectedCentro);
    return centro ? centro.nombreCentro : "";
  };

  const getSelectedTrabajadorName = () => {
    const trabajador = trabajadores.find(t => t.id === selectedTrabajador);
    return trabajador ? trabajador.nombre : "";
  };

  return (
    <div className="centros-page">
      <div className="page-container">
        <div className="page-header">
          <h1>Gestión de Centros</h1>
          <p className="page-subtitle">
            Administra los centros de trabajo y asigna trabajadores
          </p>
        </div>

        <div className="content-card">
          <div className="centros-toolbar">
            <div className="toolbar-left">
              <h2 className="toolbar-title">Centros de Trabajo</h2>
              <button
                className="btn-nuevo"
                onClick={() => setShowForm(!showForm)}
              >
                {showForm ? "❌ Cancelar" : "➕ Nuevo Centro"}
              </button>
            </div>
          </div>

          {showForm && (
            <div className="form-section">
              <div className="form-header">
                <div className="form-icon">🏢</div>
                <div>
                  <h3>Crear Nuevo Centro</h3>
                  <p>Ingresa la información del centro de trabajo</p>
                </div>
              </div>
              <CentroForm onSuccess={() => { setShowForm(false); cargarCentros(); }} />
            </div>
          )}

          <div className="centros-stats">
            <div className="stat-card">
              <div className="stat-number">{centros.length}</div>
              <div className="stat-label">Total Centros</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{trabajadores.length}</div>
              <div className="stat-label">Trabajadores Disponibles</div>
            </div>
          </div>

          {loading ? (
            <div className="loading-message">
              🔄 Cargando centros de trabajo...
            </div>
          ) : centros.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🏢</div>
              <h3>No hay centros registrados</h3>
              <p>Comienza creando tu primer centro de trabajo.</p>
              <button
                className="empty-state-action"
                onClick={() => setShowForm(true)}
              >
                ➕ Crear Primer Centro
              </button>
            </div>
          ) : (
            <div className="centros-content">
              <div className="content-header">
                <h3 className="content-title">
                  Lista de Centros
                  <span className="centros-count">
                    {centros.length} centro{centros.length !== 1 ? 's' : ''}
                  </span>
                </h3>
              </div>

              <div className="centros-grid">
                {centros.map((centro, index) => (
                  <div key={centro.id} className="centro-card" style={{animationDelay: `${index * 0.1}s`}}>
                    <div className="card-content">
                      <div className="centro-info">
                        <div className="centro-avatar">
                          🏢
                        </div>
                        <div className="centro-details">
                          <h4>{centro.nombreCentro}</h4>
                          <div className="centro-id">ID: {centro.id}</div>
                        </div>
                      </div>
                      <div className="card-actions">
                        <button 
                          className="btn-action btn-edit"
                          onClick={() => navigate(`/centros/editar/${centro.id}`)}
                          title="Editar centro"
                        >
                          ✏️
                        </button>
                        <button 
                          className="btn-action btn-delete"
                          onClick={() => handleEliminar(centro.id, centro.nombreCentro)}
                          title="Eliminar centro"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="content-card">
          <div className="assign-header">
            <div className="assign-icon">👥</div>
            <div>
              <h2>Asignar Trabajador a Centro</h2>
              <p>Vincula trabajadores con sus centros de trabajo correspondientes</p>
            </div>
          </div>

          <div className="assign-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Centro de Trabajo</label>
                <select 
                  value={selectedCentro} 
                  onChange={e => setSelectedCentro(e.target.value)}
                  className="form-select"
                >
                  <option value="">Seleccione un centro</option>
                  {centros.map(c => (
                    <option key={c.id} value={c.id}>{c.nombreCentro}</option>
                  ))}
                </select>
                {getSelectedCentroName() && (
                  <div className="selected-item">
                    🏢 Centro seleccionado: <strong>{getSelectedCentroName()}</strong>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Trabajador</label>
                <select 
                  value={selectedTrabajador} 
                  onChange={e => setSelectedTrabajador(Number(e.target.value))}
                  className="form-select"
                >
                  <option value={0}>Seleccione un trabajador</option>
                  {trabajadores.map(t => (
                    <option key={t.id} value={t.id}>{t.nombre}</option>
                  ))}
                </select>
                {getSelectedTrabajadorName() && (
                  <div className="selected-item">
                    👤 Trabajador seleccionado: <strong>{getSelectedTrabajadorName()}</strong>
                  </div>
                )}
              </div>

              <button 
                onClick={handleAsignar}
                className="btn-assign"
                disabled={loadingAssign || selectedCentro === "" || selectedTrabajador === 0}
              >
                {loadingAssign ? "Asignando..." : "👥 Asignar"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface CentroFormProps {
  onSuccess: () => void;
}

const CentroForm: React.FC<CentroFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState<Centro>({
    id: "",
    nombreCentro: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.id.trim() === "" || !formData.nombreCentro.trim()) {
      alert("Por favor, ingrese un ID válido y un nombre de centro.");
      return;
    }

    setLoading(true);
    try {
      await centrosService.crear(formData);
      alert("Centro creado correctamente.");
      onSuccess();
      setFormData({ id: "", nombreCentro: "" });
    } catch (error) {
      console.error("Error al crear centro:", error);
      alert("Error al crear el centro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="centro-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">ID Centro</label>
          <input
            type="text"
            name="id"
            value={formData.id}
            onChange={handleChange}
            className="form-input"
            placeholder="Ej: CENTRO01"
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Nombre del Centro</label>
          <input
            type="text"
            name="nombreCentro"
            value={formData.nombreCentro}
            onChange={handleChange}
            className="form-input"
            placeholder="Ej: Centro Principal"
            required
          />
        </div>
        <button 
          type="submit" 
          className="btn-submit"
          disabled={loading}
        >
          {loading ? "Creando..." : "✅ Crear Centro"}
        </button>
      </div>
    </form>
  );
};

export default CentrosPage;
