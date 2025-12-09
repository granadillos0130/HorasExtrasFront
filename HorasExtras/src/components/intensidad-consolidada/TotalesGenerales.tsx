// components/intensidad-consolidada/TotalesGenerales.tsx
import React from 'react';
import type { TotalesHoras } from '../../types/consolidado';

interface TotalesGeneralesProps {
  totales: TotalesHoras;
  diasEnRango: number;
}

export const TotalesGenerales: React.FC<TotalesGeneralesProps> = ({
  totales,
  diasEnRango,
}) => {
  // Formatear horas con 2 decimales y separador de miles
  const formatHoras = (horas: number): string => {
    return horas.toLocaleString('es-CO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Calcular promedio diario
  const promedioDiario = diasEnRango > 0 ? totales.totalHoras / diasEnRango : 0;

  return (
    <div style={{
      background: 'white',
      borderRadius: '8px',
      padding: '30px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e2e8f0'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '30px',
        paddingBottom: '20px',
        borderBottom: '3px solid #e2e8f0'
      }}>
        <h2 style={{
          margin: '0 0 8px 0',
          fontSize: '1.5rem',
          fontWeight: '700',
          color: '#1e293b',
          textTransform: 'uppercase',
          letterSpacing: '0.1em'
        }}>
          TOTALES GENERALES DEL PERÍODO
        </h2>
        <p style={{
          margin: 0,
          fontSize: '0.9rem',
          color: '#64748b',
          fontWeight: '500'
        }}>
          Consolidado de todas las horas trabajadas
        </p>
      </div>

      {/* Grid de totales por tipo de hora */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '25px'
      }}>
        {/* Horas Normales */}
        <div style={{
          ...cardStyle,
          borderLeft: '4px solid #059669'
        }}>
          <div style={labelStyle}>HORAS NORMALES</div>
          <div style={{
            ...valueStyle,
            color: '#059669'
          }}>
            {formatHoras(totales.horasNormales)}
          </div>
        </div>

        {/* Extras Diurnas */}
        <div style={{
          ...cardStyle,
          borderLeft: '4px solid #ea580c'
        }}>
          <div style={labelStyle}>EXTRAS DIURNAS</div>
          <div style={{
            ...valueStyle,
            color: '#ea580c'
          }}>
            {formatHoras(totales.horasExtrasDiurnas)}
          </div>
        </div>

        {/* Extras Nocturnas */}
        <div style={{
          ...cardStyle,
          borderLeft: '4px solid #7c3aed'
        }}>
          <div style={labelStyle}>EXTRAS NOCTURNAS</div>
          <div style={{
            ...valueStyle,
            color: '#7c3aed'
          }}>
            {formatHoras(totales.horasExtrasNocturnas)}
          </div>
        </div>

        {/* Dom. Diurnas */}
        <div style={{
          ...cardStyle,
          borderLeft: '4px solid #0891b2'
        }}>
          <div style={labelStyle}>DOM. DIURNAS</div>
          <div style={{
            ...valueStyle,
            color: '#0891b2'
          }}>
            {formatHoras(totales.extrasDominicalesDiurnas)}
          </div>
        </div>

        {/* Dom. Nocturnas */}
        <div style={{
          ...cardStyle,
          borderLeft: '4px solid #be123c'
        }}>
          <div style={labelStyle}>DOM. NOCTURNAS</div>
          <div style={{
            ...valueStyle,
            color: '#be123c'
          }}>
            {formatHoras(totales.extrasDominicalesNocturnas)}
          </div>
        </div>
      </div>

      {/* Total General - Destacado */}
      <div style={{
        background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
        borderRadius: '12px',
        padding: '30px',
        textAlign: 'center',
        boxShadow: '0 4px 12px rgba(30, 64, 175, 0.3)',
        marginBottom: '20px'
      }}>
        <div style={{
          fontSize: '0.9rem',
          fontWeight: '700',
          color: '#bfdbfe',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          marginBottom: '10px'
        }}>
          TOTAL GENERAL
        </div>
        <div style={{
          fontSize: '3.5rem',
          fontWeight: '700',
          color: 'white',
          lineHeight: '1',
          marginBottom: '10px'
        }}>
          {formatHoras(totales.totalHoras)}
        </div>
        <div style={{
          fontSize: '0.85rem',
          fontWeight: '500',
          color: '#dbeafe'
        }}>
          horas totales trabajadas en el período
        </div>
      </div>

      {/* Estadísticas adicionales */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        padding: '20px',
        background: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '0.75rem',
            fontWeight: '600',
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '6px'
          }}>
            Promedio Diario
          </div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#1e40af'
          }}>
            {formatHoras(promedioDiario)}
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: '#94a3b8',
            marginTop: '4px'
          }}>
            horas por día
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '0.75rem',
            fontWeight: '600',
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '6px'
          }}>
            Días en Rango
          </div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#7c3aed'
          }}>
            {diasEnRango}
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: '#94a3b8',
            marginTop: '4px'
          }}>
            días consultados
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '0.75rem',
            fontWeight: '600',
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '6px'
          }}>
            % Horas Extras
          </div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#ea580c'
          }}>
            {totales.totalHoras > 0
              ? (((totales.horasExtrasDiurnas + totales.horasExtrasNocturnas + 
                   totales.extrasDominicalesDiurnas + totales.extrasDominicalesNocturnas) / 
                   totales.totalHoras) * 100).toFixed(1)
              : '0.0'}%
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: '#94a3b8',
            marginTop: '4px'
          }}>
            del total
          </div>
        </div>
      </div>
    </div>
  );
};

// Estilos reutilizables
const cardStyle: React.CSSProperties = {
  background: '#f8fafc',
  padding: '20px',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
  transition: 'all 0.2s ease'
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.7rem',
  fontWeight: '700',
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  marginBottom: '10px'
};

const valueStyle: React.CSSProperties = {
  fontSize: '2rem',
  fontWeight: '700',
  lineHeight: '1'
};