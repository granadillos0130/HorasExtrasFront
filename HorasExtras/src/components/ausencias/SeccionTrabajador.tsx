import React from 'react';
import TrabajadorBuscador from '../shared/TrabajadorBuscador';
import type { Trabajador } from '../../types/trabajadores';

interface SeccionTrabajadorProps {
  trabajadores: Trabajador[];
  trabajadorSeleccionadoId: number;
  onTrabajadorSelect: (id: number, trabajador?: Trabajador) => void;
  trabajadorNombre: string;
  cargo: string;
  loadingTrabajadores: boolean;
}

export const SeccionTrabajador: React.FC<SeccionTrabajadorProps> = ({
  trabajadores,
  trabajadorSeleccionadoId,
  onTrabajadorSelect,
  trabajadorNombre,
  cargo,
  loadingTrabajadores
}) => {
  return (
    <div className="form-section">
      <h3 className="section-title">
        <span className="section-icon">👤</span>
        Información del Trabajador
      </h3>
      <div className="form-grid">
        <div className="form-group full-width">
          {loadingTrabajadores ? (
            <div className="loading-container">
              <span className="loading-spinner"></span>
              Cargando trabajadores...
            </div>
          ) : (
            <TrabajadorBuscador
              trabajadores={trabajadores}
              value={trabajadorSeleccionadoId}
              onChange={onTrabajadorSelect}
              placeholder="Buscar trabajador por nombre o cédula..."
              label="Seleccionar Trabajador"
              required={true}
              showSelectedInfo={true}
            />
          )}
        </div>

        <div className="form-group">
          <label className="form-label">
            Nombre del trabajador <span className="required">*</span>
          </label>
          <input
            type="text"
            name="trabajadorNombre"
            value={trabajadorNombre}
            className="form-input"
            placeholder="Se llenará automáticamente"
            required
            readOnly
            disabled
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Cargo <span className="required">*</span>
          </label>
          <input
            type="text"
            name="cargo"
            value={cargo}
            className="form-input"
            placeholder="Se llenará automáticamente"
            required
            readOnly
            disabled
          />
        </div>
      </div>
    </div>
  );
};