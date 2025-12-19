import React, { useState } from 'react';
import type { PreoperacionalFilters as PreoperacionalFiltersType } from '../../types/preoperacional';

interface PreoperacionalFiltersProps {
  onFilterChange: (filters: PreoperacionalFiltersType) => void;
}

export const PreoperacionalFilters: React.FC<PreoperacionalFiltersProps> = ({ 
  onFilterChange 
}) => {
  const [filters, setFilters] = useState<PreoperacionalFiltersType>({});

  const containerStyle: React.CSSProperties = {
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '24px',
    border: '1px solid #e0e0e0'
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '16px'
  };

  const inputGroupStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333'
  };

  const inputStyle: React.CSSProperties = {
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #ced4da',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s'
  };

  const buttonContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end'
  };

  const buttonStyle: React.CSSProperties = {
    padding: '10px 20px',
    borderRadius: '6px',
    border: 'none',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  };

  const primaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#28a745',
    color: 'white'
  };

  const secondaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#6c757d',
    color: 'white'
  };

  const handleInputChange = (field: keyof PreoperacionalFiltersType, value: string) => {
    const newFilters = { ...filters, [field]: value || undefined };
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    onFilterChange(filters);
  };

  const handleClearFilters = () => {
    const emptyFilters: PreoperacionalFiltersType = {};
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  return (
    <div style={containerStyle}>
      <div style={gridStyle}>
        <div style={inputGroupStyle}>
          <label style={labelStyle}>Vehículo</label>
          <input
            type="text"
            placeholder="Buscar por vehículo..."
            value={filters.vehiculo || ''}
            onChange={(e) => handleInputChange('vehiculo', e.target.value)}
            style={inputStyle}
            onFocus={(e) => e.currentTarget.style.borderColor = '#28a745'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#ced4da'}
          />
        </div>

        <div style={inputGroupStyle}>
          <label style={labelStyle}>Estado</label>
          <select
            value={filters.estado || ''}
            onChange={(e) => handleInputChange('estado', e.target.value)}
            style={inputStyle}
            onFocus={(e) => e.currentTarget.style.borderColor = '#28a745'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#ced4da'}
          >
            <option value="">Todos</option>
            <option value="OK">OK</option>
            <option value="Con Fallas">Con Fallas</option>
            <option value="Sin verificar">Sin verificar</option>
          </select>
        </div>

        <div style={inputGroupStyle}>
          <label style={labelStyle}>Fecha Desde</label>
          <input
            type="date"
            value={filters.fechaDesde || ''}
            onChange={(e) => handleInputChange('fechaDesde', e.target.value)}
            style={inputStyle}
            onFocus={(e) => e.currentTarget.style.borderColor = '#28a745'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#ced4da'}
          />
        </div>

        <div style={inputGroupStyle}>
          <label style={labelStyle}>Fecha Hasta</label>
          <input
            type="date"
            value={filters.fechaHasta || ''}
            onChange={(e) => handleInputChange('fechaHasta', e.target.value)}
            style={inputStyle}
            onFocus={(e) => e.currentTarget.style.borderColor = '#28a745'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#ced4da'}
          />
        </div>
      </div>

      <div style={buttonContainerStyle}>
        <button
          onClick={handleClearFilters}
          style={secondaryButtonStyle}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5a6268'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6c757d'}
        >
          Limpiar
        </button>
        <button
          onClick={handleApplyFilters}
          style={primaryButtonStyle}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#218838'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#28a745'}
        >
          Aplicar Filtros
        </button>
      </div>
    </div>
  );
};