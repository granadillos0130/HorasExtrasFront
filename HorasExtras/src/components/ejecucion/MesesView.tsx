// MesesView.tsx - Versión Ejecutiva con Tabla
import React from 'react';
import type { MesConActividad } from '../../types/centros';
import { formatearHoras, formatearMoneda, formatearFechaPeriodo } from '../../utils/formatters';

interface MesesViewProps {
  centroNombre: string;
  añoSeleccionado: number;
  onAñoChange: (año: number) => void;
  mesesConActividad: MesConActividad[];
  loading: boolean;
  onSeleccionarMes: (mes: number) => void;
  onVolver: () => void;
}

const MesesView: React.FC<MesesViewProps> = ({
  centroNombre,
  añoSeleccionado,
  onAñoChange,
  mesesConActividad,
  loading,
  onSeleccionarMes,
  onVolver
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
            ← Volver a Centros
          </button>

          <h1 style={{
            fontSize: '1.8rem',
            color: '#1e293b',
            marginBottom: '8px',
            fontWeight: '700'
          }}>
            INFORMACIÓN DE EJECUCIÓN
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

        {/* Selector de Año */}
        <div style={{
          background: 'white',
          borderRadius: '8px',
          padding: '20px 25px',
          marginBottom: '25px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
          }}>
            <label style={{
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#475569',
              minWidth: '100px'
            }}>
              Seleccionar Año:
            </label>
            <select
              value={añoSeleccionado}
              onChange={(e) => onAñoChange(Number(e.target.value))}
              style={{
                padding: '10px 15px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.95rem',
                background: '#f8fafc',
                cursor: 'pointer',
                fontWeight: '500',
                color: '#1e293b',
                minWidth: '120px'
              }}
            >
              {[2023, 2024, 2025, 2026, 2027, 2028].map(año => (
                <option key={año} value={año}>{año}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabla de Meses */}
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
              Cargando meses con actividad...
            </div>
          </div>
        ) : (
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
                Meses con Actividad - {añoSeleccionado}
              </h2>
            </div>

            {mesesConActividad.length > 0 ? (
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
                      <th style={headerCellStyle}>MES</th>
                      <th style={headerCellStyle}>PERÍODO</th>
                      <th style={headerCellStyle}>TRABAJADORES</th>
                      <th style={headerCellStyle}>TOTAL HORAS</th>
                      <th style={headerCellStyle}>MANO DE OBRA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mesesConActividad.map((mes) => (
                      <tr
                        key={mes.mes}
                        onClick={() => onSeleccionarMes(mes.mes)}
                        style={{
                          borderBottom: '1px solid #e2e8f0',
                          cursor: 'pointer',
                          transition: 'background 0.2s ease'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={cellStyle}>
                          <span style={{ fontWeight: '600', color: '#1e293b' }}>
                            {mes.nombreMes}
                          </span>
                        </td>
                        <td style={cellStyle}>
                          {formatearFechaPeriodo(mes.fechaPrimerRegistro, mes.fechaUltimoRegistro)}
                        </td>
                        <td style={{ ...cellStyle, textAlign: 'center' }}>
                          <span style={{
                            background: '#eff6ff',
                            color: '#1e40af',
                            padding: '4px 12px',
                            borderRadius: '6px',
                            fontWeight: '600',
                            fontSize: '0.85rem'
                          }}>
                            {mes.totalTrabajadores}
                          </span>
                        </td>
                        <td style={{ ...cellStyle, textAlign: 'center', fontWeight: '600', color: '#1e40af' }}>
                          {formatearHoras(mes.totalHoras)}
                        </td>
                        <td style={{ ...cellStyle, textAlign: 'right', fontWeight: '600', color: '#059669' }}>
                          {formatearMoneda(mes.manoObraTotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>

                  {/* Fila de totales */}
                  <tfoot>
                    <tr style={{
                      background: '#f0fdf4',
                      borderTop: '2px solid #059669',
                      fontWeight: '700'
                    }}>
                      <td style={{ ...totalCellStyle, textAlign: 'left' }}>
                        TOTALES
                      </td>
                      <td style={totalCellStyle}>
                        {mesesConActividad.length} mes{mesesConActividad.length !== 1 ? 'es' : ''}
                      </td>
                      <td style={{ ...totalCellStyle, textAlign: 'center' }}>
                        {mesesConActividad.reduce((sum, m) => sum + m.totalTrabajadores, 0)}
                      </td>
                      <td style={{ ...totalCellStyle, textAlign: 'center', color: '#1e40af' }}>
                        {formatearHoras(mesesConActividad.reduce((sum, m) => sum + m.totalHoras, 0))}
                      </td>
                      <td style={{ ...totalCellStyle, textAlign: 'right', color: '#059669' }}>
                        {formatearMoneda(mesesConActividad.reduce((sum, m) => sum + m.manoObraTotal, 0))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
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
                  No hay actividad registrada
                </h3>
                <p style={{
                  fontSize: '0.95rem',
                  margin: 0,
                  color: '#64748b'
                }}>
                  No se encontró actividad laboral para el año {añoSeleccionado} en este centro.
                </p>
              </div>
            )}

            {/* Nota al pie */}
            {mesesConActividad.length > 0 && (
              <div style={{
                padding: '15px 25px',
                borderTop: '1px solid #e2e8f0',
                background: '#f8fafc',
                fontSize: '0.85rem',
                color: '#64748b'
              }}>
                <strong style={{ color: '#475569' }}>Nota:</strong> Haga clic en cualquier fila para ver las estadísticas detalladas del mes.
              </div>
            )}
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

const totalCellStyle: React.CSSProperties = {
  padding: '15px 20px',
  fontSize: '0.9rem',
  color: '#15803d'
};

export default MesesView;