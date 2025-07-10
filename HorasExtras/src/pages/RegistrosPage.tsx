import React, { useEffect, useState } from "react";
import { useRegistros } from "../hooks/useRegistros";
import { useResumenSemana } from "../hooks/useResumenSemana";
import RegistrosTable from "../components/registros/RegistrosTable";
import ResumenSemanaTable from "../components/registros/ResumenSemanaTable";
import "../styles/pages/RegistroPage.css";
import { api } from "../api/api";
import type { Trabajador } from "../types/trabajadores";

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

  // Cargar trabajadores cuando carga la página
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
                    {registros.length} registro{registros.length !== 1 ? 's' : ''} encontrado{registros.length !== 1 ? 's' : ''}
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
                  <RegistrosTable registros={registros} />
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrosPage;