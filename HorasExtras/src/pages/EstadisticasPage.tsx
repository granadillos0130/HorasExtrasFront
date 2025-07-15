import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { estadisticasService } from "../api/estadisticasService";
import type { Centro, TrabajadorEstadistica } from "../types/estadisticas";
import "../styles/pages/EstadisticasPage.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const EstadisticasPage: React.FC = () => {
  const [centros, setCentros] = useState<Centro[]>([]);
  const [centroId, setCentroId] = useState<string>("");
  const [estadisticas, setEstadisticas] = useState<TrabajadorEstadistica[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCentros, setLoadingCentros] = useState(true);

  // 🚀 CAMBIO: nuevos estados para el buscador
  const [busqueda, setBusqueda] = useState<string>("");
  const [mostrarResultados, setMostrarResultados] = useState<boolean>(false);

  useEffect(() => {
    const cargarCentros = async () => {
      try {
        setLoadingCentros(true);
        const data = await estadisticasService.getCentros();
        setCentros(data);
      } catch (error) {
        console.error("Error al cargar centros:", error);
      } finally {
        setLoadingCentros(false);
      }
    };
    cargarCentros();
  }, []);

  const buscarEstadisticas = async () => {
    if (centroId === "") {
      alert("Seleccione un centro.");
      return;
    }
    setLoading(true);
    try {
      const data = await estadisticasService.getEstadisticasPorCentro(centroId);
      setEstadisticas(data);
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
      setEstadisticas([]);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: estadisticas.map(e => e.nombreTrabajador),
    datasets: [
      {
        label: "Horas Normales",
        backgroundColor: "#27ae60",
        data: estadisticas.map(e => e.horasNormales),
        borderRadius: 8,
      },
      {
        label: "Horas Extras Diurnas",
        backgroundColor: "#f39c12",
        data: estadisticas.map(e => e.horasExtrasDiurnas),
        borderRadius: 8,
      },
      {
        label: "Horas Extras Nocturnas",
        backgroundColor: "#8e44ad",
        data: estadisticas.map(e => e.horasExtrasNocturnas),
        borderRadius: 8,
      },
      {
        label: "Dom. Diurnas",
        backgroundColor: "#e74c3c",
        data: estadisticas.map(e => e.extrasDominicalesDiurnas),
        borderRadius: 8,
      },
      {
        label: "Dom. Nocturnas",
        backgroundColor: "#c0392b",
        data: estadisticas.map(e => e.extrasDominicalesNocturnas),
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: 600,
          },
        },
      },
      title: {
        display: true,
        text: "Distribución de Horas por Trabajador",
        font: {
          size: 16,
          weight: 600,
        },
        padding: 20,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11, weight: 500 } },
      },
      y: {
        grid: { color: "rgba(0,0,0,0.1)" },
        ticks: { font: { size: 11, weight: 500 } },
      },
    },
  };

  const getSelectedCentroName = () => {
    const centro = centros.find(c => c.id === centroId);
    return centro ? centro.nombreCentro : "";
  };

  const formatHours = (hours: number) => {
    if (hours === 0) return "0:00";
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}:${m.toString().padStart(2, "0")}`;
  };

  const getTotalStats = () => {
    if (estadisticas.length === 0) return null;
    const totales = estadisticas.reduce(
      (acc, est) => ({
        horasNormales: acc.horasNormales + est.horasNormales,
        horasExtrasDiurnas: acc.horasExtrasDiurnas + est.horasExtrasDiurnas,
        horasExtrasNocturnas: acc.horasExtrasNocturnas + est.horasExtrasNocturnas,
        extrasDominicalesDiurnas: acc.extrasDominicalesDiurnas + est.extrasDominicalesDiurnas,
        extrasDominicalesNocturnas: acc.extrasDominicalesNocturnas + est.extrasDominicalesNocturnas,
        totalHoras: acc.totalHoras + est.totalHoras,
      }),
      {
        horasNormales: 0,
        horasExtrasDiurnas: 0,
        horasExtrasNocturnas: 0,
        extrasDominicalesDiurnas: 0,
        extrasDominicalesNocturnas: 0,
        totalHoras: 0,
      }
    );
    return totales;
  };

  const totalStats = getTotalStats();

  return (
    <div className="estadisticas-page">
      <div className="page-container">
        <div className="page-header">
          <h1>Estadísticas por Centro</h1>
          <p className="page-subtitle">
            Analiza el rendimiento y distribución de horas por centro de trabajo
          </p>
        </div>

        <div className="filters-card">
          <div className="filters-header">
            <div className="filters-icon">📊</div>
            <h2>Seleccionar Centro</h2>
          </div>

          <div className="estadisticas-toolbar">
            {/* 🚀 CAMBIO: Buscador dinámico */}
            <div className="form-group buscador-centros">
              <label className="form-label">Centro de Trabajo</label>
              <input
                type="text"
                className="form-input"
                placeholder="Buscar por nombre o ID..."
                value={busqueda}
                onChange={e => {
                  setBusqueda(e.target.value);
                  setMostrarResultados(true);
                }}
                onFocus={() => setMostrarResultados(true)}
              />
              {mostrarResultados && (
                <div className="resultados-dropdown">
                  {centros
                    .filter(c =>
                      c.nombreCentro.toLowerCase().includes(busqueda.toLowerCase()) ||
                      c.id.toLowerCase().includes(busqueda.toLowerCase())
                    )
                    .slice(0, 10)
                    .map(c => (
                      <div
                        key={c.id}
                        className="resultado-item"
                        onClick={() => {
                          setCentroId(c.id);
                          setBusqueda(c.nombreCentro);
                          setMostrarResultados(false);
                        }}
                      >
                        🏢 <strong>{c.nombreCentro}</strong> <small>({c.id})</small>
                      </div>
                    ))}
                  {centros.filter(c =>
                    c.nombreCentro.toLowerCase().includes(busqueda.toLowerCase()) ||
                    c.id.toLowerCase().includes(busqueda.toLowerCase())
                  ).length === 0 && (
                    <div className="resultado-item no-resultados">
                      No se encontraron centros.
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={buscarEstadisticas}
              className="btn-search"
              disabled={loading || centroId === ""}
            >
              {loading ? "🔄 Cargando..." : "📊 Generar Estadísticas"}
            </button>
          </div>
        </div>

        {loading && (
          <div className="results-card">
            <div className="loading-message">
              🔄 Generando estadísticas para el centro seleccionado...
            </div>
          </div>
        )}

        {estadisticas.length > 0 && !loading && (
          <>
            <div className="results-card">
              <div className="results-header">
                <div className="results-title">
                  <div className="results-icon">📈</div>
                  <h3>Resumen General</h3>
                </div>
                <div className="results-count">
                  {getSelectedCentroName()} - {estadisticas.length} trabajador{estadisticas.length !== 1 ? 'es' : ''}
                </div>
              </div>

              {totalStats && (
                <div className="stats-grid">
                  <div className="stat-card normal">
                    <div className="stat-icon">⏰</div>
                    <div className="stat-content">
                      <div className="stat-number">{formatHours(totalStats.horasNormales)}</div>
                      <div className="stat-label">Horas Normales</div>
                    </div>
                  </div>
                  <div className="stat-card extra-diurna">
                    <div className="stat-icon">☀️</div>
                    <div className="stat-content">
                      <div className="stat-number">{formatHours(totalStats.horasExtrasDiurnas)}</div>
                      <div className="stat-label">Extras Diurnas</div>
                    </div>
                  </div>
                  <div className="stat-card extra-nocturna">
                    <div className="stat-icon">🌙</div>
                    <div className="stat-content">
                      <div className="stat-number">{formatHours(totalStats.horasExtrasNocturnas)}</div>
                      <div className="stat-label">Extras Nocturnas</div>
                    </div>
                  </div>
                  <div className="stat-card dom-diurna">
                    <div className="stat-icon">🌅</div>
                    <div className="stat-content">
                      <div className="stat-number">{formatHours(totalStats.extrasDominicalesDiurnas)}</div>
                      <div className="stat-label">Dom. Diurnas</div>
                    </div>
                  </div>
                  <div className="stat-card dom-nocturna">
                    <div className="stat-icon">🌃</div>
                    <div className="stat-content">
                      <div className="stat-number">{formatHours(totalStats.extrasDominicalesNocturnas)}</div>
                      <div className="stat-label">Dom. Nocturnas</div>
                    </div>
                  </div>
                  <div className="stat-card total">
                    <div className="stat-icon">📊</div>
                    <div className="stat-content">
                      <div className="stat-number">{formatHours(totalStats.totalHoras)}</div>
                      <div className="stat-label">Total Horas</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="results-card">
              <div className="results-header">
                <div className="results-title">
                  <div className="results-icon">📊</div>
                  <h3>Análisis Visual</h3>
                </div>
              </div>
              
              <div className="estadisticas-chart">
                <Bar data={chartData} options={chartOptions} height={400} />
              </div>
            </div>

            <div className="results-card">
              <div className="results-header">
                <div className="results-title">
                  <div className="results-icon">📋</div>
                  <h3>Detalle por Trabajador</h3>
                </div>
              </div>

              <div className="table-container">
                <table className="estadisticas-table">
                  <thead>
                    <tr>
                      <th>Trabajador</th>
                      <th>H. Normales</th>
                      <th>Ex. Diurnas</th>
                      <th>Ex. Nocturnas</th>
                      <th>Dom. Diurnas</th>
                      <th>Dom. Nocturnas</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estadisticas.map((e, index) => (
                      <tr key={e.trabajadorId} style={{animationDelay: `${index * 0.05}s`}}>
                        <td className="trabajador-name">{e.nombreTrabajador}</td>
                        <td className="hours-normal">{formatHours(e.horasNormales)}</td>
                        <td className="hours-extra-diurna">{formatHours(e.horasExtrasDiurnas)}</td>
                        <td className="hours-extra-nocturna">{formatHours(e.horasExtrasNocturnas)}</td>
                        <td className="hours-dom-diurna">{formatHours(e.extrasDominicalesDiurnas)}</td>
                        <td className="hours-dom-nocturna">{formatHours(e.extrasDominicalesNocturnas)}</td>
                        <td className="hours-total">{formatHours(e.totalHoras)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {estadisticas.length === 0 && !loading && centroId !== "" && (
          <div className="results-card">
            <div className="empty-state">
              <div className="empty-state-icon">📊</div>
              <h3>Sin datos estadísticos</h3>
              <p>No se encontraron datos para el centro seleccionado. Verifica que haya registros de trabajo en este centro.</p>
            </div>
          </div>
        )}

        {centroId === "" && (
          <div className="results-card">
            <div className="empty-state">
              <div className="empty-state-icon">🏢</div>
              <h3>Selecciona un centro</h3>
              <p>Elige un centro de trabajo del menú desplegable para ver sus estadísticas y análisis de horas trabajadas.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EstadisticasPage;
