/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { PreoperacionalFilters } from '../components/preoperacional/PreoperacionalFilters';
import { PreoperacionalTable } from '../components/preoperacional/PreoperacionalTable';
import { preoperacionalApi } from '../api/preoperacionalService';
import type { Preoperacional, PreoperacionalFilters as PreoperacionalFiltersType } from '../types/preoperacional';

export const PreoperacionalesPage: React.FC = () => {
  const [preoperacionales, setPreoperacionales] = useState<Preoperacional[]>([]);
  const [filteredPreoperacionales, setFilteredPreoperacionales] = useState<Preoperacional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const containerStyle: React.CSSProperties = {
    padding: '24px',
    maxWidth: '1400px',
    margin: '0 auto',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5'
  };

  const headerStyle: React.CSSProperties = {
    marginBottom: '32px'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '32px',
    fontWeight: '700',
    color: '#333',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '16px',
    color: '#666',
    fontWeight: '400'
  };

  const statsContainerStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '24px'
  };

  const statCardStyle: React.CSSProperties = {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    border: '1px solid #e0e0e0'
  };

  const statValueStyle: React.CSSProperties = {
    fontSize: '32px',
    fontWeight: '700',
    marginBottom: '4px'
  };

  const statLabelStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#666',
    fontWeight: '500'
  };

  const errorStyle: React.CSSProperties = {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #f5c6cb',
    marginBottom: '24px'
  };

  // Cargar preoperacionales al montar el componente
  useEffect(() => {
    loadPreoperacionales();
  }, []);

  const loadPreoperacionales = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await preoperacionalApi.getAll();
      setPreoperacionales(data);
      setFilteredPreoperacionales(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar preoperacionales');
      console.error('Error cargando preoperacionales:', err);
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros
  const handleFilterChange = (filters: PreoperacionalFiltersType) => {
    let filtered = [...preoperacionales];

    // Filtrar por vehículo
    if (filters.vehiculo) {
      filtered = filtered.filter(p => 
        p.vehiculo.toLowerCase().includes(filters.vehiculo!.toLowerCase()) ||
        p.placa.toLowerCase().includes(filters.vehiculo!.toLowerCase())
      );
    }

    // Filtrar por estado
    if (filters.estado) {
      filtered = filtered.filter(p => p.estado === filters.estado);
    }

    // Filtrar por fecha desde
    if (filters.fechaDesde) {
      const fechaDesde = new Date(filters.fechaDesde);
      filtered = filtered.filter(p => new Date(p.fecha) >= fechaDesde);
    }

    // Filtrar por fecha hasta
    if (filters.fechaHasta) {
      const fechaHasta = new Date(filters.fechaHasta);
      filtered = filtered.filter(p => new Date(p.fecha) <= fechaHasta);
    }

    setFilteredPreoperacionales(filtered);
  };

  // Ver detalles (para futuro)
  const handleViewDetails = (preoperacional: Preoperacional) => {
    console.log('Ver detalles:', preoperacional);
    // Aquí puedes agregar navegación o modal con detalles
  };

  // Calcular estadísticas
  const totalPreoperacionales = filteredPreoperacionales.length;
  const conFallas = filteredPreoperacionales.filter(p => p.estado === 'Con Fallas').length;
  const sinFallas = filteredPreoperacionales.filter(p => p.estado === 'OK').length;
  const sinVerificar = filteredPreoperacionales.filter(p => p.estado === 'Sin verificar').length;

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>
          🚗 Preoperacionales de Vehículos
        </h1>
        <p style={subtitleStyle}>
          Gestión y seguimiento de inspecciones vehiculares
        </p>
      </div>

      {/* Estadísticas */}
      <div style={statsContainerStyle}>
        <div style={statCardStyle}>
          <div style={{ ...statValueStyle, color: '#333' }}>{totalPreoperacionales}</div>
          <div style={statLabelStyle}>Total</div>
        </div>
        <div style={statCardStyle}>
          <div style={{ ...statValueStyle, color: '#28a745' }}>{sinFallas}</div>
          <div style={statLabelStyle}>Sin Fallas</div>
        </div>
        <div style={statCardStyle}>
          <div style={{ ...statValueStyle, color: '#dc3545' }}>{conFallas}</div>
          <div style={statLabelStyle}>Con Fallas</div>
        </div>
        <div style={statCardStyle}>
          <div style={{ ...statValueStyle, color: '#ffc107' }}>{sinVerificar}</div>
          <div style={statLabelStyle}>Sin Verificar</div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={errorStyle}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Filtros */}
      <PreoperacionalFilters onFilterChange={handleFilterChange} />

      {/* Tabla */}
      <PreoperacionalTable
        preoperacionales={filteredPreoperacionales}
        loading={loading}
        onViewDetails={handleViewDetails}
      />
    </div>
  );
};