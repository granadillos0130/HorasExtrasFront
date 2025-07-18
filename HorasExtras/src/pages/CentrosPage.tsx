import React, { useEffect, useState } from "react";
import { centrosService } from "../api/centrosService";
import { trabajadoresService } from "../api/trabajadoresService";
import { useNavigate } from "react-router-dom";
import CentroBuscador from "../components/shared/CentroBuscador";
import CentroForm from "../components/centros/CentroForm";
import CentroCard from "../components/centros/CentroCard";
import CentroEstadisticasModal from "../components/centros/CentroEstadisticasModal";
import type { Centro } from "../types/centros";
import type { Trabajador } from "../types/trabajadores";
import type { CentroEstadisticas } from "../types/centros";
import "../styles/components/CentroCard.css";
import "../styles/pages/CentrosPage.css";

const CentrosPage: React.FC = () => {
  const [centros, setCentros] = useState<Centro[]>([]);
  const [centrosFiltrados, setCentrosFiltrados] = useState<Centro[]>([]);
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [selectedCentro, setSelectedCentro] = useState<string>("");
  const [selectedTrabajador, setSelectedTrabajador] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [loadingAssign, setLoadingAssign] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [centroFiltroSeleccionado, setCentroFiltroSeleccionado] = useState<string>("");
  const [estadisticasCentro, setEstadisticasCentro] = useState<CentroEstadisticas | null>(null);
  const [showEstadisticasModal, setShowEstadisticasModal] = useState(false);
  const navigate = useNavigate();

  const cargarCentros = async () => {
    try {
      setLoading(true);
      const data = await centrosService.getAll();
      setCentros(data);
      setCentrosFiltrados(data);
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

  // Filtrar centros cuando cambie la búsqueda o el centro seleccionado
  useEffect(() => {
    let filtrados = centros;

    // Filtrar por texto de búsqueda
    if (busqueda.trim()) {
      filtrados = filtrados.filter((centro) =>
        centro.nombreCentro.toLowerCase().includes(busqueda.toLowerCase()) ||
        centro.id.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    // Filtrar por centro específico seleccionado
    if (centroFiltroSeleccionado) {
      filtrados = filtrados.filter(centro => centro.id === centroFiltroSeleccionado);
    }

    setCentrosFiltrados(filtrados);
  }, [busqueda, centroFiltroSeleccionado, centros]);

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
      setSelectedCentro("");
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

  const handleVerEstadisticas = async (centroId: string) => {
    try {
      const data = await centrosService.getEstadisticas({ centroId });
      setEstadisticasCentro(data);
      setShowEstadisticasModal(true);
    } catch (error) {
      console.error("Error al obtener estadísticas:", error);
      alert("Error al obtener estadísticas del centro");
    }
  };

  const handleLimpiarBusqueda = () => {
    setBusqueda("");
    setCentroFiltroSeleccionado("");
  };

  const handleBusquedaTexto = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusqueda(e.target.value);
    // Limpiar el filtro por centro específico cuando se hace búsqueda por texto
    if (e.target.value.trim()) {
      setCentroFiltroSeleccionado("");
    }
  };

  const handleCentroFiltroChange = (centroId: string) => {
    setCentroFiltroSeleccionado(centroId);
    // Limpiar la búsqueda por texto cuando se selecciona un centro específico
    if (centroId) {
      setBusqueda("");
    }
  };

  const getSelectedTrabajadorName = () => {
    const trabajador = trabajadores.find((t) => t.id === selectedTrabajador);
    return trabajador ? trabajador.nombre : "";
  };

  const hayFiltrosActivos = busqueda.trim() || centroFiltroSeleccionado;

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
              <CentroForm
                onSuccess={() => {
                  setShowForm(false);
                  cargarCentros();
                }}
              />
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
              <CentroBuscador
                centros={centros}
                value={selectedCentro}
                onChange={(centroId) => setSelectedCentro(centroId)}
                placeholder="Seleccione un centro para asignar trabajador"
                label="Centro de Trabajo"
                showSelectedInfo={true}
              />

              <div className="form-group">
                <label className="form-label">Trabajador</label>
                <select
                  value={selectedTrabajador}
                  onChange={(e) => setSelectedTrabajador(Number(e.target.value))}
                  className="form-select"
                >
                  <option value={0}>Seleccione un trabajador</option>
                  {trabajadores.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nombre}
                    </option>
                  ))}
                </select>
                {getSelectedTrabajadorName() && (
                  <div className="selected-item">
                    👤 Trabajador seleccionado:{" "}
                    <strong>{getSelectedTrabajadorName()}</strong>
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

        {/* Nueva sección de búsqueda y filtros */}
        <div className="content-card">
          <div className="search-section">
            <div className="search-header">
              <div className="search-icon-header">🔍</div>
              <div className="search-title-section">
                <h3>Buscar y Filtrar Centros</h3>
                <p>Encuentra centros por nombre, ID o selecciona uno específico</p>
              </div>
              {hayFiltrosActivos && (
                <button className="btn-clear-search" onClick={handleLimpiarBusqueda}>
                  🗑️ Limpiar
                </button>
              )}
            </div>

            <div className="search-controls">
              <div className="search-input-container">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Buscar por nombre del centro o ID..."
                  value={busqueda}
                  onChange={handleBusquedaTexto}
                />
                <div className="search-icon-input">🔍</div>
              </div>

              <div className="search-or-separator">
                <span>O selecciona un centro específico:</span>
              </div>

              <CentroBuscador
                centros={centros}
                value={centroFiltroSeleccionado}
                onChange={handleCentroFiltroChange}
                placeholder="Selecciona un centro específico para filtrar..."
                label="Filtrar por Centro Específico"
                showSelectedInfo={false}
                className="filter-centro-buscador"
              />
            </div>

            {hayFiltrosActivos && (
              <div className="search-results-info">
                {centrosFiltrados.length > 0 ? (
                  <div className="results-found">
                    ✅ {centrosFiltrados.length} centro(s) encontrado(s)
                    {busqueda && ` para "${busqueda}"`}
                    {centroFiltroSeleccionado && (
                      <span>
                        {" "}filtrado por: {centros.find(c => c.id === centroFiltroSeleccionado)?.nombreCentro}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="no-results">
                    ❌ No se encontraron centros
                    {busqueda && ` que coincidan con "${busqueda}"`}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="content-card">
          <div className="listado-header">
            <h2>📋 Centros {hayFiltrosActivos ? 'Filtrados' : 'Registrados'}</h2>
            <p>
              {hayFiltrosActivos 
                ? `Mostrando: ${centrosFiltrados.length} de ${centros.length} centros`
                : `Total: ${centrosFiltrados.length}`
              }
            </p>
          </div>

          <div className="centros-grid">
            {loading ? (
              <div className="loading-message">
                <div className="search-loading">
                  <div className="search-loading-spinner"></div>
                  Cargando centros...
                </div>
              </div>
            ) : centrosFiltrados.length === 0 ? (
              hayFiltrosActivos ? (
                <div className="empty-search-state">
                  <div className="empty-search-icon">🔍</div>
                  <h3>No se encontraron centros</h3>
                  <p>
                    {busqueda 
                      ? `No hay centros que coincidan con "${busqueda}"`
                      : "El centro seleccionado no está disponible"
                    }
                  </p>
                  <div className="search-suggestions">
                    <p>Sugerencias:</p>
                    <ul>
                      <li>Verifica la ortografía de tu búsqueda</li>
                      <li>Prueba con términos más generales</li>
                      <li>Busca por ID del centro en lugar del nombre</li>
                      <li>Limpia los filtros para ver todos los centros</li>
                    </ul>
                  </div>
                  <button className="btn-clear-search-alt" onClick={handleLimpiarBusqueda}>
                    🗑️ Limpiar filtros
                  </button>
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">🏢</div>
                  <h3>No hay centros registrados</h3>
                  <p>Comienza creando tu primer centro de trabajo</p>
                  <button 
                    className="empty-state-action"
                    onClick={() => setShowForm(true)}
                  >
                    ➕ Crear Primer Centro
                  </button>
                </div>
              )
            ) : (
              centrosFiltrados.map((centro, index) => (
                <CentroCard
                  key={centro.id}
                  centro={centro}
                  onDelete={handleEliminar}
                  onView={handleVerEstadisticas}
                  style={{
                    animationDelay: `${index * 0.1}s`
                  }}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <CentroEstadisticasModal
        visible={showEstadisticasModal}
        onClose={() => setShowEstadisticasModal(false)}
        data={estadisticasCentro}
      />
    </div>
  );
};

export default CentrosPage;