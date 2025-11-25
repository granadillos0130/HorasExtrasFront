import React from 'react';

interface CentrosVisitadosProps {
  centros: string[];
}

export const CentrosVisitados: React.FC<CentrosVisitadosProps> = ({ centros }) => {
  if (centros.length === 0) return null;

  return (
    <div className="centros-visitados-card">
      <div className="centros-header">
        <div className="centros-icon">🏢</div>
        <h3>Centros visitados en este período</h3>
      </div>
      <div className="centros-lista">
        {centros.map((centro, index) => (
          <span key={index} className="centro-badge">{centro}</span>
        ))}
      </div>
      <div className="centros-stats">
        <span className="centros-count">
          {centros.length} centro{centros.length !== 1 ? 's' : ''} diferente{centros.length !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
};