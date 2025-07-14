// src/pages/RegistrosPage.tsx - ACTUALIZADA con funcionalidad de lote
import React, { useEffect, useState } from "react";
import { useRegistros } from "../hooks/useRegistros";
import { useResumenSemana } from "../hooks/useResumenSemana";
import RegistrosTable from "../components/registros/RegistrosTable";
import ResumenSemanaTable from "../components/registros/ResumenSemanaTable";
import RegistrosForm from "../components/registros/RegistrosForm";
import RegistrosLoteForm from "../components/registros/RegistrosLoteForm";
import RegistroModal from "../components/registros/RegistroModal";
import "../styles/pages/RegistroPage.css";
import { api } from "../api/api";
import type { Trabajador } from "../types/trabajadores";
import type { Registro, RegistroInputDto } from "../types/registros";

const RegistrosPage: React.FC = () => {
  const {
    registros,
    loading: loadingRegistros,
    error: errorRegistros,
    buscarRegistros
  } = useRegistros();

  const {
    resumen,
    loading: loadingResumen,
    error: errorResumen,
    buscarResumen
  } = useResumenSemana();

  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [loadingTrabajadores, setLoadingTrabajadores] = useState(true);
  const [trabajadorId, setTrabajadorId] = useState<number>(0);
  const [mes, setMes] = useState<number>(new Date().getMonth() + 1);
  const [semana, setSemana] = useState<number>(1);
  const [hasSearched, setHasSearched] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showLoteForm, setShowLoteForm] = useState(false);
  const [registroSeleccionado, setRegistroSeleccionado] = useState<Registro | null>(null);

  // Cargar trabajadores al inicio
  useEffect(() => {
    const cargarTrabajadores = async () => {
      try {
        setLoadingTrabajadores(true);
        const res = await api.get<Trabajador[]>("/trabajadores");
        setTrabajadores(res.data);
      } catch (error) {
        console.error("Error al cargar trabajadores:", error);
      } finally {
        setLoadingTrabajadores(false);
      }
    };

    cargarTrabajadores();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trabajadorId > 0) {
      setHasSearched(true);
      buscarRegistros(trabajadorId, mes, semana);
      buscarResumen(trabajadorId, mes, semana);
    } else {
      alert("Por favor selecciona un trabajador.");
    }
  };

  const refreshData = () => {
    if (trabajadorId > 0) {
      buscarRegistros(trabajadorId, mes, semana);
      buscarResumen(trabajadorId, mes, semana);
    }
  };

  const getMesesOptions = () => {
    const meses = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    return meses.map((mes, index) => ({ value: index + 1, label: mes }));
  };

  const getSelectedWorkerName = () => {
    const worker = trabajadores.find(t => t.id === trabajadorId);
    return worker ? worker.nombre : "";
  };

  const handleEditar = (registro: Registro) => {
    setRegistroSeleccionado(registro);
  };

  const handleEliminar = async (id: number) => {
    if (confirm("¿Estás seguro de eliminar este registro?")) {
      try {
        await api.delete(`/registros/${id}`);
        refreshData();
        alert("Registro eliminado correctamente.");
      } catch (error) {
        console.error("Error al eliminar registro:", error);
        alert("Ocurrió un error al eliminar el registro.");
      }
    }
  };

  const handleGuardar = async (id: number, data: RegistroInputDto) => {
    try {
      await api.put(`/registros/${id}`, data);
      setRegistroSeleccionado(null);
      refreshData();
      alert("Registro actualizado correctamente.");
    } catch (error) {
      console.error("Error al actualizar registro:", error);
      alert("Ocurrió un error al guardar los cambios.");
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    refreshData();
  };

  const handleLoteSuccess = () => {
    setShowLoteForm(false);
    // Limpiar los estados de error y resultado del hook si existe
    refreshData();
    // No mostramos alert aquí porque ya se muestra en el formulario
  };

  const toggleFormType = (tipo: 'individual' | 'lote') => {
    if (tipo === 'individual') {
      setShowForm(!showForm);
      setShowLoteForm(false);
    } else {
      setShowLoteForm(!showLoteForm);
      setShowForm(false);
    }
  };

  return (
    <div className="registros-page">
      <div className="page-container">
        <div className="page-header">
          <h1>Registros de Trabajo</h1>
          <p className="page-subtitle">
            Consulta y analiza los registros de horas trabajadas
          </p>
        </div>

        <div className="filters-card">
          <div className="filters-header">
            <div className="filters-icon">🔍</div>
            <h2>Filtros de Búsqueda</h2>
            <div className="form-buttons">
              <button 
                className={`btn-nuevo-registro ${showForm ? 'active' : ''}`}
                onClick={() => toggleFormType('individual')}
              >
                {showForm ? "❌ Cancelar" : "➕ Nuevo Registro"}
              </button>
              <button 
                className={`btn-nuevo-lote ${showLoteForm ? 'active' : ''}`}
                onClick={() => toggleFormType('lote')}
              >
                {showLoteForm ? "❌ Cancelar" : "📊 Registros en Lote"}
              </button>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="filtros-form">
            <div className="form-group">
              <label className="form-label">Trabajador</label>
              <select
                value={trabajadorId}
                onChange={(e) => setTrabajadorId(Number(e.target.value))}
                className="form-select"
                disabled={loadingTrabajadores}
              >
                <option value={0}>
                  {loadingTrabajadores ? "Cargando..." : "Seleccione trabajador"}
                </option>
                {trabajadores.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Mes</label>
              <select 
                value={mes} 
                onChange={(e) => setMes(Number(e.target.value))}
                className="form-select"
              >
                {getMesesOptions().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Semana</label>
              <select 
                value={semana} 
                onChange={(e) => setSemana(Number(e.target.value))}
                className="form-select"
              >
                {[1, 2, 3, 4, 5].map((s) => (
                  <option key={s} value={s}>
                    Semana {s}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn-search">
              🔍 Buscar Registros
            </button>
          </form>
        </div>

        {showForm && (
          <div className="form-card">
            <div className="form-card-header">
              <h3>📝 Crear Registro Individual</h3>
              <p>Agrega un nuevo registro de trabajo</p>
            </div>
            <RegistrosForm onSuccess={handleFormSuccess} />
          </div>
        )}

        {showLoteForm && (
          <div className="form-card">
            <RegistrosLoteForm 
              onSuccess={handleLoteSuccess} 
              onCancel={() => setShowLoteForm(false)}
            />
          </div>
        )}

        {hasSearched && (
          <div className="results-section">
            {/* Resumen Semanal */}
            <div className="results-card">
              <div className="results-header">
                <div className="results-title">
                  <div className="results-icon">📊</div>
                  <h3>Resumen Semanal</h3>
                </div>
                {getSelectedWorkerName() && (
                  <div className="results-count">
                    {getSelectedWorkerName()} - {getMesesOptions()[mes - 1]?.label} / Semana {semana}
                  </div>
                )}
              </div>
              
              {loadingResumen && (
                <div className="loading-message">
                  🔄 Cargando resumen semanal...
                </div>
              )}
              
              {errorResumen && (
                <div className="error-message">
                  ❌ {errorResumen}
                </div>
              )}
              
              {resumen && !loadingResumen && (
                <div className="table-container">
                  <ResumenSemanaTable resumen={resumen} />
                </div>
              )}
              
              {!resumen && !loadingResumen && !errorResumen && (
                <div className="empty-state">
                  <div className="empty-state-icon">📈</div>
                  <h3>Sin datos de resumen</h3>
                  <p>No se encontró información de resumen para los filtros seleccionados.</p>
                </div>
              )}
            </div>

            {/* Registros Detallados */}
            <div className="results-card">
              <div className="results-header">
                <div className="results-title">
                  <div className="results-icon">📋</div>
                  <h3>Registros Detallados</h3>
                </div>
                {registros.length > 0 && (
                  <div className="results-count">
                    {registros.length} registro{registros.length !== 1 ? "s" : ""} encontrado{registros.length !== 1 ? "s" : ""}
                  </div>
                )}
              </div>
              
              {loadingRegistros && (
                <div className="loading-message">
                  🔄 Cargando registros detallados...
                </div>
              )}
              
              {errorRegistros && (
                <div className="error-message">
                  ❌ {errorRegistros}
                </div>
              )}
              
              {registros.length > 0 && !loadingRegistros && (
                <div className="table-container">
                  <RegistrosTable
                    registros={registros}
                    onEdit={handleEditar}
                    onDelete={handleEliminar}
                  />
                </div>
              )}
              
              {registros.length === 0 && !loadingRegistros && !errorRegistros && (
                <div className="empty-state">
                  <div className="empty-state-icon">📂</div>
                  <h3>No hay registros</h3>
                  <p>No se encontraron registros para los filtros seleccionados. Verifica que el trabajador tenga registros en la semana y mes especificados.</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {!hasSearched && (
          <div className="results-card">
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <h3>Busca registros de trabajo</h3>
              <p>Utiliza los filtros de arriba para encontrar los registros de horas trabajadas de cualquier empleado en una semana específica.</p>
              <div className="empty-state-actions">
                <button
                  className="empty-state-action"
                  onClick={() => toggleFormType('individual')}
                >
                  ➕ Crear Registro Individual
                </button>
                <button
                  className="empty-state-action secondary"
                  onClick={() => toggleFormType('lote')}
                >
                  📊 Crear Registros en Lote
                </button>
              </div>
            </div>
          </div>
        )}

        {registroSeleccionado && (
          <RegistroModal
            registro={registroSeleccionado}
            onClose={() => setRegistroSeleccionado(null)}
            onSave={handleGuardar}
          />
        )}
      </div>
    </div>
  );
};

export default RegistrosPage;