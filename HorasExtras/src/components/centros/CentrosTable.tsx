// CentrosTable.tsx
import React from "react";
import CentrosTableRow from "./CentrosTableRow";
import type { CentroPorMesCompleto } from "../../types/centros";

interface CentrosTableProps {
  centros: CentroPorMesCompleto[];
  loading: boolean;
  onVerInfo: (centro: CentroPorMesCompleto) => void;
  onVerCargos: (centro: CentroPorMesCompleto) => void;
  onVerEjecucion: (centro: CentroPorMesCompleto) => void;
  onEditar: (centroId: string) => void;
  mostrarTotales?: boolean;
}

const formatearHoras = (hours: number) => {
  if (hours === 0) return "0:00";
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}:${m.toString().padStart(2, "0")}`;
};

const formatearMoneda = (valor: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(valor);
};

const CentrosTable: React.FC<CentrosTableProps> = ({
  centros,
  loading,
  onVerInfo,
  onVerCargos,
  onVerEjecucion,
  onEditar,
  mostrarTotales = true
}) => {
  // Calcular totales
  const totales = {
    trabajadores: centros.reduce((sum, c) => sum + c.trabajadores.length, 0),
    horas: centros.reduce((sum, c) => 
      sum + c.trabajadores.reduce((h, t) => h + t.totalHoras, 0), 0
    ),
    manoObra: centros.reduce((sum, c) => sum + (c.manoObraTotal || 0), 0)
  };

  if (loading) {
    return (
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '60px',
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <div style={{ fontSize: '1.2rem', color: '#3b82f6', fontWeight: '500' }}>
          Cargando centros...
        </div>
      </div>
    );
  }

  if (centros.length === 0) {
    return (
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '60px',
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📋</div>
        <h3 style={{ margin: '0 0 10px 0', color: '#475569' }}>
          No se encontraron centros
        </h3>
        <p style={{ margin: 0, color: '#64748b' }}>
          Intenta ajustar los filtros o crea un nuevo centro
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      overflow: 'hidden'
    }}>
      {/* Tabla */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.9rem'
        }}>
          {/* Header */}
          <thead>
            <tr style={{
              background: '#f8fafc',
              borderBottom: '2px solid #e2e8f0'
            }}>
              <th style={headerCellStyle}>ID</th>
              <th style={{ ...headerCellStyle, textAlign: 'left', minWidth: '200px' }}>CENTRO</th>
              <th style={headerCellStyle}>TRAB.</th>
              <th style={headerCellStyle}>INICIO</th>
              <th style={headerCellStyle}>FINAL</th>
              <th style={headerCellStyle}>HORAS</th>
              <th style={headerCellStyle}>MANO DE OBRA</th>
              <th style={{ ...headerCellStyle, width: '50px' }}></th>
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {centros.map((centro) => (
              <CentrosTableRow
                key={centro.centroId}
                centro={centro}
                onVerInfo={() => onVerInfo(centro)}
                onVerCargos={() => onVerCargos(centro)}
                onVerEjecucion={() => onVerEjecucion(centro)}
                onEditar={() => onEditar(centro.centroId)}
              />
            ))}
          </tbody>

          {/* Totales */}
          {mostrarTotales && centros.length > 0 && (
            <tfoot>
              <tr style={{
                background: '#eff6ff',
                borderTop: '2px solid #3b82f6',
                fontWeight: '700',
                color: '#1e40af'
              }}>
                <td style={totalCellStyle}>—</td>
                <td style={{ ...totalCellStyle, textAlign: 'left' }}>
                  TOTALES ({centros.length} centro{centros.length !== 1 ? 's' : ''})
                </td>
                <td style={totalCellStyle}>{totales.trabajadores}</td>
                <td style={totalCellStyle}>—</td>
                <td style={totalCellStyle}>—</td>
                <td style={totalCellStyle}>{formatearHoras(totales.horas)}</td>
                <td style={totalCellStyle}>{formatearMoneda(totales.manoObra)}</td>
                <td style={totalCellStyle}></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

// Estilos reutilizables
const headerCellStyle: React.CSSProperties = {
  padding: '15px 12px',
  textAlign: 'center',
  fontSize: '0.8rem',
  fontWeight: '700',
  color: '#475569',
  letterSpacing: '0.05em',
  textTransform: 'uppercase'
};

const totalCellStyle: React.CSSProperties = {
  padding: '15px 12px',
  textAlign: 'center',
  fontSize: '0.9rem'
};

export default CentrosTable;