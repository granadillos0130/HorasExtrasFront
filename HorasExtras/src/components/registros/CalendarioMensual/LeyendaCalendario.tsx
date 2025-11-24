import React from "react";

interface LeyendaCalendarioProps {
  trabajadoresActivos: number;
}

export const LeyendaCalendario: React.FC<LeyendaCalendarioProps> = ({ trabajadoresActivos }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    marginBottom: '20px',
    flexWrap: 'wrap',
    padding: '15px',
    background: '#f8fafb',
    borderRadius: '12px',
    border: '2px solid #e1e8ed'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{
        width: '20px',
        height: '20px',
        background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
        border: '2px solid #fca5a5',
        borderRadius: '4px'
      }}></div>
      <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#dc2626' }}>
        Sin registros (0%)
      </span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{
        width: '20px',
        height: '20px',
        background: 'linear-gradient(135deg, #fed7aa, #fdba74)',
        border: '2px solid #fb923c',
        borderRadius: '4px'
      }}></div>
      <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#ea580c' }}>
        Parcial (1-99%)
      </span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{
        width: '20px',
        height: '20px',
        background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
        border: '2px solid #86efac',
        borderRadius: '4px'
      }}></div>
      <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#16a34a' }}>
        Completo (100%)
      </span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ fontSize: '0.9rem', color: '#666' }}>
        👥 {trabajadoresActivos} trabajadores activos
      </span>
    </div>
  </div>
);