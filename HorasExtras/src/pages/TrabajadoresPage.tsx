// TrabajadoresPage.tsx - Versión Ejecutiva Refactorizada
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrabajadores } from '../hooks/useTrabajadores';
import { trabajadoresService } from '../api/trabajadoresService';
import TrabajadorForm from '../components/trabajadores/TrabajadorForm';
import TrabajadoresFilters from '../components/trabajadores/components/Trabajadoresfilter';
import TrabajadoresTable from '../components/trabajadores/components/Trabajadorestable';

const TrabajadoresPage: React.FC = () => {
  const navigate = useNavigate();
  const { trabajadores, loading, error, refetch } = useTrabajadores();
  
  // Estados
  const [showForm, setShowForm] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('todos');
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina, setItemsPorPagina] = useState(25);

  // Filtrar trabajadores
  const trabajadoresFiltrados = useMemo(() => {
    let filtrados = trabajadores;

    // Filtro por búsqueda (nombre o cédula)
    if (busqueda.trim()) {
      const termino = busqueda.toLowerCase();
      filtrados = filtrados.filter(t =>
        t.nombre.toLowerCase().includes(termino) ||
        t.cedula.toLowerCase().includes(termino)
      );
    }

    // Filtro por estado
    if (estadoFiltro !== 'todos') {
      filtrados = filtrados.filter(t => t.estado === estadoFiltro);
    }

    return filtrados;
  }, [trabajadores, busqueda, estadoFiltro]);

  // Calcular paginación
  const totalPaginas = Math.ceil(trabajadoresFiltrados.length / itemsPorPagina);
  const trabajadoresPaginados = trabajadoresFiltrados.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  );

  // Estadísticas
  const estadisticas = useMemo(() => {
    const vigentes = trabajadores.filter(t => t.estado === 'Vigente').length;
    const noVigentes = trabajadores.filter(t => t.estado === 'No Vigente').length;
    const total = trabajadores.length;
    return { vigentes, noVigentes, total };
  }, [trabajadores]);

  // Reset página cuando cambian filtros
  React.useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, estadoFiltro]);

  // Handlers
  const handleCreated = () => {
    setShowForm(false);
    refetch();
  };

  const handleVerDetalle = (id: number) => {
    navigate(`/trabajadores/${id}`);
  };

  const handleVerAusencias = (id: number) => {
    navigate(`/trabajadores/${id}/ausencias`);
  };

  const handleVerIntensidad = (id: number) => {
    navigate(`/trabajadores/${id}/intensidad`);
  };

  const handleEditar = (id: number) => {
    navigate(`/trabajadores/editar/${id}`);
  };

  const handleCambiarEstado = async (id: number, estadoActual: string) => {
    const nuevoEstado = estadoActual === 'Vigente' ? 'No Vigente' : 'Vigente';
    try {
      await trabajadoresService.cambiarEstado(id, nuevoEstado);
      refetch();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    }
  };

  const handleEliminar = async (id: number, nombre: string) => {
    if (window.confirm(`¿Estás seguro de eliminar a ${nombre}?`)) {
      try {
        await trabajadoresService.delete(id);
        refetch();
      } catch {
        alert('Error al eliminar el trabajador');
      }
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{
            fontSize: '1.8rem',
            color: '#1e293b',
            marginBottom: '8px',
            fontWeight: '700'
          }}>
            GESTIÓN DE TRABAJADORES
          </h1>
          <p style={{
            fontSize: '1.1rem',
            color: '#64748b',
            margin: 0,
            fontWeight: '500'
          }}>
            Administra la información de tu equipo de trabajo
          </p>
        </div>

        {/* Estadísticas */}
        {!loading && trabajadores.length > 0 && !showForm && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '25px'
          }}>
            {/* Total */}
            <div style={{
              background: 'white',
              borderRadius: '8px',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{
                fontSize: '0.85rem',
                color: '#64748b',
                fontWeight: '600',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Total
              </div>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                color: '#1e293b'
              }}>
                {estadisticas.total}
              </div>
              <div style={{
                fontSize: '0.85rem',
                color: '#94a3b8',
                marginTop: '4px'
              }}>
                Trabajadores registrados
              </div>
            </div>

            {/* Vigentes */}
            <div style={{
              background: 'white',
              borderRadius: '8px',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{
                fontSize: '0.85rem',
                color: '#64748b',
                fontWeight: '600',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Vigentes
              </div>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                color: '#059669'
              }}>
                {estadisticas.vigentes}
              </div>
              <div style={{
                fontSize: '0.85rem',
                color: '#94a3b8',
                marginTop: '4px'
              }}>
                Trabajadores activos
              </div>
            </div>

            {/* No Vigentes */}
            <div style={{
              background: 'white',
              borderRadius: '8px',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{
                fontSize: '0.85rem',
                color: '#64748b',
                fontWeight: '600',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                No Vigentes
              </div>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                color: '#dc2626'
              }}>
                {estadisticas.noVigentes}
              </div>
              <div style={{
                fontSize: '0.85rem',
                color: '#94a3b8',
                marginTop: '4px'
              }}>
                Trabajadores inactivos
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        {!showForm && (
          <TrabajadoresFilters
            busqueda={busqueda}
            onBusquedaChange={setBusqueda}
            estadoFiltro={estadoFiltro}
            onEstadoChange={setEstadoFiltro}
            onAgregar={() => setShowForm(true)}
            totalTrabajadores={trabajadores.length}
          />
        )}

        {/* Formulario de creación */}
        {showForm && (
          <div style={{
            background: 'white',
            borderRadius: '8px',
            padding: '25px',
            marginBottom: '25px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <TrabajadorForm
              onCreated={handleCreated}
              onCancel={() => setShowForm(false)}
              onRefresh={refetch}
            />
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '8px',
            padding: '15px 20px',
            marginBottom: '25px',
            color: '#991b1b',
            fontSize: '0.95rem'
          }}>
            Error: {error}
          </div>
        )}

        {/* Tabla */}
        {!showForm && (
          <>
            <div style={{
              background: 'white',
              borderRadius: '8px 8px 0 0',
              padding: '20px 25px',
              borderBottom: '2px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e2e8f0'
            }}>
              <h2 style={{
                margin: 0,
                fontSize: '1.2rem',
                fontWeight: '700',
                color: '#1e293b',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                {busqueda || estadoFiltro !== 'todos' ? 'Trabajadores Filtrados' : 'Trabajadores Registrados'} ({trabajadoresFiltrados.length})
              </h2>
            </div>

            <TrabajadoresTable
              trabajadores={trabajadoresPaginados}
              loading={loading}
              onVerDetalle={handleVerDetalle}
              onVerAusencias={handleVerAusencias}
              onVerIntensidad={handleVerIntensidad}
              onEditar={handleEditar}
              onCambiarEstado={handleCambiarEstado}
              onEliminar={handleEliminar}
            />

            {/* Paginación */}
            {!loading && trabajadoresFiltrados.length > 0 && (
              <div style={{
                background: 'white',
                borderRadius: '0 0 8px 8px',
                padding: '20px 25px',
                borderTop: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '15px'
              }}>
                {/* Info de registros */}
                <div style={{
                  fontSize: '0.9rem',
                  color: '#64748b',
                  fontWeight: '500'
                }}>
                  Mostrando <strong style={{ color: '#1e40af' }}>{(paginaActual - 1) * itemsPorPagina + 1}</strong> a{' '}
                  <strong style={{ color: '#1e40af' }}>{Math.min(paginaActual * itemsPorPagina, trabajadoresFiltrados.length)}</strong> de{' '}
                  <strong style={{ color: '#1e40af' }}>{trabajadoresFiltrados.length}</strong> trabajador{trabajadoresFiltrados.length !== 1 ? 'es' : ''}
                </div>

                {/* Controles */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <button
                    onClick={() => setPaginaActual(1)}
                    disabled={paginaActual === 1}
                    style={{
                      ...buttonStyle,
                      opacity: paginaActual === 1 ? 0.4 : 1,
                      cursor: paginaActual === 1 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    ⟪
                  </button>
                  <button
                    onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))}
                    disabled={paginaActual === 1}
                    style={{
                      ...buttonStyle,
                      opacity: paginaActual === 1 ? 0.4 : 1,
                      cursor: paginaActual === 1 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    ‹
                  </button>
                  <div style={{
                    padding: '8px 20px',
                    background: '#eff6ff',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#1e40af',
                    minWidth: '120px',
                    textAlign: 'center'
                  }}>
                    Página {paginaActual} de {totalPaginas}
                  </div>
                  <button
                    onClick={() => setPaginaActual(Math.min(totalPaginas, paginaActual + 1))}
                    disabled={paginaActual === totalPaginas}
                    style={{
                      ...buttonStyle,
                      opacity: paginaActual === totalPaginas ? 0.4 : 1,
                      cursor: paginaActual === totalPaginas ? 'not-allowed' : 'pointer'
                    }}
                  >
                    ›
                  </button>
                  <button
                    onClick={() => setPaginaActual(totalPaginas)}
                    disabled={paginaActual === totalPaginas}
                    style={{
                      ...buttonStyle,
                      opacity: paginaActual === totalPaginas ? 0.4 : 1,
                      cursor: paginaActual === totalPaginas ? 'not-allowed' : 'pointer'
                    }}
                  >
                    ⟫
                  </button>
                </div>

                {/* Selector de items */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '0.9rem',
                  color: '#64748b'
                }}>
                  <label>Mostrar:</label>
                  <select
                    value={itemsPorPagina}
                    onChange={(e) => {
                      setItemsPorPagina(Number(e.target.value));
                      setPaginaActual(1);
                    }}
                    style={{
                      padding: '6px 10px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      fontSize: '0.9rem',
                      background: '#f8fafc',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span>por página</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Estilos reutilizables
const buttonStyle: React.CSSProperties = {
  background: '#f8fafc',
  border: '1px solid #cbd5e1',
  borderRadius: '6px',
  padding: '8px 12px',
  fontSize: '1.2rem',
  fontWeight: '600',
  color: '#475569',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  minWidth: '40px'
};

export default TrabajadoresPage;