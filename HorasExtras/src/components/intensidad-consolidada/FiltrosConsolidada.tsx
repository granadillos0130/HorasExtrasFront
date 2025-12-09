// components/intensidad-consolidada/FiltrosConsolidada.tsx
import React from 'react';
import {  getRangoFechasTexto, getDiasEnRango } from '../../utils/trabajadores/fechaUtils';

interface FiltrosConsolidadaProps {
  fechaInicio: string;
  fechaFin: string;
  onFechaInicioChange: (fecha: string) => void;
  onFechaFinChange: (fecha: string) => void;
  rangoPreseleccionado: string;
  onRangoPreseleccionado: (rango: string) => void;
  busqueda: string;
  onBusquedaChange: (busqueda: string) => void;
  estadoFiltro: string;
  onEstadoChange: (estado: string) => void;
  onExportarExcel: () => void;
  deshabilitarExportar?: boolean;
}

export const FiltrosConsolidada: React.FC<FiltrosConsolidadaProps> = ({
  fechaInicio,
  fechaFin,
  onFechaInicioChange,
  onFechaFinChange,
  rangoPreseleccionado,
  onRangoPreseleccionado,
  busqueda,
  onBusquedaChange,
  estadoFiltro,
  onEstadoChange,
  onExportarExcel,
  deshabilitarExportar = false,
}) => {
  const diasEnRango = getDiasEnRango(fechaInicio, fechaFin);

  return (
    <div style={{
      background: 'white',
      borderRadius: '8px',
      padding: '25px',
      marginBottom: '25px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e2e8f0'
    }}>
      {/* Header de filtros */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '25px',
        paddingBottom: '15px',
        borderBottom: '2px solid #e2e8f0'
      }}>
        <h3 style={{
          margin: 0,
          fontSize: '1.2rem',
          fontWeight: '700',
          color: '#1e293b',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          Filtros de Consulta
        </h3>
        <button
          onClick={onExportarExcel}
          disabled={deshabilitarExportar}
          style={{
            background: deshabilitarExportar ? '#e2e8f0' : '#10b981',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: deshabilitarExportar ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            opacity: deshabilitarExportar ? 0.5 : 1
          }}
          onMouseEnter={(e) => {
            if (!deshabilitarExportar) {
              e.currentTarget.style.background = '#059669';
            }
          }}
          onMouseLeave={(e) => {
            if (!deshabilitarExportar) {
              e.currentTarget.style.background = '#10b981';
            }
          }}
        >
          Exportar Excel
        </button>
      </div>

      {/* Rangos rápidos */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          fontSize: '0.85rem',
          fontWeight: '600',
          color: '#475569',
          marginBottom: '10px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          Período de Consulta
        </label>
        <div style={{
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap'
        }}>
          {[
            { value: 'hoy', label: 'Hoy' },
            { value: 'ayer', label: 'Ayer' },
            { value: 'semana_actual', label: 'Esta Semana' },
            { value: 'semana_pasada', label: 'Semana Pasada' },
            { value: 'mes_actual', label: 'Este Mes' },
            { value: 'mes_pasado', label: 'Mes Pasado' },
            { value: 'personalizado', label: 'Personalizado' },
          ].map(rango => (
            <button
              key={rango.value}
              onClick={() => onRangoPreseleccionado(rango.value)}
              style={{
                padding: '8px 16px',
                border: rangoPreseleccionado === rango.value ? '2px solid #3b82f6' : '1px solid #cbd5e1',
                borderRadius: '6px',
                background: rangoPreseleccionado === rango.value ? '#eff6ff' : 'white',
                color: rangoPreseleccionado === rango.value ? '#1e40af' : '#64748b',
                fontSize: '0.85rem',
                fontWeight: rangoPreseleccionado === rango.value ? '600' : '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (rangoPreseleccionado !== rango.value) {
                  e.currentTarget.style.background = '#f8fafc';
                  e.currentTarget.style.borderColor = '#94a3b8';
                }
              }}
              onMouseLeave={(e) => {
                if (rangoPreseleccionado !== rango.value) {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.borderColor = '#cbd5e1';
                }
              }}
            >
              {rango.label}
            </button>
          ))}
        </div>
      </div>

      {/* Fechas y filtros en grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        marginBottom: '20px'
      }}>
        {/* Fecha Inicio */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '0.85rem',
            fontWeight: '600',
            color: '#475569',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Fecha Inicio
          </label>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => onFechaInicioChange(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: '500',
              color: '#1e293b'
            }}
          />
        </div>

        {/* Fecha Fin */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '0.85rem',
            fontWeight: '600',
            color: '#475569',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Fecha Fin
          </label>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => onFechaFinChange(e.target.value)}
            min={fechaInicio}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: '500',
              color: '#1e293b'
            }}
          />
        </div>

        {/* Búsqueda */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '0.85rem',
            fontWeight: '600',
            color: '#475569',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Buscar Trabajador
          </label>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => onBusquedaChange(e.target.value)}
            placeholder="Nombre o cédula..."
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: '500',
              color: '#1e293b'
            }}
          />
        </div>

        {/* Estado */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '0.85rem',
            fontWeight: '600',
            color: '#475569',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Estado
          </label>
          <select
            value={estadoFiltro}
            onChange={(e) => onEstadoChange(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: '500',
              color: '#1e293b',
              background: 'white',
              cursor: 'pointer'
            }}
          >
            <option value="todos">Todos</option>
            <option value="Vigente">Vigente</option>
            <option value="No Vigente">No Vigente</option>
          </select>
        </div>
      </div>

      {/* Info del rango */}
      <div style={{
        display: 'flex',
        gap: '20px',
        padding: '15px',
        background: '#f8fafc',
        borderRadius: '6px',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ flex: 1 }}>
          <span style={{
            fontSize: '0.8rem',
            color: '#64748b',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Período:
          </span>
          <span style={{
            marginLeft: '8px',
            fontSize: '0.9rem',
            color: '#1e293b',
            fontWeight: '500'
          }}>
            {getRangoFechasTexto(fechaInicio, fechaFin)}
          </span>
        </div>
        <div>
          <span style={{
            fontSize: '0.8rem',
            color: '#64748b',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Días:
          </span>
          <span style={{
            marginLeft: '8px',
            fontSize: '0.9rem',
            color: '#1e293b',
            fontWeight: '600'
          }}>
            {diasEnRango}
          </span>
        </div>
      </div>
    </div>
  );
};