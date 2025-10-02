/* eslint-disable @typescript-eslint/no-explicit-any */
// components/modales/CentroModalUniversal.tsx
import React from 'react';
import type { CentroPorMesCompleto } from '../../types/centros';
import type { Cliente } from '../../types/cliente';

interface CentroModalProps {
  isOpen: boolean;
  onClose: () => void;
  centro: CentroPorMesCompleto;
  datosCompletos: {
    cliente: Cliente | null;
    manoObraTotal: number;
    manoObraCompensada?: number;
    cargosUnicos: string[];
  };
  centroEncontrado?: any;
  modalType: 'info' | 'cargos' | 'compensados';
  onToggleModal: () => void;
  onToggleCompensados?: () => void;
  source?: 'busqueda' | 'estado' | 'meses';
}

const formatearFecha = (fecha: string) => {
  return new Date(fecha).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatearHoras = (hours: number) => {
  if (hours === 0) return "0:00";
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}:${m.toString().padStart(2, "0")}`;
};

const formatearMoneda = (valor: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(valor);
};

const CentroModalUniversal: React.FC<CentroModalProps> = ({
  isOpen,
  onClose,
  centro,
  datosCompletos,
  centroEncontrado,
  modalType,
  onToggleModal,
  onToggleCompensados,
}) => {
  if (!isOpen) return null;

  const getSubtitle = () => {
    switch (modalType) {
      case 'info':
        return '📊 Información Completa';
      case 'cargos':
        return '👷 Cargos de Trabajadores';
      case 'compensados':
        return '🕒 Mano de Obra Compensada';
      default:
        return '📊 Información Completa';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '30px',
        maxWidth: '900px',
        width: '100%',
        maxHeight: '85vh',
        overflowY: 'auto',
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '25px',
          paddingBottom: '15px',
          borderBottom: '2px solid #f0f0f0'
        }}>
          <div>
            <h3 style={{
              margin: '0 0 5px 0',
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#333'
            }}>
              🏢 {centro.centroNombre}
            </h3>
            <p style={{
              margin: 0,
              fontSize: '0.9rem',
              color: '#666'
            }}>
              {getSubtitle()}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ❌
          </button>
        </div>

        {modalType === 'info' ? (
          <InfoView 
            centro={centro}
            datosCompletos={datosCompletos}
            centroEncontrado={centroEncontrado}
            onToggleModal={onToggleModal}
            onToggleCompensados={onToggleCompensados}
          />
        ) : modalType === 'cargos' ? (
          <CargosView 
            datosCompletos={datosCompletos}
            onToggleModal={onToggleModal}
            onToggleCompensados={onToggleCompensados}
          />
        ) : (
          <CompensadosView 
            centro={centro}
            datosCompletos={datosCompletos}
            onToggleModal={onToggleModal}
            onToggleCompensados={onToggleCompensados}
          />
        )}
      </div>
    </div>
  );
};

// Componente para la vista de información
const InfoView: React.FC<{
  centro: CentroPorMesCompleto;
  datosCompletos: any;
  centroEncontrado?: any;
  onToggleModal: () => void;
  onToggleCompensados?: () => void;
}> = ({ centro, datosCompletos, centroEncontrado, onToggleModal, onToggleCompensados }) => {
  
  const totalHoras = centro.trabajadores.reduce((sum, t) => sum + t.totalHoras, 0);
  const manoObraNormal = centro.manoObraTotal || datosCompletos.manoObraTotal;
  const manoObraCompensada = centro.manoObraCompensada || datosCompletos.manoObraCompensada || 0;
  const totalGeneral = manoObraNormal + manoObraCompensada;

  return (
    <div>
      {/* Cards de estadísticas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        marginBottom: '30px'
      }}>
        {/* Orden de Compra */}
        <div style={{
          background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
          color: 'white',
          padding: '15px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>🏢</div>
          <h4 style={{ margin: '0 0 5px 0', fontSize: '0.9rem' }}>Orden de Compra</h4>
          <p style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>
            {centro.centroId}
          </p>
        </div>

        {/* Total Trabajadores */}
        <div style={{
          background: 'linear-gradient(135deg, #22c55e, #15803d)',
          color: 'white',
          padding: '15px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>👥</div>
          <h4 style={{ margin: '0 0 5px 0', fontSize: '0.9rem' }}>Total Trabajadores</h4>
          <p style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>
            {centro.trabajadores.length}
          </p>
        </div>

        {/* Total Horas */}
        <div style={{
          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
          color: 'white',
          padding: '15px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>⏰</div>
          <h4 style={{ margin: '0 0 5px 0', fontSize: '0.9rem' }}>Total Horas</h4>
          <p style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>
            {formatearHoras(totalHoras)}
          </p>
        </div>

        {/* Mano de Obra Normal */}
        <div style={{
          background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
          color: 'white',
          padding: '15px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>💰</div>
          <h4 style={{ margin: '0 0 5px 0', fontSize: '0.9rem' }}>Mano de Obra Normal</h4>
          <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '600' }}>
            {formatearMoneda(manoObraNormal)}
          </p>
        </div>

        {/* Mano de Obra Compensada */}
        <div style={{
          background: 'linear-gradient(135deg, #ec4899, #db2777)',
          color: 'white',
          padding: '15px',
          borderRadius: '12px',
          textAlign: 'center',
          cursor: onToggleCompensados ? 'pointer' : 'default',
          transition: 'transform 0.2s ease',
          ...(onToggleCompensados && {
            ':hover': {
              transform: 'scale(1.05)'
            }
          })
        }}
        onClick={onToggleCompensados}
        >
          <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>🕒</div>
          <h4 style={{ margin: '0 0 5px 0', fontSize: '0.9rem' }}>Mano de Obra Compensada</h4>
          <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '600' }}>
            {formatearMoneda(manoObraCompensada)}
          </p>
          {manoObraCompensada > 0 && (
            <small style={{ opacity: 0.9, fontSize: '0.7rem' }}>
              {((manoObraCompensada / totalGeneral) * 100).toFixed(1)}% del total
            </small>
          )}
        </div>
      </div>

      {/* Resumen de Costos */}
      {manoObraCompensada > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
          padding: '15px',
          borderRadius: '12px',
          border: '2px solid #f59e0b',
          marginBottom: '20px'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#92400e', fontSize: '1.1rem' }}>
            📊 Resumen de Costos
          </h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '10px',
            fontSize: '0.9rem'
          }}>
            <div>
              <strong style={{ color: '#1e40af' }}>Mano de Obra Normal:</strong><br />
              <span>{formatearMoneda(manoObraNormal)}</span>
            </div>
            <div>
              <strong style={{ color: '#db2777' }}>Mano de Obra Compensada:</strong><br />
              <span>{formatearMoneda(manoObraCompensada)}</span>
            </div>
            <div>
              <strong style={{ color: '#15803d' }}>Total General:</strong><br />
              <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>
                {formatearMoneda(totalGeneral)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Información del proyecto */}
      <div style={{
        background: '#f8fafb',
        padding: '20px',
        borderRadius: '15px',
        border: '2px solid #e1e8ed',
        marginBottom: '20px'
      }}>
        <h4 style={{
          margin: '0 0 15px 0',
          color: '#333',
          fontSize: '1.2rem'
        }}>
          📋 Información del Proyecto
        </h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '15px'
        }}>
          <div>
            <strong style={{ color: '#22c55e' }}>Cliente:</strong><br />
            <span style={{ fontSize: '1.1rem' }}>
              {datosCompletos.cliente ? datosCompletos.cliente.nombreCliente : 'Sin cliente asignado'}
            </span>
          </div>
          <div>
            <strong style={{ color: '#22c55e' }}>Estado:</strong><br />
            <span style={{ fontSize: '1.1rem' }}>
              {centroEncontrado?.estado ? (centroEncontrado.estado ? 'Abierto' : 'Cerrado') : 'No especificado'}
            </span>
          </div>
          <div>
            <strong style={{ color: '#22c55e' }}>Tipo:</strong><br />
            <span style={{ fontSize: '1.1rem' }}>
              {centroEncontrado?.tipo || 'No especificado'}
            </span>
          </div>
          <div>
            <strong style={{ color: '#22c55e' }}>Valor de la Orden:</strong><br />
            <span style={{ fontSize: '1.1rem' }}>
              {centroEncontrado?.valorOrden ? formatearMoneda(centroEncontrado.valorOrden) : 'No especificado'}
            </span>
          </div>
        </div>
      </div>

      {/* Personal del proyecto */}
      <div style={{
        background: '#f0f9ff',
        padding: '20px',
        borderRadius: '15px',
        border: '2px solid #bfdbfe',
        marginBottom: '20px'
      }}>
        <h4 style={{
          margin: '0 0 15px 0',
          color: '#333',
          fontSize: '1.2rem'
        }}>
          👥 Personal del Proyecto
        </h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '15px'
        }}>
          <div>
            <strong style={{ color: '#1d4ed8' }}>Interventor:</strong><br />
            <span style={{ fontSize: '1.1rem' }}>
              {centroEncontrado?.interventor || 'No asignado'}
            </span>
          </div>
          <div>
            <strong style={{ color: '#1d4ed8' }}>Vendedor:</strong><br />
            <span style={{ fontSize: '1.1rem' }}>
              {centroEncontrado?.vendedor || 'No asignado'}
            </span>
          </div>
        </div>
      </div>

      {/* Fechas del proyecto */}
      <div style={{
        background: '#fef3c7',
        padding: '20px',
        borderRadius: '15px',
        border: '2px solid #fde68a'
      }}>
        <h4 style={{
          margin: '0 0 15px 0',
          color: '#333',
          fontSize: '1.2rem'
        }}>
          📅 Fechas del Proyecto
        </h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px'
        }}>
          <div>
            <strong style={{ color: '#d97706' }}>Fecha de Inicio:</strong><br />
            <span style={{ fontSize: '1.1rem' }}>
              {formatearFecha(centro.fechaInicio)}
            </span>
          </div>
          <div>
            <strong style={{ color: '#d97706' }}>Fecha Final:</strong><br />
            <span style={{ fontSize: '1.1rem' }}>
              {centro.fechaFinal ? formatearFecha(centro.fechaFinal) : '🟢 Vigente'}
            </span>
          </div>
          <div>
            <strong style={{ color: '#d97706' }}>Fecha de Factura:</strong><br />
            <span style={{ fontSize: '1.1rem' }}>
              {centroEncontrado?.fechaFactura ? formatearFecha(centroEncontrado.fechaFactura) : 'No especificada'}
            </span>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div style={{ 
        display: 'flex', 
        gap: '15px', 
        marginTop: '25px',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        {centro.trabajadores.length > 0 && (
          <button
            onClick={onToggleModal}
            style={{
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.9rem',
              flex: '1',
              minWidth: '200px'
            }}
          >
            👷 Ver Cargos ({centro.trabajadores.length})
          </button>
        )}
        
        {manoObraCompensada > 0 && onToggleCompensados && (
          <button
            onClick={onToggleCompensados}
            style={{
              background: 'linear-gradient(135deg, #ec4899, #db2777)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.9rem',
              flex: '1',
              minWidth: '200px'
            }}
          >
            🕒 Ver Compensados
          </button>
        )}
      </div>
    </div>
  );
};

// Componente para la vista de cargos
const CargosView: React.FC<{
  datosCompletos: any;
  onToggleModal: () => void;
  onToggleCompensados?: () => void;
}> = ({ datosCompletos, onToggleModal, onToggleCompensados }) => {
  return (
    <div>
      <div style={{
        marginBottom: '20px',
        padding: '15px 20px',
        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
        color: 'white',
        borderRadius: '12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h4 style={{ margin: 0, fontSize: '1.2rem' }}>
          👷 Cargos en el Centro
        </h4>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onToggleModal}
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.9rem'
            }}
          >
            📊 Ver Información
          </button>
          {onToggleCompensados && (
            <button
              onClick={onToggleCompensados}
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.9rem'
              }}
            >
              🕒 Ver Compensados
            </button>
          )}
        </div>
      </div>

      {datosCompletos.cargosUnicos.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '15px',
          maxHeight: '500px',
          overflowY: 'auto',
          padding: '10px'
        }}>
          {datosCompletos.cargosUnicos.map((cargo: string, index: number) => (
            <div key={index} style={{
              background: 'linear-gradient(135deg, #f8fafb, #ffffff)',
              padding: '25px',
              borderRadius: '15px',
              border: '2px solid #e1e8ed',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              textAlign: 'center',
              transition: 'all 0.3s ease'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #22c55e, #15803d)',
                color: 'white',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                margin: '0 auto 15px'
              }}>
                👷
              </div>
              <h5 style={{
                margin: '0 0 10px 0',
                fontSize: '1.2rem',
                fontWeight: '600',
                color: '#333'
              }}>
                {cargo}
              </h5>
              <div style={{
                background: '#f0fdf4',
                color: '#15803d',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}>
                Presente en el proyecto
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '60px',
          color: '#666'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>👷</div>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>
            No hay información de cargos
          </h3>
          <p style={{ margin: 0, color: '#666' }}>
            No se encontró información detallada de los cargos para este centro.
          </p>
        </div>
      )}
    </div>
  );
};

// Componente para la vista de compensados
const CompensadosView: React.FC<{
  centro: CentroPorMesCompleto;
  datosCompletos: any;
  onToggleModal: () => void;
  onToggleCompensados?: () => void;
}> = ({ centro, datosCompletos, onToggleModal, onToggleCompensados }) => {
  
  const manoObraCompensada = centro.manoObraCompensada || datosCompletos.manoObraCompensada || 0;
  const manoObraNormal = centro.manoObraTotal || datosCompletos.manoObraTotal;

  return (
    <div>
      <div style={{
        marginBottom: '20px',
        padding: '15px 20px',
        background: 'linear-gradient(135deg, #ec4899, #db2777)',
        color: 'white',
        borderRadius: '12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h4 style={{ margin: 0, fontSize: '1.2rem' }}>
            🕒 Mano de Obra Compensada
          </h4>
          <p style={{ margin: '5px 0 0 0', opacity: 0.9, fontSize: '0.9rem' }}>
            Horas compensadas calculadas al 50% del valor normal
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onToggleModal}
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.9rem'
            }}
          >
            📊 Ver Información
          </button>
          <button
            onClick={onToggleCompensados}
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.9rem'
            }}
          >
            👷 Ver Cargos
          </button>
        </div>
      </div>

      {manoObraCompensada > 0 ? (
        <div>
          {/* Estadísticas principales */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '15px',
            marginBottom: '20px'
          }}>
            <div style={{
              background: '#fdf2f8',
              padding: '20px',
              borderRadius: '12px',
              border: '2px solid #fbcfe8',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>💰</div>
              <h5 style={{ margin: '0 0 10px 0', color: '#db2777' }}>Total Compensado</h5>
              <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600', color: '#db2777' }}>
                {formatearMoneda(manoObraCompensada)}
              </p>
            </div>

            <div style={{
              background: '#f0fdf4',
              padding: '20px',
              borderRadius: '12px',
              border: '2px solid #bbf7d0',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📈</div>
              <h5 style={{ margin: '0 0 10px 0', color: '#15803d' }}>Porcentaje del Total</h5>
              <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600', color: '#15803d' }}>
                {((manoObraCompensada / (manoObraNormal + manoObraCompensada)) * 100).toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Información detallada */}
          <div style={{
            background: '#fafafa',
            padding: '20px',
            borderRadius: '12px',
            border: '2px solid #e5e5e5'
          }}>
            <h5 style={{ margin: '0 0 15px 0', color: '#333' }}>📋 Información de Compensados</h5>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px',
              fontSize: '0.9rem'
            }}>
              <div>
                <strong style={{ color: '#db2777' }}>Cálculo Aplicado:</strong><br />
                <span>50% del valor hora normal</span>
              </div>
              <div>
                <strong style={{ color: '#db2777' }}>Estado:</strong><br />
                <span>✅ Activo en el sistema</span>
              </div>
              <div>
                <strong style={{ color: '#db2777' }}>Tipo:</strong><br />
                <span>Horas extras compensadas</span>
              </div>
            </div>
          </div>

          {/* Nota importante */}
          <div style={{
            background: '#fffbeb',
            padding: '15px',
            borderRadius: '8px',
            border: '2px solid #fcd34d',
            marginTop: '20px'
          }}>
            <p style={{ margin: 0, color: '#92400e', fontSize: '0.9rem' }}>
              💡 <strong>Nota:</strong> Las horas compensadas representan tiempo tomado por trabajadores 
              como pago de horas extras acumuladas. Se calculan al 50% del coste normal.
            </p>
          </div>
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '60px',
          color: '#666'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🕒</div>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>
            No hay mano de obra compensada
          </h3>
          <p style={{ margin: 0, color: '#666' }}>
            Este centro no tiene registros de horas compensadas en el período seleccionado.
          </p>
        </div>
      )}
    </div>
  );
};

export default CentroModalUniversal;