import React, { useState } from "react";
import { getImageUrl } from "../../../utils/imageUtils";
import type { RegistroConTipo } from "../../../types/registros";

interface RegistroCardProps {
  registro: RegistroConTipo;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  compact?: boolean;
}

export const RegistroCard: React.FC<RegistroCardProps> = ({ 
  registro, 
  onEdit, 
  onDelete, 
  compact = false 
}) => {
  const esAusencia = registro.tipoRegistro === 'AUSENCIA';
  
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [showImage, setShowImage] = useState(true);

  React.useEffect(() => {
    setImageError(false);
    setImageLoading(true);
    setShowImage(true);
  }, [registro.trabajadorId, registro.imagen_Url]);

  React.useEffect(() => {
    if (imageLoading && registro.imagen_Url) {
      const timeout = setTimeout(() => {
        setImageError(true);
        setImageLoading(false);
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [imageLoading, registro.imagen_Url]);

  const formatearHora = (timeString: string) => {
    return timeString?.substring(0, 5) || "--:--";
  };

  const formatearHoras = (hours: number) => {
    if (hours === 0) return "0:00";
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}:${m.toString().padStart(2, "0")}`;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const retryImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageError(false);
    setImageLoading(true);
    setShowImage(false);
    setTimeout(() => setShowImage(true), 50);
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
      const tipoAusencia = registro.ausenciaInfo?.tipoAusencia?.toLowerCase();
      if (tipoAusencia?.includes('médica') || tipoAusencia?.includes('cita')) return '🏥';
      if (tipoAusencia?.includes('accidente')) return '🚑';
      if (tipoAusencia?.includes('enfermedad')) return '😷';
      if (tipoAusencia?.includes('personal') || tipoAusencia?.includes('diligencia')) return '🏃‍♂️';
      return '📋';
    }
    return '👤';
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
            <div style={{ 
              position: 'relative',
              width: '45px', 
              height: '45px',
              flexShrink: 0
            }}>
              {registro.imagen_Url && !imageError && showImage ? (
                <>
                  {imageLoading && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                      backgroundSize: '200% 100%',
                      animation: 'loading-shimmer 1.5s infinite',
                      borderRadius: '50%'
                    }}>
                      <span style={{ fontSize: '16px' }}>⏳</span>
                    </div>
                  )}
                  <img 
                    src={getImageUrl(registro.imagen_Url)}
                    alt={registro.trabajadorNombre}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '50%',
                      border: '2px solid white',
                      display: imageLoading ? 'none' : 'block'
                    }}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                  />
                </>
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: esAusencia ? '#f59e0b' : '#3b82f6',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.9rem',
                  fontWeight: '700',
                  border: '2px solid white',
                  position: 'relative'
                }}>
                  <span>{getInitials(registro.trabajadorNombre || 'T')}</span>
                  {imageError && registro.imagen_Url && (
                    <button 
                      style={{
                        position: 'absolute',
                        bottom: '-4px',
                        right: '-4px',
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        background: '#4CAF50',
                        border: '1px solid white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        padding: 0
                      }}
                      onClick={retryImage}
                      title="Reintentar cargar imagen"
                    >
                      🔄
                    </button>
                  )}
                </div>
              )}
            </div>

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
        {/* Avatar con foto del trabajador */}
        <div style={{ 
          position: 'relative',
          width: '70px', 
          height: '70px',
          flexShrink: 0
        }}>
          {registro.imagen_Url && !imageError && showImage ? (
            <>
              {imageLoading && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'loading-shimmer 1.5s infinite',
                  borderRadius: '50%'
                }}>
                  <span style={{ fontSize: '24px', animation: 'spin 2s linear infinite' }}>⏳</span>
                </div>
              )}
              <img 
                src={getImageUrl(registro.imagen_Url)}
                alt={registro.trabajadorNombre}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '50%',
                  border: '3px solid white',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                  display: imageLoading ? 'none' : 'block'
                }}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            </>
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: esAusencia ? '#f59e0b' : '#3b82f6',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: '700',
              border: '3px solid white',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
              position: 'relative'
            }}>
              <span>{getInitials(registro.trabajadorNombre || 'T')}</span>
              {imageError && registro.imagen_Url && (
                <button 
                  style={{
                    position: 'absolute',
                    bottom: '-6px',
                    right: '-6px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: '#4CAF50',
                    border: '2px solid white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    padding: 0,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={retryImage}
                  title="Reintentar cargar imagen"
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.style.background = '#45a049';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.background = '#4CAF50';
                  }}
                >
                  🔄
                </button>
              )}
            </div>
          )}
          
          {/* Icono de tipo en la esquina */}
          <div style={{
            position: 'absolute',
            bottom: '-5px',
            left: '-5px',
            background: 'white',
            borderRadius: '50%',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            fontSize: '0.9rem'
          }}>
            {getIcono()}
          </div>
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
              "{registro.ausenciaInfo?.descripcion}"
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

          {/* Desglose de horas */}
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
                  disabled={registro.id < 0}
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

      {/* CSS para animaciones */}
      <style>
        {`
          @keyframes loading-shimmer {
            0% {
              background-position: 200% 0;
            }
            100% {
              background-position: -200% 0;
            }
          }
          
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </div>
  );
};