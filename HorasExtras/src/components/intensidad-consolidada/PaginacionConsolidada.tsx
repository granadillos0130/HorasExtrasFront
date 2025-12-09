// components/intensidad-consolidada/PaginacionConsolidada.tsx
import React from 'react';

interface PaginacionConsolidadaProps {
  paginaActual: number;
  totalPaginas: number;
  itemsPorPagina: number;
  totalItems: number;
  onCambioPagina: (pagina: number) => void;
  onCambioItemsPorPagina: (items: number) => void;
}

export const PaginacionConsolidada: React.FC<PaginacionConsolidadaProps> = ({
  paginaActual,
  totalPaginas,
  itemsPorPagina,
  totalItems,
  onCambioPagina,
  onCambioItemsPorPagina,
}) => {
  const inicio = (paginaActual - 1) * itemsPorPagina + 1;
  const fin = Math.min(paginaActual * itemsPorPagina, totalItems);

  return (
    <div style={{
      background: 'white',
      borderRadius: '8px',
      padding: '20px 25px',
      marginBottom: '25px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e2e8f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '15px'
    }}>
      {/* Info de registros */}
      <div style={{
        fontSize: '0.9rem',
        color: '#64748b',
        fontWeight: '500'
      }}>
        Mostrando{' '}
        <strong style={{ color: '#1e40af' }}>{inicio}</strong>
        {' '}a{' '}
        <strong style={{ color: '#1e40af' }}>{fin}</strong>
        {' '}de{' '}
        <strong style={{ color: '#1e40af' }}>{totalItems}</strong>
        {' '}trabajador{totalItems !== 1 ? 'es' : ''}
      </div>

      {/* Controles de navegación */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        {/* Primera página */}
        <button
          onClick={() => onCambioPagina(1)}
          disabled={paginaActual === 1}
          style={{
            ...buttonStyle,
            opacity: paginaActual === 1 ? 0.4 : 1,
            cursor: paginaActual === 1 ? 'not-allowed' : 'pointer'
          }}
          onMouseEnter={(e) => {
            if (paginaActual !== 1) {
              e.currentTarget.style.background = '#e2e8f0';
            }
          }}
          onMouseLeave={(e) => {
            if (paginaActual !== 1) {
              e.currentTarget.style.background = '#f8fafc';
            }
          }}
        >
          ⟪
        </button>

        {/* Página anterior */}
        <button
          onClick={() => onCambioPagina(Math.max(1, paginaActual - 1))}
          disabled={paginaActual === 1}
          style={{
            ...buttonStyle,
            opacity: paginaActual === 1 ? 0.4 : 1,
            cursor: paginaActual === 1 ? 'not-allowed' : 'pointer'
          }}
          onMouseEnter={(e) => {
            if (paginaActual !== 1) {
              e.currentTarget.style.background = '#e2e8f0';
            }
          }}
          onMouseLeave={(e) => {
            if (paginaActual !== 1) {
              e.currentTarget.style.background = '#f8fafc';
            }
          }}
        >
          ‹
        </button>

        {/* Indicador de página actual */}
        <div style={{
          padding: '8px 20px',
          background: '#eff6ff',
          borderRadius: '8px',
          fontSize: '0.9rem',
          fontWeight: '600',
          color: '#1e40af',
          minWidth: '120px',
          textAlign: 'center'
        }}>
          Página {paginaActual} de {totalPaginas}
        </div>

        {/* Página siguiente */}
        <button
          onClick={() => onCambioPagina(Math.min(totalPaginas, paginaActual + 1))}
          disabled={paginaActual === totalPaginas}
          style={{
            ...buttonStyle,
            opacity: paginaActual === totalPaginas ? 0.4 : 1,
            cursor: paginaActual === totalPaginas ? 'not-allowed' : 'pointer'
          }}
          onMouseEnter={(e) => {
            if (paginaActual !== totalPaginas) {
              e.currentTarget.style.background = '#e2e8f0';
            }
          }}
          onMouseLeave={(e) => {
            if (paginaActual !== totalPaginas) {
              e.currentTarget.style.background = '#f8fafc';
            }
          }}
        >
          ›
        </button>

        {/* Última página */}
        <button
          onClick={() => onCambioPagina(totalPaginas)}
          disabled={paginaActual === totalPaginas}
          style={{
            ...buttonStyle,
            opacity: paginaActual === totalPaginas ? 0.4 : 1,
            cursor: paginaActual === totalPaginas ? 'not-allowed' : 'pointer'
          }}
          onMouseEnter={(e) => {
            if (paginaActual !== totalPaginas) {
              e.currentTarget.style.background = '#e2e8f0';
            }
          }}
          onMouseLeave={(e) => {
            if (paginaActual !== totalPaginas) {
              e.currentTarget.style.background = '#f8fafc';
            }
          }}
        >
          ⟫
        </button>
      </div>

      {/* Selector de items por página */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '0.9rem',
        color: '#64748b'
      }}>
        <label style={{ fontWeight: '500' }}>Mostrar:</label>
        <select
          value={itemsPorPagina}
          onChange={(e) => {
            onCambioItemsPorPagina(Number(e.target.value));
            onCambioPagina(1); // Reset a primera página
          }}
          style={{
            padding: '6px 10px',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            fontSize: '0.9rem',
            background: '#f8fafc',
            cursor: 'pointer',
            fontWeight: '500',
            color: '#1e293b'
          }}
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <span style={{ fontWeight: '500' }}>por página</span>
      </div>
    </div>
  );
};

// Estilo reutilizable para botones
const buttonStyle: React.CSSProperties = {
  background: '#f8fafc',
  border: '1px solid #cbd5e1',
  borderRadius: '6px',
  padding: '8px 12px',
  fontSize: '1.2rem',
  fontWeight: '600',
  color: '#475569',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  minWidth: '40px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};