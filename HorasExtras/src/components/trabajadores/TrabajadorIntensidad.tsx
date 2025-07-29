import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { registrosService } from "../../api/registrosService";
import { trabajadoresService } from "../../api/trabajadoresService";
import TrabajadorBuscador from "../shared/TrabajadorBuscador";
import type { Registro } from "../../types/registros";
import type { Trabajador } from "../../types/trabajadores";
import "../../styles/components/trabajador/TrabajadorIntensidad.css";

const getCurrentMonth = () => new Date().getMonth() + 1;
const getCurrentWeek = () => {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const dayOfMonth = today.getDate();
  const week = Math.ceil((dayOfMonth + firstDay.getDay()) / 7);
  return week;
};

const TrabajadorIntensidad: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Estados
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [trabajadorSeleccionado, setTrabajadorSeleccionado] = useState<number>(0);
  const [trabajadorActual, setTrabajadorActual] = useState<Trabajador | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingRegistros, setLoadingRegistros] = useState(false);
  const [error, setError] = useState("");

  // Filtros
  const [mes, setMes] = useState<number>(getCurrentMonth());
  const [semana, setSemana] = useState<number>(getCurrentWeek());

  // Cargar trabajadores al inicio
  useEffect(() => {
    const cargarTrabajadores = async () => {
      try {
        setLoading(true);
        const data = await trabajadoresService.getAll();
        setTrabajadores(data);
        
        // Si hay ID en la URL, seleccionar ese trabajador
        if (id) {
          const trabajadorId = Number(id);
          setTrabajadorSeleccionado(trabajadorId);
          const trabajador = data.find(t => t.id === trabajadorId);
          if (trabajador) {
            setTrabajadorActual(trabajador);
            await cargarRegistros(trabajadorId, mes, semana);
          }
        }
      } catch (err) {
        setError("Error cargando trabajadores.");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    cargarTrabajadores();
  }, [id, mes, semana]);

  const cargarRegistros = async (trabajadorId: number, mesParam: number, semanaParam: number) => {
    try {
      setLoadingRegistros(true);
      setError("");
      const data = await registrosService.buscarPorTrabajadorMesSemana(
        trabajadorId,
        mesParam,
        semanaParam
      );
      setRegistros(data);
    } catch (err) {
      setError("Error cargando la intensidad horaria.");
      setRegistros([]);
    } finally {
      setLoadingRegistros(false);
    }
  };

  const handleTrabajadorChange = (trabajadorId: number, trabajador?: Trabajador) => {
    setTrabajadorSeleccionado(trabajadorId);
    setTrabajadorActual(trabajador || null);
    
    if (trabajadorId > 0) {
      // Actualizar URL
      navigate(`/trabajadores/${trabajadorId}/intensidad`, { replace: true });
      cargarRegistros(trabajadorId, mes, semana);
    } else {
      setRegistros([]);
    }
  };

  const handleFiltroChange = (newMes?: number, newSemana?: number) => {
    const mesActual = newMes ?? mes;
    const semanaActual = newSemana ?? semana;
    
    if (newMes !== undefined) setMes(newMes);
    if (newSemana !== undefined) setSemana(newSemana);

    if (trabajadorSeleccionado > 0) {
      cargarRegistros(trabajadorSeleccionado, mesActual, semanaActual);
    }
  };

  const getMesesOptions = () => {
    const meses = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    return meses.map((mes, index) => ({ value: index + 1, label: mes }));
  };

  const formatHours = (hours: number) => {
    if (hours === 0) return "0:00";
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}:${m.toString().padStart(2, "0")}`;
  };

  const getResumenHoras = () => {
    const totales = registros.reduce(
      (acc, registro) => ({
        normales: acc.normales + (registro.horasNormales || 0),
        extrasDiurnas: acc.extrasDiurnas + (registro.horasExtrasDiurnas || 0),
        extrasNocturnas: acc.extrasNocturnas + (registro.horasExtrasNocturnas || 0),
        domDiurnas: acc.domDiurnas + (registro.extrasDominicalesDiurnas || 0),
        domNocturnas: acc.domNocturnas + (registro.extrasDominicalesNocturnas || 0),
        total: acc.total + (registro.totalHoras || 0),
      }),
      { normales: 0, extrasDiurnas: 0, extrasNocturnas: 0, domDiurnas: 0, domNocturnas: 0, total: 0 }
    );
    return totales;
  };

  // Funciones helper para manejar valores null de forma segura
  const safeSubstring = (str: string | null | undefined, start: number, end?: number): string => {
    if (!str) return '';
    return str.substring(start, end);
  };

  const formatCentroName = (nombreCentro: string | null | undefined): string => {
    const nombre = nombreCentro || 'Sin centro';
    return nombre.length > 15 ? `${nombre.substring(0, 15)}...` : nombre;
  };

  const resumen = getResumenHoras();

  if (loading) {
    return (
      <div className="trabajador-intensidad-page">
        <div className="page-container">
          <div className="loading-state">
            <div className="loading-spinner-large"></div>
            <h3>Cargando información...</h3>
            <p>Por favor espere un momento</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="trabajador-intensidad-page">
      <div className="page-container">
        <div className="page-header">
          <button 
            className="btn-back"
            onClick={() => navigate("/trabajadores")}
          >
            ← Volver a Trabajadores
          </button>
          <h1>Intensidad Horaria por Trabajador</h1>
          <p className="page-subtitle">
            Consulta detallada de las horas trabajadas por semana
          </p>
        </div>

        <div className="filters-card">
          <div className="filters-header">
            <div className="filters-icon">📊</div>
            <h2>Filtros de Búsqueda</h2>
          </div>

          <div className="filters-form">
            <TrabajadorBuscador
              trabajadores={trabajadores}
              value={trabajadorSeleccionado}
              onChange={handleTrabajadorChange}
              placeholder="Buscar trabajador por nombre o cédula..."
              label="Seleccionar Trabajador"
              required
              showSelectedInfo={true}
            />

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Mes</label>
                <select 
                  value={mes} 
                  onChange={(e) => handleFiltroChange(Number(e.target.value), undefined)}
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
                  onChange={(e) => handleFiltroChange(undefined, Number(e.target.value))}
                  className="form-select"
                >
                  {[1, 2, 3, 4, 5].map((s) => (
                    <option key={s} value={s}>
                      Semana {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {trabajadorActual && (
          <div className="worker-info-card">
            <div className="worker-avatar-large">
              {trabajadorActual.nombre
                ?.split(' ')
                .map(word => word?.[0] || '')
                .join('')
                .toUpperCase()
                .substring(0, 2) || 'N/A'}
            </div>
            <div className="worker-details">
              <h3>{trabajadorActual.nombre}</h3>
              <div className="worker-meta">
                <span>CC: {trabajadorActual.cedula}</span>
                <span>ID: {trabajadorActual.id}</span>
                <span>{getMesesOptions()[mes - 1]?.label} • Semana {semana}</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}

        {loadingRegistros && (
          <div className="loading-message">
            🔄 Cargando registros de intensidad horaria...
          </div>
        )}

        {trabajadorSeleccionado > 0 && !loadingRegistros && (
          <>
            {registros.length > 0 ? (
              <>
                {/* Resumen de horas */}
                <div className="resumen-card">
                  <div className="resumen-header">
                    <h3>Resumen de Horas</h3>
                    <div className="total-badge">
                      Total: {formatHours(resumen.total)}
                    </div>
                  </div>
                  
                  <div className="resumen-grid">
                    <div className="resumen-item normal">
                      <div className="resumen-icon">⏰</div>
                      <div className="resumen-content">
                        <div className="resumen-number">{formatHours(resumen.normales)}</div>
                        <div className="resumen-label">Horas Normales</div>
                      </div>
                    </div>
                    
                    <div className="resumen-item extra-diurna">
                      <div className="resumen-icon">☀️</div>
                      <div className="resumen-content">
                        <div className="resumen-number">{formatHours(resumen.extrasDiurnas)}</div>
                        <div className="resumen-label">Extras Diurnas</div>
                      </div>
                    </div>
                    
                    <div className="resumen-item extra-nocturna">
                      <div className="resumen-icon">🌙</div>
                      <div className="resumen-content">
                        <div className="resumen-number">{formatHours(resumen.extrasNocturnas)}</div>
                        <div className="resumen-label">Extras Nocturnas</div>
                      </div>
                    </div>
                    
                    <div className="resumen-item dom-diurna">
                      <div className="resumen-icon">🌅</div>
                      <div className="resumen-content">
                        <div className="resumen-number">{formatHours(resumen.domDiurnas)}</div>
                        <div className="resumen-label">Dom. Diurnas</div>
                      </div>
                    </div>
                    
                    <div className="resumen-item dom-nocturna">
                      <div className="resumen-icon">🌃</div>
                      <div className="resumen-content">
                        <div className="resumen-number">{formatHours(resumen.domNocturnas)}</div>
                        <div className="resumen-label">Dom. Nocturnas</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabla de registros detallados */}
                <div className="registros-card">
                  <div className="registros-header">
                    <div className="registros-title">
                      <div className="registros-icon">📋</div>
                      <h3>Registros Detallados</h3>
                    </div>
                    <div className="registros-count">
                      {registros.length} registro{registros.length !== 1 ? 's' : ''}
                    </div>
                  </div>

                  <div className="table-container">
                    <div className="table-wrapper">
                      <table className="intensidad-table">
                        <thead>
                          <tr>
                            <th>Fecha</th>
                            <th>Día</th>
                            <th>Centro</th>
                            <th>Ingreso</th>
                            <th>Salida</th>
                            <th>Almuerzo</th>
                            <th>H. Normales</th>
                            <th>Ex. Diurnas</th>
                            <th>Ex. Nocturnas</th>
                            <th>Dom. Diurnas</th>
                            <th>Dom. Nocturnas</th>
                            <th>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {registros.map((registro, index) => (
                            <tr key={registro.id} style={{ animationDelay: `${index * 0.05}s` }}>
                              <td className="col-fecha">
                                {registro.fecha ? new Date(registro.fecha).toLocaleDateString('es-CO', {
                                  day: '2-digit',
                                  month: '2-digit'
                                }) : 'N/A'}
                              </td>
                              <td className="col-dia">
                                {safeSubstring(registro.diaSemana, 0, 3) || 'N/A'}
                              </td>
                              <td className="col-centro" title={registro.nombreCentro || 'Sin centro'}>
                                {formatCentroName(registro.nombreCentro)}
                              </td>
                              <td className="col-hora">
                                {safeSubstring(registro.horaIngreso, 0, 5) || 'N/A'}
                              </td>
                              <td className="col-hora">
                                {safeSubstring(registro.horaSalida, 0, 5) || 'N/A'}
                              </td>
                              <td className="col-hora">
                                {safeSubstring(registro.tiempoAlmuerzo, 0, 5) || 'N/A'}
                              </td>
                              <td className="col-horas normal">
                                <span className="hours-badge normal">
                                  {formatHours(registro.horasNormales || 0)}
                                </span>
                              </td>
                              <td className="col-horas extra-diurna">
                                <span className="hours-badge extra-diurna">
                                  {formatHours(registro.horasExtrasDiurnas || 0)}
                                </span>
                              </td>
                              <td className="col-horas extra-nocturna">
                                <span className="hours-badge extra-nocturna">
                                  {formatHours(registro.horasExtrasNocturnas || 0)}
                                </span>
                              </td>
                              <td className="col-horas dom-diurna">
                                <span className="hours-badge dom-diurna">
                                  {formatHours(registro.extrasDominicalesDiurnas || 0)}
                                </span>
                              </td>
                              <td className="col-horas dom-nocturna">
                                <span className="hours-badge dom-nocturna">
                                  {formatHours(registro.extrasDominicalesNocturnas || 0)}
                                </span>
                              </td>
                              <td className="col-horas total">
                                <span className="hours-badge total">
                                  {formatHours(registro.totalHoras || 0)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="scroll-indicator">
                      💡 Desliza horizontalmente para ver todas las columnas
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">📊</div>
                <h3>No hay registros</h3>
                <p>
                  No se encontraron registros para {trabajadorActual?.nombre || 'este trabajador'} 
                  en {getMesesOptions()[mes - 1]?.label}, Semana {semana}.
                </p>
                <div className="empty-state-suggestions">
                  <p>Prueba con:</p>
                  <ul>
                    <li>Una semana diferente del mismo mes</li>
                    <li>Un mes anterior o posterior</li>
                    <li>Verificar que existan registros para este trabajador</li>
                  </ul>
                </div>
              </div>
            )}
          </>
        )}

        {trabajadorSeleccionado === 0 && !loading && (
          <div className="empty-state">
            <div className="empty-state-icon">👤</div>
            <h3>Selecciona un trabajador</h3>
            <p>
              Utiliza el buscador de arriba para seleccionar un trabajador y ver 
              su intensidad horaria semanal.
            </p>
            <div className="empty-state-features">
              <div className="feature-item">
                <span className="feature-icon">🔍</span>
                <span>Busca por nombre o cédula</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📅</span>
                <span>Filtra por mes y semana</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📊</span>
                <span>Ve resumen y detalle de horas</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrabajadorIntensidad;