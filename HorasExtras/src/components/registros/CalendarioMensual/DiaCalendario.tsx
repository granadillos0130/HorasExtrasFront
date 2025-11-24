import React from "react";

interface DiaCalendarioProps {
  dia: number | null;
  colores?: {
    background: string;
    color: string;
    border: string;
  };
  tooltip?: string;
  estadisticaInfo: string | null;
  onClick: () => void;
}

export const DiaCalendario: React.FC<DiaCalendarioProps> = ({
  dia,
  colores,
  tooltip,
  estadisticaInfo,
  onClick
}) => {
  if (!dia) {
    return (
      <div style={{
        minHeight: '70px',
        border: '2px solid transparent',
        borderRadius: '10px'
      }} />
    );
  }

  return (
    <div 
      style={{
        minHeight: '70px',
        border: `2px solid ${colores?.border}`,
        borderRadius: '10px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        background: colores?.background,
        fontSize: '1.2rem',
        fontWeight: '600',
        color: colores?.color,
        transition: 'all 0.3s ease',
        position: 'relative'
      }}
      onClick={onClick}
      title={tooltip}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.zIndex = '10';
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.zIndex = '1';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ fontSize: '1.2rem', fontWeight: '700' }}>
        {dia}
      </div>
      {estadisticaInfo && (
        <div style={{ 
          fontSize: '0.7rem', 
          fontWeight: '600',
          marginTop: '2px',
          opacity: 0.8
        }}>
          {estadisticaInfo}
        </div>
      )}
    </div>
  );
};