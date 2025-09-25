import React from 'react';
import type { TrabajadorInfo, TrabajadorManoObra, ManoObraData } from '../../types/ejecucion';
import { formatearMoneda } from '../../utils/formatters';
import { ExcelExportService } from '../../api/excelExportService';

interface TrabajadoresViewProps {
  centroNombre: string;
  mesNombre: string;
  año: number;
  trabajadores: TrabajadorInfo[];
  trabajadoresManoObra: TrabajadorManoObra[];
  manoObraData: ManoObraData | null;
  loading: boolean;
  onVolver: () => void;
  onVerDetalle: (trabajadorId: number) => void;
}

const TrabajadoresView: React.FC<TrabajadoresViewProps> = ({
  centroNombre,
  mesNombre,
  año,
  trabajadores,
  trabajadoresManoObra,
  manoObraData,
  loading,
  onVolver,
  onVerDetalle
}) => {
  const exportarExcel = () => {
    ExcelExportService.exportarTrabajadores(
      trabajadores,
      trabajadoresManoObra,
      centroNombre,
      manoObraData?.centroId || '',
      mesNombre,
      año,
      manoObraData?.manoObraTotal
    );
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
              <h1 style={{ fontSize: '2rem', color: '#333', marginBottom: '10px' }}>
                📊 {centroNombre} - {mesNombre} {año}
              </h1>
            </div>
            {trabajadores.length > 0 && (
              <button 
                onClick={exportarExcel}
                style={{
                  background: '#10b981',
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
            )}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', fontSize: '1.5rem', color: '#666' }}>
            Cargando información...
          </div>
        ) : (
          <>
            {manoObraData && (
              <div style={{ background: 'white', borderRadius: '12px', padding: '30px', marginBottom: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                <h3 style={{ color: '#333', marginBottom: '15px' }}>💰 Mano de Obra Total del Centro</h3>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981', margin: 0 }}>
                  {formatearMoneda(manoObraData.manoObraTotal)}
                </p>
              </div>
            )}

            <div style={{ background: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ color: '#333', margin: 0 }}>👥 Trabajadores del Mes</h3>
                <span style={{ color: '#666' }}>
                  Total: {trabajadores.length} trabajadores
                </span>
              </div>

              {trabajadores.length > 0 ? (
                <div style={{ display: 'grid', gap: '15px' }}>
                  {trabajadores.map((trabajador) => {
                    const manoObra = trabajadoresManoObra.find(mo => mo.trabajadorId === trabajador.trabajadorId);
                    return (
                      <div key={trabajador.trabajadorId} style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div>
                          <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>
                            {trabajador.nombre}
                          </h4>
                          <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                            ID: {trabajador.trabajadorId}
                            {trabajador.cargo && ` | Cargo: ${trabajador.cargo}`}
                          </p>
                          {manoObra && (
                            <p style={{ margin: '10px 0 0 0', color: '#10b981', fontWeight: 'bold' }}>
                              Mano de Obra: {formatearMoneda(manoObra.manoObraTotal)}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => onVerDetalle(trabajador.trabajadorId)}
                          style={{
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            cursor: 'pointer'
                          }}
                        >
                          Ver Detalles
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  No hay trabajadores registrados para este mes
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TrabajadoresView;