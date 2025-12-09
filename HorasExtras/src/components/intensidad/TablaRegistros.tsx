import React from 'react';
import type { Registro } from '../../types/registros';
import { formatFechaSafe, formatHours, safeSubstring, formatCentroName } from '../../utils/trabajadores/fechaUtils';

interface TablaRegistrosProps {
  registros: Registro[];
  resumen: {
    normales: number;
    extrasDiurnas: number;
    extrasNocturnas: number;
    domDiurnas: number;
    domNocturnas: number;
    total: number;
  };
}

export const TablaRegistros: React.FC<TablaRegistrosProps> = ({ registros, resumen }) => {
  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={headerLeftStyle}>
          <div style={headerIconStyle}>📋</div>
          <div>
            <h3 style={titleStyle}>REGISTROS DETALLADOS</h3>
            <p style={subtitleStyle}>Vista completa de todos los registros del período</p>
          </div>
        </div>
        <div style={badgeStyle}>
          {registros.length} registro{registros.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Tabla */}
      <div style={tableWrapperStyle}>
        <table style={tableStyle}>
          <thead>
            <tr style={headerRowStyle}>
              <th style={thStyle}>FECHA</th>
              <th style={thStyle}>DÍA</th>
              <th style={{...thStyle, textAlign: 'left', minWidth: '180px'}}>CENTRO</th>
              <th style={thStyle}>INGRESO</th>
              <th style={thStyle}>SALIDA</th>
              <th style={thStyle}>ALMUERZO</th>
              <th style={thStyle}>NORMALES</th>
              <th style={thStyle}>EX. DIURNAS</th>
              <th style={thStyle}>EX. NOCTURNAS</th>
              <th style={thStyle}>DOM. DIURNAS</th>
              <th style={thStyle}>DOM. NOCTURNAS</th>
              <th style={thStyle}>TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {registros.map((registro, index) => (
              <tr 
                key={registro.id} 
                style={{
                  ...rowStyle,
                  background: index % 2 === 0 ? '#fafbfc' : 'white',
                }}
              >
                <td style={tdStyle}>
                  {formatFechaSafe(registro.fecha)}
                </td>
                <td style={tdStyle}>
                  {safeSubstring(registro.diaSemana, 0, 3) || 'N/A'}
                </td>
                <td style={{...tdStyle, textAlign: 'left'}} title={registro.nombreCentro || 'Sin centro'}>
                  {formatCentroName(registro.nombreCentro)}
                </td>
                <td style={tdStyle}>
                  {safeSubstring(registro.horaIngreso, 0, 5) || 'N/A'}
                </td>
                <td style={tdStyle}>
                  {safeSubstring(registro.horaSalida, 0, 5) || 'N/A'}
                </td>
                <td style={tdStyle}>
                  {safeSubstring(registro.tiempoAlmuerzo, 0, 5) || 'N/A'}
                </td>
                <td style={tdStyle}>
                  <span style={{...hoursBadgeStyle, background: '#dbeafe', color: '#1e40af'}}>
                    {formatHours(registro.horasNormales || 0)}
                  </span>
                </td>
                <td style={tdStyle}>
                  <span style={{...hoursBadgeStyle, background: '#fef3c7', color: '#92400e'}}>
                    {formatHours(registro.horasExtrasDiurnas || 0)}
                  </span>
                </td>
                <td style={tdStyle}>
                  <span style={{...hoursBadgeStyle, background: '#e0e7ff', color: '#3730a3'}}>
                    {formatHours(registro.horasExtrasNocturnas || 0)}
                  </span>
                </td>
                <td style={tdStyle}>
                  <span style={{...hoursBadgeStyle, background: '#fce7f3', color: '#831843'}}>
                    {formatHours(registro.extrasDominicalesDiurnas || 0)}
                  </span>
                </td>
                <td style={tdStyle}>
                  <span style={{...hoursBadgeStyle, background: '#ede9fe', color: '#5b21b6'}}>
                    {formatHours(registro.extrasDominicalesNocturnas || 0)}
                  </span>
                </td>
                <td style={tdStyle}>
                  <span style={{...hoursBadgeStyle, background: '#dcfce7', color: '#166534', fontWeight: '700'}}>
                    {formatHours(registro.totalHoras || 0)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>

          {/* Footer con totales */}
          <tfoot>
            <tr style={footerRowStyle}>
              <td style={totalCellStyle} colSpan={6}>
                <strong>TOTALES ({registros.length} registro{registros.length !== 1 ? 's' : ''})</strong>
              </td>
              <td style={totalCellStyle}>
                <strong>{formatHours(resumen.normales)}</strong>
              </td>
              <td style={totalCellStyle}>
                <strong>{formatHours(resumen.extrasDiurnas)}</strong>
              </td>
              <td style={totalCellStyle}>
                <strong>{formatHours(resumen.extrasNocturnas)}</strong>
              </td>
              <td style={totalCellStyle}>
                <strong>{formatHours(resumen.domDiurnas)}</strong>
              </td>
              <td style={totalCellStyle}>
                <strong>{formatHours(resumen.domNocturnas)}</strong>
              </td>
              <td style={totalCellStyle}>
                <strong>{formatHours(resumen.total)}</strong>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Scroll indicator */}
      <div style={scrollIndicatorStyle}>
        💡 Deslice horizontalmente para ver todas las columnas
      </div>
    </div>
  );
};

// Estilos
const containerStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: '12px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  overflow: 'hidden',
  marginBottom: '20px',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '24px 28px',
  borderBottom: '2px solid #e2e8f0',
  background: '#f8fafc',
  flexWrap: 'wrap',
  gap: '16px',
};

const headerLeftStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
};

