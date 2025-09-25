import React from 'react';
import type { MesConActividad } from '../../types/centros';
import { formatearHoras, formatearMoneda, formatearFechaPeriodo } from '../../utils/formatters';

interface MesesViewProps {
  centroNombre: string;
  añoSeleccionado: number;
  onAñoChange: (año: number) => void;
  mesesConActividad: MesConActividad[];
  loading: boolean;
  onSeleccionarMes: (mes: number) => void;
  onVolver: () => void;
}

const MesesView: React.FC<MesesViewProps> = ({
  centroNombre,
  añoSeleccionado,
  onAñoChange,
  mesesConActividad,
  loading,
  onSeleccionarMes,
  onVolver
}) => {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', padding: '20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '30px' }}>
          <button 
            onClick={onVolver}
            style={{ 
              marginBottom: '20px', 
              padding: '12px 24px', 
              border: 'none', 
              borderRadius: '10px', 
              background: 'rgba(255,255,255,0.2)', 
              color: 'white', 
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease'
            }}
          >
            ← Volver a Centros
          </button>
          <h1 style={{ 
            fontSize: '2.5rem', 
            color: 'white', 
            marginBottom: '10px', 
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            fontWeight: '700'
          }}>
            📈 Información de Ejecución
          </h1>
          <h2 style={{ fontSize: '1.3rem', color: 'rgba(255,255,255,0.9)', margin: 0 }}>
            Centro: {centroNombre}
          </h2>
        </div>

        <div style={{ 
          background: 'rgba(255,255,255,0.95)', 
          borderRadius: '20px', 
          padding: '30px', 
          marginBottom: '30px', 
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{ marginBottom: '20px', color: '#333', fontSize: '1.3rem', fontWeight: '600' }}>
            📅 Seleccionar Año
          </h3>
          <select
            value={añoSeleccionado}
            onChange={(e) => onAñoChange(Number(e.target.value))}
            style={{ 
              padding: '12px 20px', 
              borderRadius: '10px', 
              border: '2px solid #e5e7eb', 
              fontSize: '1.1rem', 
              marginBottom: '20px',
              background: 'white',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            {[2023, 2024, 2025, 2026].map(año => (
              <option key={año} value={año}>{año}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div style={{ 
            background: 'rgba(255,255,255,0.95)', 
            borderRadius: '20px', 
            padding: '60px', 
            textAlign: 'center', 
            fontSize: '1.2rem', 
            color: '#666',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ marginBottom: '20px' }}>🔄</div>
            Cargando meses con actividad...
          </div>
        ) : (
          <div style={{ 
            background: 'rgba(255,255,255,0.95)', 
            borderRadius: '20px', 
            padding: '30px', 
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            backdropFilter: 'blur(10px)'
          }}>
            <h3 style={{ 
              marginBottom: '30px', 
              color: '#333', 
              textAlign: 'center', 
              fontSize: '1.4rem',
              fontWeight: '600'
            }}>
              📊 Meses con Actividad - {añoSeleccionado}
            </h3>

            {mesesConActividad.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                {mesesConActividad.map((mes) => (
                  <div
                    key={mes.mes}
                    onClick={() => onSeleccionarMes(mes.mes)}
                    style={{
                      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                      color: 'white',
                      border: 'none',
                      padding: '25px',
                      borderRadius: '15px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                      position: 'relative' as const,
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{ position: 'absolute', top: '10px', right: '15px', fontSize: '2rem', opacity: 0.3 }}>
                      📊
                    </div>
                    
                    <h4 style={{ 
                      margin: '0 0 15px 0', 
                      fontSize: '1.4rem', 
                      fontWeight: '700',
                      textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
                    }}>
                      {mes.nombreMes}
                    </h4>
                    
                    <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '15px' }}>
                      📅 {formatearFechaPeriodo(mes.fechaPrimerRegistro, mes.fechaUltimoRegistro)}
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.85rem' }}>
                      <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '8px' }}>
                        <div style={{ fontWeight: '600' }}>👥 Trabajadores</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>{mes.totalTrabajadores}</div>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '8px' }}>
                        <div style={{ fontWeight: '600' }}>⏱️ Total Horas</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>{formatearHoras(mes.totalHoras)}</div>
                      </div>
                      <div style={{ 
                        background: 'rgba(255,255,255,0.2)', 
                        padding: '8px', 
                        borderRadius: '8px',
                        gridColumn: '1 / -1'  
                      }}>
                        <div style={{ fontWeight: '600' }}>💰 Mano de Obra</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>{formatearMoneda(mes.manoObraTotal)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '60px 20px', 
                color: '#666',
                background: '#f9fafb',
                borderRadius: '15px',
                border: '2px dashed #d1d5db'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '20px', opacity: 0.5 }}>📅</div>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '10px', color: '#374151' }}>
                  No hay actividad registrada
                </h3>
                <p style={{ fontSize: '1rem', lineHeight: 1.6, maxWidth: '400px', margin: '0 auto' }}>
                  No se encontró actividad laboral para el año {añoSeleccionado} en este centro de trabajo.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MesesView;