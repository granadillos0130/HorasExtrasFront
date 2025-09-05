import React, { useEffect, useState } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

import { cursosService } from "../api/cursoService";

interface Curso {
  id: number;
  nombre: string;
  descripcion: string;
}

interface EstadisticasGenerales {
  totalCursos: number;
  totalTrabajadoresEnCursos: number;
  promedioTrabajadoresPorCurso: number;
  cursoConMasTrabajadores: {
    idCurso: number;
    nombreCurso: string;
    cantidadTrabajadores: number;
  } | null;
  cursoConMenosTrabajadores: {
    idCurso: number;
    nombreCurso: string;
    cantidadTrabajadores: number;
  } | null;
  detallesCursos: {
    idCurso: number;
    nombreCurso: string;
    descripcion: string;
    cantidadTrabajadores: number;
  }[];
}

interface EstadisticasCurso {
  idCurso: number;
  nombreCurso: string;
  descripcion: string;
  cantidadTrabajadores: number;
  trabajadoresInscritos: {
    id: number;
    nombre: string;
    cedula: string;
    cargoDesempenado: string;
    estado: string;
    area: string;
  }[];
}

interface HorasCurso {
  idCurso: number;
  nombreCurso: string;
  cantidadTrabajadores: number;
  totalHorasCurso: number;
  periodoConsultado: {
    fechaInicio: string;
    fechaFin: string;
  };
}

interface Props {
  onVolver: () => void;
}

