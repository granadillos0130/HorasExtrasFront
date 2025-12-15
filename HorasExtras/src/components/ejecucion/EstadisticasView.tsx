// EstadisticasView.tsx - Versión Ejecutiva con Resumen en Footer
import React from 'react';
import type { EstadisticasMes, TipoHora } from '../../types/centros';
import { formatearHoras, formatearMoneda, formatearFecha } from '../../utils/formatters';
import { TIPOS_HORAS_CONFIG } from '../../constants/tiposHoras';

interface EstadisticasViewProps {
  centroNombre: string;
  mesNombre: string;
  año: number;
  estadisticasMes: EstadisticasMes | null;
  loading: boolean;
  onVolver: () => void;
  onVerTrabajadores: () => void;
  onVerTrabajadoresPorTipo: (tipoHora: TipoHora) => void;
}

const EstadisticasView: React.FC<EstadisticasViewProps> = ({
  centroNombre,
  mesNombre,
  año,
  estadisticasMes,
  loading,
  onVolver,
  onVerTrabajadores,
  onVerTrabajadoresPorTipo
}) => {
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
            ← Volver a Meses
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
                ESTADÍSTICAS DETALLADAS - {mesNombre} {año}
              </h1>
              <p style={{
                fontSize: '1.1rem',
                color: '#64748b',
                margin: 0,
                fontWeight: '500'
              }}>
                Centro: {centroNombre}
              </p>
            </div>
            
            <button 
              onClick={onVerTrabajadores}
              style={{
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: '600',
                transition: 'background 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#2563eb'}
              onMouseOut={(e) => e.currentTarget.style.background = '#3b82f6'}
            >
              Ver Todos los Trabajadores
            </button>
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
              Cargando estadísticas...
            </div>
          </div>
        ) : estadisticasMes ? (
          <>
            {/* Tabla de Desglose por Tipo de Hora */}
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
                  Desglose por Tipo de Hora
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
                      <th style={{ ...headerCellStyle, minWidth: '200px' }}>TIPO DE HORA</th>
                      <th style={headerCellStyle}>DESCRIPCIÓN</th>
                      <th style={headerCellStyle}>TOTAL HORAS</th>
                      <th style={headerCellStyle}>TRABAJADORES</th>
                      <th style={headerCellStyle}>MANO DE OBRA</th>
                      <th style={{ ...headerCellStyle, width: '100px' }}>ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(estadisticasMes.estadisticasPorTipo).map(([key, stats]) => {
                      const tipoKey = key === 'horasNormales' ? 'normales' : 
                                     key === 'extrasDiurnas' ? 'extrasdiurnas' :
                                     key === 'extrasNocturnas' ? 'extrasnocturnas' :
                                     key === 'dominicalesDiurnas' ? 'dominicalesdiurnas' :
                                     key === 'dominicalesNocturnas' ? 'dominicalesnocturnas' : 'normales';
                      
                      const config = TIPOS_HORAS_CONFIG[tipoKey as TipoHora];
                      const tieneHoras = stats.totalHoras > 0;

                      return (
                        <tr
                          key={key}
                          style={{
                            borderBottom: '1px solid #e2e8f0',
                            cursor: tieneHoras ? 'pointer' : 'default',
                            background: tieneHoras ? 'transparent' : '#f9fafb',
                            opacity: tieneHoras ? 1 : 0.6,
                            transition: 'background 0.2s ease'
                          }}
                          onClick={() => tieneHoras && onVerTrabajadoresPorTipo(tipoKey as TipoHora)}
                          onMouseOver={(e) => {
                            if (tieneHoras) e.currentTarget.style.background = '#f8fafc';
                          }}
                          onMouseOut={(e) => {
                            if (tieneHoras) e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          <td style={{ ...cellStyle, fontWeight: '600', color: '#1e293b' }}>
                            {config.nombre}
                          </td>
                          <td style={{ ...cellStyle, fontSize: '0.85rem', color: '#64748b' }}>
                            {config.descripcion}
                          </td>
                          <td style={{ ...cellStyle, textAlign: 'center', fontWeight: '600', color: '#1e40af' }}>
                            {formatearHoras(stats.totalHoras)}
                          </td>
                          <td style={{ ...cellStyle, textAlign: 'center' }}>
                            <span style={{
                              background: tieneHoras ? '#eff6ff' : '#f1f5f9',
                              color: tieneHoras ? '#1e40af' : '#94a3b8',
                              padding: '4px 12px',
                              borderRadius: '6px',
                              fontWeight: '600',
                              fontSize: '0.85rem'
                            }}>
                              {stats.totalTrabajadores}
                            </span>
                          </td>
                          <td style={{ ...cellStyle, textAlign: 'right', fontWeight: '600', color: '#059669' }}>
                            {formatearMoneda(stats.manoObra)}
                          </td>
                          <td style={{ ...cellStyle, textAlign: 'center' }}>
                            {tieneHoras && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onVerTrabajadoresPorTipo(tipoKey as TipoHora);
                                }}
                                style={{
                                  background: '#3b82f6',
                                  color: 'white',
                                  border: 'none',
                                  padding: '6px 12px',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '0.8rem',
                                  fontWeight: '600',
                                  transition: 'background 0.2s ease'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = '#2563eb'}
                                onMouseOut={(e) => e.currentTarget.style.background = '#3b82f6'}
                              >
                                Ver
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Footer con Resumen General */}
              <div style={{
                borderTop: '3px solid #e2e8f0',
                background: '#f8fafc',
                padding: '20px 25px'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '20px'
                }}>
                  {/* Total Horas Hombre */}
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
                      Total Horas Hombre
                    </div>
                    <div style={{
                      fontSize: '1.5rem',
                      color: '#1e40af',
                      fontWeight: '700'
                    }}>
                      {formatearHoras(estadisticasMes.totalHorasHombre)}
                    </div>
                  </div>

                  {/* Trabajadores Únicos */}
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
                      Trabajadores Únicos
                    </div>
                    <div style={{
                      fontSize: '1.5rem',
                      color: '#1e40af',
                      fontWeight: '700'
                    }}>
                      {estadisticasMes.totalTrabajadoresUnicos}
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
                      {formatearMoneda(estadisticasMes.manoObraTotal)}
                    </div>
                  </div>

                  {/* Período de Actividad */}
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
                      Período de Actividad
                    </div>
                    <div style={{
                      fontSize: '0.9rem',
                      color: '#334155',
                      fontWeight: '600',
                      lineHeight: '1.4'
                    }}>
                      {formatearFecha(estadisticasMes.periodoActividad.fechaInicio)}
                      <br />
                      {formatearFecha(estadisticasMes.periodoActividad.fechaFin)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Nota al pie */}
              <div style={{
                padding: '15px 25px',
                borderTop: '1px solid #e2e8f0',
                background: '#f1f5f9',
                fontSize: '0.85rem',
                color: '#64748b'
              }}>
                <strong style={{ color: '#475569' }}>Nota:</strong> Haga clic en cualquier fila con horas registradas para ver el detalle de trabajadores.
              </div>
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
              No se pudieron cargar las estadísticas
            </h3>
            <p style={{
              fontSize: '0.95rem',
              margin: 0,
              color: '#64748b'
            }}>
              Intente nuevamente o seleccione otro mes.
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

export default EstadisticasView;