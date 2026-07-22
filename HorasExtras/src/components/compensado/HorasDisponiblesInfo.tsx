import React from "react";
import type { HorasDisponibles } from "../../types/compensado";

interface Props {
  horasDisponibles: HorasDisponibles | null;
}

export const HorasDisponiblesInfo: React.FC<Props> = ({ horasDisponibles }) => {
  if (!horasDisponibles) return null;

  return (
    <div className="horas-disponibles-section">
      <div className="horas-header">
        <span>💳</span>
        <strong>Horas Disponibles en el Banco</strong>
      </div>

      <div className="horas-content">
        <p style={{ marginBottom: '15px', fontWeight: '600' }}>
          {horasDisponibles.mensaje}
        </p>

        <div className="horas-grid">
          <div className="horas-item">
            <strong>Balance total</strong>
            <span>{horasDisponibles.balanceTotal.toFixed(2)}h</span>
          </div>
          <div className="horas-item">
            <strong>Ya utilizadas</strong>
            <span>{horasDisponibles.horasYaUtilizadas.toFixed(2)}h</span>
          </div>
          <div className="horas-item">
            <strong>Disponibles</strong>
            <span>{horasDisponibles.horasDisponibles.toFixed(2)}h</span>
          </div>
          <div className="horas-item">
            <strong>Estado</strong>
            <span>{horasDisponibles.tieneHorasDisponibles ? "✅ Disponible" : "❌ Sin horas"}</span>
          </div>
        </div>

        {horasDisponibles.compensadosExistentes.length > 0 && (
          <div className="compensados-existentes">
            <h5 style={{ margin: '0 0 10px 0', color: '#92400e', fontSize: '0.95rem' }}>
              📋 Compensados ya creados en este período:
            </h5>
            {horasDisponibles.compensadosExistentes.map((comp, index) => (
              <div key={index} className="compensado-item">
                <span>
                  {new Date(comp.fecha).toLocaleDateString('es-ES')} - {comp.centroNombre}
                </span>
                <span style={{ fontWeight: '600', color: '#92400e' }}>
                  {comp.horasUtilizadas}h - {comp.estado}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
