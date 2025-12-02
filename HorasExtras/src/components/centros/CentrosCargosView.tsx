// CentroCargosView.tsx
import React from "react";

interface CentroCargosViewProps {
  datosCompletos: {
    cargosUnicos: string[];
  };
  onToggleModal: () => void;
  onToggleCompensados?: () => void;
}

const CentroCargosView: React.FC<CentroCargosViewProps> = ({
  datosCompletos,
  onToggleModal,
  onToggleCompensados
}) => {
  return (
    <div>
      {/* Header con botones de navegación */}
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
        <h4 style={{
          margin: 0,
          fontSize: '1rem',
          fontWeight: '700',
          color: '#1e293b',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          Cargos en el Centro
        </h4>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={onToggleModal}
            style={navButtonStyle}
          >
            Ver Información
          </button>
          {onToggleCompensados && (
            <button
              onClick={onToggleCompensados}
              style={navButtonStyle}
            >
              Ver Compensados
            </button>
          )}
        </div>
      </div>

      {/* Lista de cargos */}
      {datosCompletos.cargosUnicos.length > 0 ? (
        <div>
          {/* Contador de cargos */}
          <div style={{
            background: '#eff6ff',
            padding: '12px 20px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #bfdbfe'
          }}>
            <span style={{
              fontSize: '0.9rem',
              color: '#1e40af',
              fontWeight: '600'
            }}>
              Total de cargos: {datosCompletos.cargosUnicos.length}
            </span>
          </div>

          {/* Grid de cargos */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '12px',
            maxHeight: '450px',
            overflowY: 'auto',
            padding: '5px'
          }}>
            {datosCompletos.cargosUnicos.map((cargo: string, index: number) => (
              <div
                key={index}
                style={{
                  background: '#ffffff',
                  padding: '18px 20px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.15)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Indicador visual */}
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  background: '#eff6ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '4px',
                    background: '#3b82f6'
                  }} />
                </div>

                {/* Información del cargo */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    color: '#1e293b',
                    marginBottom: '2px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {cargo}
                  </div>
                  <div style={{
                    fontSize: '0.8rem',
                    color: '#64748b'
                  }}>
                    Presente en proyecto
                  </div>
                </div>

                {/* Badge de estado */}
                <div style={{
                  background: '#dcfce7',
                  color: '#15803d',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  flexShrink: 0
                }}>
                  ACTIVO
                </div>
              </div>
            ))}
          </div>

          {/* Nota informativa */}
          <div style={{
            marginTop: '20px',
            padding: '12px 16px',
            background: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            <p style={{
              margin: 0,
              fontSize: '0.85rem',
              color: '#64748b'
            }}>
              <strong style={{ color: '#1e293b' }}>Nota:</strong> Los cargos listados representan 
              todas las posiciones de trabajo activas en este centro de trabajo.
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
              borderRadius: '8px'
            }} />
          </div>
          <h3 style={{
            margin: '0 0 10px 0',
            fontSize: '1.2rem',
            fontWeight: '600',
            color: '#475569'
          }}>
            No hay información de cargos
          </h3>
          <p style={{
            margin: 0,
            fontSize: '0.9rem',
            color: '#64748b'
          }}>
            No se encontró información detallada de los cargos para este centro.
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

export default CentroCargosView;