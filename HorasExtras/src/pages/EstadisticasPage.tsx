import React, { useEffect, useState } from "react";
import { Bar, Chart } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ChartDataLabels,
  PointElement,
  LineElement
);

import { estadisticasService } from "../api/estadisticasService";
import { ausenciasService } from "../api/ausenciasService";
import type { Centro, TrabajadorEstadistica } from "../types/estadisticas";
import CentroBuscador from "../components/shared/CentroBuscador";
import CursosEstadisticasPage from "./CursoEstadisticasPage";
import "../styles/pages/EstadisticasPage.css";

// Interfaces para las estadísticas de ausencias
interface EstadisticaAusenciaMensual {
  mes: number;
  anio: number;
  nombreMes: string;
  totalAusencias: number;
  totalHoras: number;
  manoObraPerdida: number;
  citasMedicas: number;
  incapacidades: number;
  permisos: number;
  otros: number;
}

interface EstadisticaTipoAusencia {
  tipoAusencia: string;
  totalAusencias: number;
  totalHoras: number;
  manoObraPerdida: number;
}

interface EstadisticaDiagnostico {
  diagnosticoCodigo: string;
  diagnosticoDescripcion: string;
  cantidadAusencias: number;
  totalHoras: number;
  manoObraPerdida: number;
}

