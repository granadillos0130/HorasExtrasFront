import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ausenciasService } from "../api/ausenciasService";
import "../styles/components/ausencias/EstadisticaAusenciaPage.css";

interface EstadisticaHoras {
  tipoAusencia: string;
  totalHoras: number;
}

interface EstadisticaHorasArea {
  area: string;
  totalHoras: number;
}

export function EstadisticaAusenciaPage() {
  const [estadisticas, setEstadisticas] = useState<EstadisticaHoras[]>([]);
  const [estadisticasArea, setEstadisticasArea] = useState<EstadisticaHorasArea[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    setLoading(true);
    try {
      // Cargar ambos tipos de estadísticas en paralelo
      const [dataTipo, dataArea] = await Promise.all([
        ausenciasService.getEstadisticasHoras(),
        ausenciasService.getEstadisticasHorasPorArea()
      ]);
      
      console.log("Estadísticas por tipo recibidas:", dataTipo);
      console.log("Estadísticas por área recibidas:", dataArea);
      
      setEstadisticas(dataTipo);
      setEstadisticasArea(dataArea);
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  const maxHoras = estadisticas.length > 0 ? Math.max(...estadisticas.map(e => e.totalHoras)) : 0;
  const maxHorasArea = estadisticasArea.length > 0 ? Math.max(...estadisticasArea.map(e => e.totalHoras)) : 0;

  const getBarHeight = (horas: number, maxValue: number) => {
    if (maxValue === 0) return 0;
    return (horas / maxValue) * 100;
  };

  const getBarColor = (index: number) => {
    const colors = [
      '#3b82f6', // blue
      '#ef4444', // red
      '#10b981', // green
      '#f59e0b', // yellow
      '#8b5cf6', // purple
      '#06b6d4', // cyan
      '#f97316', // orange
      '#84cc16', // lime
      '#ec4899', // pink
      '#6b7280', // gray
    ];
    return colors[index % colors.length];
  };

  const totalHorasGeneral = estadisticas.reduce((sum, e) => sum + e.totalHoras, 0);
  const totalHorasArea = estadisticasArea.reduce((sum, e) => sum + e.totalHoras, 0);

  return (
    <div className="estadisticas-container">
      <div className="estadisticas-header">
        <button 
          className="volver-btn"
          onClick={() => navigate("/ausencias")}
        >
          ← Volver a Ausencias
        </button>
        <h1 className="estadisticas-title">Estadísticas de Ausencias</h1>
        <button 
          className="actualizar-btn"
          onClick={cargarEstadisticas}
          disabled={loading}
        >
          🔄 Actualizar
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <p className="loading-text">Cargando estadísticas...</p>
        </div>
      ) : (estadisticas.length === 0 && estadisticasArea.length === 0) ? (
        <div className="no-data-container">
          <p className="no-data-text">No hay datos de estadísticas disponibles.</p>
        </div>
      ) : (
        <div className="estadisticas-content">
          {/* Tarjetas de resumen */}
          <div className="resumen-cards">
            <div className="card">
              <h3>Total de Tipos</h3>
              <p className="card-number">{estadisticas.length}</p>
            </div>
            <div className="card">
              <h3>Total de Horas</h3>
              <p className="card-number">{totalHorasGeneral.toFixed(1)}</p>
            </div>
            <div className="card">
              <h3>Áreas con Ausencias</h3>
              <p className="card-number">{estadisticasArea.length}</p>
            </div>
            <div className="card">
              <h3>Promedio por Área</h3>
              <p className="card-number">
                {estadisticasArea.length > 0 
                  ? (totalHorasArea / estadisticasArea.length).toFixed(1)
                  : '0'
                }
              </p>
            </div>
          </div>

          {/* Gráfico por tipo de ausencia */}
          {estadisticas.length > 0 && (
            <div className="grafica-container">
              <h2 className="grafica-title">Horas por Tipo de Ausencia</h2>
              <div className="chart-container">
                <div className="chart">
                  {estadisticas.map((stat, index) => (
                    <div key={stat.tipoAusencia} className="bar-container">
                      <div className="bar-wrapper">
                        <div 
                          className="bar"
                          style={{
                            height: `${getBarHeight(stat.totalHoras, maxHoras)}%`,
                            backgroundColor: getBarColor(index)
                          }}
                        >
                          <div className="bar-value">
                            {stat.totalHoras.toFixed(1)}h
                          </div>
                        </div>
                      </div>
                      <div className="bar-label">
                        {stat.tipoAusencia}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Nuevo gráfico por área */}
          {estadisticasArea.length > 0 && (
            <div className="grafica-container">
              <h2 className="grafica-title">Horas de Ausencia por Área</h2>
              <div className="chart-container">
                <div className="chart">
                  {estadisticasArea.map((stat, index) => (
                    <div key={stat.area} className="bar-container">
                      <div className="bar-wrapper">
                        <div 
                          className="bar"
                          style={{
                            height: `${getBarHeight(stat.totalHoras, maxHorasArea)}%`,
                            backgroundColor: getBarColor(index + estadisticas.length)
                          }}
                        >
                          <div className="bar-value">
                            {stat.totalHoras.toFixed(1)}h
                          </div>
                        </div>
                      </div>
                      <div className="bar-label">
                        {stat.area}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tabla de estadísticas por tipo */}
          {estadisticas.length > 0 && (
            <div className="tabla-estadisticas">
              <h2 className="tabla-title">Detalle por Tipo de Ausencia</h2>
              <table className="estadisticas-table">
                <thead>
                  <tr>
                    <th>Tipo de Ausencia</th>
                    <th>Total de Horas</th>
                    <th>Porcentaje</th>
                  </tr>
                </thead>
                <tbody>
                  {estadisticas
                    .sort((a, b) => b.totalHoras - a.totalHoras)
                    .map((stat, index) => {
                      const porcentaje = totalHorasGeneral > 0 ? (stat.totalHoras / totalHorasGeneral) * 100 : 0;
                      
                      return (
                        <tr key={stat.tipoAusencia}>
                          <td>
                            <div className="tipo-ausencia">
                              <div 
                                className="color-indicator"
                                style={{ backgroundColor: getBarColor(index) }}
                              ></div>
                              {stat.tipoAusencia}
                            </div>
                          </td>
                          <td className="horas-cell">{stat.totalHoras.toFixed(1)} horas</td>
                          <td className="porcentaje-cell">{porcentaje.toFixed(1)}%</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}

          {/* Nueva tabla de estadísticas por área */}
          {estadisticasArea.length > 0 && (
            <div className="tabla-estadisticas">
              <h2 className="tabla-title">Detalle por Área</h2>
              <table className="estadisticas-table">
                <thead>
                  <tr>
                    <th>Área</th>
                    <th>Total de Horas</th>
                    <th>Porcentaje</th>
                  </tr>
                </thead>
                <tbody>
                  {estadisticasArea
                    .sort((a, b) => b.totalHoras - a.totalHoras)
                    .map((stat, index) => {
                      const porcentaje = totalHorasArea > 0 ? (stat.totalHoras / totalHorasArea) * 100 : 0;
                      
                      return (
                        <tr key={stat.area}>
                          <td>
                            <div className="tipo-ausencia">
                              <div 
                                className="color-indicator"
                                style={{ backgroundColor: getBarColor(index + estadisticas.length) }}
                              ></div>
                              {stat.area}
                            </div>
                          </td>
                          <td className="horas-cell">{stat.totalHoras.toFixed(1)} horas</td>
                          <td className="porcentaje-cell">{porcentaje.toFixed(1)}%</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}