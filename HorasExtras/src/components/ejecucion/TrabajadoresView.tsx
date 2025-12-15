// TrabajadoresView.tsx - Versión Ejecutiva con Resumen en Footer
import React, { useState } from 'react';
import type { TrabajadorInfo, TrabajadorManoObra, ManoObraData } from '../../types/ejecucion';
import { formatearMoneda } from '../../utils/formatters';
import { ExcelExportService } from '../../api/excelExportService';

interface TrabajadoresViewProps {
  centroNombre: string;
  mesNombre: string;
  año: number;
  trabajadores: TrabajadorInfo[];
  trabajadoresManoObra: TrabajadorManoObra[];
  manoObraData: ManoObraData | null;
  loading: boolean;
  onVolver: () => void;
  onVerDetalle: (trabajadorId: number) => void;
}

const TrabajadoresView: React.FC<TrabajadoresViewProps> = ({
  centroNombre,
  mesNombre,
  año,
  trabajadores,
  trabajadoresManoObra,
  manoObraData,
  loading,
  onVolver,
  onVerDetalle
}) => {
  // Estados de paginación
  const [paginaActual, setPaginaActual] = useState<number>(1);
  const [itemsPorPagina, setItemsPorPagina] = useState<number>(15);

  // Calcular paginación
  const totalPaginas = Math.ceil(trabajadores.length / itemsPorPagina);
  const trabajadoresPaginados = trabajadores.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  );

  const exportarExcel = () => {
    ExcelExportService.exportarTrabajadores(
      trabajadores,
      trabajadoresManoObra,
      centroNombre,
      manoObraData?.centroId || '',
      mesNombre,
      año,
      manoObraData?.manoObraTotal
    );
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
          <button 
            onClick={onVolver}
            style={{
              marginBottom: '20px',
              padding: '10px 20px',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              background: '#ffffff',
              color: '#475569',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: '600',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#f1f5f9'}
            onMouseOut={(e) => e.currentTarget.style.background = '#ffffff'}
          >
            ← Volver a Estadísticas
          </button>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '15px'
          }}>
            <div>
              <h1 style={{
                fontSize: '1.8rem',
                color: '#1e293b',
                marginBottom: '8px',
                fontWeight: '700'
              }}>
                {centroNombre} - {mesNombre} {año}
              </h1>
              <p style={{
                fontSize: '1.1rem',
                color: '#64748b',
                margin: 0,
                fontWeight: '500'
              }}>
                Listado de Trabajadores
              </p>
            </div>
            
            {trabajadores.length > 0 && (
              <button 
                onClick={exportarExcel}
                style={{
                  background: '#059669',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  transition: 'background 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#047857'}
                onMouseOut={(e) => e.currentTarget.style.background = '#059669'}
              >
                Exportar Excel
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div style={{
            background: 'white',
            borderRadius: '8px',
            padding: '60px',
            textAlign: 'center',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              fontSize: '1.1rem',
              color: '#64748b',
              fontWeight: '500'
            }}>
              Cargando información...
            </div>
          </div>
        ) : (
          <>
            {/* Tabla de Trabajadores */}
            <div style={{
              background: 'white',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e2e8f0',
              overflow: 'hidden'
            }}>
              {/* Título de la tabla */}
              <div style={{
                padding: '20px 25px',
                borderBottom: '2px solid #e2e8f0',
                background: '#f8fafc'
              }}>
                <h2 style={{
                  margin: 0,
                  fontSize: '1.2rem',
                  fontWeight: '700',
                  color: '#1e293b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Trabajadores del Mes
                </h2>
              </div>

              {trabajadores.length > 0 ? (
                <>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: '0.9rem'
                    }}>
                      <thead>
                        <tr style={{
                          background: '#f8fafc',
                          borderBottom: '2px solid #e2e8f0'
                        }}>
                          <th style={{ ...headerCellStyle, width: '100px' }}>ID</th>
                          <th style={{ ...headerCellStyle, minWidth: '250px' }}>NOMBRE</th>
                          <th style={headerCellStyle}>CARGO</th>
                          <th style={headerCellStyle}>MANO DE OBRA</th>
                          <th style={{ ...headerCellStyle, width: '120px' }}>ACCIONES</th>
                        </tr>
                      </thead>
                      <tbody>
                        {trabajadoresPaginados.map((trabajador) => {
                          const manoObra = trabajadoresManoObra.find(mo => mo.trabajadorId === trabajador.trabajadorId);
                          return (
                            <tr
                              key={trabajador.trabajadorId}
                              style={{
                                borderBottom: '1px solid #e2e8f0',
                                transition: 'background 0.2s ease'
                              }}
                              onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
                              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              <td style={{ ...cellStyle, fontFamily: 'monospace', fontWeight: '600', color: '#64748b' }}>
                                {trabajador.trabajadorId}
                              </td>
                              <td style={{ ...cellStyle, fontWeight: '600', color: '#1e293b' }}>
                                {trabajador.nombre}
                              </td>
                              <td style={cellStyle}>
                                {trabajador.cargo ? (
                                  <span style={{
                                    background: '#eff6ff',
                                    color: '#1e40af',
                                    padding: '4px 10px',
                                    borderRadius: '6px',
                                    fontSize: '0.85rem',
                                    fontWeight: '600'
                                  }}>
                                    {trabajador.cargo}
                                  </span>
                                ) : (
                                  <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No especificado</span>
                                )}
                              </td>
                              <td style={{ ...cellStyle, textAlign: 'right', fontWeight: '600', color: '#059669' }}>
                                {manoObra ? formatearMoneda(manoObra.manoObraTotal) : '—'}
                              </td>
                              <td style={{ ...cellStyle, textAlign: 'center' }}>
                                <button
                                  onClick={() => onVerDetalle(trabajador.trabajadorId)}
                                  style={{
                                    background: '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    fontWeight: '600',
                                    transition: 'background 0.2s ease'
                                  }}
                                  onMouseOver={(e) => e.currentTarget.style.background = '#2563eb'}
                                  onMouseOut={(e) => e.currentTarget.style.background = '#3b82f6'}
                                >
                                  Ver Detalle
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Footer con Resumen */}
                  {manoObraData && (
                    <div style={{
                      borderTop: '3px solid #e2e8f0',
                      background: '#f8fafc',
                      padding: '20px 25px'
                    }}>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '20px',
                        marginBottom: '20px'
                      }}>
                        {/* Total Trabajadores */}
                        <div style={{
                          padding: '15px',
                          background: 'white',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0'
                        }}>
                          <div style={{
                            fontSize: '0.8rem',
                            color: '#64748b',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: '8px'
                          }}>
                            Total Trabajadores
                          </div>
                          <div style={{
                            fontSize: '1.5rem',
                            color: '#1e40af',
                            fontWeight: '700'
                          }}>
                            {trabajadores.length}
                          </div>
                        </div>

                        {/* Mano de Obra Total */}
                        <div style={{
                          padding: '15px',
                          background: 'white',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0'
                        }}>
                          <div style={{
                            fontSize: '0.8rem',
                            color: '#64748b',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: '8px'
                          }}>
                            Mano de Obra Total
                          </div>
                          <div style={{
                            fontSize: '1.5rem',
                            color: '#059669',
                            fontWeight: '700'
                          }}>
                            {formatearMoneda(manoObraData.manoObraTotal)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Paginación */}
                  {trabajadores.length > 0 && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '20px 25px',
                      borderTop: '1px solid #e2e8f0',
                      background: '#f1f5f9',
                      flexWrap: 'wrap',
                      gap: '15px'
                    }}>
                      {/* Información de registros */}
                      <div style={{
                        fontSize: '0.9rem',
                        color: '#64748b',
                        fontWeight: '500'
                      }}>
                        Mostrando <strong style={{ color: '#1e40af' }}>{(paginaActual - 1) * itemsPorPagina + 1}</strong> a{' '}
                        <strong style={{ color: '#1e40af' }}>{Math.min(paginaActual * itemsPorPagina, trabajadores.length)}</strong> de{' '}
                        <strong style={{ color: '#1e40af' }}>{trabajadores.length}</strong> trabajador{trabajadores.length !== 1 ? 'es' : ''}
                      </div>

                      {/* Controles de navegación */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}>
                        {/* Botón Primera Página */}
                        <button
                          onClick={() => setPaginaActual(1)}
                          disabled={paginaActual === 1}
                          style={{
                            ...buttonStyle,
                            opacity: paginaActual === 1 ? 0.4 : 1,
                            cursor: paginaActual === 1 ? 'not-allowed' : 'pointer'
                          }}
                          title="Primera página"
                        >
                          ⟪
                        </button>

                        {/* Botón Página Anterior */}
                        <button
                          onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))}
                          disabled={paginaActual === 1}
                          style={{
                            ...buttonStyle,
                            opacity: paginaActual === 1 ? 0.4 : 1,
                            cursor: paginaActual === 1 ? 'not-allowed' : 'pointer'
                          }}
                          title="Página anterior"
                        >
                          ‹
                        </button>

                        {/* Indicador de página actual */}
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

                        {/* Botón Página Siguiente */}
                        <button
                          onClick={() => setPaginaActual(Math.min(totalPaginas, paginaActual + 1))}
                          disabled={paginaActual === totalPaginas}
                          style={{
                            ...buttonStyle,
                            opacity: paginaActual === totalPaginas ? 0.4 : 1,
                            cursor: paginaActual === totalPaginas ? 'not-allowed' : 'pointer'
                          }}
                          title="Página siguiente"
                        >
                          ›
                        </button>

                        {/* Botón Última Página */}
                        <button
                          onClick={() => setPaginaActual(totalPaginas)}
                          disabled={paginaActual === totalPaginas}
                          style={{
                            ...buttonStyle,
                            opacity: paginaActual === totalPaginas ? 0.4 : 1,
                            cursor: paginaActual === totalPaginas ? 'not-allowed' : 'pointer'
                          }}
                          title="Última página"
                        >
                          ⟫
                        </button>
                      </div>

                      {/* Selector de items por página */}
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
                            setPaginaActual(1); // Reset a página 1
                          }}
                          style={{
                            padding: '6px 10px',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            fontSize: '0.9rem',
                            background: 'white',
                            cursor: 'pointer',
                            fontWeight: '500'
                          }}
                        >
                          <option value={10}>10</option>
                          <option value={15}>15</option>
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                        </select>
                        <span>por página</span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: '#64748b'
                }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    margin: '0 auto 20px',
                    background: '#f1f5f9',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: '#cbd5e1',
                      borderRadius: '8px'
                    }} />
                  </div>
                  <h3 style={{
                    fontSize: '1.2rem',
                    marginBottom: '10px',
                    color: '#475569',
                    fontWeight: '600'
                  }}>
                    No hay trabajadores registrados
                  </h3>
                  <p style={{
                    fontSize: '0.95rem',
                    margin: 0,
                    color: '#64748b'
                  }}>
                    No se encontraron trabajadores para este mes.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Estilos reutilizables
const headerCellStyle: React.CSSProperties = {
  padding: '15px 20px',
  textAlign: 'left',
  fontSize: '0.8rem',
  fontWeight: '700',
  color: '#475569',
  letterSpacing: '0.05em',
  textTransform: 'uppercase'
};

const cellStyle: React.CSSProperties = {
  padding: '15px 20px',
  fontSize: '0.9rem',
  color: '#334155'
};

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

export default TrabajadoresView;