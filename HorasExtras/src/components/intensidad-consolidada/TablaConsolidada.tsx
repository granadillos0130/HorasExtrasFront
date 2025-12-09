// components/intensidad-consolidada/TablaConsolidada.tsx
import React from 'react';
import type { TrabajadorConsolidado } from '../../types/consolidado';

interface TablaConsolidadaProps {
  trabajadores: TrabajadorConsolidado[];
  loading: boolean;
  onVerDetalle?: (trabajadorId: number) => void;
}

export const TablaConsolidada: React.FC<TablaConsolidadaProps> = ({
  trabajadores,
  loading,
  onVerDetalle,
}) => {
  // Formatear horas con 2 decimales
  const formatHoras = (horas: number): string => {
    return horas.toFixed(2);
  };

  if (loading) {
    return (
      <div style={{
        background: 'white',
        borderRadius: '8px',
        padding: '60px 20px',
        textAlign: 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid #e2e8f0',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          margin: '0 auto 20px',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{
          fontSize: '1.1rem',
          color: '#64748b',
          fontWeight: '500',
          margin: 0
        }}>
          Cargando datos consolidados...
        </p>
      </div>
    );
  }

  if (trabajadores.length === 0) {
    return (
      <div style={{
        background: 'white',
        borderRadius: '8px',
        padding: '60px 20px',
        textAlign: 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{
          fontSize: '3rem',
          marginBottom: '15px',
          color: '#cbd5e1'
        }}>
          📊
        </div>
        <h3 style={{
          fontSize: '1.3rem',
          fontWeight: '600',
          color: '#1e293b',
          margin: '0 0 10px 0'
        }}>
          No hay registros
        </h3>
        <p style={{
          fontSize: '0.95rem',
          color: '#64748b',
          margin: 0
        }}>
          No se encontraron trabajadores con registros en el período seleccionado.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e2e8f0',
      overflow: 'hidden'
    }}>
      {/* Header de la tabla */}
      <div style={{
        padding: '20px 25px',
        borderBottom: '2px solid #e2e8f0',
        background: '#f8fafc'
      }}>
        <h3 style={{
          margin: 0,
          fontSize: '1.1rem',
          fontWeight: '700',
          color: '#1e293b',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          Trabajadores Registrados ({trabajadores.length})
        </h3>
      </div>

      {/* Tabla con scroll horizontal */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.9rem'
        }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th style={headerCellStyle}>TRABAJADOR</th>
              <th style={headerCellStyle}>CÉDULA</th>
              <th style={headerCellStyle}>ESTADO</th>
              <th style={headerCellStyle}>DÍAS REG.</th>
              <th style={headerCellStyle}>CENTROS</th>
              <th style={{ ...headerCellStyle, textAlign: 'right' }}>H. NORMALES</th>
              <th style={{ ...headerCellStyle, textAlign: 'right' }}>EX. DIURNAS</th>
              <th style={{ ...headerCellStyle, textAlign: 'right' }}>EX. NOCTURNAS</th>
              <th style={{ ...headerCellStyle, textAlign: 'right' }}>DOM. DIURNAS</th>
              <th style={{ ...headerCellStyle, textAlign: 'right' }}>DOM. NOCTURNAS</th>
              <th style={{ ...headerCellStyle, textAlign: 'right', background: '#eff6ff' }}>TOTAL</th>
              {onVerDetalle && <th style={headerCellStyle}>ACCIONES</th>}
            </tr>
          </thead>
          <tbody>
            {trabajadores.map((trabajador, index) => (
              <tr
                key={trabajador.trabajadorId}
                style={{
                  borderBottom: '1px solid #e2e8f0',
                  transition: 'background-color 0.2s ease',
                  animation: `fadeIn 0.3s ease-out ${index * 0.03}s both`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                {/* Trabajador */}
                <td style={{
                  ...cellStyle,
                  fontWeight: '600',
                  color: '#1e293b'
                }}>
                  {trabajador.nombre}
                </td>

                {/* Cédula */}
                <td style={{
                  ...cellStyle,
                  color: '#64748b'
                }}>
                  {trabajador.cedula}
                </td>

                {/* Estado */}
                <td style={cellStyle}>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    background: trabajador.estado === 'Vigente' ? '#d1fae5' : '#fee2e2',
                    color: trabajador.estado === 'Vigente' ? '#065f46' : '#991b1b'
                  }}>
                    {trabajador.estado}
                  </span>
                </td>

                {/* Días Registrados */}
                <td style={{
                  ...cellStyle,
                  textAlign: 'center',
                  fontWeight: '600',
                  color: '#3b82f6'
                }}>
                  {trabajador.diasRegistrados}
                </td>

                {/* Centros Únicos */}
                <td style={{
                  ...cellStyle,
                  textAlign: 'center',
                  fontWeight: '600',
                  color: '#8b5cf6'
                }}>
                  {trabajador.centrosUnicos}
                </td>

                {/* Horas Normales */}
                <td style={{
                  ...cellStyle,
                  textAlign: 'right',
                  fontWeight: '600',
                  color: '#059669'
                }}>
                  {formatHoras(trabajador.totales.horasNormales)}
                </td>

                {/* Extras Diurnas */}
                <td style={{
                  ...cellStyle,
                  textAlign: 'right',
                  fontWeight: '600',
                  color: '#ea580c'
                }}>
                  {formatHoras(trabajador.totales.horasExtrasDiurnas)}
                </td>

                {/* Extras Nocturnas */}
                <td style={{
                  ...cellStyle,
                  textAlign: 'right',
                  fontWeight: '600',
                  color: '#7c3aed'
                }}>
                  {formatHoras(trabajador.totales.horasExtrasNocturnas)}
                </td>

                {/* Dom. Diurnas */}
                <td style={{
                  ...cellStyle,
                  textAlign: 'right',
                  fontWeight: '600',
                  color: '#0891b2'
                }}>
                  {formatHoras(trabajador.totales.extrasDominicalesDiurnas)}
                </td>

                {/* Dom. Nocturnas */}
                <td style={{
                  ...cellStyle,
                  textAlign: 'right',
                  fontWeight: '600',
                  color: '#be123c'
                }}>
                  {formatHoras(trabajador.totales.extrasDominicalesNocturnas)}
                </td>

                {/* Total */}
                <td style={{
                  ...cellStyle,
                  textAlign: 'right',
                  fontWeight: '700',
                  fontSize: '1rem',
                  color: '#1e40af',
                  background: '#eff6ff'
                }}>
                  {formatHoras(trabajador.totales.totalHoras)}
                </td>

                {/* Acciones */}
                {onVerDetalle && (
                  <td style={cellStyle}>
                    <button
                      onClick={() => onVerDetalle(trabajador.trabajadorId)}
                      style={{
                        padding: '6px 12px',
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#2563eb';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#3b82f6';
                      }}
                    >
                      Ver Detalle
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Indicador de scroll */}
      <div style={{
        padding: '12px 25px',
        background: '#f8fafc',
        borderTop: '1px solid #e2e8f0',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: '#64748b',
        fontWeight: '500'
      }}>
        Desliza horizontalmente para ver todas las columnas
      </div>

      {/* Animación CSS */}
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
};

// Estilos reutilizables
const headerCellStyle: React.CSSProperties = {
  padding: '15px 12px',
  textAlign: 'left',
  fontSize: '0.75rem',
  fontWeight: '700',
  color: '#475569',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  borderBottom: '2px solid #e2e8f0',
  whiteSpace: 'nowrap'
};

const cellStyle: React.CSSProperties = {
  padding: '15px 12px',
  color: '#1e293b',
  whiteSpace: 'nowrap'
};