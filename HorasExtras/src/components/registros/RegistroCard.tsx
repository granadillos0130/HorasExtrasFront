// src/components/registros/RegistroCard.tsx
import React from 'react';
import type { RegistroConTipo } from '../../types/registros';

interface Props {
  registro: RegistroConTipo;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  compact?: boolean;
}

const RegistroCard: React.FC<Props> = ({ 
  registro, 
  onEdit, 
  onDelete, 
  compact = false 
}) => {
  const esAusencia = registro.tipoRegistro === 'AUSENCIA';
  const formatearHora = (timeString: string) => {
    return timeString?.substring(0, 5) || "--:--";
  };

  const formatearHoras = (hours: number) => {
    if (hours === 0) return "0:00";
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}:${m.toString().padStart(2, "0")}`;
  };

  const getCardStyle = () => {
    if (esAusencia) {
      return {
        background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
        border: '2px solid #f59e0b',
        borderLeft: '6px solid #d97706'
      };
    }
    return {
      background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
      border: '2px solid #3b82f6',
      borderLeft: '6px solid #1d4ed8'
    };
  };

  const getIcono = () => {
    if (esAusencia) {
      // Iconos específicos según el tipo de ausencia
      const tipoAusencia = registro.ausenciaInfo?.tipoAusencia?.toLowerCase();
      if (tipoAusencia?.includes('médica') || tipoAusencia?.includes('cita')) return '🏥';
      if (tipoAusencia?.includes('accidente')) return '🚑';
      if (tipoAusencia?.includes('enfermedad')) return '😷';
      if (tipoAusencia?.includes('personal') || tipoAusencia?.includes('diligencia')) return '🏃‍♂️';
      return '📋'; // Icono genérico para ausencias
    }
    return '👤'; // Icono para trabajo normal
  };

  const getTipoTexto = () => {
    if (esAusencia) {
      return `AUSENCIA - ${registro.ausenciaInfo?.tipoAusencia || 'Tipo no especificado'}`;
    }
    return `TRABAJO - ${registro.nombreCentro}`;
  };

  const getRemunerationBadge = () => {
    if (!esAusencia) return null;
    
    const esRemunerada = registro.ausenciaInfo?.remunerado;
    return (
      <span style={{
        background: esRemunerada ? '#10b981' : '#ef4444',
        color: 'white',
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '0.7rem',
        fontWeight: '600',
        textTransform: 'uppercase'
      }}>
        {esRemunerada ? '💰 Remunerada' : '🚫 No Remunerada'}
      </span>
    );
  };

  if (compact) {
    return (
      <div style={{
        ...getCardStyle(),
        padding: '15px',
        borderRadius: '12px',
        margin: '8px 0',
        transition: 'all 0.3s ease'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '1.5rem' }}>{getIcono()}</div>
            <div>
              <h5 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: '600' }}>
                {registro.trabajadorNombre}
              </h5>
              <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.8 }}>
                {formatearHora(registro.horaIngreso)} - {formatearHora(registro.horaSalida)}
              </p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              background: 'rgba(255,255,255,0.8)',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '0.9rem',
              fontWeight: '600',
              marginBottom: '4px'
            }}>
              {formatearHoras(registro.totalHoras)}
            </div>
            {getRemunerationBadge()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      ...getCardStyle(),
      padding: '25px',
      borderRadius: '16px',
      margin: '15px 0',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease',
      position: 'relative'
    }}
    onMouseOver={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
    }}
    >
      {/* Badge de tipo de registro */}
      <div style={{
        position: 'absolute',
        top: '15px',
        right: '15px',
        background: esAusencia ? '#f59e0b' : '#3b82f6',
        color: 'white',
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '0.7rem',
        fontWeight: '600',
        textTransform: 'uppercase'
      }}>
        {esAusencia ? 'AUSENCIA' : 'TRABAJO'}
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '20px'
      }}>
        {/* Icono y información principal */}
        <div style={{
          background: esAusencia ? '#f59e0b' : '#3b82f6',
          color: 'white',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.8rem',
          flexShrink: 0
        }}>
          {getIcono()}
        </div>

        <div style={{ flex: 1 }}>
          {/* Nombre del trabajador */}
          <h4 style={{
            margin: '0 0 8px 0',
            fontSize: '1.3rem',
            fontWeight: '700',
            color: '#1f2937'
          }}>
            {registro.trabajadorNombre || `Trabajador ${registro.trabajadorId}`}
          </h4>

          {/* Tipo y centro/descripción */}
          <p style={{
            margin: '0 0 12px 0',
            fontSize: '1rem',
            fontWeight: '600',
            color: esAusencia ? '#92400e' : '#1e40af'
          }}>
            {getTipoTexto()}
          </p>

          {/* Descripción adicional para ausencias */}
          {esAusencia && registro.ausenciaInfo?.descripcion && (
            <p style={{
              margin: '0 0 12px 0',
              fontSize: '0.9rem',
              color: '#6b7280',
              fontStyle: 'italic',
              background: 'rgba(255,255,255,0.6)',
              padding: '8px 12px',
              borderRadius: '8px'
            }}>
              "{registro.ausenciaInfo.descripcion}"
            </p>
          )}

          {/* Horarios */}
          <div style={{
            display: 'flex',
            gap: '20px',
            marginBottom: '15px',
            flexWrap: 'wrap'
          }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '600' }}>
                HORARIO:
              </span>
              <span style={{ fontSize: '1rem', fontWeight: '600', marginLeft: '8px' }}>
                {formatearHora(registro.horaIngreso)} - {formatearHora(registro.horaSalida)}
              </span>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '600' }}>
                TOTAL:
              </span>
              <span style={{ 
                fontSize: '1.1rem', 
                fontWeight: '700', 
                marginLeft: '8px',
                color: esAusencia ? '#d97706' : '#1d4ed8'
              }}>
                {formatearHoras(registro.totalHoras)} hrs
              </span>
            </div>
          </div>

          {/* Desglose de horas (solo si hay horas extras o es trabajo) */}
          {(!esAusencia || registro.horasExtrasDiurnas > 0 || registro.horasExtrasNocturnas > 0) && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '12px',
              marginBottom: '15px'
            }}>
              <div style={{
                background: 'rgba(255,255,255,0.7)',
                padding: '8px 12px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: '600' }}>
                  NORMALES
                </div>
                <div style={{ fontSize: '1rem', fontWeight: '700', color: '#059669' }}>
                  {formatearHoras(registro.horasNormales)}
                </div>
              </div>

              {registro.horasExtrasDiurnas > 0 && (
                <div style={{
                  background: 'rgba(255,255,255,0.7)',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: '600' }}>
                    EXTRAS DIURNAS
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: '700', color: '#ea580c' }}>
                    {formatearHoras(registro.horasExtrasDiurnas)}
                  </div>
                </div>
              )}

              {registro.horasExtrasNocturnas > 0 && (
                <div style={{
                  background: 'rgba(255,255,255,0.7)',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: '600' }}>
                    EXTRAS NOCTURNAS
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: '700', color: '#7c2d12' }}>
                    {formatearHoras(registro.horasExtrasNocturnas)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Badge de remuneración y acciones */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              {getRemunerationBadge()}
            </div>

            {/* Botones de acción */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {onEdit && (
                <button
                  onClick={() => onEdit(registro.id)}
                  style={{
                    background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                    color: 'white',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    cursor: registro.id < 0 ? 'not-allowed' : 'pointer',
                    opacity: registro.id < 0 ? 0.5 : 1,
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}
                  disabled={registro.id < 0} // Deshabilitar para ausencias (ID negativo)
                  title={registro.id < 0 ? 'Para editar ausencias, ve a la sección de Ausencias' : 'Editar registro'}
                >
                  ✏️ Editar
                </button>
              )}
              
              {onDelete && (
                <button
                  onClick={() => onDelete(registro.id)}
                  style={{
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: 'white',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}
                  title={registro.id < 0 ? 'Eliminar ausencia' : 'Eliminar registro'}
                >
                  🗑️ Eliminar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistroCard;