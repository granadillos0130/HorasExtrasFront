import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom"; // 🆕 Para navegación
import { useTrabajadores } from "../hooks/useTrabajadores";
import TrabajadorForm from "../components/trabajadores/TrabajadorForm";
import TrabajadorCard from "../components/trabajadores/TrabajadorCard";
import TrabajadorDetail from "../components/trabajadores/TrabajadorDetailModal";
import TrabajadorBuscador from "../components/shared/TrabajadorBuscador";
import { trabajadoresService } from "../api/trabajadoresService";
import { ausenciasService } from "../api/ausenciasService"; // 🆕 Importar servicio
import type { ResumenTrabajador } from "../types/ausencia"; // 🆕 Importar tipo
import "../styles/pages/TrabajadoresPage.css";
import type { Trabajador } from "../types/trabajadores";

const TrabajadoresPage: React.FC = () => {
  const navigate = useNavigate(); // 🆕 Hook de navegación
  const { trabajadores, loading, error, refetch } = useTrabajadores();
  const [showForm, setShowForm] = useState(false);
  const [detalleId, setDetalleId] = useState<number | null>(null);
  const [mostrarSoloNoVigentes, setMostrarSoloNoVigentes] = useState(false);
  const [selectedTrabajadorId, setSelectedTrabajadorId] = useState<number | null>(null);
  
  // 🆕 Estados para el resumen de ausencias
  const [resumenAusencias, setResumenAusencias] = useState<ResumenTrabajador | null>(null);
  const [loadingResumen, setLoadingResumen] = useState(false);
  
  // Estados para el buscador
  const [trabajadorSeleccionadoId, setTrabajadorSeleccionadoId] = useState<number>(0);
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [terminoBusqueda, setTerminoBusqueda] = useState<string>("");

  const handleCreated = () => {
    setShowForm(false);
    refetch();
  };

  const handleDelete = async (id: number, nombre: string) => {
    if (confirm(`¿Estás seguro de eliminar a ${nombre}?`)) {
      try {
        await trabajadoresService.delete(id);
        if (selectedTrabajadorId === id) {
          setSelectedTrabajadorId(null);
        }
        refetch();
      } catch (error) {
        console.error("Error al eliminar el trabajador:", error);
        alert("Error al eliminar el trabajador");
      }
    }
  };

  const handleSelectTrabajador = (id: number) => {
    setSelectedTrabajadorId(selectedTrabajadorId === id ? null : id);
    // 🆕 Limpiar resumen cuando se selecciona otro trabajador
    if (selectedTrabajadorId !== id) {
      setResumenAusencias(null);
    }
  };

  // 🆕 Función para navegar a la página de ausencias
  const handleVerAusencias = async () => {
    if (!selectedTrabajadorId) return;

    // Cargar resumen rápido primero
    setLoadingResumen(true);
    try {
      const resumen = await ausenciasService.getResumenTrabajador(selectedTrabajadorId);
      setResumenAusencias(resumen);
      
      // Navegar a la página de ausencias
      navigate(`/trabajadores/${selectedTrabajadorId}/ausencias`);
    } catch (error) {
      console.error("Error al cargar resumen de ausencias:", error);
      // Aún así navegar a la página, que manejará el error
      navigate(`/trabajadores/${selectedTrabajadorId}/ausencias`);
    } finally {
      setLoadingResumen(false);
    }
  };

  // Función para filtrar trabajadores
  const trabajadoresFiltrados = useMemo(() => {
    let filtrados = trabajadores;

    if (filtroEstado !== "todos") {
      filtrados = filtrados.filter(t => t.estado === filtroEstado);
    }

    if (trabajadorSeleccionadoId > 0) {
      filtrados = filtrados.filter(t => t.id === trabajadorSeleccionadoId);
    } else if (terminoBusqueda.trim()) {
      const termino = terminoBusqueda.toLowerCase();
      filtrados = filtrados.filter(t => 
        t.nombre.toLowerCase().includes(termino) ||
        t.cedula.toLowerCase().includes(termino)
      );
    }

    if (mostrarSoloNoVigentes) {
      filtrados = filtrados.filter(t => t.estado === "No Vigente");
    }

    return filtrados;
  }, [trabajadores, filtroEstado, trabajadorSeleccionadoId, terminoBusqueda, mostrarSoloNoVigentes]);

  // Estadísticas de trabajadores
  const estadisticas = useMemo(() => {
    const vigentes = trabajadores.filter(t => t.estado === "Vigente").length;
    const noVigentes = trabajadores.filter(t => t.estado === "No Vigente").length;
    const total = trabajadores.length;
    
    return { vigentes, noVigentes, total };
  }, [trabajadores]);

  const handleBuscarTrabajador = (id: number, trabajador?: Trabajador) => {
    setTrabajadorSeleccionadoId(id);
    if (trabajador) {
      setTerminoBusqueda(trabajador.nombre);
      setSelectedTrabajadorId(trabajador.id);
    } else {
      setTerminoBusqueda("");
      setSelectedTrabajadorId(null);
    }
  };

  const limpiarBusqueda = () => {
    setTrabajadorSeleccionadoId(0);
    setTerminoBusqueda("");
    setFiltroEstado("todos");
    setMostrarSoloNoVigentes(false);
    setSelectedTrabajadorId(null);
    setResumenAusencias(null); // 🆕 Limpiar resumen
  };

  const hayFiltrosActivos = trabajadorSeleccionadoId > 0 || terminoBusqueda.trim() || 
                          filtroEstado !== "todos" || mostrarSoloNoVigentes;

  // 🆕 Obtener trabajador seleccionado
  const trabajadorSeleccionado = selectedTrabajadorId 
    ? trabajadores.find(t => t.id === selectedTrabajadorId)
    : null;

  return (
    <div className="trabajadores-page">
      <div className="page-container">
        <div className="page-header">
          <h1>Gestión de Trabajadores</h1>
          <p className="page-subtitle">
            Administra la información de tu equipo de trabajo
          </p>
        </div>

        <div className="content-card">
          <div className="form-section">
            {!showForm && (
              <>
                <button className="btn-primary" onClick={() => setShowForm(true)}>
                  ➕ Agregar Nuevo Trabajador
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => setMostrarSoloNoVigentes((prev) => !prev)}
                >
                  {mostrarSoloNoVigentes ? "👀 Ver Todos" : "🚫 Ver No Vigentes"}
                </button>
                
                {/* 🆕 Sección de acciones para trabajador seleccionado */}
                {selectedTrabajadorId && (
                  <div className="selection-info">
                    <div className="selection-header">
                      <span className="selection-text">
                        ✨ Trabajador seleccionado: <strong>{trabajadorSeleccionado?.nombre}</strong>
                      </span>
                      <button 
                        className="btn-deselect"
                        onClick={() => setSelectedTrabajadorId(null)}
                      >
                        ✕ Deseleccionar
                      </button>
                    </div>
                    
                    {/* 🆕 Botones de acciones */}
                    <div className="selection-actions">
                      <button 
                        className={`btn-action ${loadingResumen ? 'loading' : ''}`}
                        onClick={handleVerAusencias}
                        disabled={loadingResumen}
                      >
                        {loadingResumen ? (
                          <>🔄 Cargando...</>
                        ) : (
                          <>📊 Ver Estadísticas de Ausencias</>
                        )}
                      </button>
                      
                      {/* 🆕 Mostrar resumen rápido si está disponible */}
                      {resumenAusencias && (
                        <div className="quick-resume">
                          <span className="resume-item">
                            📈 Total ausencias: <strong>{resumenAusencias.totalAusencias}</strong>
                          </span>
                          <span className="resume-item">
                            📅 Este año: <strong>{resumenAusencias.ausenciasEsteAño}</strong>
                          </span>
                          {resumenAusencias.ultimaAusencia && (
                            <span className="resume-item">
                              🕒 Última: <strong>{new Date(resumenAusencias.ultimaAusencia.fecha).toLocaleDateString()}</strong>
                              ({resumenAusencias.ultimaAusencia.tipo})
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {showForm && (
            <TrabajadorForm
              onCreated={handleCreated}
              onCancel={() => setShowForm(false)}
              onRefresh={refetch}
            />
          )}

          {/* Estadísticas */}
          {!loading && trabajadores.length > 0 && (
            <div className="trabajadores-stats">
              <div className="stat-card">
                <div className="stat-number">{estadisticas.total}</div>
                <div className="stat-label">Total</div>
              </div>
              <div className="stat-card vigentes">
                <div className="stat-number">{estadisticas.vigentes}</div>
                <div className="stat-label">Vigentes</div>
              </div>
              <div className="stat-card no-vigentes">
                <div className="stat-number">{estadisticas.noVigentes}</div>
                <div className="stat-label">No Vigentes</div>
              </div>
            </div>
          )}

          {/* Sección de búsqueda */}
          {!loading && trabajadores.length > 0 && (
            <div className="search-section">
              <div className="search-header">
                <div className="search-icon-header">🔍</div>
                <div className="search-title-section">
                  <h3>Buscar Trabajadores</h3>
                  <p>Encuentra rápidamente cualquier trabajador por nombre o cédula. Haz clic en una card para ver las acciones.</p>
                </div>
                {hayFiltrosActivos && (
                  <button className="btn-clear-search" onClick={limpiarBusqueda}>
                    ✕ Limpiar
                  </button>
                )}
              </div>
              
              <div className="search-controls">
                <div className="search-input-container">
                  <TrabajadorBuscador
                    trabajadores={trabajadores}
                    value={trabajadorSeleccionadoId}
                    onChange={handleBuscarTrabajador}
                    placeholder="Buscar por nombre o cédula..."
                    showSelectedInfo={false}
                    className="search-trabajador-input"
                  />
                </div>
                <div className="filter-container">
                  <select
                    className="filter-select"
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                  >
                    <option value="todos">Todos los estados</option>
                    <option value="Vigente">Solo Vigentes</option>
                    <option value="No Vigente">Solo No Vigentes</option>
                  </select>
                  <div className="filter-icon">⚙️</div>
                </div>
              </div>

              {hayFiltrosActivos && (
                <div className="search-results-info">
                  <div className="results-count">
                    {trabajadoresFiltrados.length > 0 ? (
                      <span className="results-found">
                        ✓ {trabajadoresFiltrados.length} trabajador{trabajadoresFiltrados.length !== 1 ? 'es' : ''} encontrado{trabajadoresFiltrados.length !== 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="no-results">
                        ❌ No se encontraron resultados
                      </span>
                    )}
                  </div>
                  
                  <div className="active-filters">
                    {trabajadorSeleccionadoId > 0 && (
                      <span className="filter-tag">
                        Trabajador específico
                        <button onClick={() => setTrabajadorSeleccionadoId(0)}>✕</button>
                      </span>
                    )}
                    {filtroEstado !== "todos" && (
                      <span className="filter-tag">
                        Estado: {filtroEstado}
                        <button onClick={() => setFiltroEstado("todos")}>✕</button>
                      </span>
                    )}
                    {mostrarSoloNoVigentes && (
                      <span className="filter-tag">
                        Solo No Vigentes
                        <button onClick={() => setMostrarSoloNoVigentes(false)}>✕</button>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="list-section">
            <h2>
              Trabajadores {hayFiltrosActivos ? 'Filtrados' : 'Registrados'} ({trabajadoresFiltrados.length})
            </h2>

            {loading && (
              <div className="loading-message">
                🔄 Cargando trabajadores...
              </div>
            )}

            {error && (
              <div className="error-message">
                ❌ {error}
              </div>
            )}

            {!loading && trabajadores.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon">👥</div>
                <h3>No hay trabajadores registrados</h3>
                <p>Comienza agregando tu primer trabajador usando el botón de arriba.</p>
              </div>
            )}

            {!loading && trabajadores.length > 0 && trabajadoresFiltrados.length === 0 && (
              <div className="empty-search-state">
                <div className="empty-search-icon">🔍</div>
                <h3>No se encontraron trabajadores</h3>
                <p>Los filtros aplicados no coinciden con ningún trabajador.</p>
                <div className="search-suggestions">
                  <p>Intenta:</p>
                  <ul>
                    <li>Verificar la ortografía del nombre o cédula</li>
                    <li>Usar términos más generales</li>
                    <li>Cambiar el filtro de estado</li>
                    <li>Limpiar todos los filtros</li>
                  </ul>
                </div>
                <button className="btn-clear-search-alt" onClick={limpiarBusqueda}>
                  🔄 Limpiar filtros
                </button>
              </div>
            )}

            {!loading && trabajadoresFiltrados.length > 0 && (
              <div className="trabajadores-grid">
                {trabajadoresFiltrados.map((trabajador, index) => (
                  <div key={trabajador.id} className="trabajador-card-wrapper" style={{ animationDelay: `${index * 0.1}s` }}>
                    <TrabajadorCard
                      trabajador={trabajador}
                      onDelete={(id) => handleDelete(id, trabajador.nombre)}
                      onView={(id) => setDetalleId(id)}
                      onEstadoChange={refetch}
                      isSelected={selectedTrabajadorId === trabajador.id}
                      onSelect={handleSelectTrabajador}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {detalleId && (
            <TrabajadorDetail
              trabajadorId={detalleId}
              onClose={() => setDetalleId(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TrabajadoresPage;