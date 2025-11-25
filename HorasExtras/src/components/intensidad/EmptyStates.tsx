import React from 'react';
import type { Trabajador } from '../../types/trabajadores';

interface EmptyStateNoSeleccionProps {
  type: 'no-seleccion';
}

interface EmptyStateNoRegistrosProps {
  type: 'no-registros';
  trabajador: Trabajador;
}

type EmptyStatesProps = EmptyStateNoSeleccionProps | EmptyStateNoRegistrosProps;

export const EmptyStates: React.FC<EmptyStatesProps> = (props) => {
  if (props.type === 'no-seleccion') {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">👤</div>
        <h3>Selecciona un trabajador</h3>
        <p>
          Utiliza el buscador de arriba para seleccionar un trabajador y ver
          su intensidad horaria en el período deseado.
        </p>
        <div className="empty-state-features">
          <div className="feature-item">
            <span className="feature-icon">🔍</span>
            <span>Busca por nombre o cédula</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📅</span>
            <span>Selecciona período personalizado</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📊</span>
            <span>Ve resumen y detalle de horas</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">⚡</span>
            <span>Rangos rápidos disponibles</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="empty-state">
      <div className="empty-state-icon">📊</div>
      <h3>No hay registros</h3>
      <p>
        No se encontraron registros para {props.trabajador?.nombre || 'este trabajador'}
        en el período seleccionado.
      </p>
      <div className="empty-state-suggestions">
        <p>Prueba con:</p>
        <ul>
          <li>Un rango de fechas diferente</li>
          <li>Verificar períodos anteriores</li>
          <li>Asegurarte de que existan registros para este trabajador</li>
        </ul>
      </div>
    </div>
  );
};