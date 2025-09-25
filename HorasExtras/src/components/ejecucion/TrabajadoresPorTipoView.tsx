import React from 'react';
import type { TrabajadoresPorTipoHora, TipoHora } from '../../types/centros';
import { formatearHoras, formatearMoneda, formatearFecha } from '../../utils/formatters';
import { TIPOS_HORAS_CONFIG } from '../../constants/tiposHoras';
import { ExcelExportService } from '../../api/excelExportService';

interface TrabajadoresPorTipoViewProps {
  centroNombre: string;
  mesNombre: string;
  año: number;
  trabajadoresPorTipo: TrabajadoresPorTipoHora | null;
  tipoHora: TipoHora;
  loading: boolean;
  onVolver: () => void;
  onVerDetalle: (trabajadorId: number) => void;
}

const TrabajadoresPorTipoView: React.FC<TrabajadoresPorTipoViewProps> = ({
  centroNombre,
  mesNombre,
  año,
  trabajadoresPorTipo,
  tipoHora,
  loading,
  onVolver,
  onVerDetalle
}) => {
  const config = TIPOS_HORAS_CONFIG[tipoHora];

  const exportarExcel = () => {
    if (trabajadoresPorTipo) {
      ExcelExportService.exportarTrabajadoresPorTipo(
        trabajadoresPorTipo,
        tipoHora,
        centroNombre,
        mesNombre,
        año
      );
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa', padding: '20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '30px' }}>
          <button 
            onClick={onVolver}
            style={{ marginBottom: '20px', padding: '10px 20px', border: 'none', borderRadius: '8px', background: '#6b7280', color: 'white', cursor: 'pointer' }}
          >
            ← Volver a Estadísticas
          </button>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h1 style={{ fontSize: '2rem', color: '#333', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                {config.icono} {config.nombre}
              </h1>
              <h2 style={{ fontSize: '1.3rem', color: '#666', margin: 0 }}>
                {centroNombre} - {mesNombre} {año}
              </h2>
            </div>
            <button 
              onClick={exportarExcel}
              style={{
                background: config.color,
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              📤 Exportar Excel
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', fontSize: '1.5rem', color: '#666' }}>
            Cargando trabajadores...
          </div>
        ) : trabajadoresPorTipo ? (
          <>
            {/* Resumen del Tipo de Hora */}
            <div style={{ 
              background: 'white', 
              borderRadius: '12px', 
              padding: '30px', 
              marginBottom: '30px', 
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              border: `3px solid ${config.color}`
            }}>
              <h3 style={{ color: config.color, marginBottom: '20px', fontSize: '1.4rem', textAlign: 'center' }}>
                📊 Resumen - {config.nombre}
              </h3>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '20px'
              }}>
                <div style={{ background: `${config.color}10`, padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: config.color }}>
                    {trabajadoresPorTipo.totalTrabajadores}
                  </div>
                  <div style={{ color: '#666', fontWeight: '600' }}>Trabajadores</div>
                </div>
                <div style={{ background: `${config.color}10`, padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: config.color }}>
                    {formatearHoras(trabajadoresPorTipo.totalHoras)}
                  </div>
                  <div style={{ color: '#666', fontWeight: '600' }}>Total Horas</div>
                </div>
                <div style={{ background: `${config.color}10`, padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: config.color }}>
                    {formatearMoneda(trabajadoresPorTipo.totalManoObra)}
                  </div>
                  <div style={{ color: '#666', fontWeight: '600' }}>Mano de Obra</div>
                </div>
              </div>
              <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '0.9rem', color: '#666' }}>
                {config.descripcion}
              </div>
            </div>

            {/* Lista de Trabajadores */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <h3 style={{ color: '#333', marginBottom: '20px' }}>
                👥 Trabajadores que trabajaron {config.nombre}
              </h3>

              {trabajadoresPorTipo.trabajadores.length > 0 ? (
                <div style={{ display: 'grid', gap: '15px' }}>
                  {trabajadoresPorTipo.trabajadores.map((trabajador) => (
                    <div key={trabajador.trabajadorId} style={{
                      border: `2px solid ${config.color}20`,
                      borderRadius: '12px',
                      padding: '20px',
                      background: `${config.color}08`,
                      transition: 'all 0.3s ease'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                        <div>
                          <h4 style={{ margin: '0 0 5px 0', color: '#333', fontSize: '1.2rem' }}>
                            {trabajador.nombreTrabajador}
                          </h4>
                          <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '0.9rem' }}>
                            ID: {trabajador.trabajadorId}
                            {trabajador.cargo && ` | Cargo: ${trabajador.cargo}`}
                          </p>
                          <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                            Valor Hora: {formatearMoneda(trabajador.valorHora)} × {trabajador.multiplicador}
                          </p>
                        </div>
                        <button
                          onClick={() => onVerDetalle(trabajador.trabajadorId)}
                          style={{
                            background: config.color,
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                          }}
                        >
                          Ver Detalle Completo
                        </button>
                      </div>
                      
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                        gap: '15px',
                        marginBottom: '15px'
                      }}>
                        <div style={{ background: 'rgba(255,255,255,0.8)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                          <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: config.color }}>
                            {formatearHoras(trabajador.totalHoras)}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#666' }}>Total Horas</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.8)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                          <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: config.color }}>
                            {trabajador.totalDias}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#666' }}>Días Trabajados</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.8)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                          <div style={{ fontSize: '1rem', fontWeight: 'bold', color: config.color }}>
                            {formatearMoneda(trabajador.manoObra)}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#666' }}>Mano de Obra</div>
                        </div>
                      </div>

                      {/* Detalle por fechas (colapsible) */}
                      <details style={{ marginTop: '15px' }}>
                        <summary style={{ 
                          cursor: 'pointer', 
                          color: config.color, 
                          fontWeight: '600',
                          fontSize: '0.9rem',
                          padding: '5px 0'
                        }}>
                          📅 Ver detalle por fechas ({trabajador.detalles.length} registros)
                        </summary>
                        <div style={{ 
                          marginTop: '10px', 
                          background: 'rgba(255,255,255,0.9)', 
                          borderRadius: '8px', 
                          padding: '15px',
                          maxHeight: '200px',
                          overflowY: 'auto'
                        }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.85rem' }}>
                            {trabajador.detalles.map((detalle, index) => (
                              <div key={index} style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between',
                                padding: '5px 0',
                                borderBottom: index < trabajador.detalles.length - 1 ? '1px solid #e5e7eb' : 'none'
                              }}>
                                <span>{formatearFecha(detalle.fecha)}</span>
                                <span style={{ fontWeight: '600', color: config.color }}>
                                  {formatearHoras(detalle.horas)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </details>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  No hay trabajadores registrados para este tipo de hora
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>
            No se pudieron cargar los datos
          </div>
        )}
      </div>
    </div>
  );
};

export default TrabajadoresPorTipoView;
