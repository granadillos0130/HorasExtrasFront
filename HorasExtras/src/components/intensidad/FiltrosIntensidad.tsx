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
    <div className="filters-card">
      <div className="filters-header">
        <div className="filters-icon">📊</div>
        <h2>Filtros de Búsqueda</h2>
      </div>

      <div className="filters-form">
        <TrabajadorBuscador
          trabajadores={trabajadores}
          value={trabajadorSeleccionado}
          onChange={onTrabajadorChange}
          placeholder="Buscar trabajador por nombre o cédula..."
          label="Seleccionar Trabajador"
          required
          showSelectedInfo={true}
        />

        <div className="form-group">
          <label className="form-label">Período de Consulta</label>
          <div className="range-selector">
            <div className="range-buttons">
              <button
                className={`range-btn ${rangoPreseleccionado === 'hoy' ? 'active' : ''}`}
                onClick={() => onRangoPreseleccionado('hoy')}
              >
                📅 Hoy
              </button>
              <button
                className={`range-btn ${rangoPreseleccionado === 'ayer' ? 'active' : ''}`}
                onClick={() => onRangoPreseleccionado('ayer')}
              >
                ⏮️ Ayer
              </button>
              <button
                className={`range-btn ${rangoPreseleccionado === 'semana_actual' ? 'active' : ''}`}
                onClick={() => onRangoPreseleccionado('semana_actual')}
              >
                📝 Esta Semana
              </button>
              <button
                className={`range-btn ${rangoPreseleccionado === 'semana_pasada' ? 'active' : ''}`}
                onClick={() => onRangoPreseleccionado('semana_pasada')}
              >
                📄 Semana Pasada
              </button>
              <button
                className={`range-btn ${rangoPreseleccionado === 'mes_actual' ? 'active' : ''}`}
                onClick={() => onRangoPreseleccionado('mes_actual')}
              >
                📊 Este Mes
              </button>
              <button
                className={`range-btn ${rangoPreseleccionado === 'mes_pasado' ? 'active' : ''}`}
                onClick={() => onRangoPreseleccionado('mes_pasado')}
              >
                📈 Mes Pasado
              </button>
              <button
                className={`range-btn ${rangoPreseleccionado === 'personalizado' ? 'active' : ''}`}
                onClick={() => onRangoPreseleccionado('personalizado')}
              >
                🎯 Personalizado
              </button>
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Fecha de Inicio</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => onFechaInicioChange(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Fecha de Fin</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => onFechaFinChange(e.target.value)}
              className="form-input"
              min={fechaInicio}
            />
          </div>
        </div>

        <div className="range-info">
          <div className="range-info-item">
            <span className="range-info-icon">📅</span>
            <span className="range-info-text">
              <strong>Período:</strong> {getRangoFechasTexto(fechaInicio, fechaFin)}
            </span>
          </div>
          <div className="range-info-item">
            <span className="range-info-icon">📊</span>
            <span className="range-info-text">
              <strong>Días en rango:</strong> {getDiasEnRango(fechaInicio, fechaFin)} día{getDiasEnRango(fechaInicio, fechaFin) !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};