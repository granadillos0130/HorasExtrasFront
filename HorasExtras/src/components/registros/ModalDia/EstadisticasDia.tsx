import React from "react";
import type { EstadisticasDia as EstadisticasDiaType } from "../../../types/registros";

interface EstadisticasDiaProps {
  estadisticas: EstadisticasDiaType;
  mostrarEstadisticas: boolean;
  onToggle: () => void;
}

export const EstadisticasDia: React.FC<EstadisticasDiaProps> = ({ 
  estadisticas, 
  mostrarEstadisticas, 
  onToggle 
}) => (
  <div style={{
    background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
    border: '2px solid #0ea5e9',
    borderRadius: '15px',
    padding: '20px',
    marginBottom: '20px'
  }}>
    <h4 style={{ 
      margin: '0 0 15px 0', 
      color: '#0c4a6e',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    }}>
      📊 Estadísticas del Día
      <button
        onClick={onToggle}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1rem'
        }}
      >
        {mostrarEstadisticas ? '🔼' : '🔽'}
      </button>
    </h4>
    
    {mostrarEstadisticas && (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '15px'
      }}>
        <div style={{ textAlign: 'center', padding: '10px', background: 'rgba(255,255,255,0.7)', borderRadius: '8px' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0c4a6e' }}>{estadisticas.totalRegistros}</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Total Registros</div>
        </div>
        
        <div style={{ textAlign: 'center', padding: '10px', background: 'rgba(255,255,255,0.7)', borderRadius: '8px' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1d4ed8' }}>{estadisticas.registrosTrabajo}</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Trabajo</div>
        </div>
        
        <div style={{ textAlign: 'center', padding: '10px', background: 'rgba(255,255,255,0.7)', borderRadius: '8px' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f59e0b' }}>{estadisticas.registrosAusencia}</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Ausencias</div>
        </div>
        
        <div style={{ textAlign: 'center', padding: '10px', background: 'rgba(255,255,255,0.7)', borderRadius: '8px' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#059669' }}>{estadisticas.trabajadoresUnicos}</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Trabajadores</div>
        </div>
        
        <div style={{ textAlign: 'center', padding: '10px', background: 'rgba(255,255,255,0.7)', borderRadius: '8px' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#059669' }}>{estadisticas.horasNormales.toFixed(1)}</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Horas Normales</div>
        </div>
        
        <div style={{ textAlign: 'center', padding: '10px', background: 'rgba(255,255,255,0.7)', borderRadius: '8px' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ea580c' }}>{estadisticas.horasExtras.toFixed(1)}</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Horas Extras</div>
        </div>
      </div>
    )}
  </div>
);