import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ausenciasService } from '../api/ausenciasService';
import { trabajadoresService } from '../api/trabajadoresService';
import type { Trabajador } from '../types/trabajadores';
import type { 
  EstadisticasTrabajador,
  VistaAusencias
} from '../types/ausencia';
import '../styles/pages/TrabajadorAusenciasPage.css';

const TrabajadorAusenciasPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [trabajador, setTrabajador] = useState<Trabajador | null>(null);
  const [estadisticas, setEstadisticas] = useState<EstadisticasTrabajador | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vistaActual, setVistaActual] = useState<VistaAusencias>('resumen');

  const cargarDatos = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);
    
    try {
      // Cargar datos del trabajador y estadísticas en paralelo
      const [trabajadorData, estadisticasData] = await Promise.all([
        trabajadoresService.getById(parseInt(id)),
        ausenciasService.getEstadisticasTrabajador(parseInt(id))
      ]);
      
      setTrabajador(trabajadorData);
      setEstadisticas(estadisticasData);
    } catch (err) {
      setError('Error al cargar los datos del trabajador');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const handleExportar = () => {
    if (estadisticas) {
      ausenciasService.exportarEstadisticasTrabajadorCSV(estadisticas);
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatearHoras = (horas: number) => {
    return `${horas.toFixed(1)}h`;
  };

  const handleVolver = () => {
    navigate('/trabajadores');
  };

  if (loading) {
    return (
      <div className="ausencias-page">
        <div className="page-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <h2>Cargando estadísticas de ausencias...</h2>
            <p>Por favor espera mientras procesamos los datos</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !trabajador) {
    return (
      <div className="ausencias-page">
        <div className="page-container">
          <div className="error-state">
            <div className="error-icon">❌</div>
            <h2>Error al cargar los datos</h2>
            <p>{error || 'No se pudo encontrar el trabajador'}</p>
            <div className="error-actions">
              <button className="btn-retry" onClick={cargarDatos}>
                🔄 Reintentar
              </button>
              <button className="btn-back" onClick={handleVolver}>
                ← Volver a Trabajadores
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ausencias-page">
      <div className="page-container">
        {/* Header de la página */}
        <div className="page-header">
          <div className="header-navigation">
            <button className="btn-back" onClick={handleVolver}>
              ← Volver a Trabajadores
            </button>
          </div>
          
          <div className="header-content">
            <div className="header-info">
              <h1>📊 Estadísticas de Ausencias</h1>
              <h2>{trabajador.nombre}</h2>
              <div className="trabajador-details">
                <span className="detail-item">
                  <strong>Cédula:</strong> {trabajador.cedula}
                </span>
                <span className="detail-item">
                  <strong>Cargo:</strong> {trabajador.cargo || 'N/A'}
                </span>
                <span className="detail-item">
                  <strong>Estado:</strong> 
                  <span className={`status ${trabajador.estado === 'Vigente' ? 'active' : 'inactive'}`}>
                    {trabajador.estado}
                  </span>
                </span>
              </div>
            </div>
            
            <div className="header-actions">
              {estadisticas && (
                <button className="btn-export" onClick={handleExportar}>
                  📄 Exportar CSV
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="page-content">
          {estadisticas && (
            <>
              {/* Navegación de pestañas */}
              <div className="tabs-navigation">
                <button 
                  className={`tab-btn ${vistaActual === 'resumen' ? 'active' : ''}`}
                  onClick={() => setVistaActual('resumen')}
                >
                  📈 Resumen General
                </button>
                <button 
                  className={`tab-btn ${vistaActual === 'tipos' ? 'active' : ''}`}
                  onClick={() => setVistaActual('tipos')}
                >
                  📋 Por Tipo de Ausencia
                </button>
                <button 
                  className={`tab-btn ${vistaActual === 'diagnosticos' ? 'active' : ''}`}
                  onClick={() => setVistaActual('diagnosticos')}
                >
                  🏥 Por Diagnóstico
                </button>
                <button 
                  className={`tab-btn ${vistaActual === 'historial' ? 'active' : ''}`}
                  onClick={() => setVistaActual('historial')}
                >
                  📅 Historial Completo
                </button>
                <button 
                  className={`tab-btn ${vistaActual === 'tendencia' ? 'active' : ''}`}
                  onClick={() => setVistaActual('tendencia')}
                >
                  📊 Tendencia Mensual
                </button>
              </div>

              {/* Contenido de las pestañas */}
              <div className="tab-content">
                {vistaActual === 'resumen' && (
                  <div className="resumen-tab">
                    <div className="stats-overview">
                      <h3>📋 Resumen Ejecutivo</h3>
                      <div className="stats-cards">
                        <div className="stat-card total">
                          <div className="stat-icon">📊</div>
                          <div className="stat-content">
                            <div className="stat-number">{estadisticas.totalAusencias}</div>
                            <div className="stat-label">Total Ausencias</div>
                          </div>
                        </div>

                        <div className="stat-card hours">
                          <div className="stat-icon">⏰</div>
                          <div className="stat-content">
                            <div className="stat-number">{formatearHoras(estadisticas.totalHoras)}</div>
                            <div className="stat-label">Total Horas</div>
                          </div>
                        </div>

                        <div className="stat-card paid">
                          <div className="stat-icon">💰</div>
                          <div className="stat-content">
                            <div className="stat-number">{estadisticas.ausenciasRemuneradas}</div>
                            <div className="stat-label">Remuneradas</div>
                          </div>
                        </div>

                        <div className="stat-card unpaid">
                          <div className="stat-icon">❌</div>
                          <div className="stat-content">
                            <div className="stat-number">{estadisticas.ausenciasNoRemuneradas}</div>
                            <div className="stat-label">No Remuneradas</div>
                          </div>
                        </div>

                        <div className="stat-card average">
                          <div className="stat-icon">📏</div>
                          <div className="stat-content">
                            <div className="stat-number">{formatearHoras(estadisticas.promedioDuracion)}</div>
                            <div className="stat-label">Promedio Duración</div>
                          </div>
                        </div>

                        <div className="stat-card diagnoses">
                          <div className="stat-icon">🏥</div>
                          <div className="stat-content">
                            <div className="stat-number">{estadisticas.diagnosticosUnicos}</div>
                            <div className="stat-label">Diagnósticos Únicos</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="resumen-analysis">
                      <h4>🔍 Análisis Detallado</h4>
                      <div className="analysis-content">
                        {estadisticas.totalAusencias === 0 ? (
                          <div className="no-ausencias">
                            <div className="celebration-icon">🎉</div>
                            <h3>¡Excelente!</h3>
                            <p>Este trabajador no tiene ausencias registradas en el sistema.</p>
                          </div>
                        ) : (
                          <>
                            <div className="analysis-summary">
                              <p>
                                <strong>{estadisticas.trabajadorNombre}</strong> ha tenido un total de{' '}
                                <span className="highlight">{estadisticas.totalAusencias} ausencias</span> registradas, 
                                acumulando <span className="highlight">{formatearHoras(estadisticas.totalHoras)}</span> de tiempo ausente.
                              </p>
                              
                              <div className="breakdown-stats">
                                <div className="breakdown-item">
                                  <div className="breakdown-label">Distribución de ausencias:</div>
                                  <div className="breakdown-values">
                                    <span className="value-item paid">
                                      💰 {estadisticas.ausenciasRemuneradas} Remuneradas 
                                      ({((estadisticas.ausenciasRemuneradas / estadisticas.totalAusencias) * 100).toFixed(1)}%)
                                    </span>
                                    <span className="value-item unpaid">
                                      ❌ {estadisticas.ausenciasNoRemuneradas} No Remuneradas 
                                      ({((estadisticas.ausenciasNoRemuneradas / estadisticas.totalAusencias) * 100).toFixed(1)}%)
                                    </span>
                                  </div>
                                </div>

                                <div className="breakdown-item">
                                  <div className="breakdown-label">Duración promedio por ausencia:</div>
                                  <div className="breakdown-values">
                                    <span className="value-highlight">{formatearHoras(estadisticas.promedioDuracion)}</span>
                                  </div>
                                </div>

                                {estadisticas.diagnosticosUnicos > 0 && (
                                  <div className="breakdown-item">
                                    <div className="breakdown-label">Diversidad de diagnósticos:</div>
                                    <div className="breakdown-values">
                                      <span className="value-highlight">
                                        {estadisticas.diagnosticosUnicos} diagnósticos médicos diferentes
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Top 3 de tipos más frecuentes */}
                            {estadisticas.estadisticasPorTipo.length > 0 && (
                              <div className="top-tipos">
                                <h5>🔝 Tipos de Ausencia Más Frecuentes</h5>
                                <div className="top-items">
                                  {estadisticas.estadisticasPorTipo.slice(0, 3).map((tipo, index) => (
                                    <div key={index} className="top-item">
                                      <div className="top-rank">{index + 1}</div>
                                      <div className="top-content">
                                        <div className="top-title">{tipo.tipoAusencia}</div>
                                        <div className="top-stats">
                                          {tipo.cantidad} ausencias ({tipo.porcentaje}%) • {formatearHoras(tipo.totalHoras)}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {vistaActual === 'tipos' && (
                  <div className="tipos-tab">
                    <div className="section-header">
                      <h3>📋 Ausencias por Tipo</h3>
                      <p>Análisis detallado de cada tipo de ausencia registrada</p>
                    </div>
                    
                    {estadisticas.estadisticasPorTipo.length === 0 ? (
                      <div className="no-data">
                        <div className="no-data-icon">📋</div>
                        <h4>Sin datos de tipos</h4>
                        <p>No hay información de tipos de ausencia disponible.</p>
                      </div>
                    ) : (
                      <div className="tipos-grid">
                        {estadisticas.estadisticasPorTipo.map((tipo, index) => (
                          <div key={index} className="tipo-card">
                            <div className="tipo-header">
                              <h4>{tipo.tipoAusencia}</h4>
                              <span className="percentage">{tipo.porcentaje}%</span>
                            </div>
                            
                            <div className="tipo-metrics">
                              <div className="metric-row">
                                <span className="metric-label">Total de ausencias:</span>
                                <span className="metric-value">{tipo.cantidad}</span>
                              </div>
                              <div className="metric-row">
                                <span className="metric-label">Horas acumuladas:</span>
                                <span className="metric-value">{formatearHoras(tipo.totalHoras)}</span>
                              </div>
                              <div className="metric-row">
                                <span className="metric-label">Remuneradas:</span>
                                <span className="metric-value paid">{tipo.remuneradas}</span>
                              </div>
                              <div className="metric-row">
                                <span className="metric-label">No remuneradas:</span>
                                <span className="metric-value unpaid">{tipo.noRemuneradas}</span>
                              </div>
                            </div>

                            <div className="progress-container">
                              <div className="progress-bar">
                                <div 
                                  className="progress-fill" 
                                  style={{ width: `${tipo.porcentaje}%` }}
                                ></div>
                              </div>
                              <div className="progress-label">
                                {tipo.porcentaje}% del total de ausencias
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {vistaActual === 'diagnosticos' && (
                  <div className="diagnosticos-tab">
                    <div className="section-header">
                      <h3>🏥 Ausencias por Diagnóstico Médico</h3>
                      <p>Análisis de ausencias según diagnósticos CIE-10</p>
                    </div>
                    
                    {estadisticas.estadisticasPorDiagnostico.length === 0 ? (
                      <div className="no-data">
                        <div className="no-data-icon">🏥</div>
                        <h4>Sin diagnósticos médicos</h4>
                        <p>No hay diagnósticos médicos registrados para las ausencias de este trabajador.</p>
                      </div>
                    ) : (
                      <div className="diagnosticos-grid">
                        {estadisticas.estadisticasPorDiagnostico.map((diag, index) => (
                          <div key={index} className="diagnostico-card">
                            <div className="diagnostico-header">
                              <div className="diagnostico-code">{diag.diagnosticoCodigo}</div>
                              <span className="percentage">{diag.porcentaje}%</span>
                            </div>
                            
                            <div className="diagnostico-title">
                              <h4>{diag.diagnosticoDescripcion}</h4>
                            </div>

                            <div className="diagnostico-metrics">
                              <div className="metric-grid">
                                <div className="metric-item">
                                  <div className="metric-number">{diag.cantidad}</div>
                                  <div className="metric-label">Ausencias</div>
                                </div>
                                <div className="metric-item">
                                  <div className="metric-number">{formatearHoras(diag.totalHoras)}</div>
                                  <div className="metric-label">Total Horas</div>
                                </div>
                                <div className="metric-item">
                                  <div className="metric-number">{formatearHoras(diag.promedioDuracion)}</div>
                                  <div className="metric-label">Promedio</div>
                                </div>
                              </div>

                              <div className="payment-breakdown">
                                <div className="payment-item paid">
                                  <span className="payment-label">💰 Remuneradas:</span>
                                  <span className="payment-value">{diag.remuneradas}</span>
                                </div>
                                <div className="payment-item unpaid">
                                  <span className="payment-label">❌ No remuneradas:</span>
                                  <span className="payment-value">{diag.noRemuneradas}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {vistaActual === 'historial' && (
                  <div className="historial-tab">
                    <div className="section-header">
                      <h3>📅 Historial Completo de Ausencias</h3>
                      <p>Registro cronológico detallado de todas las ausencias</p>
                    </div>
                    
                    {estadisticas.ausencias.length === 0 ? (
                      <div className="no-data">
                        <div className="no-data-icon">📅</div>
                        <h4>Sin historial de ausencias</h4>
                        <p>Este trabajador no tiene ausencias registradas en el sistema.</p>
                      </div>
                    ) : (
                      <div className="historial-list">
                        {estadisticas.ausencias.map((ausencia) => (
                          <div key={ausencia.id} className={`ausencia-item ${ausencia.remunerado ? 'paid' : 'unpaid'}`}>
                            <div className="ausencia-main">
                              <div className="ausencia-header">
                                <h4>{ausencia.tipoAusencia}</h4>
                                <div className="ausencia-badges">
                                  <span className={`badge ${ausencia.remunerado ? 'paid' : 'unpaid'}`}>
                                    {ausencia.remunerado ? '💰 Remunerada' : '❌ No Remunerada'}
                                  </span>
                                  <span className="badge duration">
                                    ⏰ {formatearHoras(ausencia.duracion)}
                                  </span>
                                </div>
                              </div>

                              <div className="ausencia-details">
                                <div className="detail-grid">
                                  <div className="detail-item">
                                    <span className="detail-label">📅 Período:</span>
                                    <span className="detail-value">
                                      {formatearFecha(ausencia.fechaInicio)} - {formatearFecha(ausencia.fechaFin)}
                                    </span>
                                  </div>
                                  <div className="detail-item">
                                    <span className="detail-label">🕐 Horario:</span>
                                    <span className="detail-value">{ausencia.horaInicio} - {ausencia.horaFin}</span>
                                  </div>
                                  {ausencia.cargo && (
                                    <div className="detail-item">
                                      <span className="detail-label">👔 Cargo:</span>
                                      <span className="detail-value">{ausencia.cargo}</span>
                                    </div>
                                  )}
                                  {ausencia.diagnosticoCodigo && (
                                    <div className="detail-item">
                                      <span className="detail-label">🏥 Diagnóstico:</span>
                                      <span className="detail-value">
                                        {ausencia.diagnosticoCodigo} - {ausencia.diagnosticoDescripcion}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {ausencia.descripcion && (
                                  <div className="ausencia-description">
                                    <span className="detail-label">📝 Descripción:</span>
                                    <p>{ausencia.descripcion}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {vistaActual === 'tendencia' && (
                  <div className="tendencia-tab">
                    <div className="section-header">
                      <h3>📊 Tendencia Mensual</h3>
                      <p>Evolución de ausencias en los últimos 12 meses</p>
                    </div>
                    
                    {estadisticas.tendenciaMensual.length === 0 ? (
                      <div className="no-data">
                        <div className="no-data-icon">📊</div>
                        <h4>Sin datos de tendencia</h4>
                        <p>No hay suficientes datos para mostrar la tendencia mensual.</p>
                      </div>
                    ) : (
                      <div className="tendencia-container">
                        <div className="tendencia-grid">
                          {estadisticas.tendenciaMensual.map((mes, index) => (
                            <div key={index} className="tendencia-card">
                              <div className="tendencia-header">
                                <h4>{mes.nombreMes}</h4>
                                <span className="tendencia-total">{mes.cantidad}</span>
                              </div>
                              
                              <div className="tendencia-details">
                                <div className="tendencia-metric">
                                  <span className="metric-label">⏰ Total horas:</span>
                                  <span className="metric-value">{formatearHoras(mes.totalHoras)}</span>
                                </div>
                                <div className="tendencia-metric">
                                  <span className="metric-label">💰 Remuneradas:</span>
                                  <span className="metric-value">{mes.remuneradas}</span>
                                </div>
                                <div className="tendencia-metric">
                                  <span className="metric-label">❌ No remuneradas:</span>
                                  <span className="metric-value">{mes.noRemuneradas}</span>
                                </div>
                              </div>

                              <div className="tendencia-bar">
                                <div 
                                  className="bar-fill" 
                                  style={{ 
                                    height: `${Math.max((mes.cantidad / Math.max(...estadisticas.tendenciaMensual.map(m => m.cantidad))) * 100, 5)}%` 
                                  }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrabajadorAusenciasPage;