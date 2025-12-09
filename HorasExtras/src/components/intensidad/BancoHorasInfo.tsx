/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { formatFechaCompensado, formatPeriodoOrigen, formatHours } from '../../utils/trabajadores/fechaUtils';

interface BancoHorasInfoProps {
  metadatosVista: {
    tipoVista: string;
    trabajadorUsaBanco: boolean;
    valoresMostrados: string;
    informacionAdicional?: any;
  };
  bancoInfo: any;
  compensadosInfo: any;
}

const getEstadoStyle = (estado: string): React.CSSProperties => {
  const lower = estado.toLowerCase();
  if (lower.includes('conforme') || lower.includes('positivo')) {
    return { background: '#dcfce7', color: '#166534' };
  }
  if (lower.includes('déficit') || lower.includes('negativo')) {
    return { background: '#fee2e2', color: '#991b1b' };
  }
  return { background: '#e2e8f0', color: '#475569' };
};

export const BancoHorasInfo: React.FC<BancoHorasInfoProps> = ({
  metadatosVista,
  bancoInfo,
  compensadosInfo,
}) => {
  const [compensadosExpandido, setCompensadosExpandido] = useState(false);
  const [compensadoDetalleVisible, setCompensadoDetalleVisible] = useState<number | null>(null);
  const [semanaDetalleVisible, setSemanaDetalleVisible] = useState<number | null>(null);

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={iconStyle}>
            {metadatosVista.tipoVista === "Semanal" ? "📅" : "📊"}
          </div>
          <h3 style={titleStyle}>Información de Vista: {metadatosVista.tipoVista}</h3>
        </div>
        <span style={badgeStyle}>{metadatosVista.valoresMostrados}</span>
      </div>

      {/* Metadata */}
      <div style={metadataStyle}>
        <div style={metadataItemStyle}>
          <span>Tipo de trabajador:</span>
          <span style={{ fontWeight: '600' }}>
            {metadatosVista.trabajadorUsaBanco ? "Con banco de horas" : "Sin banco de horas"}
          </span>
        </div>
        <div style={metadataItemStyle}>
          <span>Valores mostrados:</span>
          <span style={{ fontWeight: '600' }}>{metadatosVista.valoresMostrados}</span>
        </div>
      </div>

      {bancoInfo && (
        <div style={{ padding: '20px' }}>
          {/* Vista Semanal */}
          {bancoInfo.tipo === "semanal" && (
            <div style={sectionStyle}>
              <div style={sectionTitleStyle}>📝 Información Semanal (Vista Excel)</div>
              <div style={gridStyle}>
                <div style={gridItemStyle}>
                  <span>Horas base semanal:</span>
                  <span style={{ fontWeight: '700' }}>{bancoInfo.horasBase || 0}h</span>
                </div>
                <div style={gridItemStyle}>
                  <span>Según Excel:</span>
                  <span style={{ fontWeight: '700' }}>{bancoInfo.totalSegunExcel || 0}h</span>
                </div>
                <div style={gridItemStyle}>
                  <span>Estado:</span>
                  <span style={{ ...estadoBadgeStyle, ...getEstadoStyle(bancoInfo.estado || 'Desconocido') }}>
                    {bancoInfo.estado || 'Desconocido'}
                  </span>
                </div>
              </div>
              {bancoInfo.mensaje && (
                <div style={messageStyle}>💡 {bancoInfo.mensaje}</div>
              )}
            </div>
          )}

          {/* Vista Mensual */}
          {bancoInfo.tipo === "mensual" && bancoInfo.bancoHoras && (
            <div style={sectionStyle}>
              <div style={sectionTitleStyle}>🏦 Estado del Banco de Horas</div>

              {/* Compensados */}
              {compensadosInfo && compensadosInfo.total > 0 && (
                <div style={{ marginTop: '20px', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                  <div
                    style={clickableHeaderStyle}
                    onClick={() => setCompensadosExpandido(!compensadosExpandido)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '600' }}>
                      🔄 Días Compensados en este Período
                      <span style={{ marginLeft: 'auto', fontSize: '0.8rem' }}>
                        {compensadosExpandido ? '▼' : '▶'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                      <span style={badgeBlueStyle}>
                        {compensadosInfo.total} día{compensadosInfo.total !== 1 ? 's' : ''}
                      </span>
                      <span style={badgeYellowStyle}>
                        {compensadosInfo.totalHorasCompensadas.toFixed(2)} horas usadas
                      </span>
                    </div>
                  </div>

                  {compensadosExpandido && (
                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {compensadosInfo.detalle.map((comp: any) => (
                        <div key={comp.id} style={cardStyle}>
                          <div style={cardHeaderStyle}>
                            <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', flexWrap: 'wrap' }}>
                              <span>📅 {formatFechaCompensado(comp.fecha)}</span>
                              <span>🏢 {comp.centroNombre}</span>
                              <span>⏰ {comp.horasCompensadas.toFixed(2)}h</span>
                            </div>
                            <button
                              style={buttonStyle}
                              onClick={() => setCompensadoDetalleVisible(
                                compensadoDetalleVisible === comp.id ? null : comp.id
                              )}
                            >
                              {compensadoDetalleVisible === comp.id ? 'Ocultar' : 'Ver más'}
                            </button>
                          </div>

                          {compensadoDetalleVisible === comp.id && (
                            <div style={expandedStyle}>
                              <div style={infoGroupStyle}>
                                <div style={infoItemStyle}>
                                  <span>Horario:</span>
                                  <span>{comp.horaInicio} - {comp.horaFin}</span>
                                </div>
                                <div style={infoItemStyle}>
                                  <span>Período origen:</span>
                                  <span>{formatPeriodoOrigen(comp.periodoOrigenInicio, comp.periodoOrigenFin)}</span>
                                </div>
                                <div style={infoItemStyle}>
                                  <span>Balance origen:</span>
                                  <span>{comp.balanceOrigenTotal.toFixed(2)}h</span>
                                </div>
                              </div>

                              <div style={disponibilidadStyle}>
                                <div style={dispItemStyle}>
                                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Antes</span>
                                  <span style={{ fontSize: '1rem', fontWeight: '700', color: '#3b82f6' }}>
                                    {comp.horasDisponiblesAntes.toFixed(2)}h
                                  </span>
                                </div>
                                <span style={{ fontSize: '1.2rem', color: '#94a3b8' }}>→</span>
                                <div style={dispItemStyle}>
                                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Después</span>
                                  <span style={{ fontSize: '1rem', fontWeight: '700', color: '#8b5cf6' }}>
                                    {comp.horasDisponiblesDespues.toFixed(2)}h
                                  </span>
                                </div>
                                <div style={dispItemStyle}>
                                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Actual</span>
                                  <span style={{ 
                                    fontSize: '1rem', 
                                    fontWeight: '700', 
                                    color: comp.horasDisponiblesActuales <= 0 ? '#dc2626' : '#16a34a' 
                                  }}>
                                    {comp.horasDisponiblesActuales.toFixed(2)}h
                                  </span>
                                </div>
                              </div>

                              {comp.descripcion && (
                                <div style={infoGroupStyle}>
                                  <div style={infoItemStyle}>
                                    <span>Descripción:</span>
                                    <span>{comp.descripcion}</span>
                                  </div>
                                </div>
                              )}

                              <div style={{ fontSize: '0.75rem', color: '#64748b', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
                                Creado: {new Date(comp.fechaCreacion).toLocaleString('es-CO')} por {comp.usuarioCreacion}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Desglose Semanas */}
              {bancoInfo.desgloseSemanas && bancoInfo.desgloseSemanas.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: '700' }}>Desglose Semanal</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                    {bancoInfo.desgloseSemanas.map((sem: any, idx: number) => (
                      <div key={idx} style={cardStyle}>
                        <div
                          style={clickableHeaderStyle}
                          onClick={() => setSemanaDetalleVisible(semanaDetalleVisible === idx ? null : idx)}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: '700' }}>Semana {idx + 1}</span>
                            <span style={{ fontWeight: '700', color: sem.balance >= 0 ? '#16a34a' : '#dc2626' }}>
                              {sem.balance >= 0 ? '+' : ''}{sem.balance.toFixed(2)}h
                            </span>
                            <span style={{ fontSize: '0.8rem' }}>{semanaDetalleVisible === idx ? '▼' : '▶'}</span>
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '8px' }}>{sem.semana}</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginTop: '4px' }}>
                            <span>Trabajadas: {sem.horasTrabajadas.toFixed(2)}h</span>
                            <span>Base: {sem.horasBase.toFixed(2)}h</span>
                          </div>
                        </div>

                        {semanaDetalleVisible === idx && (
                          <div style={expandedStyle}>
                            <div style={{ fontWeight: '600', marginBottom: '8px' }}>📊 Desglose de Horas</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <div style={horaDetalleStyle}>
                                <span>⏰ Normales:</span>
                                <span>{formatHours(sem.horasNormales || 0)}</span>
                              </div>
                              <div style={horaDetalleStyle}>
                                <span>☀️ Ex. Diurnas:</span>
                                <span>{formatHours(sem.horasExtrasDiurnas || 0)}</span>
                              </div>
                              <div style={horaDetalleStyle}>
                                <span>🌙 Ex. Nocturnas:</span>
                                <span>{formatHours(sem.horasExtrasNocturnas || 0)}</span>
                              </div>
                              <div style={horaDetalleStyle}>
                                <span>🌅 Dom. Diurnas:</span>
                                <span>{formatHours(sem.extrasDominicalesDiurnas || 0)}</span>
                              </div>
                              <div style={horaDetalleStyle}>
                                <span>🌃 Dom. Nocturnas:</span>
                                <span>{formatHours(sem.extrasDominicalesNocturnas || 0)}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resumen */}
              {bancoInfo.resumenPeriodo && (
                <div style={{ marginTop: '20px' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: '700' }}>Resumen del Período</h4>
                  <div style={{ background: '#eff6ff', border: '2px solid #3b82f6', borderRadius: '8px', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: '700', color: '#1e40af' }}>Balance Total</span>
                      <span style={{ 
                        fontSize: '1.5rem', 
                        fontWeight: '700', 
                        color: bancoInfo.resumenPeriodo.balanceTotal >= 0 ? '#16a34a' : '#dc2626' 
                      }}>
                        {bancoInfo.resumenPeriodo.balanceTotal >= 0 ? '+' : ''}
                        {bancoInfo.resumenPeriodo.balanceTotal.toFixed(2)}h
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                      {bancoInfo.resumenPeriodo.mensaje}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Estilos
const containerStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: '12px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  overflow: 'hidden',
  marginBottom: '20px',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '20px 24px',
  borderBottom: '2px solid #e2e8f0',
  background: '#f8fafc',
  flexWrap: 'wrap',
  gap: '12px',
};

const iconStyle: React.CSSProperties = {
  fontSize: '1.8rem',
  background: '#eff6ff',
  width: '48px',
  height: '48px',
  borderRadius: '10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '1.05rem',
  fontWeight: '700',
  color: '#1e293b',
};

const badgeStyle: React.CSSProperties = {
  padding: '6px 14px',
  background: '#eff6ff',
  borderRadius: '16px',
  fontSize: '0.85rem',
  fontWeight: '600',
  color: '#1e40af',
};

const metadataStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  padding: '16px 24px',
  background: '#fafbfc',
  borderBottom: '1px solid #e2e8f0',
  fontSize: '0.9rem',
};

const metadataItemStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  color: '#475569',
};

const sectionStyle: React.CSSProperties = {
  background: '#fafbfc',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  overflow: 'hidden',
};

const sectionTitleStyle: React.CSSProperties = {
  padding: '14px 18px',
  background: '#f8fafc',
  borderBottom: '1px solid #e2e8f0',
  fontSize: '0.9rem',
  fontWeight: '700',
  color: '#1e293b',
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '12px',
  padding: '16px',
};

const gridItemStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '10px 12px',
  background: 'white',
  borderRadius: '6px',
  border: '1px solid #e2e8f0',
  fontSize: '0.85rem',
  color: '#475569',
};

const estadoBadgeStyle: React.CSSProperties = {
  padding: '4px 10px',
  borderRadius: '6px',
  fontSize: '0.75rem',
  fontWeight: '600',
  textTransform: 'uppercase',
};

const messageStyle: React.CSSProperties = {
  padding: '12px 18px',
  background: '#fef3c7',
  borderTop: '1px solid #fde68a',
  fontSize: '0.85rem',
  color: '#92400e',
};

const clickableHeaderStyle: React.CSSProperties = {
  padding: '14px 16px',
  background: '#f8fafc',
  cursor: 'pointer',
};

const badgeBlueStyle: React.CSSProperties = {
  padding: '4px 12px',
  background: '#eff6ff',
  borderRadius: '6px',
  fontSize: '0.8rem',
  fontWeight: '600',
  color: '#1e40af',
};

const badgeYellowStyle: React.CSSProperties = {
  padding: '4px 12px',
  background: '#fef3c7',
  borderRadius: '6px',
  fontSize: '0.8rem',
  fontWeight: '600',
  color: '#92400e',
};

const cardStyle: React.CSSProperties = {
  background: 'white',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  overflow: 'hidden',
};

const cardHeaderStyle: React.CSSProperties = {
  padding: '14px 16px',
  background: '#fafbfc',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '10px',
};

const buttonStyle: React.CSSProperties = {
  padding: '6px 12px',
  background: '#3b82f6',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  fontSize: '0.8rem',
  fontWeight: '600',
  cursor: 'pointer',
};

const expandedStyle: React.CSSProperties = {
  padding: '16px',
  background: 'white',
  borderTop: '1px solid #e2e8f0',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  fontSize: '0.85rem',
};

const infoGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  padding: '10px',
  background: '#f8fafc',
  borderRadius: '6px',
  border: '1px solid #e2e8f0',
};

const infoItemStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  color: '#475569',
};

const disponibilidadStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'center',
  padding: '12px',
  background: '#f8fafc',
  borderRadius: '6px',
  border: '1px solid #e2e8f0',
  flexWrap: 'wrap',
  gap: '10px',
};

const dispItemStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '4px',
};

const horaDetalleStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '8px 10px',
  background: 'white',
  borderRadius: '6px',
  border: '1px solid #e2e8f0',
  fontSize: '0.8rem',
};