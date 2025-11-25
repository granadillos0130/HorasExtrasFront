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

export const BancoHorasInfo: React.FC<BancoHorasInfoProps> = ({
  metadatosVista,
  bancoInfo,
  compensadosInfo,
}) => {
  const [compensadosExpandido, setCompensadosExpandido] = useState(false);
  const [compensadoDetalleVisible, setCompensadoDetalleVisible] = useState<number | null>(null);
  const [semanaDetalleVisible, setSemanaDetalleVisible] = useState<number | null>(null);

  return (
    <div className="vista-info-card">
      <div className="vista-header">
        <div className="vista-icon">
          {metadatosVista.tipoVista === "Semanal" ? "📅" : "📊"}
        </div>
        <h3>Información de Vista: {metadatosVista.tipoVista}</h3>
        <span className="vista-badge">
          {metadatosVista.valoresMostrados}
        </span>
      </div>

      <div className="vista-details">
        <div className="vista-item">
          <span className="vista-label">Tipo de trabajador:</span>
          <span className="vista-value">
            {metadatosVista.trabajadorUsaBanco ? "Con banco de horas" : "Sin banco de horas"}
          </span>
        </div>
        <div className="vista-item">
          <span className="vista-label">Valores mostrados:</span>
          <span className="vista-value">{metadatosVista.valoresMostrados}</span>
        </div>
      </div>

      {bancoInfo && (
        <div className="banco-info">
          {/* Vista Semanal */}
          {bancoInfo.tipo === "semanal" && (
            <div className="banco-semanal">
              <div className="banco-titulo">📝 Información Semanal (Vista Excel)</div>
              <div className="banco-grid">
                <div className="banco-item">
                  <span className="banco-label">Horas base semanal:</span>
                  <span className="banco-value">{bancoInfo.horasBase || 0}h</span>
                </div>
                <div className="banco-item">
                  <span className="banco-label">Según Excel:</span>
                  <span className="banco-value">{bancoInfo.totalSegunExcel || 0}h</span>
                </div>
                <div className="banco-item">
                  <span className="banco-label">Estado:</span>
                  <span className={`banco-estado ${(bancoInfo.estado || '').toLowerCase()}`}>
                    {bancoInfo.estado || 'Desconocido'}
                  </span>
                </div>
              </div>
              {bancoInfo.mensaje && (
                <div className="banco-mensaje">
                  💡 {bancoInfo.mensaje}
                </div>
              )}
            </div>
          )}

          {/* Vista Mensual */}
          {bancoInfo.tipo === "mensual" && bancoInfo.bancoHoras && (
            <div className="banco-mensual">
              <div className="banco-titulo">🏦 Estado del Banco de Horas</div>

              {/* Sección de Compensados */}
              {compensadosInfo && compensadosInfo.total > 0 && (
                <div className="compensados-seccion">
                  <div
                    className="compensados-header"
                    onClick={() => setCompensadosExpandido(!compensadosExpandido)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="compensados-titulo">
                      🔄 Días Compensados en este Período
                      <span className="compensados-toggle">
                        {compensadosExpandido ? '▼' : '▶'}
                      </span>
                    </div>
                    <div className="compensados-resumen">
                      <span className="compensados-cantidad">
                        {compensadosInfo.total} día{compensadosInfo.total !== 1 ? 's' : ''}
                      </span>
                      <span className="compensados-horas">
                        {compensadosInfo.totalHorasCompensadas.toFixed(2)} horas usadas
                      </span>
                    </div>
                  </div>

                  {compensadosExpandido && (
                    <div className="compensados-detalle">
                      {compensadosInfo.detalle.map((compensado: any) => (
                        <div key={compensado.id} className="compensado-card">
                          <div className="compensado-header">
                            <div className="compensado-fecha">
                              📅 {formatFechaCompensado(compensado.fecha)}
                            </div>
                            <div className="compensado-centro">
                              🏢 {compensado.centroNombre}
                            </div>
                            <div className="compensado-horas">
                              ⏰ {compensado.horasCompensadas.toFixed(2)}h
                            </div>
                            <button
                              className="compensado-detalle-btn"
                              onClick={() => setCompensadoDetalleVisible(
                                compensadoDetalleVisible === compensado.id ? null : compensado.id
                              )}
                            >
                              {compensadoDetalleVisible === compensado.id ? 'Ocultar' : 'Ver más'}
                            </button>
                          </div>

                          {compensadoDetalleVisible === compensado.id && (
                            <div className="compensado-info-expandida">
                              <div className="compensado-horario">
                                <div className="info-item">
                                  <span className="info-label">Horario:</span>
                                  <span className="info-value">
                                    {compensado.horaInicio} - {compensado.horaFin}
                                  </span>
                                </div>
                              </div>

                              <div className="compensado-origen">
                                <div className="info-item">
                                  <span className="info-label">Período origen:</span>
                                  <span className="info-value">
                                    {formatPeriodoOrigen(compensado.periodoOrigenInicio, compensado.periodoOrigenFin)}
                                  </span>
                                </div>
                                <div className="info-item">
                                  <span className="info-label">Balance origen total:</span>
                                  <span className="info-value">{compensado.balanceOrigenTotal.toFixed(2)}h</span>
                                </div>
                              </div>

                              <div className="compensado-disponibilidad">
                                <div className="disponibilidad-item">
                                  <span className="disp-label">Antes del compensado:</span>
                                  <span className="disp-valor antes">{compensado.horasDisponiblesAntes.toFixed(2)}h</span>
                                </div>
                                <div className="disponibilidad-flecha">→</div>
                                <div className="disponibilidad-item">
                                  <span className="disp-label">Después del compensado:</span>
                                  <span className="disp-valor despues">{compensado.horasDisponiblesDespues.toFixed(2)}h</span>
                                </div>
                                <div className="disponibilidad-item">
                                  <span className="disp-label">Disponible actualmente:</span>
                                  <span className={`disp-valor actual ${compensado.horasDisponiblesActuales <= 0 ? 'agotado' : 'disponible'}`}>
                                    {compensado.horasDisponiblesActuales.toFixed(2)}h
                                  </span>
                                </div>
                              </div>

                              {compensado.descripcion && (
                                <div className="compensado-descripcion">
                                  <div className="info-item">
                                    <span className="info-label">Descripción:</span>
                                    <span className="info-value">{compensado.descripcion}</span>
                                  </div>
                                </div>
                              )}

                              <div className="compensado-meta">
                                <div className="meta-item">
                                  <span className="meta-label">Creado:</span>
                                  <span className="meta-value">
                                    {new Date(compensado.fechaCreacion).toLocaleDateString('es-CO', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                                <div className="meta-item">
                                  <span className="meta-label">Por:</span>
                                  <span className="meta-value">{compensado.usuarioCreacion}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Desglose de semanas */}
              {bancoInfo.desgloseSemanas && bancoInfo.desgloseSemanas.length > 0 && (
                <div className="desglose-semanas">
                  <h4>Desglose Semanal</h4>
                  <div className="semanas-grid">
                    {bancoInfo.desgloseSemanas.map((semana: any, index: number) => (
                      <div key={index} className="semana-card">
                        <div 
                          className="semana-header"
                          onClick={() => setSemanaDetalleVisible(
                            semanaDetalleVisible === index ? null : index
                          )}
                          style={{ cursor: 'pointer' }}
                        >
                          <span className="semana-numero">Semana {index + 1}</span>
                          <span className={`semana-balance ${semana.balance >= 0 ? 'positivo' : 'negativo'}`}>
                            {semana.balance >= 0 ? '+' : ''}{semana.balance.toFixed(2)}h
                          </span>
                          <span className="semana-toggle">
                            {semanaDetalleVisible === index ? '▼' : '▶'}
                          </span>
                        </div>
                        <div className="semana-detalles">
                          <div className="semana-fechas">{semana.semana}</div>
                          <div className="semana-horas">
                            <span>Trabajadas: {semana.horasTrabajadas.toFixed(2)}h</span>
                            <span>Base: {semana.horasBase.toFixed(2)}h</span>
                          </div>
                          <div className={`semana-estado ${semana.estado.toLowerCase()}`}>
                            {semana.estado}
                          </div>
                        </div>
                        
                        {semanaDetalleVisible === index && (
                          <div className="semana-detalle-expandido">
                            <div className="semana-detalle-titulo">📊 Desglose de Horas</div>
                            <div className="semana-horas-detalle">
                              <div className="hora-detalle-item normal">
                                <span className="hora-label">⏰ Horas Normales:</span>
                                <span className="hora-valor">{formatHours(semana.horasNormales || 0)}</span>
                              </div>
                              <div className="hora-detalle-item extra-diurna">
                                <span className="hora-label">☀️ Extras Diurnas:</span>
                                <span className="hora-valor">{formatHours(semana.horasExtrasDiurnas || 0)}</span>
                              </div>
                              <div className="hora-detalle-item extra-nocturna">
                                <span className="hora-label">🌙 Extras Nocturnas:</span>
                                <span className="hora-valor">{formatHours(semana.horasExtrasNocturnas || 0)}</span>
                              </div>
                              <div className="hora-detalle-item dom-diurna">
                                <span className="hora-label">🌅 Dom. Diurnas:</span>
                                <span className="hora-valor">{formatHours(semana.extrasDominicalesDiurnas || 0)}</span>
                              </div>
                              <div className="hora-detalle-item dom-nocturna">
                                <span className="hora-label">🌃 Dom. Nocturnas:</span>
                                <span className="hora-valor">{formatHours(semana.extrasDominicalesNocturnas || 0)}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resumen del período */}
              {bancoInfo.resumenPeriodo && (
                <div className="resumen-periodo">
                  <h4>Resumen del Período</h4>
                  <div className="resumen-card total">
                    <div className="resumen-header">
                      <span className="resumen-titulo">Balance Total</span>
                      <span className={`resumen-valor ${bancoInfo.resumenPeriodo.balanceTotal >= 0 ? 'positivo' : 'negativo'}`}>
                        {bancoInfo.resumenPeriodo.balanceTotal >= 0 ? '+' : ''}
                        {bancoInfo.resumenPeriodo.balanceTotal.toFixed(2)}h
                      </span>
                    </div>
                    <div className="resumen-detalle">
                      <span className={`resumen-estado ${bancoInfo.resumenPeriodo.estadoTotal.toLowerCase()}`}>
                        {bancoInfo.resumenPeriodo.estadoTotal}
                      </span>
                      <span className="resumen-mensaje">
                        {bancoInfo.resumenPeriodo.mensaje}
                      </span>
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