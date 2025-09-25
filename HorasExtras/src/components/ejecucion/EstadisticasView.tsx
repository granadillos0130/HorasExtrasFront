import React from 'react';
import type { EstadisticasMes, TipoHora } from '../../types/centros';
import { formatearHoras, formatearMoneda, formatearFecha } from '../../utils/formatters';
import { TIPOS_HORAS_CONFIG } from '../../constants/tiposHoras';

interface EstadisticasViewProps {
  centroNombre: string;
  mesNombre: string;
  año: number;
  estadisticasMes: EstadisticasMes | null;
  loading: boolean;
  onVolver: () => void;
  onVerTrabajadores: () => void;
  onVerTrabajadoresPorTipo: (tipoHora: TipoHora) => void;
}

const EstadisticasView: React.FC<EstadisticasViewProps> = ({
  centroNombre,
  mesNombre,
  año,
  estadisticasMes,
  loading,
  onVolver,
  onVerTrabajadores,
  onVerTrabajadoresPorTipo
}) => {
  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa', padding: '20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '30px' }}>
          <button 
            onClick={onVolver}
            style={{ marginBottom: '20px', padding: '10px 20px', border: 'none', borderRadius: '8px', background: '#6b7280', color: 'white', cursor: 'pointer' }}
          >
            ← Volver a Meses
          </button>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h1 style={{ fontSize: '2rem', color: '#333', marginBottom: '10px' }}>
                📊 Estadísticas Detalladas - {mesNombre} {año}
              </h1>
              <h2 style={{ fontSize: '1.3rem', color: '#666', margin: 0 }}>
                Centro: {centroNombre}
              </h2>
            </div>
            <button 
              onClick={onVerTrabajadores}
              style={{
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold'
              }}
            >
              👥 Ver Todos los Trabajadores
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', fontSize: '1.5rem', color: '#666' }}>
            Cargando estadísticas...
          </div>
        ) : estadisticasMes ? (
          <>
            {/* Resumen General */}
            <div style={{ 
              background: 'white', 
              borderRadius: '12px', 
              padding: '30px', 
              marginBottom: '30px', 
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <h3 style={{ color: '#333', marginBottom: '20px', fontSize: '1.4rem' }}>
                📈 Resumen General del Mes
              </h3>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '20px',
                marginBottom: '20px'
              }}>
                <div style={{ background: '#f0fdf4', padding: '20px', borderRadius: '10px', border: '2px solid #10b981' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⏱️</div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
                    {formatearHoras(estadisticasMes.totalHorasHombre)}
                  </div>
                  <div style={{ color: '#666', fontWeight: '600' }}>Total Horas Hombre</div>
                </div>
                <div style={{ background: '#f0f9ff', padding: '20px', borderRadius: '10px', border: '2px solid #3b82f6' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '10px' }}>👥</div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
                    {estadisticasMes.totalTrabajadoresUnicos}
                  </div>
                  <div style={{ color: '#666', fontWeight: '600' }}>Trabajadores Únicos</div>
                </div>
                <div style={{ background: '#f0fdf4', padding: '20px', borderRadius: '10px', border: '2px solid #10b981' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '10px' }}>💰</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#10b981' }}>
                    {formatearMoneda(estadisticasMes.manoObraTotal)}
                  </div>
                  <div style={{ color: '#666', fontWeight: '600' }}>Mano de Obra Total</div>
                </div>
              </div>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>
                📅 Período: {formatearFecha(estadisticasMes.periodoActividad.fechaInicio)} - {formatearFecha(estadisticasMes.periodoActividad.fechaFin)}
              </div>
            </div>

            {/* Estadísticas por Tipo de Hora */}
            <div style={{ 
              background: 'white', 
              borderRadius: '12px', 
              padding: '30px', 
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ color: '#333', marginBottom: '30px', fontSize: '1.4rem', textAlign: 'center' }}>
                🎯 Estadísticas por Tipo de Hora
              </h3>
              <div style={{ display: 'grid', gap: '20px' }}>
                {Object.entries(estadisticasMes.estadisticasPorTipo).map(([key, stats]) => {
                  const tipoKey = key === 'horasNormales' ? 'normales' : 
                                 key === 'extrasDiurnas' ? 'extrasdiurnas' :
                                 key === 'extrasNocturnas' ? 'extrasnocturnas' :
                                 key === 'dominicalesDiurnas' ? 'dominicalesdiurnas' :
                                 key === 'dominicalesNocturnas' ? 'dominicalesnocturnas' : 'normales';
                  
                  const config = TIPOS_HORAS_CONFIG[tipoKey as TipoHora];
                  
                  return (
                    <div
                      key={key}
                      onClick={() => stats.totalHoras > 0 && onVerTrabajadoresPorTipo(tipoKey as TipoHora)}
                      style={{
                        border: `2px solid ${config.color}`,
                        borderRadius: '12px',
                        padding: '25px',
                        background: stats.totalHoras > 0 ? `${config.color}08` : '#f9fafb',
                        cursor: stats.totalHoras > 0 ? 'pointer' : 'default',
                        transition: 'all 0.3s ease',
                        opacity: stats.totalHoras > 0 ? 1 : 0.6
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          <div style={{ fontSize: '2.5rem' }}>{config.icono}</div>
                          <div>
                            <h4 style={{ margin: '0 0 5px 0', color: config.color, fontSize: '1.3rem', fontWeight: '700' }}>
                              {config.nombre}
                            </h4>
                            <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                              {config.descripcion}
                            </p>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          {stats.totalHoras > 0 && (
                            <div style={{ color: '#10b981', fontSize: '0.9rem', fontWeight: '600', marginBottom: '5px' }}>
                              👆 Click para ver trabajadores
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                        gap: '15px',
                        marginTop: '20px'
                      }}>
                        <div style={{ background: 'rgba(255,255,255,0.8)', padding: '15px', borderRadius: '8px' }}>
                          <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: config.color }}>
                            {formatearHoras(stats.totalHoras)}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: '#666' }}>Total Horas</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.8)', padding: '15px', borderRadius: '8px' }}>
                          <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: config.color }}>
                            {stats.totalTrabajadores}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: '#666' }}>Trabajadores</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.8)', padding: '15px', borderRadius: '8px' }}>
                          <div style={{ fontSize: '1rem', fontWeight: 'bold', color: config.color }}>
                            {formatearMoneda(stats.manoObra)}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: '#666' }}>Mano de Obra</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>
            No se pudieron cargar las estadísticas del mes
          </div>
        )}
      </div>
    </div>
  );
};

export default EstadisticasView;