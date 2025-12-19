// components/registros/TablaRegistros/TotalesRegistros.tsx
import React from "react";
import type { RegistroConTipo } from "../../../types/registros";

interface TotalesRegistrosProps {
  registros: RegistroConTipo[];
}

export const TotalesRegistros: React.FC<TotalesRegistrosProps> = ({ registros }) => {
  const formatearHoras = (hours: number) => {
    if (hours === 0) return "0:00";
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}:${m.toString().padStart(2, "0")}`;
  };

  // Calcular totales
  const totales = registros.reduce((acc, registro) => {
    return {
      totalRegistros: acc.totalRegistros + 1,
      horasNormales: acc.horasNormales + registro.horasNormales,
      horasExtrasDiurnas: acc.horasExtrasDiurnas + registro.horasExtrasDiurnas,
      horasExtrasNocturnas: acc.horasExtrasNocturnas + registro.horasExtrasNocturnas,
      horasDesplazamiento: acc.horasDesplazamiento + registro.horasDesplazamiento,
      horasTotales: acc.horasTotales + registro.totalHoras
    };
  }, {
    totalRegistros: 0,
    horasNormales: 0,
    horasExtrasDiurnas: 0,
    horasExtrasNocturnas: 0,
    horasDesplazamiento: 0,
    horasTotales: 0
  });

  const estiloItemTotal = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderRadius: '8px',
    background: '#f9fafb',
    border: '1px solid #e5e7eb'
  };

  const estiloLabel = {
    fontSize: '0.9rem',
    fontWeight: '600' as const,
    color: '#6b7280',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const estiloValor = (color: string) => ({
    fontSize: '1.1rem',
    fontWeight: '700' as const,
    color: color,
    fontFamily: 'monospace'
  });

  if (registros.length === 0) {
    return null;
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '24px',
      marginTop: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    }}>
      {/* Header */}
      <div style={{
        marginBottom: '20px',
        paddingBottom: '16px',
        borderBottom: '2px solid #e5e7eb'
      }}>
        <h3 style={{
          margin: 0,
          fontSize: '1.3rem',
          fontWeight: '700',
          color: '#1f2937',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          📊 TOTALES DEL PERÍODO SELECCIONADO
        </h3>
      </div>

      {/* Grid de totales */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '16px'
      }}>
        {/* Total Registros */}
        <div style={estiloItemTotal}>
          <span style={estiloLabel}>
            <span>📋</span>
            <span>Total Registros</span>
          </span>
          <span style={estiloValor('#374151')}>
            {totales.totalRegistros}
          </span>
        </div>

        {/* Horas Normales */}
        <div style={estiloItemTotal}>
          <span style={estiloLabel}>
            <span>⏰</span>
            <span>Horas Normales</span>
          </span>
          <span style={estiloValor('#059669')}>
            {formatearHoras(totales.horasNormales)}
          </span>
        </div>

        {/* Horas Extras Diurnas */}
        <div style={estiloItemTotal}>
          <span style={estiloLabel}>
            <span>⚡</span>
            <span>Extras Diurnas</span>
          </span>
          <span style={estiloValor('#ea580c')}>
            {formatearHoras(totales.horasExtrasDiurnas)}
          </span>
        </div>

        {/* Horas Extras Nocturnas */}
        <div style={estiloItemTotal}>
          <span style={estiloLabel}>
            <span>🌙</span>
            <span>Extras Nocturnas</span>
          </span>
          <span style={estiloValor('#7c2d12')}>
            {formatearHoras(totales.horasExtrasNocturnas)}
          </span>
        </div>

        {/* Horas Desplazamiento */}
        <div style={estiloItemTotal}>
          <span style={estiloLabel}>
            <span>🚗</span>
            <span>Desplazamiento</span>
          </span>
          <span style={estiloValor('#8b5cf6')}>
            {formatearHoras(totales.horasDesplazamiento)}
          </span>
        </div>
      </div>

      {/* Total General - Destacado */}
      <div style={{
        marginTop: '20px',
        padding: '20px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <span style={{
            fontSize: '1.2rem',
            fontWeight: '700',
            color: 'white',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span>💰</span>
            <span>TOTAL GENERAL</span>
          </span>
          <span style={{
            fontSize: '1.8rem',
            fontWeight: '900',
            color: 'white',
            fontFamily: 'monospace',
            textShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}>
            {formatearHoras(totales.horasTotales)} horas
          </span>
        </div>
      </div>

      {/* Nota adicional */}
      <div style={{
        marginTop: '16px',
        padding: '12px',
        background: '#f0f9ff',
        border: '1px solid #bae6fd',
        borderRadius: '8px',
        fontSize: '0.85rem',
        color: '#0c4a6e',
        textAlign: 'center'
      }}>
        💡 Los totales incluyen todos los registros de trabajo y ausencias del período seleccionado
      </div>
    </div>
  );
};