const EstadisticasPage: React.FC = () => {
  // Estados para la vista principal
  const [vistaActiva, setVistaActiva] = useState<'inicio' | 'centros' | 'ausencias' | 'cursos'>('inicio');

  // Estados para estadísticas de centros (original)
  const [centros, setCentros] = useState<Centro[]>([]);
  const [centroId, setCentroId] = useState<string>("");
  const [estadisticas, setEstadisticas] = useState<TrabajadorEstadistica[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCentros, setLoadingCentros] = useState(true);

  // Estados para estadísticas de ausencias
  const [estadisticasAusencias, setEstadisticasAusencias] = useState({
    mensuales: [] as EstadisticaAusenciaMensual[],
    porTipo: [] as EstadisticaTipoAusencia[],
    porDiagnostico: [] as EstadisticaDiagnostico[],
  });
  const [filtrosAusencias, setFiltrosAusencias] = useState({
    anio: new Date().getFullYear(),
    mes: new Date().getMonth() + 1,
  });
  const [loadingAusencias, setLoadingAusencias] = useState(false);
  const [subvistaAusencias, setSubvistaAusencias] = useState<'resumen' | 'diagnosticos' | 'tipos' | 'mensual'>('resumen');

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

  // Funciones para estadísticas de centros (original)
  const buscarEstadisticas = async () => {
    if (centroId === "") {
      alert("Seleccione un centro.");
      return;
    }
    setLoading(true);
    try {
      const data = await estadisticasService.getEstadisticasPorCentro(parseInt(centroId));
      setEstadisticas(data);
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
      setEstadisticas([]);
    } finally {
      setLoading(false);
    }
  };

  // Funciones para estadísticas de ausencias
  const cargarEstadisticasAusencias = async () => {
    setLoadingAusencias(true);
    try {
      const [porDiagnostico, porTipo, mensuales] = await Promise.all([
        ausenciasService.getEstadisticasDiagnosticosDetallado(),
        ausenciasService.getEstadisticasTiposDetallado(),
        ausenciasService.getEstadisticasMensuales(filtrosAusencias.anio)
      ]);

      setEstadisticasAusencias({
        porDiagnostico: porDiagnostico.map(d => ({
          diagnosticoCodigo: d.diagnosticoCodigo,
          diagnosticoDescripcion: d.diagnosticoDescripcion,
          cantidadAusencias: d.cantidadAusencias,
          totalHoras: d.totalHoras,
          manoObraPerdida: d.manoObraPerdida
        })),
        porTipo: porTipo.map(t => ({
          tipoAusencia: t.tipoAusencia,
          totalAusencias: t.totalAusencias,
          totalHoras: t.totalHoras,
          manoObraPerdida: t.manoObraPerdida
        })),
        mensuales: mensuales.map(m => ({
          mes: m.mes,
          anio: m.anio,
          nombreMes: m.nombreMes,
          totalAusencias: m.totalAusencias,
          totalHoras: m.totalHoras,
          manoObraPerdida: m.manoObraPerdida,
          citasMedicas: m.citasMedicas,
          incapacidades: m.incapacidades,
          permisos: m.permisos,
          otros: m.otros
        }))
      });
    } catch (error) {
      console.error("Error al cargar estadísticas de ausencias:", error);
    } finally {
      setLoadingAusencias(false);
    }
  };

  const handleCentroChange = (selectedCentroId: string) => {
    setCentroId(selectedCentroId);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatHours = (hours: number) => {
    if (hours === 0) return "0:00";
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}:${m.toString().padStart(2, "0")}`;
  };

  // Gráficos para ausencias
  const chartDataDiagnosticos = {
    labels: estadisticasAusencias.porDiagnostico.slice(0, 10).map(d => d.diagnosticoCodigo),
    datasets: [
      {
        label: "Cantidad de Ausencias",
        backgroundColor: ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57", "#ff9ff3", "#54a0ff", "#5f27cd"],
        data: estadisticasAusencias.porDiagnostico.slice(0, 10).map(d => d.cantidadAusencias),
      },
    ],
  };

  const chartDataTipos = {
    labels: estadisticasAusencias.porTipo.map(t => t.tipoAusencia),
    datasets: [
      {
        label: "Horas Perdidas",
        backgroundColor: "#ff6b6b",
        data: estadisticasAusencias.porTipo.map(t => t.totalHoras),
        borderRadius: 8,
      },
      {
        label: "Mano de Obra Perdida",
        backgroundColor: "#4ecdc4",
        data: estadisticasAusencias.porTipo.map(t => t.manoObraPerdida / 1000), // En miles
        borderRadius: 8,
        yAxisID: 'y1',
      },
    ],
  };

  const chartDataMensual = {
    labels: estadisticasAusencias.mensuales.map(m => m.nombreMes),
    datasets: [
      {
        label: "Total Ausencias",
        backgroundColor: "#45b7d1",
        borderColor: "#45b7d1",
        data: estadisticasAusencias.mensuales.map(m => m.totalAusencias),
        type: 'bar' as const,
      },
      {
        label: "Citas Médicas",
        backgroundColor: "#ff6b6b",
        data: estadisticasAusencias.mensuales.map(m => m.citasMedicas),
        type: 'bar' as const,
      },
      {
        label: "Incapacidades",
        backgroundColor: "#feca57",
        data: estadisticasAusencias.mensuales.map(m => m.incapacidades),
        type: 'bar' as const,
      },
      {
        label: "Permisos",
        backgroundColor: "#48cab2",
        data: estadisticasAusencias.mensuales.map(m => m.permisos),
        type: 'bar' as const,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "Estadísticas de Ausencias" },
    },
    scales: {
      y: { beginAtZero: true },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: { drawOnChartArea: false },
      },
    },
  };

  // Transform centros data para CentroBuscador
  const transformedCentros = centros.map(centro => ({
    ...centro,
    fechaInicio: new Date().toISOString(),
    clienteId: "",
  }));

  const renderVistaInicio = () => (
    <div className="vista-inicio">
      <div className="page-header">
        <h1>Centro de Estadísticas</h1>
        <p className="page-subtitle">
          Selecciona el tipo de análisis que deseas realizar
        </p>
      </div>

      <div className="menu-principal">
        <div className="menu-card" onClick={() => setVistaActiva('centros')}>
          <div className="menu-icon">🏢</div>
          <h3>Estadísticas por Centro</h3>
          <p>Analiza el rendimiento y distribución de horas por centro de trabajo</p>
          <button className="btn-menu">Ver Estadísticas de Centros</button>
        </div>

        <div className="menu-card" onClick={() => {
          setVistaActiva('ausencias');
          cargarEstadisticasAusencias();
        }}>
          <div className="menu-icon">🏥</div>
          <h3>Estadísticas de Ausencias</h3>
          <p>Analiza ausencias por diagnósticos, tipos y impacto en mano de obra</p>
          <button className="btn-menu">Ver Estadísticas de Ausencias</button>
        </div>

        <div className="menu-card" onClick={() => setVistaActiva('cursos')}>
          <div className="menu-icon">🎓</div>
          <h3>Estadísticas de Cursos</h3>
          <p>Analiza la participación en cursos y total de horas por curso</p>
          <button className="btn-menu">Ver Estadísticas de Cursos</button>
        </div>
      </div>
    </div>
  );

  const renderVistaCentros = () => (
    <div className="vista-centros">
      <div className="page-header">
        <button onClick={() => setVistaActiva('inicio')} className="btn-back">
          ← Volver al Inicio
        </button>
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
          {loadingCentros ? (
            <div className="form-group">
              <label className="form-label">Centro de Trabajo</label>
              <div className="loading-input">🔄 Cargando centros...</div>
            </div>
          ) : (
            <CentroBuscador
              centros={transformedCentros}
              value={centroId}
              onChange={handleCentroChange}
              placeholder="Buscar por nombre o ID..."
              label="Centro de Trabajo"
              required={true}
              showSelectedInfo={true}
            />
          )}

          <button
            onClick={buscarEstadisticas}
            className="btn-search"
            disabled={loading || centroId === "" || loadingCentros}
          >
            {loading ? "🔄 Cargando..." : "📊 Generar Estadísticas"}
          </button>
        </div>
      </div>

      {/* Resto del contenido original para centros */}
      {estadisticas.length > 0 && !loading && (
        <div className="results-card">
          <div className="results-header">
            <h3>Estadísticas del Centro</h3>
          </div>
          {/* Aquí iría el contenido original de las estadísticas de centros */}
        </div>
      )}
    </div>
  );

  const renderVistaAusencias = () => (
    <div className="vista-ausencias">
      <div className="page-header">
        <button onClick={() => setVistaActiva('inicio')} className="btn-back">
          ← Volver al Inicio
        </button>
        <h1>Estadísticas de Ausencias</h1>
        <p className="page-subtitle">
          Analiza las ausencias laborales y su impacto en la productividad
        </p>
      </div>

      <div className="submenu-ausencias">
        <button 
          className={`submenu-btn ${subvistaAusencias === 'resumen' ? 'active' : ''}`}
          onClick={() => setSubvistaAusencias('resumen')}
        >
          📊 Resumen General
        </button>
        <button 
          className={`submenu-btn ${subvistaAusencias === 'diagnosticos' ? 'active' : ''}`}
          onClick={() => setSubvistaAusencias('diagnosticos')}
        >
          🩺 Por Diagnósticos
        </button>
        <button 
          className={`submenu-btn ${subvistaAusencias === 'tipos' ? 'active' : ''}`}
          onClick={() => setSubvistaAusencias('tipos')}
        >
          📋 Por Tipos
        </button>
        <button 
          className={`submenu-btn ${subvistaAusencias === 'mensual' ? 'active' : ''}`}
          onClick={() => setSubvistaAusencias('mensual')}
        >
          📅 Análisis Mensual
        </button>
      </div>

      {loadingAusencias ? (
        <div className="loading-container">
          <div className="loading-message">🔄 Cargando estadísticas de ausencias...</div>
        </div>
      ) : (
        <>
          {subvistaAusencias === 'resumen' && (
            <div className="ausencias-resumen">
              <div className="stats-grid">
                <div className="stat-card total">
                  <div className="stat-icon">📊</div>
                  <div className="stat-content">
                    <div className="stat-number">
                      {estadisticasAusencias.porDiagnostico.reduce((acc, d) => acc + d.cantidadAusencias, 0)}
                    </div>
                    <div className="stat-label">Total Ausencias</div>
                  </div>
                </div>
                <div className="stat-card hours">
                  <div className="stat-icon">⏰</div>
                  <div className="stat-content">
                    <div className="stat-number">
                      {formatHours(estadisticasAusencias.porDiagnostico.reduce((acc, d) => acc + d.totalHoras, 0))}
                    </div>
                    <div className="stat-label">Horas Perdidas</div>
                  </div>
                </div>
                <div className="stat-card money">
                  <div className="stat-icon">💰</div>
                  <div className="stat-content">
                    <div className="stat-number">
                      {formatCurrency(estadisticasAusencias.porDiagnostico.reduce((acc, d) => acc + d.manoObraPerdida, 0))}
                    </div>
                    <div className="stat-label">Mano de Obra Perdida</div>
                  </div>
                </div>
                <div className="stat-card diagnostics">
                  <div className="stat-icon">🩺</div>
                  <div className="stat-content">
                    <div className="stat-number">{estadisticasAusencias.porDiagnostico.length}</div>
                    <div className="stat-label">Diagnósticos Diferentes</div>
                  </div>
                </div>
              </div>

              <div className="charts-container">
                <div className="chart-card">
                  <h3>Top 10 Diagnósticos Más Frecuentes</h3>
                  <div style={{ height: '400px' }}>
                    <Bar data={chartDataDiagnosticos} options={chartOptions} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {subvistaAusencias === 'diagnosticos' && (
            <div className="ausencias-diagnosticos">
              <div className="table-container">
                <h3>Ausencias por Diagnóstico</h3>
                <table className="estadisticas-table">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Descripción</th>
                      <th>Cantidad</th>
                      <th>Horas</th>
                      <th>Mano de Obra Perdida</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estadisticasAusencias.porDiagnostico.map((diag, index) => (
                      <tr key={diag.diagnosticoCodigo} style={{animationDelay: `${index * 0.05}s`}}>
                        <td className="codigo">{diag.diagnosticoCodigo}</td>
                        <td className="descripcion">{diag.diagnosticoDescripcion}</td>
                        <td className="cantidad">{diag.cantidadAusencias}</td>
                        <td className="horas">{formatHours(diag.totalHoras)}</td>
                        <td className="mano-obra">{formatCurrency(diag.manoObraPerdida)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {subvistaAusencias === 'tipos' && (
            <div className="ausencias-tipos">
              <div className="chart-card">
                <h3>Impacto por Tipo de Ausencia</h3>
                <div style={{ height: '400px' }}>
                  <Bar data={chartDataTipos} options={chartOptions} />
                </div>
              </div>
              
              <div className="table-container">
                <table className="estadisticas-table">
                  <thead>
                    <tr>
                      <th>Tipo de Ausencia</th>
                      <th>Horas Perdidas</th>
                      <th>Mano de Obra Perdida</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estadisticasAusencias.porTipo.map((tipo, index) => (
                      <tr key={tipo.tipoAusencia} style={{animationDelay: `${index * 0.05}s`}}>
                        <td className="tipo">{tipo.tipoAusencia}</td>
                        <td className="horas">{formatHours(tipo.totalHoras)}</td>
                        <td className="mano-obra">{formatCurrency(tipo.manoObraPerdida)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {subvistaAusencias === 'mensual' && (
            <div className="ausencias-mensual">
              <div className="filtros-mensual">
                <div className="form-group">
                  <label>Año:</label>
                  <select 
                    value={filtrosAusencias.anio} 
                    onChange={(e) => setFiltrosAusencias({...filtrosAusencias, anio: parseInt(e.target.value)})}
                  >
                    {[2022, 2023, 2024, 2025].map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <button onClick={cargarEstadisticasAusencias} className="btn-refresh">
                  🔄 Actualizar
                </button>
              </div>

              <div className="chart-card">
                <h3>Tendencia Mensual de Ausencias</h3>
                <div style={{ height: '400px' }}>
                  <Chart type="bar" data={chartDataMensual} options={chartOptions} />
                </div>
              </div>

              <div className="table-container">
                <table className="estadisticas-table">
                  <thead>
                    <tr>
                      <th>Mes</th>
                      <th>Total</th>
                      <th>Citas Médicas</th>
                      <th>Incapacidades</th>
                      <th>Permisos</th>
                      <th>Otros</th>
                      <th>Mano de Obra Perdida</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estadisticasAusencias.mensuales.map((mes, index) => (
                      <tr key={`${mes.anio}-${mes.mes}`} style={{animationDelay: `${index * 0.05}s`}}>
                        <td className="mes">{mes.nombreMes}</td>
                        <td className="total">{mes.totalAusencias}</td>
                        <td className="citas">{mes.citasMedicas}</td>
                        <td className="incapacidades">{mes.incapacidades}</td>
                        <td className="permisos">{mes.permisos}</td>
                        <td className="otros">{mes.otros}</td>
                        <td className="mano-obra">{formatCurrency(mes.manoObraPerdida)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="estadisticas-page">
      <div className="page-container">
        {vistaActiva === 'inicio' && renderVistaInicio()}
        {vistaActiva === 'centros' && renderVistaCentros()}
        {vistaActiva === 'ausencias' && renderVistaAusencias()}
        {vistaActiva === 'cursos' && <CursosEstadisticasPage onVolver={() => setVistaActiva('inicio')} />}
      </div>
    </div>
  );
};

export default EstadisticasPage;