import React from 'react';

interface CentrosVisitadosProps {
  centros: string[];
}

export const CentrosVisitados: React.FC<CentrosVisitadosProps> = ({ centros }) => {
  if (centros.length === 0) return null;

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={headerIconStyle}>🏢</div>
        <div>
          <h3 style={titleStyle}>CENTROS VISITADOS</h3>
          <p style={subtitleStyle}>Lugares de trabajo durante el período</p>
        </div>
      </div>

      {/* Lista de centros */}
      <div style={centrosContainerStyle}>
        {centros.map((centro, index) => (
          <div key={index} style={centroBadgeStyle}>
            <span style={centroIconStyle}>📍</span>
            <span style={centroTextStyle}>{centro}</span>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div style={statsContainerStyle}>
        <div style={statsItemStyle}>
          <span style={statsIconStyle}>📊</span>
          <span style={statsTextStyle}>
            {centros.length} centro{centros.length !== 1 ? 's' : ''} diferente{centros.length !== 1 ? 's' : ''}
          </span>
        </div>
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
  alignItems: 'center',
  gap: '16px',
  padding: '24px 28px',
  borderBottom: '2px solid #e2e8f0',
  background: '#f8fafc',
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

const centrosContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '12px',
  padding: '24px 28px',
};

const centroBadgeStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 16px',
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  fontSize: '0.9rem',
  color: '#1e293b',
  fontWeight: '500',
};

const centroIconStyle: React.CSSProperties = {
  fontSize: '1rem',
};

const centroTextStyle: React.CSSProperties = {
  fontSize: '0.9rem',
};

const statsContainerStyle: React.CSSProperties = {
  padding: '16px 28px',
  background: '#f8fafc',
  borderTop: '1px solid #e2e8f0',
};

const statsItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const statsIconStyle: React.CSSProperties = {
  fontSize: '1rem',
};

const statsTextStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  color: '#475569',
  fontWeight: '600',
};