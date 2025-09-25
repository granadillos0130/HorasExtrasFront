import React from 'react';
import type { DetalleDias } from '../../types/ejecucion';
import { formatearHoras, formatearFecha } from '../../utils/formatters';
import { ExcelExportService } from '../../api/excelExportService';

interface DetalleViewProps {
  centroNombre: string;
  mesNombre: string;
  año: number;
  detalle: DetalleDias | null;
  loading: boolean;
  onVolver: () => void;
}

const DetalleView: React.FC<DetalleViewProps> = ({
  centroNombre,
  mesNombre,
  año,
  detalle,
  loading,
  onVolver
}) => {
  const exportarExcel = () => {
    if (detalle) {
      ExcelExportService.exportarDetalle(detalle, centroNombre, mesNombre, año);
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
            ← Volver a Trabajadores
          </button>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h1 style={{ fontSize: '2rem', color: '#333', marginBottom: '10px' }}>
                📅 Detalle de Días Trabajados
              </h1>
              <h2 style={{ fontSize: '1.5rem', color: '#666', margin: 0 }}>
                Trabajador: {detalle?.nombreTrabajador}
              </h2>
            </div>
            {detalle && detalle.detalleDias.length > 0 && (
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
            Cargando detalle...
          </div>
        ) : detalle ? (
          <div style={{ background: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginBottom: '20px', color: '#333' }}>
              📊 Registro Diario de Horas
            </h3>

            {detalle.detalleDias.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ background: '#f9fafb' }}>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Fecha</th>
                      <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e5e7eb' }}>H. Normales</th>
                      <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e5e7eb' }}>Extras Diurnas</th>
                      <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e5e7eb' }}>Extras Nocturnas</th>
                      <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e5e7eb' }}>Dom. Diurnas</th>
                      <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e5e7eb' }}>Dom. Nocturnas</th>
                      <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e5e7eb' }}>Total Horas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalle.detalleDias.map((dia, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '12px' }}>{formatearFecha(dia.fecha)}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>{formatearHoras(dia.horasNormales)}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>{formatearHoras(dia.extrasDiurnas)}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>{formatearHoras(dia.extrasNocturnas)}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>{formatearHoras(dia.dominicalesDiurnas)}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>{formatearHoras(dia.dominicalesNocturnas)}</td>
                        <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>{formatearHoras(dia.totalHoras)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={{ marginTop: '20px', padding: '15px', background: '#f0f9ff', borderRadius: '8px' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>📈 Resumen Total</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
                    <div><strong>Total Días:</strong> {detalle.detalleDias.length}</div>
                    <div><strong>H. Normales:</strong> {formatearHoras(detalle.detalleDias.reduce((sum, d) => sum + d.horasNormales, 0))}</div>
                    <div><strong>Extras Diurnas:</strong> {formatearHoras(detalle.detalleDias.reduce((sum, d) => sum + d.extrasDiurnas, 0))}</div>
                    <div><strong>Extras Nocturnas:</strong> {formatearHoras(detalle.detalleDias.reduce((sum, d) => sum + d.extrasNocturnas, 0))}</div>
                    <div><strong>Dom. Diurnas:</strong> {formatearHoras(detalle.detalleDias.reduce((sum, d) => sum + d.dominicalesDiurnas, 0))}</div>
                    <div><strong>Dom. Nocturnas:</strong> {formatearHoras(detalle.detalleDias.reduce((sum, d) => sum + d.dominicalesNocturnas, 0))}</div>
                    <div><strong>TOTAL HORAS:</strong> {formatearHoras(detalle.detalleDias.reduce((sum, d) => sum + d.totalHoras, 0))}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                No hay registros de días trabajados para este trabajador
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>
            No se pudo cargar el detalle del trabajador
          </div>
        )}
      </div>
    </div>
  );
};

export default DetalleView;