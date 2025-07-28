import React, { useState, useEffect } from "react";
import { centrosService } from "../api/centrosService";

interface Props {
  centroId: string;
  centroNombre: string;
  onVolver: () => void;
}

interface ManoObraData {
  centroId: string;
  manoObraTotal: number;
}

interface TrabajadorManoObra {
  centroId: string;
  trabajadorId: number;
  nombreTrabajador: string;
  manoObraTotal: number;
}

interface DetalleDias {
  centroId: string;
  trabajadorId: number;
  nombreTrabajador: string;
  detalleDias: Array<{
    fecha: string;
    horasNormales: number;
    extrasDiurnas: number;
    extrasNocturnas: number;
    dominicalesDiurnas: number;
    dominicalesNocturnas: number;
    totalHoras: number;
  }>;
}

interface TrabajadorInfo {
  trabajadorId: number;
  nombre: string;
  cargo?: string;
}

const InformacionEjecucionPage: React.FC<Props> = ({ centroId, centroNombre, onVolver }) => {
  const [mesSeleccionado, setMesSeleccionado] = useState<number | null>(null);
  const [añoSeleccionado, setAñoSeleccionado] = useState<number>(new Date().getFullYear());
  const [manoObraData, setManoObraData] = useState<ManoObraData | null>(null);
  const [trabajadoresDelMes, setTrabajadoresDelMes] = useState<TrabajadorInfo[]>([]);
  const [trabajadoresManoObra, setTrabajadoresManoObra] = useState<TrabajadorManoObra[]>([]);
  const [detalleActual, setDetalleActual] = useState<DetalleDias | null>(null);
  const [vistaActual, setVistaActual] = useState<'meses' | 'trabajadores' | 'detalle'>('meses');
  const [loading, setLoading] = useState(false);

  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const cargarManoObraTotal = async () => {
    setLoading(true);
    try {
      const data = await centrosService.obtenerManoObraTotal(centroId);
      setManoObraData(data);
    } catch (error) {
      console.error("Error al cargar mano de obra total:", error);
      setManoObraData(null);
    } finally {
      setLoading(false);
    }
  };

  const cargarTrabajadoresDelMes = async (mes: number, año: number) => {
    setLoading(true);
    try {
      // Usar el endpoint por-mes para obtener trabajadores de ese mes
      const centrosData = await centrosService.obtenerPorMes(año, mes);
      const centroDelMes = centrosData.find(c => c.centroId === centroId);
      
      if (centroDelMes) {
        setTrabajadoresDelMes(centroDelMes.trabajadores);
        
        // Cargar mano de obra para cada trabajador
        const manoObraPromises = centroDelMes.trabajadores.map(trabajador =>
          centrosService.obtenerManoObraPorTrabajador(centroId, trabajador.trabajadorId)
        );
        
        const manoObraResults = await Promise.all(manoObraPromises);
        setTrabajadoresManoObra(manoObraResults);
      } else {
        setTrabajadoresDelMes([]);
        setTrabajadoresManoObra([]);
      }
    } catch (error) {
      console.error("Error al cargar trabajadores del mes:", error);
      setTrabajadoresDelMes([]);
      setTrabajadoresManoObra([]);
    } finally {
      setLoading(false);
    }
  };

  const cargarDetalleTrabajador = async (trabajadorId: number) => {
    setLoading(true);
    try {
      const detalle = await centrosService.obtenerDetalleDiasTrabajador(centroId, trabajadorId);
      setDetalleActual(detalle);
    } catch (error) {
      console.error("Error al cargar detalle del trabajador:", error);
      setDetalleActual(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSeleccionarMes = (mes: number) => {
    setMesSeleccionado(mes);
    setVistaActual('trabajadores');
    cargarTrabajadoresDelMes(mes, añoSeleccionado);
    cargarManoObraTotal();
  };

  const handleVerDetalle = (trabajadorId: number) => {
    setVistaActual('detalle');
    cargarDetalleTrabajador(trabajadorId);
  };

  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(valor);
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatearHoras = (hours: number) => {
    if (hours === 0) return "0:00";
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}:${m.toString().padStart(2, "0")}`;
  };

  if (vistaActual === 'meses') {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f7fa', padding: '20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '30px' }}>
            <button onClick={onVolver} style={{ marginBottom: '20px', padding: '10px 20px', border: 'none', borderRadius: '8px', background: '#6b7280', color: 'white', cursor: 'pointer' }}>
              ← Volver a Centros
            </button>
            <h1 style={{ fontSize: '2rem', color: '#333', marginBottom: '10px' }}>
              📈 Información de Ejecución
            </h1>
            <h2 style={{ fontSize: '1.5rem', color: '#666', margin: 0 }}>
              Centro: {centroNombre}
            </h2>
          </div>

          <div style={{ background: 'white', borderRadius: '12px', padding: '30px', marginBottom: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginBottom: '20px', color: '#333' }}>Seleccionar Año</h3>
            <select
              value={añoSeleccionado}
              onChange={(e) => setAñoSeleccionado(Number(e.target.value))}
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1.1rem', marginBottom: '20px' }}
            >
              {[2023, 2024, 2025, 2026].map(año => (
                <option key={año} value={año}>{año}</option>
              ))}
            </select>
          </div>

          <div style={{ background: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginBottom: '30px', color: '#333', textAlign: 'center' }}>
              Selecciona el Mes - {añoSeleccionado}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              {meses.map((mes, index) => (
                <button
                  key={index}
                  onClick={() => handleSeleccionarMes(index + 1)}
                  style={{
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    padding: '20px',
                    borderRadius: '10px',
                    fontSize: '1.1rem',
                    cursor: 'pointer',
                    transition: 'background 0.3s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#2563eb'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#3b82f6'}
                >
                  {mes}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (vistaActual === 'trabajadores') {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f7fa', padding: '20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '30px' }}>
            <button 
              onClick={() => setVistaActual('meses')} 
              style={{ marginBottom: '20px', padding: '10px 20px', border: 'none', borderRadius: '8px', background: '#6b7280', color: 'white', cursor: 'pointer' }}
            >
              ← Volver a Meses
            </button>
            <h1 style={{ fontSize: '2rem', color: '#333', marginBottom: '10px' }}>
              📊 {centroNombre} - {meses[mesSeleccionado! - 1]} {añoSeleccionado}
            </h1>
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
                    Total: {trabajadoresDelMes.length} trabajadores
                  </span>
                </div>

                {trabajadoresDelMes.length > 0 ? (
                  <div style={{ display: 'grid', gap: '15px' }}>
                    {trabajadoresDelMes.map((trabajador) => {
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
                            onClick={() => handleVerDetalle(trabajador.trabajadorId)}
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
  }

  if (vistaActual === 'detalle' && detalleActual) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f7fa', padding: '20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '30px' }}>
            <button 
              onClick={() => setVistaActual('trabajadores')} 
              style={{ marginBottom: '20px', padding: '10px 20px', border: 'none', borderRadius: '8px', background: '#6b7280', color: 'white', cursor: 'pointer' }}
            >
              ← Volver a Trabajadores
            </button>
            <h1 style={{ fontSize: '2rem', color: '#333', marginBottom: '10px' }}>
              📅 Detalle de Días Trabajados
            </h1>
            <h2 style={{ fontSize: '1.5rem', color: '#666', margin: 0 }}>
              Trabajador: {detalleActual.nombreTrabajador}
            </h2>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', fontSize: '1.5rem', color: '#666' }}>
              Cargando detalle...
            </div>
          ) : (
            <div style={{ background: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginBottom: '20px', color: '#333' }}>
                📊 Registro Diario de Horas
              </h3>

              {detalleActual.detalleDias.length > 0 ? (
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
                      {detalleActual.detalleDias.map((dia, index) => (
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
                      <div>
                        <strong>Total Días:</strong> {detalleActual.detalleDias.length}
                      </div>
                      <div>
                        <strong>H. Normales:</strong> {formatearHoras(detalleActual.detalleDias.reduce((sum, d) => sum + d.horasNormales, 0))}
                      </div>
                      <div>
                        <strong>Extras Diurnas:</strong> {formatearHoras(detalleActual.detalleDias.reduce((sum, d) => sum + d.extrasDiurnas, 0))}
                      </div>
                      <div>
                        <strong>Extras Nocturnas:</strong> {formatearHoras(detalleActual.detalleDias.reduce((sum, d) => sum + d.extrasNocturnas, 0))}
                      </div>
                      <div>
                        <strong>Dom. Diurnas:</strong> {formatearHoras(detalleActual.detalleDias.reduce((sum, d) => sum + d.dominicalesDiurnas, 0))}
                      </div>
                      <div>
                        <strong>Dom. Nocturnas:</strong> {formatearHoras(detalleActual.detalleDias.reduce((sum, d) => sum + d.dominicalesNocturnas, 0))}
                      </div>
                      <div>
                        <strong>TOTAL HORAS:</strong> {formatearHoras(detalleActual.detalleDias.reduce((sum, d) => sum + d.totalHoras, 0))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  No hay registros de días trabajados para este trabajador
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default InformacionEjecucionPage;