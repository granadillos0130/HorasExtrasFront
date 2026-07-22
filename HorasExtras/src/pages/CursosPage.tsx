import React, { useState, useEffect } from 'react';
import { cursosService } from '../api/cursoService';
import { CursosForm } from '../components/curso/CursoForm';
import type { Curso } from '../types/curso';

export const CursosPage: React.FC = () => {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCurso, setEditingCurso] = useState<Curso | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    cargarCursos();
  }, []);

  const cargarCursos = async () => {
    try {
      setLoading(true);
      const data = await cursosService.getAll();
      setCursos(data);
    } catch (error) {
      console.error('Error al cargar cursos:', error);
    } finally {
      setLoading(false);
    }
  };

  const buscarCursos = async () => {
    if (!searchTerm.trim()) {
      cargarCursos();
      return;
    }
    
    try {
      setLoading(true);
      const data = await cursosService.buscarPorNombre(searchTerm);
      setCursos(data);
    } catch (error) {
      console.error('Error al buscar cursos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCrear = () => {
    setEditingCurso(null);
    setShowForm(true);
  };

  const handleEditar = (curso: Curso) => {
    setEditingCurso(curso);
    setShowForm(true);
  };

  const handleEliminar = async (id: number) => {
    try {
      await cursosService.eliminar(id);
      await cargarCursos();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error al eliminar curso:', error);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingCurso(null);
    cargarCursos();
  };

  // Filtro client-side intencional: filtra en vivo mientras se escribe, sobre
  // la última lista cargada (todos los cursos o el resultado de buscarCursos).
  // La búsqueda real contra el backend (buscarCursos) solo se dispara al
  // presionar Enter o el botón de buscar; este filtro no la reemplaza.
  const cursosFiltrados = cursos.filter(curso =>
    curso.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (curso.descripcion && curso.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      buscarCursos();
    }
  };

  // ESTILOS INTEGRADOS
  const styles = {
    page: {
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      padding: '1.5rem'
    },
    container: {
      maxWidth: '1400px',
      margin: '0 auto'
    },
    header: {
      marginBottom: '2rem'
    },
    headerContent: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap' as const,
      gap: '1rem'
    },
    headerInfo: {
      display: 'flex',
      flexDirection: 'column' as const
    },
    title: {
      fontSize: '1.875rem',
      fontWeight: '700',
      color: '#111827',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      margin: '0 0 0.5rem 0'
    },
    subtitle: {
      color: '#6b7280',
      margin: '0',
      fontSize: '1rem'
    },
    btnNuevo: {
      backgroundColor: '#2563eb',
      color: 'white',
      padding: '0.5rem 1rem',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontWeight: '600',
      transition: 'all 0.2s ease'
    },
    searchContainer: {
      background: 'white',
      borderRadius: '0.5rem',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      padding: '1.5rem',
      marginBottom: '1.5rem'
    },
    searchForm: {
      display: 'flex',
      gap: '1rem',
      flexWrap: 'wrap' as const
    },
    searchInputContainer: {
      flex: '1',
      position: 'relative' as const,
      minWidth: '250px'
    },
    searchIcon: {
      position: 'absolute' as const,
      left: '0.75rem',
      top: '0.75rem',
      color: '#9ca3af',
      fontSize: '1rem',
      pointerEvents: 'none' as const
    },
    searchInput: {
      width: '100%',
      padding: '0.5rem 1rem 0.5rem 2.5rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      fontSize: '0.875rem',
      transition: 'all 0.2s ease',
      boxSizing: 'border-box' as const
    },
    btnSearch: {
      backgroundColor: '#4b5563',
      color: 'white',
      padding: '0.5rem 1.5rem',
      border: 'none',
      borderRadius: '0.375rem',
      cursor: 'pointer',
      fontWeight: '600',
      transition: 'background-color 0.2s ease'
    },
    btnClear: {
      backgroundColor: '#d1d5db',
      color: '#374151',
      padding: '0.5rem 1rem',
      border: 'none',
      borderRadius: '0.375rem',
      cursor: 'pointer',
      fontWeight: '600',
      transition: 'background-color 0.2s ease'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1.5rem',
      marginBottom: '1.5rem'
    },
    statCard: {
      background: 'white',
      borderRadius: '0.5rem',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      padding: '1.5rem'
    },
    statContent: {
      display: 'flex',
      alignItems: 'center'
    },
    statIcon: {
      padding: '0.5rem',
      borderRadius: '0.5rem',
      fontSize: '1.5rem',
      marginRight: '1rem'
    },
    statIconBlue: {
      backgroundColor: '#dbeafe'
    },
    statIconGreen: {
      backgroundColor: '#d1fae5'
    },
    statIconPurple: {
      backgroundColor: '#ede9fe'
    },
    statInfo: {
      display: 'flex',
      flexDirection: 'column' as const
    },
    statLabel: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#6b7280',
      margin: '0'
    },
    statValue: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: '#111827',
      margin: '0.25rem 0 0 0'
    },
    tableContainer: {
      background: 'white',
      borderRadius: '0.5rem',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden'
    },
    tableHeader: {
      padding: '1.5rem',
      borderBottom: '1px solid #e5e7eb'
    },
    tableTitle: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#111827',
      margin: '0'
    },
    tableWrapper: {
      overflowX: 'auto' as const
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse' as const
    },
    th: {
      padding: '0.75rem 1.5rem',
      textAlign: 'left' as const,
      fontSize: '0.75rem',
      fontWeight: '500',
      color: '#6b7280',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
      borderBottom: '1px solid #e5e7eb',
      backgroundColor: '#f9fafb'
    },
    thActions: {
      padding: '0.75rem 1.5rem',
      textAlign: 'right' as const,
      fontSize: '0.75rem',
      fontWeight: '500',
      color: '#6b7280',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
      borderBottom: '1px solid #e5e7eb',
      backgroundColor: '#f9fafb'
    },
    tr: {
      borderBottom: '1px solid #e5e7eb',
      transition: 'background-color 0.2s ease'
    },
    td: {
      padding: '1rem 1.5rem',
      fontSize: '0.875rem'
    },
    cursoId: {
      fontWeight: '500',
      color: '#111827'
    },
    cursoNombre: {
      fontWeight: '500',
      color: '#111827'
    },
    cursoDescripcion: {
      color: '#6b7280',
      maxWidth: '300px',
      whiteSpace: 'nowrap' as const,
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },
    actionsContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: '0.5rem'
    },
    btnAction: {
      padding: '0.25rem',
      border: 'none',
      background: 'transparent',
      borderRadius: '0.25rem',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontSize: '1.125rem'
    },
    loadingContainer: {
      padding: '2rem',
      textAlign: 'center' as const
    },
    spinner: {
      border: '2px solid #f3f4f6',
      borderTop: '2px solid #3b82f6',
      borderRadius: '50%',
      width: '3rem',
      height: '3rem',
      animation: 'spin 1s linear infinite',
      margin: '0 auto'
    },
    loadingText: {
      color: '#6b7280',
      marginTop: '1rem',
      fontSize: '0.875rem'
    },
    emptyContainer: {
      padding: '2rem',
      textAlign: 'center' as const
    },
    emptyIcon: {
      fontSize: '4rem',
      marginBottom: '1rem'
    },
    emptyTitle: {
      fontSize: '1.125rem',
      fontWeight: '500',
      color: '#111827',
      margin: '0 0 0.5rem 0'
    },
    emptyDescription: {
      color: '#6b7280',
      margin: '0 0 1rem 0'
    },
    btnCreateEmpty: {
      backgroundColor: '#2563eb',
      color: 'white',
      padding: '0.5rem 1rem',
      border: 'none',
      borderRadius: '0.375rem',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontWeight: '600',
      transition: 'background-color 0.2s ease'
    },
    modalOverlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      padding: '1rem'
    },
    modalContainer: {
      background: 'white',
      borderRadius: '0.5rem',
      padding: '1.5rem',
      maxWidth: '28rem',
      width: '100%'
    },
    modalHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      color: '#dc2626',
      marginBottom: '1rem'
    },
    modalTitle: {
      fontSize: '1.125rem',
      fontWeight: '600',
      margin: '0'
    },
    modalContent: {
      color: '#6b7280',
      marginBottom: '1.5rem',
      lineHeight: 1.5
    },
    modalActions: {
      display: 'flex',
      gap: '0.75rem',
      justifyContent: 'flex-end'
    },
    btnCancel: {
      padding: '0.5rem 1rem',
      color: '#6b7280',
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '500',
      transition: 'color 0.2s ease'
    },
    btnDelete: {
      backgroundColor: '#dc2626',
      color: 'white',
      padding: '0.5rem 1rem',
      border: 'none',
      borderRadius: '0.375rem',
      cursor: 'pointer',
      fontWeight: '600',
      transition: 'background-color 0.2s ease'
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <div style={styles.headerInfo}>
              <h1 style={styles.title}>
                <span>📚</span>
                Gestión de Cursos
              </h1>
              <p style={styles.subtitle}>
                Administra los cursos de capacitación disponibles
              </p>
            </div>
            <button 
              onClick={handleCrear} 
              style={styles.btnNuevo}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#1d4ed8';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(37, 99, 235, 0.3)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#2563eb';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span>➕</span>
              Nuevo Curso
            </button>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div style={styles.searchContainer}>
          <div style={styles.searchForm}>
            <div style={styles.searchInputContainer}>
              <span style={styles.searchIcon}>🔍</span>
              <input
                type="text"
                placeholder="Buscar cursos por nombre o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                style={styles.searchInput}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <button 
              onClick={buscarCursos} 
              style={styles.btnSearch}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#374151'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
            >
              Buscar
            </button>
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  cargarCursos();
                }}
                style={styles.btnClear}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#9ca3af'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#d1d5db'}
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Estadísticas */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statContent}>
              <div style={{...styles.statIcon, ...styles.statIconBlue}}>
                <span>📚</span>
              </div>
              <div style={styles.statInfo}>
                <p style={styles.statLabel}>Total Cursos</p>
                <p style={styles.statValue}>{cursos.length}</p>
              </div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statContent}>
              <div style={{...styles.statIcon, ...styles.statIconPurple}}>
                <span>🔍</span>
              </div>
              <div style={styles.statInfo}>
                <p style={styles.statLabel}>Resultados</p>
                <p style={styles.statValue}>{cursosFiltrados.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de cursos */}
        <div style={styles.tableContainer}>
          <div style={styles.tableHeader}>
            <h2 style={styles.tableTitle}>
              Lista de Cursos ({cursosFiltrados.length})
            </h2>
          </div>

          {loading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner}></div>
              <p style={styles.loadingText}>Cargando cursos...</p>
            </div>
          ) : cursosFiltrados.length === 0 ? (
            <div style={styles.emptyContainer}>
              <div style={styles.emptyIcon}>📚</div>
              <h3 style={styles.emptyTitle}>No hay cursos</h3>
              <p style={styles.emptyDescription}>
                {searchTerm ? 'No se encontraron cursos que coincidan con tu búsqueda.' : 'Comienza creando tu primer curso.'}
              </p>
              {!searchTerm && (
                <button 
                  onClick={handleCrear} 
                  style={styles.btnCreateEmpty}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                >
                  <span>➕</span>
                  Crear Curso
                </button>
              )}
            </div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Nombre</th>
                    <th style={styles.th}>Descripción</th>
                    <th style={styles.thActions}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {cursosFiltrados.map((curso) => (
                    <tr 
                      key={curso.id} 
                      style={styles.tr}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={styles.td}>
                        <div style={styles.cursoId}>#{curso.id}</div>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.cursoNombre}>{curso.nombre}</div>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.cursoDescripcion}>
                          {curso.descripcion || 'Sin descripción'}
                        </div>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.actionsContainer}>
                          <button
                            onClick={() => handleEditar(curso)}
                            style={styles.btnAction}
                            title="Editar curso"
                            onMouseOver={(e) => {
                              e.currentTarget.style.backgroundColor = '#dbeafe';
                              e.currentTarget.style.color = '#1d4ed8';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = 'inherit';
                            }}
                          >
                            <span>✏️</span>
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(curso.id)}
                            style={styles.btnAction}
                            title="Eliminar curso"
                            onMouseOver={(e) => {
                              e.currentTarget.style.backgroundColor = '#fee2e2';
                              e.currentTarget.style.color = '#dc2626';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = 'inherit';
                            }}
                          >
                            <span>🗑️</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de formulario */}
      {showForm && (
        <CursosForm
          curso={editingCurso}
          onSuccess={handleFormSuccess}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Modal de confirmación de eliminación */}
      {deleteConfirm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContainer}>
            <div style={styles.modalHeader}>
              <span>🗑️</span>
              <h3 style={styles.modalTitle}>Confirmar Eliminación</h3>
            </div>
            <p style={styles.modalContent}>
              ¿Estás seguro de que deseas eliminar este curso? Esta acción no se puede deshacer.
            </p>
            <div style={styles.modalActions}>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={styles.btnCancel}
                onMouseOver={(e) => e.currentTarget.style.color = '#374151'}
                onMouseOut={(e) => e.currentTarget.style.color = '#6b7280'}
              >
                Cancelar
              </button>
              <button
                onClick={() => handleEliminar(deleteConfirm)}
                style={styles.btnDelete}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};