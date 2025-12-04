// TrabajadoresFilters.tsx - Componente de filtros
import React from 'react';

interface TrabajadoresFiltersProps {
  busqueda: string;
  onBusquedaChange: (busqueda: string) => void;
  estadoFiltro: string;
  onEstadoChange: (estado: string) => void;
  onAgregar: () => void;
  onExportar?: () => void;
  totalTrabajadores: number;
}

const TrabajadoresFilters: React.FC<TrabajadoresFiltersProps> = ({
  busqueda,
  onBusquedaChange,
  estadoFiltro,
  onEstadoChange,
  onAgregar,
  onExportar,
  totalTrabajadores
}) => {
  return (
    <div style={{
      background: 'white',
      borderRadius: '8px',
      padding: '20px 25px',
      marginBottom: '25px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e2e8f0'
    }}>
      {/* Botones de acción */}
      <div style={{
        display: 'flex',
        gap: '15px',
        marginBottom: totalTrabajadores > 0 ? '20px' : '0',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={onAgregar}
          style={{
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: '600',
            transition: 'background 0.2s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#2563eb'}
          onMouseOut={(e) => e.currentTarget.style.background = '#3b82f6'}
        >
          Agregar Nuevo Trabajador
        </button>

        {onExportar && totalTrabajadores > 0 && (
          <button
            onClick={onExportar}
            style={{
              background: '#059669',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: '600',
              transition: 'background 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#047857'}
            onMouseOut={(e) => e.currentTarget.style.background = '#059669'}
          >
            Exportar Excel
          </button>
        )}
      </div>

      {/* Filtros de búsqueda */}
      {totalTrabajadores > 0 && (
        <div style={{
          display: 'flex',
          gap: '15px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          {/* Input de búsqueda */}
          <div style={{ flex: '1 1 300px', minWidth: '250px' }}>
            <input
              type="text"
              placeholder="Buscar por nombre o cédula..."
              value={busqueda}
              onChange={(e) => onBusquedaChange(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 15px',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                fontSize: '0.95rem',
                background: '#f8fafc',
                color: '#1e293b',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6';
                e.currentTarget.style.background = '#ffffff';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#cbd5e1';
                e.currentTarget.style.background = '#f8fafc';
              }}
            />
          </div>

          {/* Select de estado */}
          <div style={{ minWidth: '200px' }}>
            <select
              value={estadoFiltro}
              onChange={(e) => onEstadoChange(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 15px',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                fontSize: '0.95rem',
                background: '#f8fafc',
                color: '#1e293b',
                cursor: 'pointer',
                fontWeight: '500',
                outline: 'none'
              }}
            >
              <option value="todos">Todos los estados</option>
              <option value="Vigente">Solo Vigentes</option>
              <option value="No Vigente">Solo No Vigentes</option>
            </select>
          </div>

          {/* Botón limpiar (solo si hay filtros) */}
          {(busqueda.trim() || estadoFiltro !== 'todos') && (
            <button
              onClick={() => {
                onBusquedaChange('');
                onEstadoChange('todos');
              }}
              style={{
                padding: '10px 20px',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                background: '#ffffff',
                color: '#64748b',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#f1f5f9';
                e.currentTarget.style.borderColor = '#94a3b8';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.borderColor = '#cbd5e1';
              }}
            >
              Limpiar Filtros
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TrabajadoresFilters;