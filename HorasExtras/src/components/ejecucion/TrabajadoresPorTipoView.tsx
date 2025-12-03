// TrabajadoresPorTipoView.tsx - Versión Ejecutiva con Tablas y Paginación
import React, { useState } from 'react';
import type { TrabajadoresPorTipoHora, TipoHora } from '../../types/centros';
import { formatearHoras, formatearMoneda, formatearFecha } from '../../utils/formatters';
import { TIPOS_HORAS_CONFIG } from '../../constants/tiposHoras';
import { ExcelExportService } from '../../api/excelExportService';

interface TrabajadoresPorTipoViewProps {
  centroNombre: string;
  mesNombre: string;
  año: number;
  trabajadoresPorTipo: TrabajadoresPorTipoHora | null;
  tipoHora: TipoHora;
  loading: boolean;
  onVolver: () => void;
  onVerDetalle: (trabajadorId: number) => void;
}

const TrabajadoresPorTipoView: React.FC<TrabajadoresPorTipoViewProps> = ({
  centroNombre,
  mesNombre,
  año,
  trabajadoresPorTipo,
  tipoHora,
  loading,
  onVolver,
  onVerDetalle
}) => {
  const config = TIPOS_HORAS_CONFIG[tipoHora];

  // Estados de paginación
  const [paginaActual, setPaginaActual] = useState<number>(1);
  const [itemsPorPagina, setItemsPorPagina] = useState<number>(15);
  
  // Estado para filas expandidas
  const [filasExpandidas, setFilasExpandidas] = useState<Set<number>>(new Set());

  const toggleFila = (trabajadorId: number) => {
    const nuevasExpandidas = new Set(filasExpandidas);
    if (nuevasExpandidas.has(trabajadorId)) {
      nuevasExpandidas.delete(trabajadorId);
    } else {
      nuevasExpandidas.add(trabajadorId);
    }
    setFilasExpandidas(nuevasExpandidas);
  };

  const exportarExcel = () => {
    if (trabajadoresPorTipo) {
      ExcelExportService.exportarTrabajadoresPorTipo(
        trabajadoresPorTipo,
        tipoHora,
        centroNombre,
        mesNombre,
        año
      );
    }
  };

  // Calcular paginación
  const trabajadores = trabajadoresPorTipo?.trabajadores || [];
  const totalPaginas = Math.ceil(trabajadores.length / itemsPorPagina);
  const trabajadoresPaginados = trabajadores.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  );

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
                {config.nombre.toUpperCase()}
              </h1>
              <p style={{
                fontSize: '1.1rem',
                color: '#64748b',
                margin: 0,
                fontWeight: '500'
              }}>
                {centroNombre} - {mesNombre} {año}
              </p>
              <p style={{
                fontSize: '0.9rem',
                color: '#94a3b8',
                marginTop: '5px'
              }}>
                {config.descripcion}
              </p>
            </div>
            
            {trabajadoresPorTipo && trabajadores.length > 0 && (
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
              Cargando trabajadores...
            </div>
          </div>
        ) : trabajadoresPorTipo ? (
          <>
            {/* Tabla de Resumen */}
            <div style={{
              background: 'white',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              marginBottom: '25px'
            }}>
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
                  Resumen de {config.nombre}
                </h2>
              </div>

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
                      <th style={headerCellStyle}>CONCEPTO</th>
                      <th style={headerCellStyle}>VALOR</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={labelCellStyle}>Total Trabajadores</td>
                      <td style={{ ...valueCellStyle, color: '#1e40af', fontWeight: '700', fontSize: '1.1rem' }}>
                        {trabajadoresPorTipo.totalTrabajadores}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={labelCellStyle}>Total Horas Trabajadas</td>
                      <td style={{ ...valueCellStyle, color: '#1e40af', fontWeight: '700', fontSize: '1.1rem' }}>
                        {formatearHoras(trabajadoresPorTipo.totalHoras)}
                      </td>
                    </tr>
                    <tr>
                      <td style={labelCellStyle}>Mano de Obra Total</td>
                      <td style={{ ...valueCellStyle, color: '#059669', fontWeight: '700', fontSize: '1.1rem' }}>
                        {formatearMoneda(trabajadoresPorTipo.totalManoObra)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tabla de Trabajadores */}
            <div style={{
              background: 'white',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e2e8f0',
              overflow: 'hidden'
            }}>
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
                  Detalle de Trabajadores
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
                          <th style={{ ...headerCellStyle, width: '80px' }}></th>
                          <th style={{ ...headerCellStyle, width: '100px' }}>ID</th>
                          <th style={{ ...headerCellStyle, minWidth: '200px' }}>NOMBRE</th>
                          <th style={headerCellStyle}>CARGO</th>
                          <th style={headerCellStyle}>HORAS</th>
                          <th style={headerCellStyle}>DÍAS</th>
                          <th style={headerCellStyle}>MANO DE OBRA</th>
                          <th style={{ ...headerCellStyle, width: '140px' }}>ACCIONES</th>
                        </tr>
                      </thead>
                      <tbody>
                        {trabajadoresPaginados.map((trabajador) => {
                          const expandida = filasExpandidas.has(trabajador.trabajadorId);
                          
                          return (
                            <React.Fragment key={trabajador.trabajadorId}>
                              {/* Fila principal */}
                              <tr
                                style={{
                                  borderBottom: expandida ? 'none' : '1px solid #e2e8f0',
                                  transition: 'background 0.2s ease'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                              >
                                <td style={{ ...cellStyle, textAlign: 'center' }}>
                                  <button
                                    onClick={() => toggleFila(trabajador.trabajadorId)}
                                    style={{
                                      background: 'transparent',
                                      border: 'none',
                                      cursor: 'pointer',
                                      fontSize: '1.2rem',
                                      color: '#64748b',
                                      padding: '4px 8px',
                                      transition: 'color 0.2s ease'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.color = '#1e40af'}
                                    onMouseOut={(e) => e.currentTarget.style.color = '#64748b'}
                                    title={expandida ? 'Ocultar detalle' : 'Ver detalle por fechas'}
                                  >
                                    {expandida ? '▼' : '▶'}
                                  </button>
                                </td>
                                <td style={{ ...cellStyle, fontFamily: 'monospace', fontWeight: '600', color: '#64748b' }}>
                                  {trabajador.trabajadorId}
                                </td>
                                <td style={{ ...cellStyle, fontWeight: '600', color: '#1e293b' }}>
                                  {trabajador.nombreTrabajador}
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
                                <td style={{ ...cellStyle, textAlign: 'center', fontWeight: '600', color: '#1e40af' }}>
                                  {formatearHoras(trabajador.totalHoras)}
                                </td>
                                <td style={{ ...cellStyle, textAlign: 'center' }}>
                                  <span style={{
                                    background: '#f0f9ff',
                                    color: '#0369a1',
                                    padding: '4px 10px',
                                    borderRadius: '6px',
                                    fontSize: '0.85rem',
                                    fontWeight: '600'
                                  }}>
                                    {trabajador.totalDias}
                                  </span>
                                </td>
                                <td style={{ ...cellStyle, textAlign: 'right', fontWeight: '600', color: '#059669' }}>
                                  {formatearMoneda(trabajador.manoObra)}
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

                              {/* Fila expandida con detalle por fechas */}
                              {expandida && (
                                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                                  <td colSpan={8} style={{ padding: 0 }}>
                                    <div style={{
                                      background: '#f8fafc',
                                      padding: '20px 25px'
                                    }}>
                                      <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '15px'
                                      }}>
                                        <h4 style={{
                                          margin: 0,
                                          fontSize: '0.95rem',
                                          fontWeight: '600',
                                          color: '#475569',
                                          textTransform: 'uppercase',
                                          letterSpacing: '0.05em'
                                        }}>
                                          Detalle por Fechas ({trabajador.detalles.length} registros)
                                        </h4>
                                        <div style={{
                                          fontSize: '0.85rem',
                                          color: '#64748b'
                                        }}>
                                          Valor hora: <strong>{formatearMoneda(trabajador.valorHora)}</strong> × <strong>{trabajador.multiplicador}</strong>
                                        </div>
                                      </div>

                                      <div style={{
                                        background: 'white',
                                        borderRadius: '8px',
                                        border: '1px solid #e2e8f0',
                                        overflow: 'hidden',
                                        maxHeight: '300px',
                                        overflowY: 'auto'
                                      }}>
                                        <table style={{
                                          width: '100%',
                                          borderCollapse: 'collapse',
                                          fontSize: '0.85rem'
                                        }}>
                                          <thead>
                                            <tr style={{
                                              background: '#f8fafc',
                                              borderBottom: '1px solid #e2e8f0',
                                              position: 'sticky',
                                              top: 0
                                            }}>
                                              <th style={{ ...subHeaderCellStyle, textAlign: 'left' }}>FECHA</th>
                                              <th style={{ ...subHeaderCellStyle, textAlign: 'right' }}>HORAS</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {trabajador.detalles.map((detalle, index) => (
                                              <tr
                                                key={index}
                                                style={{
                                                  borderBottom: index < trabajador.detalles.length - 1 ? '1px solid #f1f5f9' : 'none'
                                                }}
                                              >
                                                <td style={subCellStyle}>
                                                  {formatearFecha(detalle.fecha)}
                                                </td>
                                                <td style={{ ...subCellStyle, textAlign: 'right', fontWeight: '600', color: '#1e40af' }}>
                                                  {formatearHoras(detalle.horas)}
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Paginación */}
                  {trabajadores.length > 0 && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '20px 25px',
                      borderTop: '1px solid #e2e8f0',
                      background: '#f8fafc',
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
                          title="Página siguiente"
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
                    No se encontraron trabajadores para este tipo de hora.
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{
            background: 'white',
            borderRadius: '8px',
            padding: '60px',
            textAlign: 'center',
            border: '1px solid #e2e8f0'
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
              No se pudieron cargar los datos
            </h3>
            <p style={{
              fontSize: '0.95rem',
              margin: 0,
              color: '#64748b'
            }}>
              Intente nuevamente o contacte al administrador.
            </p>
          </div>
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

const labelCellStyle: React.CSSProperties = {
  padding: '15px 20px',
  fontSize: '0.9rem',
  color: '#64748b',
  fontWeight: '600'
};

const valueCellStyle: React.CSSProperties = {
  padding: '15px 20px',
  fontSize: '0.9rem',
  color: '#1e293b',
  fontWeight: '500'
};

const subHeaderCellStyle: React.CSSProperties = {
  padding: '10px 15px',
  fontSize: '0.75rem',
  fontWeight: '700',
  color: '#475569',
  letterSpacing: '0.05em',
  textTransform: 'uppercase'
};

const subCellStyle: React.CSSProperties = {
  padding: '10px 15px',
  fontSize: '0.85rem',
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

export default TrabajadoresPorTipoView;