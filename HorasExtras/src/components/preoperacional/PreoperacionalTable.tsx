import React from 'react';
import type { Preoperacional } from '../../types/preoperacional';
import { PreoperacionalRow } from './PreoperacionalRow';

interface PreoperacionalTableProps {
  preoperacionales: Preoperacional[];
  loading?: boolean;
  onViewDetails?: (preoperacional: Preoperacional) => void;
}

export const PreoperacionalTable: React.FC<PreoperacionalTableProps> = ({ 
  preoperacionales, 
  loading = false,
  onViewDetails 
}) => {
  const containerStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    overflow: 'hidden'
  };

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse'
  };

  const theadStyle: React.CSSProperties = {
    backgroundColor: '#28a745',
    color: 'white'
  };

  const thStyle: React.CSSProperties = {
    padding: '16px 12px',
    textAlign: 'left',
    fontWeight: '600',
    fontSize: '14px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  const loadingContainerStyle: React.CSSProperties = {
    padding: '60px 20px',
    textAlign: 'center',
    color: '#666'
  };

  const emptyContainerStyle: React.CSSProperties = {
    padding: '60px 20px',
    textAlign: 'center',
    color: '#999'
  };

  const emptyIconStyle: React.CSSProperties = {
    fontSize: '48px',
    marginBottom: '16px',
    opacity: 0.5
  };

  const spinnerStyle: React.CSSProperties = {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #28a745',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 16px'
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={loadingContainerStyle}>
          <div style={spinnerStyle}></div>
          <div>Cargando preoperacionales...</div>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (preoperacionales.length === 0) {
    return (
      <div style={containerStyle}>
        <div style={emptyContainerStyle}>
          <div style={emptyIconStyle}>📋</div>
          <div style={{ fontSize: '18px', fontWeight: '500', marginBottom: '8px' }}>
            No hay preoperacionales
          </div>
          <div style={{ fontSize: '14px' }}>
            No se encontraron registros con los filtros aplicados
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <table style={tableStyle}>
        <thead style={theadStyle}>
          <tr>
            <th style={thStyle}>Vehículo</th>
            <th style={thStyle}>Día / Fecha</th>
            <th style={thStyle}>Mes / Semana</th>
            <th style={thStyle}>Estado</th>
            <th style={thStyle}>Fallas</th>
          </tr>
        </thead>
        <tbody>
          {preoperacionales.map((preoperacional) => (
            <PreoperacionalRow
              key={`${preoperacional.id}-${preoperacional.diaSemana}`}
              preoperacional={preoperacional}
              onViewDetails={onViewDetails}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};