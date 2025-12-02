// CentrosPagination.tsx
import React from "react";

interface CentrosPaginationProps {
  paginaActual: number;
  totalPaginas: number;
  itemsPorPagina: number;
  totalItems: number;
  onCambioPagina: (pagina: number) => void;
  onCambioItemsPorPagina?: (items: number) => void;
}

const CentrosPagination: React.FC<CentrosPaginationProps> = ({
  paginaActual,
  totalPaginas,
  itemsPorPagina,
  totalItems,
  onCambioPagina,
  onCambioItemsPorPagina
}) => {
  // Calcular rango de items mostrados
  const primerItem = totalItems === 0 ? 0 : (paginaActual - 1) * itemsPorPagina + 1;
  const ultimoItem = Math.min(paginaActual * itemsPorPagina, totalItems);

  const irPrimeraPagina = () => onCambioPagina(1);
  const irUltimaPagina = () => onCambioPagina(totalPaginas);
  const irPaginaAnterior = () => onCambioPagina(Math.max(1, paginaActual - 1));
  const irPaginaSiguiente = () => onCambioPagina(Math.min(totalPaginas, paginaActual + 1));

  // Si no hay items, no mostrar paginación
  if (totalItems === 0) {
    return null;
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '20px 25px',
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      marginTop: '20px',
      flexWrap: 'wrap',
      gap: '15px'
    }}>
      {/* Información de registros */}
      <div style={{
        fontSize: '0.9rem',
        color: '#64748b',
        fontWeight: '500'
      }}>
        Mostrando <strong style={{ color: '#1e40af' }}>{primerItem}</strong> a{' '}
        <strong style={{ color: '#1e40af' }}>{ultimoItem}</strong> de{' '}
        <strong style={{ color: '#1e40af' }}>{totalItems}</strong> centro{totalItems !== 1 ? 's' : ''}
      </div>

      {/* Controles de navegación */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        {/* Botón Primera Página */}
        <button
          onClick={irPrimeraPagina}
          disabled={paginaActual === 1}
          style={{
            ...buttonStyle,
            opacity: paginaActual === 1 ? 0.4 : 1,
            cursor: paginaActual === 1 ? 'not-allowed' : 'pointer'
          }}
          title="Primera página"
        >
          ⟪
        </button>

        {/* Botón Página Anterior */}
        <button
          onClick={irPaginaAnterior}
          disabled={paginaActual === 1}
          style={{
            ...buttonStyle,
            opacity: paginaActual === 1 ? 0.4 : 1,
            cursor: paginaActual === 1 ? 'not-allowed' : 'pointer'
          }}
          title="Página anterior"
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

        {/* Botón Página Siguiente */}
        <button
          onClick={irPaginaSiguiente}
          disabled={paginaActual === totalPaginas}
          style={{
            ...buttonStyle,
            opacity: paginaActual === totalPaginas ? 0.4 : 1,
            cursor: paginaActual === totalPaginas ? 'not-allowed' : 'pointer'
          }}
          title="Página siguiente"
        >
          ›
        </button>

        {/* Botón Última Página */}
        <button
          onClick={irUltimaPagina}
          disabled={paginaActual === totalPaginas}
          style={{
            ...buttonStyle,
            opacity: paginaActual === totalPaginas ? 0.4 : 1,
            cursor: paginaActual === totalPaginas ? 'not-allowed' : 'pointer'
          }}
          title="Última página"
        >
          ⟫
        </button>
      </div>

      {/* Selector de items por página (opcional) */}
      {onCambioItemsPorPagina && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.9rem',
          color: '#64748b'
        }}>
          <label>Mostrar:</label>
          <select
            value={itemsPorPagina}
            onChange={(e) => onCambioItemsPorPagina(Number(e.target.value))}
            style={{
              padding: '6px 10px',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              fontSize: '0.9rem',
              background: '#f8fafc',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span>por página</span>
        </div>
      )}
    </div>
  );
};

// Estilo base para botones de navegación
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
  minWidth: '40px'
};

export default CentrosPagination;