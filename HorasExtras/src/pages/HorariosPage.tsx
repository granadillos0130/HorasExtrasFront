import React, { useEffect, useState } from "react";
import { horariosService } from "../api/horariosService";
import { trabajadoresService } from "../api/trabajadoresService";
import { useNavigate } from "react-router-dom";
import HorariosTable from "../components/horarios/HorariosTable";
import TrabajadorBuscador from "../components/shared/TrabajadorBuscador";
import type { Horario } from "../types/horarios";
import type { Trabajador } from "../types/trabajadores";
import "../styles/pages/HorariosPage.css";

const HorariosPage: React.FC = () => {
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [filtroTrabajador, setFiltroTrabajador] = useState<number>(0);
  const [trabajadorSeleccionado, setTrabajadorSeleccionado] = useState<Trabajador | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const cargarTodos = async () => {
    try {
      setLoading(true);
      const data = await horariosService.getAll();
      setHorarios(data);
      setError(null);
    } catch (err) {
      setError("Error al cargar los horarios");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const cargarPorTrabajador = async (id: number) => {
    try {
      setLoading(true);
      if (id === 0) {
        const data = await horariosService.getAll();
        setHorarios(data);
      } else {
        const data = await horariosService.getByTrabajador(id);
        setHorarios(data);
      }
      setError(null);
    } catch (err) {
      setError("Error al cargar los horarios");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await horariosService.eliminar(id);
      // Recargar horarios después de eliminar
      handleUpdate();
    } catch (err) {
      setError("Error al eliminar el horario");
      console.error("Error:", err);
    }
  };

  // Nueva función para actualizar la lista (usado después de editar)
  const handleUpdate = () => {
    if (filtroTrabajador === 0) {
      cargarTodos();
    } else {
      cargarPorTrabajador(filtroTrabajador);
    }
  };

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [horariosData, trabajadoresData] = await Promise.all([
          horariosService.getAll(),
          trabajadoresService.getAll()
        ]);
        setHorarios(horariosData);
        setTrabajadores(trabajadoresData);
        setError(null);
      } catch (err) {
        setError("Error al cargar los datos");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };
    
    cargarDatos();
  }, []);

  // Manejador para el cambio de filtro de trabajador
  const handleFiltroTrabajadorChange = (trabajadorId: number, trabajador?: Trabajador) => {
    setFiltroTrabajador(trabajadorId);
    setTrabajadorSeleccionado(trabajador || null);
    cargarPorTrabajador(trabajadorId);
  };

  // Función para limpiar el filtro
  const limpiarFiltro = () => {
    setFiltroTrabajador(0);
    setTrabajadorSeleccionado(null);
    cargarTodos();
  };

  const getSelectedWorkerName = () => {
    if (filtroTrabajador === 0) return "Todos los trabajadores";
    return trabajadorSeleccionado ? trabajadorSeleccionado.nombre : "Trabajador seleccionado";
  };

  const getStats = () => {
    const totalHorarios = horarios.length;
    const trabajadoresConHorarios = new Set(horarios.map(h => h.trabajadorId)).size;
    const diasUnicos = new Set(horarios.map(h => h.dia)).size;
    const horasPromedio = horarios.length > 0 
      ? horarios.reduce((acc, h) => acc + h.intensidadHoraria, 0) / horarios.length 
      : 0;

    return {
      totalHorarios,
      trabajadoresConHorarios,
      diasUnicos,
      horasPromedio: horasPromedio.toFixed(1)
    };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="horarios-page">
        <div className="page-container">
          <div className="content-card">
            <div className="loading-message">
              🔄 Cargando horarios...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="horarios-page">
      <div className="page-container">
        <div className="page-header">
          <h1>Gestión de Horarios</h1>
          <p className="page-subtitle">
            Administra los horarios de trabajo de tu equipo
          </p>
        </div>

        <div className="content-card">
          <div className="horarios-toolbar">
            <div className="toolbar-left">
              <h2 className="toolbar-title">Horarios Asignados</h2>
              <button
                className="btn-nuevo"
                onClick={() => navigate("/horarios/crear")}
              >
                ➕ Nuevo Horario
              </button>
            </div>

            <div className="filter-group">
              {/* Reemplazamos el select tradicional con TrabajadorBuscador */}
              <div className="filter-container">
                <TrabajadorBuscador
                  trabajadores={trabajadores}
                  value={filtroTrabajador}
                  onChange={handleFiltroTrabajadorChange}
                  placeholder="Buscar trabajador para filtrar..."
                  label="Filtrar por Trabajador"
                  disabled={loading}
                  required={false}
                  showSelectedInfo={false}
                  className="filter-trabajador"
                />
                
                {/* Botón para limpiar filtro */}
                {filtroTrabajador !== 0 && (
                  <button
                    type="button"
                    className="btn-clear-filter"
                    onClick={limpiarFiltro}
                    title="Mostrar todos los trabajadores"
                  >
                    🔄 Mostrar Todos
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="horarios-stats">
            <div className="stat-card">
              <div className="stat-number">{stats.totalHorarios}</div>
              <div className="stat-label">Total Horarios</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.trabajadoresConHorarios}</div>
              <div className="stat-label">Trabajadores</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.diasUnicos}</div>
              <div className="stat-label">Días Configurados</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.horasPromedio}h</div>
              <div className="stat-label">Promedio Horas</div>
            </div>
          </div>

          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}

          <div className="horarios-content">
            <div className="content-header">
              <h3 className="content-title">
                {getSelectedWorkerName()}
                <span className="horarios-count">
                  {horarios.length} horario{horarios.length !== 1 ? 's' : ''}
                </span>
              </h3>
              
              {/* Indicador visual del filtro activo */}
              {filtroTrabajador !== 0 && trabajadorSeleccionado && (
                <div className="active-filter-indicator">
                  🔍 Filtrando por: <strong>{trabajadorSeleccionado.nombre}</strong>
                  <span className="filter-meta">CC: {trabajadorSeleccionado.cedula}</span>
                </div>
              )}
            </div>

            {horarios.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">⏰</div>
                <h3>No hay horarios asignados</h3>
                <p>
                  {filtroTrabajador === 0 
                    ? "Aún no se han creado horarios en el sistema. Comienza asignando horarios a tus trabajadores."
                    : `${trabajadorSeleccionado?.nombre || 'Este trabajador'} no tiene horarios asignados. Puedes crear uno nuevo.`
                  }
                </p>
                <div className="empty-state-actions">
                  <button
                    className="empty-state-action"
                    onClick={() => navigate("/horarios/crear")}
                  >
                    ➕ Crear Primer Horario
                  </button>
                  {filtroTrabajador !== 0 && (
                    <button
                      className="empty-state-action secondary"
                      onClick={limpiarFiltro}
                    >
                      👀 Ver Todos los Horarios
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <HorariosTable 
                horarios={horarios} 
                onDelete={handleDelete}
                onUpdate={handleUpdate}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HorariosPage;