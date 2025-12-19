// DetalleView.tsx - Versión Ejecutiva con Tabla Expandible
import React, { useState } from 'react';
import type { DetalleDias } from '../../types/ejecucion';
import { formatearHoras, formatearFecha } from '../../utils/formatters';
import { ExcelExportService } from '../../api/excelExportService';

interface DetalleViewProps {
  centroNombre: string;
  mesNombre: string;
  año: number;
  detalle: DetalleDias | null;
  loading: boolean;
  onVolver: () => void;
}

const DetalleView: React.FC<DetalleViewProps> = ({
  centroNombre,
  mesNombre,
  año,
  detalle,
  loading,
  onVolver
}) => {
  const [filaExpandida, setFilaExpandida] = useState<number | null>(null);

  const exportarExcel = () => {
    if (detalle) {
      ExcelExportService.exportarDetalle(detalle, centroNombre, mesNombre, año);
    }
  };

  const toggleFila = (index: number) => {
    setFilaExpandida(filaExpandida === index ? null : index);
  };

  // Calcular totales
  const totales = detalle ? {
    totalDias: detalle.detalleDias.length,
    horasNormales: detalle.detalleDias.reduce((sum, d) => sum + d.horasNormales, 0),
    extrasDiurnas: detalle.detalleDias.reduce((sum, d) => sum + d.extrasDiurnas, 0),
    extrasNocturnas: detalle.detalleDias.reduce((sum, d) => sum + d.extrasNocturnas, 0),
    dominicalesDiurnas: detalle.detalleDias.reduce((sum, d) => sum + d.dominicalesDiurnas, 0),
    dominicalesNocturnas: detalle.detalleDias.reduce((sum, d) => sum + d.dominicalesNocturnas, 0),
    desplazamientoNormal: detalle.detalleDias.reduce((sum, d) => sum + d.desplazamientoNormal, 0),
    desplazamientoExtraDiurno: detalle.detalleDias.reduce((sum, d) => sum + d.desplazamientoExtraDiurno, 0),
    desplazamientoExtraNocturno: detalle.detalleDias.reduce((sum, d) => sum + d.desplazamientoExtraNocturno, 0),
    totalHoras: detalle.detalleDias.reduce((sum, d) => sum + d.totalHoras, 0)
  } : null;

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
            ← Volver a Trabajadores
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
                DETALLE DE DÍAS TRABAJADOS
              </h1>
              <p style={{
                fontSize: '1.1rem',
                color: '#64748b',
                margin: 0,
                fontWeight: '500'
              }}>
                Trabajador: {detalle?.nombreTrabajador || 'Cargando...'}
              </p>
              <p style={{
                fontSize: '0.9rem',
                color: '#94a3b8',
                marginTop: '5px'
              }}>
                {centroNombre} - {mesNombre} {año}
              </p>
            </div>

            {detalle && detalle.detalleDias.length > 0 && (
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
              Cargando detalle...
            </div>
          </div>
        ) : detalle ? (
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
                Registro Diario de Horas
              </h2>
            </div>

            {detalle.detalleDias.length > 0 ? (
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
                        <th style={{ ...headerCellStyle, minWidth: '120px' }}>FECHA</th>
                        <th style={headerCellStyle}>H. NORMALES</th>
                        <th style={headerCellStyle}>EXTRAS DIURNAS</th>
                        <th style={headerCellStyle}>EXTRAS NOCTURNAS</th>
                        <th style={headerCellStyle}>DOM. DIURNAS</th>
                        <th style={headerCellStyle}>DOM. NOCTURNAS</th>
                        <th style={headerCellStyle}>TOTAL HORAS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detalle.detalleDias.map((dia, index) => {
                        const expandida = filaExpandida === index;

                        return (
                          <React.Fragment key={index}>
                            {/* Fila principal */}
                            <tr
                              onClick={() => toggleFila(index)}
                              style={{
                                borderBottom: expandida ? 'none' : '1px solid #e2e8f0',
                                cursor: 'pointer',
                                transition: 'background 0.2s ease'
                              }}
                              onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
                              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              <td style={{ ...cellStyle, textAlign: 'center' }}>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFila(index);
                                  }}
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
                                  title={expandida ? 'Ocultar detalle' : 'Ver detalle completo'}
                                >
                                  {expandida ? '▼' : '▶'}
                                </button>
                              </td>
                              <td style={{ ...cellStyle, fontWeight: '600', color: '#1e293b' }}>
                                {formatearFecha(dia.fecha)}
                              </td>
                              <td style={{ ...cellStyle, textAlign: 'center', color: '#1e40af' }}>
                                {formatearHoras(dia.horasNormales)}
                              </td>
                              <td style={{ ...cellStyle, textAlign: 'center', color: '#1e40af' }}>
                                {formatearHoras(dia.extrasDiurnas)}
                              </td>
                              <td style={{ ...cellStyle, textAlign: 'center', color: '#1e40af' }}>
                                {formatearHoras(dia.extrasNocturnas)}
                              </td>
                              <td style={{ ...cellStyle, textAlign: 'center', color: '#1e40af' }}>
                                {formatearHoras(dia.dominicalesDiurnas)}
                              </td>
                              <td style={{ ...cellStyle, textAlign: 'center', color: '#1e40af' }}>
                                {formatearHoras(dia.dominicalesNocturnas)}
                              </td>
                              <td style={{ ...cellStyle, textAlign: 'center', fontWeight: '700', color: '#059669' }}>
                                {formatearHoras(dia.totalHoras)}
                              </td>
                            </tr>

                            {/* Fila expandida con detalles */}
                            {expandida && (
                              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                                <td colSpan={8} style={{ padding: 0 }}>
                                  <div style={{
                                    background: '#f8fafc',
                                    padding: '25px 30px'
                                  }}>
                                    <div style={{
                                      display: 'grid',
                                      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                                      gap: '20px'
                                    }}>
                                      {/* Sección 1: Horario */}
                                      <div style={sectionStyle}>
                                        <h4 style={sectionTitleStyle}>HORARIO TRABAJADO</h4>
                                        <div style={sectionContentStyle}>
                                          <div style={detailRowStyle}>
                                            <span style={labelStyle}>Hora Ingreso:</span>
                                            <span style={valueStyle}>{dia.horaIngreso}</span>
                                          </div>
                                          <div style={detailRowStyle}>
                                            <span style={labelStyle}>Hora Salida:</span>
                                            <span style={valueStyle}>{dia.horaSalida}</span>
                                          </div>
                                          <div style={detailRowStyle}>
                                            <span style={labelStyle}>Tiempo Almuerzo:</span>
                                            <span style={valueStyle}>{dia.tiempoAlmuerzo}</span>
                                          </div>
                                          <div style={detailRowStyle}>
                                            <span style={labelStyle}>Intensidad Horaria:</span>
                                            <span style={{ ...valueStyle, color: '#1e40af', fontWeight: '600' }}>
                                              {formatearHoras(dia.intensidadHoraria)}
                                            </span>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Sección 2: Desglose */}
                                      <div style={sectionStyle}>
                                        <h4 style={sectionTitleStyle}>DESGLOSE DE HORAS</h4>
                                        <div style={sectionContentStyle}>
                                          <div style={detailRowStyle}>
                                            <span style={labelStyle}>Horas Normales:</span>
                                            <span style={valueStyle}>{formatearHoras(dia.horasNormales)}</span>
                                          </div>
                                          <div style={detailRowStyle}>
                                            <span style={labelStyle}>Extras Diurnas:</span>
                                            <span style={valueStyle}>{formatearHoras(dia.extrasDiurnas)}</span>
                                          </div>
                                          <div style={detailRowStyle}>
                                            <span style={labelStyle}>Extras Nocturnas:</span>
                                            <span style={valueStyle}>{formatearHoras(dia.extrasNocturnas)}</span>
                                          </div>
                                          <div style={detailRowStyle}>
                                            <span style={labelStyle}>Dominicales Diurnas:</span>
                                            <span style={valueStyle}>{formatearHoras(dia.dominicalesDiurnas)}</span>
                                          </div>
                                          <div style={detailRowStyle}>
                                            <span style={labelStyle}>Dominicales Nocturnas:</span>
                                            <span style={valueStyle}>{formatearHoras(dia.dominicalesNocturnas)}</span>
                                          </div>
                                          <div style={{
                                            ...detailRowStyle,
                                            borderTop: '1px solid #e2e8f0',
                                            marginTop: '10px',
                                            paddingTop: '10px'
                                          }}>
                                            <span style={{ ...labelStyle, fontWeight: '700' }}>TOTAL:</span>
                                            <span style={{ ...valueStyle, color: '#059669', fontWeight: '700' }}>
                                              {formatearHoras(dia.totalHoras)}
                                            </span>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Sección 3: Información Adicional */}
                                      <div style={sectionStyle}>
                                        <h4 style={sectionTitleStyle}>INFORMACIÓN ADICIONAL</h4>
                                        <div style={sectionContentStyle}>
                                          <div style={detailRowStyle}>
                                            <span style={labelStyle}>Día de la Semana:</span>
                                            <span style={valueStyle}>{dia.diaSemana}</span>
                                          </div>
                                          <div style={detailRowStyle}>
                                            <span style={labelStyle}>Centro de Trabajo:</span>
                                            <span style={valueStyle}>{dia.centroDia}</span>
                                          </div>

                                          {dia.esConductor && (
                                            <>
                                              <div style={detailRowStyle}>
                                                <span style={labelStyle}>Desplazamiento Ida:</span>
                                                <span style={valueStyle}>{dia.desplazamientoIda}</span>
                                              </div>
                                              <div style={detailRowStyle}>
                                                <span style={labelStyle}>Desplazamiento Regreso:</span>
                                                <span style={valueStyle}>{dia.desplazamientoRegreso}</span>
                                              </div>
                                              {/* ✅ AGREGAR ESTA SECCIÓN COMPLETA AQUÍ */}
                                              {(dia.desplazamientoNormal > 0 || dia.desplazamientoExtraDiurno > 0 || dia.desplazamientoExtraNocturno > 0) && (
                                                <div style={{
                                                  marginTop: '12px',
                                                  paddingTop: '12px',
                                                  borderTop: '1px solid #e2e8f0'
                                                }}>
                                                  <div style={{
                                                    fontSize: '0.8rem',
                                                    fontWeight: '700',
                                                    color: '#475569',
                                                    marginBottom: '8px',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.05em'
                                                  }}>
                                                    Desplazamiento Clasificado
                                                  </div>
                                                  {dia.desplazamientoNormal > 0 && (
                                                    <div style={detailRowStyle}>
                                                      <span style={labelStyle}>Normal (1.0x):</span>
                                                      <span style={{ ...valueStyle, color: '#06b6d4' }}>
                                                        {formatearHoras(dia.desplazamientoNormal)}
                                                      </span>
                                                    </div>
                                                  )}
                                                  {dia.desplazamientoExtraDiurno > 0 && (
                                                    <div style={detailRowStyle}>
                                                      <span style={labelStyle}>Extra Diurno (1.25x):</span>
                                                      <span style={{ ...valueStyle, color: '#f97316' }}>
                                                        {formatearHoras(dia.desplazamientoExtraDiurno)}
                                                      </span>
                                                    </div>
                                                  )}
                                                  {dia.desplazamientoExtraNocturno > 0 && (
                                                    <div style={detailRowStyle}>
                                                      <span style={labelStyle}>Extra Nocturno (1.75x):</span>
                                                      <span style={{ ...valueStyle, color: '#7c3aed' }}>
                                                        {formatearHoras(dia.desplazamientoExtraNocturno)}
                                                      </span>
                                                    </div>
                                                  )}
                                                </div>
                                              )}
                                            </>
                                          )}
                                        {/* Badges de estado */}
                                        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                          {dia.esCompensado && (
                                            <div style={{
                                              padding: '8px 12px',
                                              background: '#fef3c7',
                                              border: '1px solid #fde047',
                                              borderRadius: '6px',
                                              fontSize: '0.85rem',
                                              fontWeight: '600',
                                              color: '#854d0e'
                                            }}>
                                              Día Compensado
                                            </div>
                                          )}
                                          {dia.esFestivo && (
                                            <div style={{
                                              padding: '8px 12px',
                                              background: '#dbeafe',
                                              border: '1px solid #93c5fd',
                                              borderRadius: '6px',
                                              fontSize: '0.85rem',
                                              fontWeight: '600',
                                              color: '#1e40af'
                                            }}>
                                              Día Festivo
                                            </div>
                                          )}
                                          {dia.esAusencia && (
                                            <div style={{
                                              padding: '8px 12px',
                                              background: '#fee2e2',
                                              border: '1px solid #fca5a5',
                                              borderRadius: '6px',
                                              fontSize: '0.85rem',
                                              fontWeight: '600',
                                              color: '#991b1b'
                                            }}>
                                              Ausencia Registrada
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                              </tr>
                        )
                      }
                          </React.Fragment>
                    );
                      })}
                  </tbody>

                  {/* Footer con totales */}
                  {totales && (
                    <tfoot>
                      <tr style={{
                        background: '#f0fdf4',
                        borderTop: '2px solid #059669'
                      }}>
                        <td style={totalCellStyle} colSpan={2}>
                          TOTALES ({totales.totalDias} días)
                        </td>
                        <td style={{ ...totalCellStyle, textAlign: 'center' }}>
                          {formatearHoras(totales.horasNormales)}
                        </td>
                        <td style={{ ...totalCellStyle, textAlign: 'center' }}>
                          {formatearHoras(totales.extrasDiurnas)}
                        </td>
                        <td style={{ ...totalCellStyle, textAlign: 'center' }}>
                          {formatearHoras(totales.extrasNocturnas)}
                        </td>
                        <td style={{ ...totalCellStyle, textAlign: 'center' }}>
                          {formatearHoras(totales.dominicalesDiurnas)}
                        </td>
                        <td style={{ ...totalCellStyle, textAlign: 'center' }}>
                          {formatearHoras(totales.dominicalesNocturnas)}
                        </td>
                        <td style={{ ...totalCellStyle, textAlign: 'center', fontSize: '1rem' }}>
                          {formatearHoras(totales.totalHoras)}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>

            {/* Nota al pie */}
            <div style={{
              padding: '15px 25px',
              borderTop: '1px solid #e2e8f0',
              background: '#f8fafc',
              fontSize: '0.85rem',
              color: '#64748b'
            }}>
              <strong style={{ color: '#475569' }}>Nota:</strong> Haga clic en cualquier fila para ver el detalle completo del día trabajado.
            </div>
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
              No hay registros
            </h3>
            <p style={{
              fontSize: '0.95rem',
              margin: 0,
              color: '#64748b'
            }}>
              No se encontraron días trabajados para este trabajador.
            </p>
          </div>
        )}
      </div>
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
          No se pudo cargar el detalle
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
    </div >
  );
};

// Estilos reutilizables
const headerCellStyle: React.CSSProperties = {
  padding: '15px 20px',
  textAlign: 'center',
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
  fontWeight: '700',
  color: '#15803d'
};

const sectionStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
  overflow: 'hidden'
};

const sectionTitleStyle: React.CSSProperties = {
  margin: 0,
  padding: '12px 15px',
  background: '#f8fafc',
  borderBottom: '1px solid #e2e8f0',
  fontSize: '0.85rem',
  fontWeight: '700',
  color: '#475569',
  letterSpacing: '0.05em',
  textTransform: 'uppercase'
};

const sectionContentStyle: React.CSSProperties = {
  padding: '15px'
};

const detailRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '6px 0',
  fontSize: '0.85rem'
};

const labelStyle: React.CSSProperties = {
  color: '#64748b',
  fontWeight: '500'
};

const valueStyle: React.CSSProperties = {
  color: '#1e293b',
  fontWeight: '600'
};

export default DetalleView;