/* eslint-disable @typescript-eslint/no-explicit-any */
// CentroInfoView.tsx
import React from "react";
import type { CentroPorMesCompleto } from "../../types/centros";
import type { Cliente } from "../../types/cliente";

interface CentroInfoViewProps {
  centro: CentroPorMesCompleto;
  datosCompletos: {
    cliente: Cliente | null;
    manoObraTotal: number;
    manoObraCompensada?: number;
    cargosUnicos: string[];
  };
  centroEncontrado?: any;
  onToggleModal: () => void;
  onToggleCompensados?: () => void;
}

const formatearFecha = (fecha: string) => {
  return new Date(fecha).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

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

const CentroInfoView: React.FC<CentroInfoViewProps> = ({
  centro,
  datosCompletos,
  centroEncontrado,
  onToggleModal,
  onToggleCompensados
}) => {
  const totalHoras = centro.trabajadores.reduce((sum, t) => sum + t.totalHoras, 0);
  const manoObraNormal = centro.manoObraTotal || datosCompletos.manoObraTotal;
  const manoObraCompensada = centro.manoObraCompensada || datosCompletos.manoObraCompensada || 0;
  const totalGeneral = manoObraNormal + manoObraCompensada;

  return (
    <div>
      {/* Métricas principales */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '15px',
        marginBottom: '25px'
      }}>
        {/* Orden de Compra */}
        <div style={metricCardStyle}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '5px', fontWeight: '600' }}>
            ORDEN DE COMPRA
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: '700', color: '#1e293b' }}>
            {centro.centroId}
          </div>
        </div>

        {/* Trabajadores */}
        <div style={metricCardStyle}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '5px', fontWeight: '600' }}>
            TRABAJADORES
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: '700', color: '#059669' }}>
            {centro.trabajadores.length}
          </div>
        </div>

        {/* Horas */}
        <div style={metricCardStyle}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '5px', fontWeight: '600' }}>
            TOTAL HORAS
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: '700', color: '#1e40af' }}>
            {formatearHoras(totalHoras)}
          </div>
        </div>

        {/* Mano de Obra Normal */}
        <div style={metricCardStyle}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '5px', fontWeight: '600' }}>
            MANO DE OBRA NORMAL
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#059669' }}>
            {formatearMoneda(manoObraNormal)}
          </div>
        </div>

        {/* Mano de Obra Compensada */}
        {manoObraCompensada > 0 && (
          <div 
            style={{
              ...metricCardStyle,
              cursor: onToggleCompensados ? 'pointer' : 'default',
              background: onToggleCompensados ? '#fef3c7' : '#f8fafc',
              border: onToggleCompensados ? '2px solid #fbbf24' : '1px solid #e2e8f0'
            }}
            onClick={onToggleCompensados}
          >
            <div style={{ fontSize: '0.8rem', color: '#92400e', marginBottom: '5px', fontWeight: '600' }}>
              MANO DE OBRA COMPENSADA
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#d97706' }}>
              {formatearMoneda(manoObraCompensada)}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#92400e', marginTop: '3px' }}>
              {((manoObraCompensada / totalGeneral) * 100).toFixed(1)}% del total
            </div>
          </div>
        )}
      </div>

      {/* Resumen de costos si hay compensados */}
      {manoObraCompensada > 0 && (
        <div style={{
          background: '#fffbeb',
          padding: '15px 20px',
          borderRadius: '8px',
          border: '1px solid #fde68a',
          marginBottom: '20px'
        }}>
          <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#92400e', marginBottom: '10px' }}>
            RESUMEN DE COSTOS
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '12px',
            fontSize: '0.85rem'
          }}>
            <div>
              <span style={{ color: '#64748b' }}>Normal:</span>{' '}
              <strong style={{ color: '#1e293b' }}>{formatearMoneda(manoObraNormal)}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Compensada:</span>{' '}
              <strong style={{ color: '#d97706' }}>{formatearMoneda(manoObraCompensada)}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Total:</span>{' '}
              <strong style={{ color: '#059669', fontSize: '1rem' }}>{formatearMoneda(totalGeneral)}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de información del proyecto */}
      <div style={sectionContainerStyle}>
        <h4 style={sectionTitleStyle}>Información del Proyecto</h4>
        <table style={tableStyle}>
          <tbody>
            <tr>
              <td style={tableCellLabelStyle}>Cliente:</td>
              <td style={tableCellValueStyle}>
                {datosCompletos.cliente ? datosCompletos.cliente.nombreCliente : 'Sin cliente asignado'}
              </td>
            </tr>
            <tr>
              <td style={tableCellLabelStyle}>Estado:</td>
              <td style={tableCellValueStyle}>
                <span style={{
                  background: centroEncontrado?.estado === 'abierto' ? '#dcfce7' : '#fee2e2',
                  color: centroEncontrado?.estado === 'abierto' ? '#15803d' : '#dc2626',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: '600'
                }}>
                  {centroEncontrado?.estado ? (centroEncontrado.estado === 'abierto' ? 'Abierto' : 'Cerrado') : 'No especificado'}
                </span>
              </td>
            </tr>
            <tr>
              <td style={tableCellLabelStyle}>Tipo:</td>
              <td style={tableCellValueStyle}>
                {centroEncontrado?.tipo || 'No especificado'}
              </td>
            </tr>
            <tr>
              <td style={tableCellLabelStyle}>Valor de la Orden:</td>
              <td style={tableCellValueStyle}>
                {centroEncontrado?.valorOrden ? formatearMoneda(centroEncontrado.valorOrden) : 'No especificado'}
              </td>
            </tr>
            <tr>
              <td style={tableCellLabelStyle}>Interventor:</td>
              <td style={tableCellValueStyle}>
                {centroEncontrado?.interventor || 'No asignado'}
              </td>
            </tr>
            <tr>
              <td style={tableCellLabelStyle}>Vendedor:</td>
              <td style={tableCellValueStyle}>
                {centroEncontrado?.vendedor || 'No asignado'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Fechas del proyecto */}
      <div style={sectionContainerStyle}>
        <h4 style={sectionTitleStyle}>Fechas del Proyecto</h4>
        <table style={tableStyle}>
          <tbody>
            <tr>
              <td style={tableCellLabelStyle}>Fecha de Inicio:</td>
              <td style={tableCellValueStyle}>{formatearFecha(centro.fechaInicio)}</td>
            </tr>
            <tr>
              <td style={tableCellLabelStyle}>Fecha Final:</td>
              <td style={tableCellValueStyle}>
                {centro.fechaFinal ? formatearFecha(centro.fechaFinal) : (
                  <span style={{ color: '#059669', fontWeight: '600' }}>Vigente</span>
                )}
              </td>
            </tr>
            <tr>
              <td style={tableCellLabelStyle}>Fecha de Factura:</td>
              <td style={tableCellValueStyle}>
                {centroEncontrado?.fechaFactura ? formatearFecha(centroEncontrado.fechaFactura) : 'No especificada'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Botones de acción */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginTop: '25px',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        {centro.trabajadores.length > 0 && (
          <button
            onClick={onToggleModal}
            style={actionButtonStyle}
          >
            Ver Cargos ({centro.trabajadores.length})
          </button>
        )}
        
        {manoObraCompensada > 0 && onToggleCompensados && (
          <button
            onClick={onToggleCompensados}
            style={{
              ...actionButtonStyle,
              background: '#fbbf24',
              color: '#78350f'
            }}
          >
            Ver Compensados
          </button>
        )}
      </div>
    </div>
  );
};

// Estilos reutilizables
const metricCardStyle: React.CSSProperties = {
  background: '#f8fafc',
  padding: '15px',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
  textAlign: 'center'
};

const sectionContainerStyle: React.CSSProperties = {
  background: '#ffffff',
  padding: '20px',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
  marginBottom: '15px'
};

const sectionTitleStyle: React.CSSProperties = {
  margin: '0 0 15px 0',
  fontSize: '0.95rem',
  fontWeight: '700',
  color: '#1e293b',
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse'
};

const tableCellLabelStyle: React.CSSProperties = {
  padding: '10px 15px 10px 0',
  fontSize: '0.9rem',
  color: '#64748b',
  fontWeight: '600',
  width: '40%',
  verticalAlign: 'top'
};

const tableCellValueStyle: React.CSSProperties = {
  padding: '10px 0',
  fontSize: '0.9rem',
  color: '#1e293b',
  fontWeight: '500'
};

const actionButtonStyle: React.CSSProperties = {
  background: '#3b82f6',
  color: 'white',
  border: 'none',
  padding: '12px 24px',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: '600',
  fontSize: '0.9rem',
  minWidth: '180px',
  transition: 'background 0.2s ease'
};

export default CentroInfoView;