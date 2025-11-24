import React from "react";
import type { FiltroTipoRegistro } from "../../../types/registros";

interface FiltrosTipoProps {
  filtroTipo: FiltroTipoRegistro;
  onSetFiltro: (filtro: FiltroTipoRegistro) => void;
  totalRegistros: number;
  registrosFiltrados: number;
}

export const FiltrosTipo: React.FC<FiltrosTipoProps> = ({
  filtroTipo,
  onSetFiltro,
  totalRegistros,
  registrosFiltrados
}) => (
  <div style={{
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    padding: '15px',
    background: 'rgba(255,255,255,0.9)',
    borderRadius: '12px',
    alignItems: 'center',
    flexWrap: 'wrap'
  }}>
    <span style={{ fontWeight: '600', color: '#374151' }}>Filtrar por:</span>
    {(['TODOS', 'TRABAJO', 'AUSENCIA'] as FiltroTipoRegistro[]).map(tipo => (
      <button
        key={tipo}
        onClick={() => onSetFiltro(tipo)}
        style={{
          background: filtroTipo === tipo 
            ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' 
            : 'white',
          color: filtroTipo === tipo ? 'white' : '#374151',
          border: `2px solid ${filtroTipo === tipo ? '#1d4ed8' : '#d1d5db'}`,
          padding: '8px 16px',
          borderRadius: '20px',
          cursor: 'pointer',
          fontWeight: '600',
          fontSize: '0.9rem',
          transition: 'all 0.3s ease'
        }}
      >
        {tipo === 'TODOS' ? '📋 Todos' : 
         tipo === 'TRABAJO' ? '👤 Trabajo' : 
         '📅 Ausencias'}
      </button>
    ))}
    
    <div style={{ marginLeft: 'auto', fontSize: '0.9rem', color: '#6b7280' }}>
      {registrosFiltrados} de {totalRegistros} registros
    </div>
  </div>
);