const CursosEstadisticasPage: React.FC<Props> = ({ onVolver }) => {
  const [subvista, setSubvista] = useState<'resumen' | 'detalle' | 'horas'>('resumen');
  const [loading, setLoading] = useState(false);
  const [loadingCursos, setLoadingCursos] = useState(true);
  
  // Estados para datos
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [estadisticasGenerales, setEstadisticasGenerales] = useState<EstadisticasGenerales | null>(null);
  const [cursoSeleccionado, setCursoSeleccionado] = useState<number>(0);
  const [estadisticasCurso, setEstadisticasCurso] = useState<EstadisticasCurso | null>(null);
  const [horasCurso, setHorasCurso] = useState<HorasCurso | null>(null);
  
  // Estados para filtros de horas
  const [filtrosHoras, setFiltrosHoras] = useState({
    fechaInicio: '',
    fechaFin: '',
  });

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    setLoadingCursos(true);
    try {
      const [cursosData, estadisticasData] = await Promise.all([
        cursosService.getAllCursos(),
        cursosService.getEstadisticasGenerales()
      ]);
      
      setCursos(cursosData);
      setEstadisticasGenerales(estadisticasData);
    } catch (error) {
      console.error("Error al cargar datos iniciales:", error);
    } finally {
      setLoadingCursos(false);
    }
  };

  const cargarEstadisticasCurso = async (idCurso: number) => {
    if (idCurso === 0) return;
    
    setLoading(true);
    try {
      const data = await cursosService.getEstadisticasCurso(idCurso);
      setEstadisticasCurso(data);
    } catch (error) {
      console.error("Error al cargar estadísticas del curso:", error);
    } finally {
      setLoading(false);
    }
  };

  const cargarHorasCurso = async (idCurso: number) => {
    if (idCurso === 0) return;
    
    setLoading(true);
    try {
      const data = await cursosService.getHorasCurso(
        idCurso,
        filtrosHoras.fechaInicio || undefined,
        filtrosHoras.fechaFin || undefined
      );
      setHorasCurso(data);
    } catch (error) {
      console.error("Error al cargar horas del curso:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCursoChange = (idCurso: number) => {
    setCursoSeleccionado(idCurso);
    if (subvista === 'detalle') {
      cargarEstadisticasCurso(idCurso);
    } else if (subvista === 'horas') {
      cargarHorasCurso(idCurso);
    }
  };

  const handleSubvistaChange = (nuevaSubvista: 'resumen' | 'detalle' | 'horas') => {
    setSubvista(nuevaSubvista);
    if (nuevaSubvista === 'detalle' && cursoSeleccionado > 0) {
      cargarEstadisticasCurso(cursoSeleccionado);
    } else if (nuevaSubvista === 'horas' && cursoSeleccionado > 0) {
      cargarHorasCurso(cursoSeleccionado);
    }
  };

  // Datos para gráficos
  const chartDataTrabajadores = estadisticasGenerales ? {
    labels: estadisticasGenerales.detallesCursos.slice(0, 10).map(c => c.nombreCurso),
    datasets: [
      {
        label: "Cantidad de Trabajadores",
        backgroundColor: [
          "#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57", 
          "#ff9ff3", "#54a0ff", "#5f27cd", "#a55eea", "#26de81"
        ],
        data: estadisticasGenerales.detallesCursos.slice(0, 10).map(c => c.cantidadTrabajadores),
      },
    ],
  } : { labels: [], datasets: [] };

  const chartDataDistribucion = estadisticasGenerales ? {
    labels: estadisticasGenerales.detallesCursos.slice(0, 8).map(c => c.nombreCurso),
    datasets: [
      {
        data: estadisticasGenerales.detallesCursos.slice(0, 8).map(c => c.cantidadTrabajadores),
        backgroundColor: [
          "#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", 
          "#feca57", "#ff9ff3", "#54a0ff", "#5f27cd"
        ],
        borderWidth: 2,
      },
    ],
  } : { labels: [], datasets: [] };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "Estadísticas de Cursos" },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  const renderResumen = () => (
    <div className="cursos-resumen">
      {loadingCursos ? (
        <div className="loading-container">
          <div className="loading-message">🔄 Cargando estadísticas de cursos...</div>
        </div>
      ) : estadisticasGenerales ? (
        <>
          <div className="stats-grid">
            <div className="stat-card total">
              <div className="stat-icon">📚</div>
              <div className="stat-content">
                <div className="stat-number">{estadisticasGenerales.totalCursos}</div>
                <div className="stat-label">Total Cursos</div>
              </div>
            </div>
            <div className="stat-card workers">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <div className="stat-number">{estadisticasGenerales.totalTrabajadoresEnCursos}</div>
                <div className="stat-label">Total Trabajadores en Cursos</div>
              </div>
            </div>
            <div className="stat-card average">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <div className="stat-number">{estadisticasGenerales.promedioTrabajadoresPorCurso}</div>
                <div className="stat-label">Promedio por Curso</div>
              </div>
            </div>
            <div className="stat-card popular">
              <div className="stat-icon">🏆</div>
              <div className="stat-content">
                <div className="stat-number">
                  {estadisticasGenerales.cursoConMasTrabajadores?.cantidadTrabajadores || 0}
                </div>
                <div className="stat-label">Curso Más Popular</div>
                <div className="stat-subtitle">
                  {estadisticasGenerales.cursoConMasTrabajadores?.nombreCurso || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          <div className="charts-container">
            <div className="chart-card">
              <h3>Top 10 Cursos por Cantidad de Trabajadores</h3>
              <div style={{ height: '400px' }}>
                <Bar data={chartDataTrabajadores} options={chartOptions} />
              </div>
            </div>
            
            <div className="chart-card">
              <h3>Distribución de Trabajadores por Curso</h3>
              <div style={{ height: '400px' }}>
                <Doughnut 
                  data={chartDataDistribucion} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: "right" as const },
                      title: { display: true, text: "Distribución" },
                    },
                  }} 
                />
              </div>
            </div>
          </div>

          <div className="table-container">
            <h3>Todos los Cursos</h3>
            <table className="estadisticas-table">
              <thead>
                <tr>
                  <th>Curso</th>
                  <th>Descripción</th>
                  <th>Trabajadores</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {estadisticasGenerales.detallesCursos.map((curso, index) => (
                  <tr key={curso.idCurso} style={{animationDelay: `${index * 0.05}s`}}>
                    <td className="curso-nombre">{curso.nombreCurso}</td>
                    <td className="descripcion">{curso.descripcion || 'Sin descripción'}</td>
                    <td className="cantidad">{curso.cantidadTrabajadores}</td>
                    <td className="acciones">
                      <button 
                        className="btn-ver-detalle"
                        onClick={() => {
                          setCursoSeleccionado(curso.idCurso);
                          setSubvista('detalle');
                          cargarEstadisticasCurso(curso.idCurso);
                        }}
                      >
                        👁️ Ver Detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="error-message">Error al cargar las estadísticas</div>
      )}
    </div>
  );

  const renderDetalle = () => (
    <div className="cursos-detalle">
      <div className="selector-curso">
        <div className="form-group">
          <label>Seleccionar Curso:</label>
          <select 
            value={cursoSeleccionado} 
            onChange={(e) => handleCursoChange(parseInt(e.target.value))}
            disabled={loadingCursos}
          >
            <option value={0}>Seleccione un curso...</option>
            {cursos.map(curso => (
              <option key={curso.id} value={curso.id}>
                {curso.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-message">🔄 Cargando detalles del curso...</div>
        </div>
      ) : estadisticasCurso ? (
        <div className="curso-info">
          <div className="curso-header">
            <h3>{estadisticasCurso.nombreCurso}</h3>
            <p className="curso-descripcion">{estadisticasCurso.descripcion || 'Sin descripción'}</p>
            <div className="curso-stats">
              <span className="stat-badge">
                👥 {estadisticasCurso.cantidadTrabajadores} Trabajadores
              </span>
            </div>
          </div>

          <div className="trabajadores-container">
            <h4>Trabajadores Inscritos</h4>
            {estadisticasCurso.trabajadoresInscritos.length > 0 ? (
              <table className="trabajadores-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Cédula</th>
                    <th>Cargo</th>
                    <th>Estado</th>
                    <th>Área</th>
                  </tr>
                </thead>
                <tbody>
                  {estadisticasCurso.trabajadoresInscritos.map((trabajador, index) => (
                    <tr key={trabajador.id} style={{animationDelay: `${index * 0.05}s`}}>
                      <td className="nombre">{trabajador.nombre}</td>
                      <td className="cedula">{trabajador.cedula}</td>
                      <td className="cargo">{trabajador.cargoDesempenado}</td>
                      <td className="estado">
                        <span className={`estado-badge ${trabajador.estado.toLowerCase()}`}>
                          {trabajador.estado}
                        </span>
                      </td>
                      <td className="area">{trabajador.area || 'Sin área'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-message">
                📭 No hay trabajadores inscritos en este curso
              </div>
            )}
          </div>
        </div>
      ) : cursoSeleccionado > 0 ? (
        <div className="empty-message">
          📭 No se encontraron datos para este curso
        </div>
      ) : (
        <div className="empty-message">
          🎯 Seleccione un curso para ver los detalles
        </div>
      )}
    </div>
  );

  const renderHoras = () => (
    <div className="cursos-horas">
      <div className="filtros-horas">
        <div className="form-group">
          <label>Curso:</label>
          <select 
            value={cursoSeleccionado} 
            onChange={(e) => handleCursoChange(parseInt(e.target.value))}
            disabled={loadingCursos}
          >
            <option value={0}>Seleccione un curso...</option>
            {cursos.map(curso => (
              <option key={curso.id} value={curso.id}>
                {curso.nombre}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label>Fecha Inicio:</label>
          <input 
            type="date" 
            value={filtrosHoras.fechaInicio}
            onChange={(e) => setFiltrosHoras({...filtrosHoras, fechaInicio: e.target.value})}
          />
        </div>
        
        <div className="form-group">
          <label>Fecha Fin:</label>
          <input 
            type="date" 
            value={filtrosHoras.fechaFin}
            onChange={(e) => setFiltrosHoras({...filtrosHoras, fechaFin: e.target.value})}
          />
        </div>
        
        <button 
          onClick={() => cargarHorasCurso(cursoSeleccionado)}
          className="btn-consultar"
          disabled={cursoSeleccionado === 0 || loading}
        >
          📊 Consultar Horas
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-message">🔄 Cargando horas del curso...</div>
        </div>
      ) : horasCurso ? (
        <div className="horas-resultado">
          <div className="horas-header">
            <h3>{horasCurso.nombreCurso}</h3>
            <div className="periodo-info">
              📅 Período: {horasCurso.periodoConsultado.fechaInicio} al {horasCurso.periodoConsultado.fechaFin}
            </div>
          </div>

          <div className="horas-stats">
            <div className="stat-card trabajadores">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <div className="stat-number">{horasCurso.cantidadTrabajadores}</div>
                <div className="stat-label">Trabajadores</div>
              </div>
            </div>
            <div className="stat-card horas-total">
              <div className="stat-icon">⏰</div>
              <div className="stat-content">
                <div className="stat-number">{horasCurso.totalHorasCurso.toFixed(2)}</div>
                <div className="stat-label">Total Horas</div>
              </div>
            </div>
            <div className="stat-card promedio">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <div className="stat-number">
                  {horasCurso.cantidadTrabajadores > 0 
                    ? (horasCurso.totalHorasCurso / horasCurso.cantidadTrabajadores).toFixed(2)
                    : '0'
                  }
                </div>
                <div className="stat-label">Horas por Trabajador</div>
              </div>
            </div>
          </div>
        </div>
      ) : cursoSeleccionado > 0 ? (
        <div className="empty-message">
          📭 No se encontraron registros de horas para este curso en el período seleccionado
        </div>
      ) : (
        <div className="empty-message">
          🎯 Seleccione un curso para consultar las horas
        </div>
      )}
    </div>
  );

  return (
    <div className="cursos-estadisticas-page">
      <div className="page-header">
        <button onClick={onVolver} className="btn-back">
          ← Volver al Inicio
        </button>
        <h1>Estadísticas de Cursos</h1>
        <p className="page-subtitle">
          Analiza la participación en cursos y el rendimiento de los trabajadores
        </p>
      </div>

      <div className="submenu-cursos">
        <button 
          className={`submenu-btn ${subvista === 'resumen' ? 'active' : ''}`}
          onClick={() => handleSubvistaChange('resumen')}
        >
          📊 Resumen General
        </button>
        <button 
          className={`submenu-btn ${subvista === 'detalle' ? 'active' : ''}`}
          onClick={() => handleSubvistaChange('detalle')}
        >
          👥 Detalle por Curso
        </button>
        <button 
          className={`submenu-btn ${subvista === 'horas' ? 'active' : ''}`}
          onClick={() => handleSubvistaChange('horas')}
        >
          ⏰ Horas por Curso
        </button>
      </div>

      {subvista === 'resumen' && renderResumen()}
      {subvista === 'detalle' && renderDetalle()}
      {subvista === 'horas' && renderHoras()}
    </div>
  );
};

export default CursosEstadisticasPage;