const headerIconStyle: React.CSSProperties = {
  fontSize: '2rem',
  background: '#eff6ff',
  width: '56px',
  height: '56px',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const titleStyle: React.CSSProperties = {
  margin: '0 0 4px 0',
  fontSize: '1.1rem',
  fontWeight: '700',
  color: '#1e293b',
  letterSpacing: '0.02em',
};

const subtitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.875rem',
  color: '#64748b',
};

const badgeStyle: React.CSSProperties = {
  padding: '8px 16px',
  background: '#eff6ff',
  borderRadius: '20px',
  fontSize: '0.85rem',
  fontWeight: '600',
  color: '#1e40af',
};

const tableWrapperStyle: React.CSSProperties = {
  overflowX: 'auto',
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '0.85rem',
};

const headerRowStyle: React.CSSProperties = {
  background: '#f8fafc',
  borderBottom: '2px solid #e2e8f0',
};

const thStyle: React.CSSProperties = {
  padding: '14px 12px',
  textAlign: 'center',
  fontSize: '0.75rem',
  fontWeight: '700',
  color: '#475569',
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
};

const rowStyle: React.CSSProperties = {
  borderBottom: '1px solid #e2e8f0',
  transition: 'background 0.15s',
};

const tdStyle: React.CSSProperties = {
  padding: '12px',
  textAlign: 'center',
  color: '#475569',
  fontSize: '0.85rem',
};

const hoursBadgeStyle: React.CSSProperties = {
  padding: '4px 10px',
  borderRadius: '6px',
  fontSize: '0.8rem',
  fontWeight: '600',
  display: 'inline-block',
  minWidth: '50px',
};

const footerRowStyle: React.CSSProperties = {
  background: '#eff6ff',
  borderTop: '2px solid #3b82f6',
  fontWeight: '700',
  color: '#1e40af',
};

const totalCellStyle: React.CSSProperties = {
  padding: '15px 12px',
  textAlign: 'center',
  fontSize: '0.9rem',
};

const scrollIndicatorStyle: React.CSSProperties = {
  padding: '12px 28px',
  background: '#fef3c7',
  textAlign: 'center',
  fontSize: '0.8rem',
  color: '#92400e',
  borderTop: '1px solid #fde68a',
};