// CentroCompensadosView.tsx
import React from "react";
import type { CentroPorMesCompleto } from "../../types/centros";

interface CentroCompensadosViewProps {
  centro: CentroPorMesCompleto;
  datosCompletos: {
    manoObraTotal: number;
    manoObraCompensada?: number;
  };
  onToggleModal: () => void;
  onToggleCompensados?: () => void;
}

const formatearMoneda = (valor: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(valor);
};

const CentroCompensadosView: React.FC<CentroCompensadosViewProps> = ({
  centro,
  datosCompletos,
  onToggleModal,
  onToggleCompensados
}) => {
  const manoObraCompensada = centro.manoObraCompensada || datosCompletos.manoObraCompensada || 0;
  const manoObraNormal = centro.manoObraTotal || datosCompletos.manoObraTotal;
  const totalGeneral = manoObraNormal + manoObraCompensada;
  const porcentajeCompensado = totalGeneral > 0 
    ? ((manoObraCompensada / totalGeneral) * 100).toFixed(1) 
    : '0.0';

  return (
    <div>
      {/* Header con navegación */}
      <div style={{
        marginBottom: '20px',
        padding: '15px 20px',
        background: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div>
          <h4 style={{
            margin: '0 0 5px 0',
            fontSize: '1rem',
            fontWeight: '700',
            color: '#1e293b',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Mano de Obra Compensada
          </h4>
          <p style={{
            margin: 0,
            fontSize: '0.85rem',
            color: '#64748b'
          }}>
            Horas compensadas calculadas al 50% del valor normal
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={onToggleModal}
            style={navButtonStyle}
          >
            Ver Información
          </button>
          <button
            onClick={onToggleCompensados}
            style={navButtonStyle}
          >
            Ver Cargos
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      {manoObraCompensada > 0 ? (
        <div>
          {/* Métricas principales */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            marginBottom: '20px'
          }}>
            {/* Total Compensado */}
            <div style={{
              background: '#fffbeb',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #fde68a',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '0.8rem',
                color: '#92400e',
                marginBottom: '8px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Total Compensado
              </div>
              <div style={{
                fontSize: '1.8rem',
                fontWeight: '700',
                color: '#d97706'
              }}>
                {formatearMoneda(manoObraCompensada)}
              </div>
            </div>

            {/* Porcentaje del Total */}
            <div style={{
              background: '#f0fdf4',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #bbf7d0',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '0.8rem',
                color: '#15803d',
                marginBottom: '8px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Porcentaje del Total
              </div>
              <div style={{
                fontSize: '1.8rem',
                fontWeight: '700',
                color: '#059669'
              }}>
                {porcentajeCompensado}%
              </div>
            </div>

            {/* Mano de Obra Normal (referencia) */}
            <div style={{
              background: '#eff6ff',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #bfdbfe',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '0.8rem',
                color: '#1e40af',
                marginBottom: '8px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Mano de Obra Normal
              </div>
              <div style={{
                fontSize: '1.8rem',
                fontWeight: '700',
                color: '#3b82f6'
              }}>
                {formatearMoneda(manoObraNormal)}
              </div>
            </div>
          </div>

          {/* Tabla de información detallada */}
          <div style={{
            background: '#ffffff',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            marginBottom: '20px'
          }}>
            <h5 style={{
              margin: '0 0 15px 0',
              fontSize: '0.95rem',
              fontWeight: '700',
              color: '#1e293b',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Información de Compensados
            </h5>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={tableCellLabelStyle}>Cálculo Aplicado:</td>
                  <td style={tableCellValueStyle}>50% del valor hora normal</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={tableCellLabelStyle}>Estado:</td>
                  <td style={tableCellValueStyle}>
                    <span style={{
                      background: '#dcfce7',
                      color: '#15803d',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      fontWeight: '600'
                    }}>
                      ACTIVO
                    </span>
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={tableCellLabelStyle}>Tipo:</td>
                  <td style={tableCellValueStyle}>Horas extras compensadas</td>
                </tr>
                <tr>
                  <td style={tableCellLabelStyle}>Total General:</td>
                  <td style={tableCellValueStyle}>
                    <strong style={{ color: '#059669', fontSize: '1.1rem' }}>
                      {formatearMoneda(totalGeneral)}
                    </strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Gráfico de barras visual */}
          <div style={{
            background: '#ffffff',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            marginBottom: '20px'
          }}>
            <h5 style={{
              margin: '0 0 15px 0',
              fontSize: '0.95rem',
              fontWeight: '700',
              color: '#1e293b',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Distribución de Costos
            </h5>
            
            {/* Barra de Mano de Obra Normal */}
            <div style={{ marginBottom: '15px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '5px',
                fontSize: '0.85rem'
              }}>
                <span style={{ fontWeight: '600', color: '#475569' }}>Mano de Obra Normal</span>
                <span style={{ color: '#3b82f6', fontWeight: '600' }}>
                  {formatearMoneda(manoObraNormal)} ({(100 - parseFloat(porcentajeCompensado)).toFixed(1)}%)
                </span>
              </div>
              <div style={{
                width: '100%',
                height: '30px',
                background: '#f1f5f9',
                borderRadius: '6px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${100 - parseFloat(porcentajeCompensado)}%`,
                  height: '100%',
                  background: '#3b82f6',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>

            {/* Barra de Mano de Obra Compensada */}
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '5px',
                fontSize: '0.85rem'
              }}>
                <span style={{ fontWeight: '600', color: '#475569' }}>Mano de Obra Compensada</span>
                <span style={{ color: '#d97706', fontWeight: '600' }}>
                  {formatearMoneda(manoObraCompensada)} ({porcentajeCompensado}%)
                </span>
              </div>
              <div style={{
                width: '100%',
                height: '30px',
                background: '#f1f5f9',
                borderRadius: '6px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${porcentajeCompensado}%`,
                  height: '100%',
                  background: '#fbbf24',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
          </div>

          {/* Nota informativa */}
          <div style={{
            background: '#fffbeb',
            padding: '15px 20px',
            borderRadius: '8px',
            border: '1px solid #fde68a'
          }}>
            <p style={{
              margin: 0,
              fontSize: '0.85rem',
              color: '#92400e'
            }}>
              <strong style={{ color: '#78350f' }}>Nota:</strong> Las horas compensadas representan 
              tiempo tomado por trabajadores como pago de horas extras acumuladas. Se calculan al 50% 
              del coste normal para reflejar el valor reducido de estas horas.
            </p>
          </div>
        </div>
      ) : (
        // Estado vacío
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 20px',
            background: '#e2e8f0',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: '#94a3b8',
              borderRadius: '50%'
            }} />
          </div>
          <h3 style={{
            margin: '0 0 10px 0',
            fontSize: '1.2rem',
            fontWeight: '600',
            color: '#475569'
          }}>
            No hay mano de obra compensada
          </h3>
          <p style={{
            margin: 0,
            fontSize: '0.9rem',
            color: '#64748b'
          }}>
            Este centro no tiene registros de horas compensadas en el período seleccionado.
          </p>
        </div>
      )}
    </div>
  );
};

// Estilos reutilizables
const navButtonStyle: React.CSSProperties = {
  background: '#ffffff',
  color: '#475569',
  border: '1px solid #cbd5e1',
  padding: '8px 16px',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: '600',
  fontSize: '0.85rem',
  transition: 'all 0.2s ease'
};

const tableCellLabelStyle: React.CSSProperties = {
  padding: '12px 15px 12px 0',
  fontSize: '0.9rem',
  color: '#64748b',
  fontWeight: '600',
  width: '45%'
};

const tableCellValueStyle: React.CSSProperties = {
  padding: '12px 0',
  fontSize: '0.9rem',
  color: '#1e293b',
  fontWeight: '500'
};

export default CentroCompensadosView;