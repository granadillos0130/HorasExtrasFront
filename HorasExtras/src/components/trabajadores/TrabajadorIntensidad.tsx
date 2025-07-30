import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { registrosService } from "../../api/registrosService";
import { trabajadoresService } from "../../api/trabajadoresService";
import TrabajadorBuscador from "../shared/TrabajadorBuscador";
import type { Registro } from "../../types/registros";
import type { Trabajador } from "../../types/trabajadores";
import "../../styles/components/trabajador/TrabajadorIntensidad.css";

// Funciones helper para fechas
const formatDateForInput = (date: Date) => {
  return date.toISOString().split('T')[0];
};

const getStartOfWeek = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  return new Date(d.setDate(diff));
};

const getEndOfWeek = (date: Date) => {
  const startOfWeek = getStartOfWeek(date);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  return endOfWeek;
};

const getCurrentWeekRange = () => {
  const today = new Date();
  return {
    inicio: getStartOfWeek(today),
    fin: getEndOfWeek(today)
  };
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

  // Filtros de fecha
  const currentWeek = getCurrentWeekRange();
  const [fechaInicio, setFechaInicio] = useState<string>(formatDateForInput(currentWeek.inicio));
  const [fechaFin, setFechaFin] = useState<string>(formatDateForInput(currentWeek.fin));
  const [rangoPreseleccionado, setRangoPreseleccionado] = useState<string>("semana_actual");

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
            await cargarRegistros(trabajadorId, fechaInicio, fechaFin);
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
  }, [id]);

  // Cargar registros cuando cambien las fechas
  useEffect(() => {
    if (trabajadorSeleccionado > 0) {
      cargarRegistros(trabajadorSeleccionado, fechaInicio, fechaFin);
    }
  }, [fechaInicio, fechaFin, trabajadorSeleccionado]);

  const cargarRegistros = async (trabajadorId: number, inicio: string, fin: string) => {
    try {
      setLoadingRegistros(true);
      setError("");
      // Asumiendo que el servicio acepta fechas en formato YYYY-MM-DD
      const data = await registrosService.buscarPorTrabajadorRangoFechas(
        trabajadorId,
        inicio,
        fin
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
    } else {
      setRegistros([]);
    }
  };

  const handleRangoPreseleccionado = (rango: string) => {
    setRangoPreseleccionado(rango);
    const today = new Date();
    
    switch (rango) {
      case "hoy":
        setFechaInicio(formatDateForInput(today));
        setFechaFin(formatDateForInput(today));
        break;
      case "ayer":
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        setFechaInicio(formatDateForInput(yesterday));
        setFechaFin(formatDateForInput(yesterday));
        break;
      case "semana_actual":
        const thisWeek = getCurrentWeekRange();
        setFechaInicio(formatDateForInput(thisWeek.inicio));
        setFechaFin(formatDateForInput(thisWeek.fin));
        break;
      case "semana_pasada":
        const lastWeekEnd = new Date(getStartOfWeek(today));
        lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);
        const lastWeekStart = getStartOfWeek(lastWeekEnd);
        setFechaInicio(formatDateForInput(lastWeekStart));
        setFechaFin(formatDateForInput(lastWeekEnd));
        break;
      case "mes_actual":
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        setFechaInicio(formatDateForInput(firstDayOfMonth));
        setFechaFin(formatDateForInput(lastDayOfMonth));
        break;
      case "mes_pasado":
        const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        setFechaInicio(formatDateForInput(firstDayLastMonth));
        setFechaFin(formatDateForInput(lastDayLastMonth));
        break;
      case "personalizado":
        // No hacer nada, dejar que el usuario seleccione manualmente
        break;
    }
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

  const formatFechaLegible = (fechaStr: string) => {
    const fecha = new Date(fechaStr + 'T00:00:00');
    return fecha.toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRangoFechasTexto = () => {
    if (fechaInicio === fechaFin) {
      return formatFechaLegible(fechaInicio);
    }
    return `${formatFechaLegible(fechaInicio)} - ${formatFechaLegible(fechaFin)}`;
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

  const getDiasEnRango = () => {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diffTime = Math.abs(fin.getTime() - inicio.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
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
            Consulta detallada de las horas trabajadas por período
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

            {/* Selector de rango rápido */}
            <div className="form-group">
              <label className="form-label">Período de Consulta</label>
              <div className="range-selector">
                <div className="range-buttons">
                  <button
                    className={`range-btn ${rangoPreseleccionado === 'hoy' ? 'active' : ''}`}
                    onClick={() => handleRangoPreseleccionado('hoy')}
                  >
                    📅 Hoy
                  </button>
                  <button
                    className={`range-btn ${rangoPreseleccionado === 'ayer' ? 'active' : ''}`}
                    onClick={() => handleRangoPreseleccionado('ayer')}
                  >
                    ⏮️ Ayer
                  </button>
                  <button
                    className={`range-btn ${rangoPreseleccionado === 'semana_actual' ? 'active' : ''}`}
                    onClick={() => handleRangoPreseleccionado('semana_actual')}
                  >
                    📝 Esta Semana
                  </button>
                  <button
                    className={`range-btn ${rangoPreseleccionado === 'semana_pasada' ? 'active' : ''}`}
                    onClick={() => handleRangoPreseleccionado('semana_pasada')}
                  >
                    📄 Semana Pasada
                  </button>
                  <button
                    className={`range-btn ${rangoPreseleccionado === 'mes_actual' ? 'active' : ''}`}
                    onClick={() => handleRangoPreseleccionado('mes_actual')}
                  >
                    📊 Este Mes
                  </button>
                  <button
                    className={`range-btn ${rangoPreseleccionado === 'mes_pasado' ? 'active' : ''}`}
                    onClick={() => handleRangoPreseleccionado('mes_pasado')}
                  >
                    📈 Mes Pasado
                  </button>
                  <button
                    className={`range-btn ${rangoPreseleccionado === 'personalizado' ? 'active' : ''}`}
                    onClick={() => handleRangoPreseleccionado('personalizado')}
                  >
                    🎯 Personalizado
                  </button>
                </div>
              </div>
            </div>

            {/* Selectores de fecha personalizados */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Fecha de Inicio</label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => {
                    setFechaInicio(e.target.value);
                    setRangoPreseleccionado('personalizado');
                  }}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Fecha de Fin</label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => {
                    setFechaFin(e.target.value);
                    setRangoPreseleccionado('personalizado');
                  }}
                  className="form-input"
                  min={fechaInicio}
                />
              </div>
            </div>

            {/* Información del rango seleccionado */}
            <div className="range-info">
              <div className="range-info-item">
                <span className="range-info-icon">📅</span>
                <span className="range-info-text">
                  <strong>Período:</strong> {getRangoFechasTexto()}
                </span>
              </div>
              <div className="range-info-item">
                <span className="range-info-icon">📊</span>
                <span className="range-info-text">
                  <strong>Días en rango:</strong> {getDiasEnRango()} día{getDiasEnRango() !== 1 ? 's' : ''}
                </span>
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
                <span>{getRangoFechasTexto()}</span>
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

                  {/* Información adicional del período */}
                  <div className="period-summary">
                    <div className="period-item">
                      <span className="period-icon">📊</span>
                      <span>Promedio diario: {formatHours(resumen.total / getDiasEnRango())}</span>
                    </div>
                    <div className="period-item">
                      <span className="period-icon">📈</span>
                      <span>{registros.length} día{registros.length !== 1 ? 's' : ''} con registro</span>
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
                                  month: '2-digit',
                                  year: '2-digit'
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
                  en el período seleccionado.
                </p>
                <div className="empty-state-suggestions">
                  <p>Prueba con:</p>
                  <ul>
                    <li>Un rango de fechas diferente</li>
                    <li>Verificar períodos anteriores</li>
                    <li>Asegurarte de que existan registros para este trabajador</li>
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
              su intensidad horaria en el período deseado.
            </p>
            <div className="empty-state-features">
              <div className="feature-item">
                <span className="feature-icon">🔍</span>
                <span>Busca por nombre o cédula</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📅</span>
                <span>Selecciona período personalizado</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📊</span>
                <span>Ve resumen y detalle de horas</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">⚡</span>
                <span>Rangos rápidos disponibles</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrabajadorIntensidad;