import React from "react";
import { calcularFechaRegreso } from "../../api/ausenciasService";
import type { ValidacionVacacionesResponse } from "../../types/ausencia";

interface Props {
  validacionVacaciones: ValidacionVacacionesResponse | null;
  fechaFin: string;
}

export const ValidacionVacacionesInfo: React.FC<Props> = ({ validacionVacaciones, fechaFin }) => {
  if (!validacionVacaciones) return null;

  const fechaRegreso = calcularFechaRegreso(new Date(fechaFin));

  return (
    <div style={{
      background: 'linear-gradient(135deg, #fefbf3, #fef3c7)',
      border: '2px solid #f59e0b',
      borderRadius: '12px',
      padding: '20px',
      margin: '15px 0',
      animation: 'slideIn 0.3s ease-out'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '15px',
        color: '#92400e',
        fontSize: '1.1rem',
        fontWeight: '600'
      }}>
        <span>🏖️</span>
        <strong>Validación de Vacaciones</strong>
      </div>

      <div style={{ color: '#78350f', lineHeight: '1.6' }}>
        <p style={{ marginBottom: '15px', fontWeight: '600' }}>
          {validacionVacaciones.mensaje}
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px',
          margin: '15px 0'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.8)',
            padding: '12px',
            borderRadius: '8px',
            borderLeft: '4px solid #f59e0b'
          }}>
            <strong style={{ display: 'block', color: '#92400e', fontSize: '0.9rem', marginBottom: '4px' }}>
              Total de días
            </strong>
            <span style={{ fontSize: '1.1rem', fontWeight: '600', color: '#78350f' }}>
              {validacionVacaciones.totalDias}
            </span>
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.8)',
            padding: '12px',
            borderRadius: '8px',
            borderLeft: '4px solid #f59e0b'
          }}>
            <strong style={{ display: 'block', color: '#92400e', fontSize: '0.9rem', marginBottom: '4px' }}>
              Días laborables
            </strong>
            <span style={{ fontSize: '1.1rem', fontWeight: '600', color: '#78350f' }}>
              {validacionVacaciones.diasLaborables}
            </span>
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.8)',
            padding: '12px',
            borderRadius: '8px',
            borderLeft: '4px solid #f59e0b'
          }}>
            <strong style={{ display: 'block', color: '#92400e', fontSize: '0.9rem', marginBottom: '4px' }}>
              Se descontarán
            </strong>
            <span style={{ fontSize: '1.1rem', fontWeight: '600', color: '#78350f' }}>
              {validacionVacaciones.diasADescontar} días
            </span>
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
          border: '2px solid #22c55e',
          borderRadius: '10px',
          padding: '15px',
          marginTop: '15px',
          textAlign: 'center'
        }}>
          <div style={{ color: '#15803d', fontWeight: '600', marginBottom: '8px', fontSize: '1rem' }}>
            📅 Fecha de regreso al trabajo:
          </div>
          <div style={{ color: '#166534', fontSize: '1.3rem', fontWeight: '700' }}>
            {fechaRegreso.toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>

        {validacionVacaciones.detalleDias && validacionVacaciones.detalleDias.length > 0 && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '8px',
            padding: '15px',
            marginTop: '15px',
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            <h5 style={{ margin: '0 0 10px 0', color: '#92400e', fontSize: '0.95rem' }}>
              📋 Detalle por días:
            </h5>
            {validacionVacaciones.detalleDias.map((dia, index) => (
              <div key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '6px 0',
                borderBottom: '1px solid #f3f4f6',
                fontSize: '0.85rem'
              }}>
                <span style={{ fontWeight: '600', color: '#374151' }}>
                  {new Date(dia.fecha).toLocaleDateString('es-ES')} - {dia.diaSemana}
                </span>
                <span style={{ color: '#6b7280' }}>{dia.motivo}</span>
                <span style={{
                  color: dia.esLaborable ? '#059669' : '#dc2626',
                  fontWeight: '600'
                }}>
                  {dia.esLaborable ? "✅ Se descuenta" : "⭕ No se descuenta"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
