import React from 'react';
import TrabajadorBuscador from '../shared/TrabajadorBuscador';
import type { Trabajador } from '../../types/trabajadores';
import { getRangoFechasTexto, getDiasEnRango } from '../../utils/trabajadores/fechaUtils';

interface FiltrosIntensidadProps {
  trabajadores: Trabajador[];
  trabajadorSeleccionado: number;
  onTrabajadorChange: (id: number, trabajador?: Trabajador) => void;
  fechaInicio: string;
  fechaFin: string;
  onFechaInicioChange: (fecha: string) => void;
  onFechaFinChange: (fecha: string) => void;
  rangoPreseleccionado: string;
  onRangoPreseleccionado: (rango: string) => void;
}

export const FiltrosIntensidad: React.FC<FiltrosIntensidadProps> = ({
  trabajadores,
  trabajadorSeleccionado,
  onTrabajadorChange,
  fechaInicio,
  fechaFin,
  onFechaInicioChange,
  onFechaFinChange,
  rangoPreseleccionado,
  onRangoPreseleccionado,
}) => {
  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={headerIconStyle}>🔍</div>
        <div>
          <h2 style={titleStyle}>FILTROS DE BÚSQUEDA</h2>
          <p style={subtitleStyle}>Configure los parámetros de consulta</p>
        </div>
      </div>

      {/* Form */}
      <div style={formContainerStyle}>
        {/* Trabajador */}
        <div style={formGroupStyle}>
          <TrabajadorBuscador
            trabajadores={trabajadores}
            value={trabajadorSeleccionado}
            onChange={onTrabajadorChange}
            placeholder="Buscar trabajador por nombre o cédula..."
            label="Seleccionar Trabajador"
            required
            showSelectedInfo={true}
          />
        </div>

        {/* Período */}
        <div style={formGroupStyle}>
          <label style={labelStyle}>PERÍODO DE CONSULTA</label>
          <div style={rangeButtonsContainerStyle}>
            <button
              style={rangoPreseleccionado === 'hoy' ? activeRangeButtonStyle : rangeButtonStyle}
              onClick={() => onRangoPreseleccionado('hoy')}
            >
              📅 Hoy
            </button>
            <button
              style={rangoPreseleccionado === 'ayer' ? activeRangeButtonStyle : rangeButtonStyle}
              onClick={() => onRangoPreseleccionado('ayer')}
            >
              ⏮️ Ayer
            </button>
            <button
              style={rangoPreseleccionado === 'semana_actual' ? activeRangeButtonStyle : rangeButtonStyle}
              onClick={() => onRangoPreseleccionado('semana_actual')}
            >
              📝 Esta Semana
            </button>
            <button
              style={rangoPreseleccionado === 'semana_pasada' ? activeRangeButtonStyle : rangeButtonStyle}
              onClick={() => onRangoPreseleccionado('semana_pasada')}
            >
              📄 Semana Pasada
            </button>
            <button
              style={rangoPreseleccionado === 'mes_actual' ? activeRangeButtonStyle : rangeButtonStyle}
              onClick={() => onRangoPreseleccionado('mes_actual')}
            >
              📊 Este Mes
            </button>
            <button
              style={rangoPreseleccionado === 'mes_pasado' ? activeRangeButtonStyle : rangeButtonStyle}
              onClick={() => onRangoPreseleccionado('mes_pasado')}
            >
              📈 Mes Pasado
            </button>
            <button
              style={rangoPreseleccionado === 'personalizado' ? activeRangeButtonStyle : rangeButtonStyle}
              onClick={() => onRangoPreseleccionado('personalizado')}
            >
              🎯 Personalizado
            </button>
          </div>
        </div>

        {/* Fechas */}
        <div style={dateRowStyle}>
          <div style={dateGroupStyle}>
            <label style={labelStyle}>FECHA DE INICIO</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => onFechaInicioChange(e.target.value)}
              style={dateInputStyle}
            />
          </div>

          <div style={dateGroupStyle}>
            <label style={labelStyle}>FECHA DE FIN</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => onFechaFinChange(e.target.value)}
              style={dateInputStyle}
              min={fechaInicio}
            />
          </div>
        </div>

        {/* Info */}
        <div style={infoContainerStyle}>
          <div style={infoItemStyle}>
            <span style={infoIconStyle}>📅</span>
            <span style={infoTextStyle}>
              <strong>Período:</strong> {getRangoFechasTexto(fechaInicio, fechaFin)}
            </span>
          </div>
          <div style={infoItemStyle}>
            <span style={infoIconStyle}>📊</span>
            <span style={infoTextStyle}>
              <strong>Días en rango:</strong> {getDiasEnRango(fechaInicio, fechaFin)} día{getDiasEnRango(fechaInicio, fechaFin) !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Estilos
const containerStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: '12px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  overflow: 'hidden',
  marginBottom: '20px',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  padding: '24px 28px',
  borderBottom: '2px solid #e2e8f0',
  background: '#f8fafc',
};

const headerIconStyle: React.CSSProperties = {
  fontSize: '2rem',
  background: '#eff6ff',
  width: '56px',
  height: '56px',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const titleStyle: React.CSSProperties = {
  margin: '0 0 4px 0',
  fontSize: '1.1rem',
  fontWeight: '700',
  color: '#1e293b',
  letterSpacing: '0.02em',
};

const subtitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.875rem',
  color: '#64748b',
};

const formContainerStyle: React.CSSProperties = {
  padding: '28px',
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
};

const formGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: '700',
  color: '#475569',
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  marginBottom: '8px',
};

const rangeButtonsContainerStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
  gap: '8px',
};

const rangeButtonStyle: React.CSSProperties = {
  padding: '10px 16px',
  background: 'white',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  fontSize: '0.85rem',
  fontWeight: '500',
  color: '#475569',
  cursor: 'pointer',
  transition: 'all 0.2s',
  whiteSpace: 'nowrap',
};

const activeRangeButtonStyle: React.CSSProperties = {
  ...rangeButtonStyle,
  background: '#eff6ff',
  border: '2px solid #3b82f6',
  color: '#1e40af',
  fontWeight: '600',
};

const dateRowStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '16px',
};

const dateGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
};

const dateInputStyle: React.CSSProperties = {
  padding: '10px 14px',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  fontSize: '0.9rem',
  color: '#1e293b',
  outline: 'none',
  transition: 'all 0.2s',
};

const infoContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  padding: '16px',
  background: '#f8fafc',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
};

const infoItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
};

const infoIconStyle: React.CSSProperties = {
  fontSize: '1.2rem',
};

const infoTextStyle: React.CSSProperties = {
  fontSize: '0.9rem',
  color: '#475569',
};