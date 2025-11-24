import React from "react";
import { RegistroCard } from "./RegistroCard";
import { EstadisticasDia } from "./EstadisticasDia";
import { FiltrosTipo } from "./FiltrosTipo";
import { fechaUtils } from "../../../utils/registros/fechaUtils";
import type { RegistroConTipo, EstadisticasDia as EstadisticasDiaType, FiltroTipoRegistro } from "../../../types/registros";

interface ModalDiaProps {
  diaSeleccionado: string;
  registrosDelDia: RegistroConTipo[];
  loading: boolean;
  estadisticasDia: EstadisticasDiaType | null;
  trabajadoresConRegistro: number;
  totalTrabajadores: number;
  porcentaje: number;
  filtroTipo: FiltroTipoRegistro;
  mostrarEstadisticas: boolean;
  sincronizandoHuellero: boolean;
  onClose: () => void;
  onNavigateToForm: (tipo: 'individual' | 'lote') => void;
  onNavigateToEditLote: () => void;
  onSincronizarHuellero: () => void;
  onSetFiltroTipo: (filtro: FiltroTipoRegistro) => void;
  onSetMostrarEstadisticas: (mostrar: boolean) => void;
  onEditRegistro: (id: number) => void;
  onDeleteRegistro: (id: number) => void;
}

export const ModalDia: React.FC<ModalDiaProps> = ({
  diaSeleccionado,
  registrosDelDia,
  loading,
  estadisticasDia,
  trabajadoresConRegistro,
  totalTrabajadores,
  porcentaje,
  filtroTipo,
  mostrarEstadisticas,
  sincronizandoHuellero,
  onClose,
  onNavigateToForm,
  onNavigateToEditLote,
  onSincronizarHuellero,
  onSetFiltroTipo,
  onSetMostrarEstadisticas,
  onEditRegistro,
  onDeleteRegistro
}) => {
  const filtrarRegistrosPorTipo = (registros: RegistroConTipo[]): RegistroConTipo[] => {
    if (filtroTipo === 'TODOS') return registros;
    return registros.filter(r => r.tipoRegistro === filtroTipo);
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
              📅 {fechaUtils.formatearFecha(diaSeleccionado)}
            </h3>
            <p style={{
              margin: 0,
              fontSize: '0.9rem',
              color: '#666'
            }}>
              👥 {trabajadoresConRegistro} de {totalTrabajadores} trabajadores ({porcentaje.toFixed(1)}%)
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

        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            fontSize: '1.2rem',
            color: '#667eea'
          }}>
            🔄 Consultando registros del día...
          </div>
        ) : registrosDelDia.length > 0 ? (
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '25px',
              padding: '15px 20px',
              background: 'linear-gradient(135deg, #43e97b, #38f9d7)',
              color: 'white',
              borderRadius: '12px'
            }}>
              <h4 style={{ margin: 0, fontSize: '1.2rem' }}>
                ✅ {registrosDelDia.length} Registro{registrosDelDia.length !== 1 ? 's' : ''} Encontrado{registrosDelDia.length !== 1 ? 's' : ''}
              </h4>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={onSincronizarHuellero}
                  disabled={sincronizandoHuellero}
                  style={{
                    background: sincronizandoHuellero ? 'rgba(156, 163, 175, 0.3)' : 'rgba(139, 92, 246, 0.3)',
                    color: 'white',
                    border: '2px solid rgba(255,255,255,0.5)',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    cursor: sincronizandoHuellero ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    opacity: sincronizandoHuellero ? 0.6 : 1
                  }}
                >
                  {sincronizandoHuellero ? '⏳ Sincronizando...' : '👆 Huellero'}
                </button>
                <button
                  onClick={() => onNavigateToForm('individual')}
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
                  ➕ Nuevo
                </button>
                <button
                  onClick={() => onNavigateToForm('lote')}
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
                  📊 Lote
                </button>
                <button
                  onClick={onNavigateToEditLote}
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
                  ✏️ Editar Lote
                </button>
              </div>
            </div>

            {estadisticasDia && (
              <EstadisticasDia 
                estadisticas={estadisticasDia}
                mostrarEstadisticas={mostrarEstadisticas}
                onToggle={() => onSetMostrarEstadisticas(!mostrarEstadisticas)}
              />
            )}
            
            <FiltrosTipo
              filtroTipo={filtroTipo}
              onSetFiltro={onSetFiltroTipo}
              totalRegistros={registrosDelDia.length}
              registrosFiltrados={filtrarRegistrosPorTipo(registrosDelDia).length}
            />
            
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {filtrarRegistrosPorTipo(registrosDelDia).map((registro) => (
                <RegistroCard
                  key={`${registro.tipoRegistro}-${registro.id}`}
                  registro={registro}
                  onEdit={onEditRegistro}
                  onDelete={onDeleteRegistro}
                  compact={false}
                />
              ))}
            </div>
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#666'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📝</div>
            <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>
              No hay registros para este día
            </h4>
            <p style={{ marginBottom: '25px', color: '#666' }}>
              Ningún trabajador tiene registros para esta fecha
            </p>
            
            <div style={{
              display: 'flex',
              gap: '15px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={onSincronizarHuellero}
                disabled={sincronizandoHuellero}
                style={{
                  background: sincronizandoHuellero 
                    ? 'linear-gradient(135deg, #94a3b8, #64748b)' 
                    : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                  color: 'white',
                  border: 'none',
                  padding: '15px 25px',
                  borderRadius: '10px',
                  cursor: sincronizandoHuellero ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '1rem',
                  opacity: sincronizandoHuellero ? 0.7 : 1
                }}
              >
                {sincronizandoHuellero ? '⏳ Sincronizando...' : '👆 Desde Huellero'}
              </button>

              <button
                onClick={() => onNavigateToForm('individual')}
                style={{
                  background: 'linear-gradient(135deg, #22c55e, #15803d)',
                  color: 'white',
                  border: 'none',
                  padding: '15px 25px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '1rem'
                }}
              >
                ➕ Crear Registro
              </button>
              
              <button
                onClick={() => onNavigateToForm('lote')}
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  color: 'white',
                  border: 'none',
                  padding: '15px 25px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '1rem'
                }}
              >
                📊 Registros en Lote
              </button>
              
              <button
                onClick={onNavigateToEditLote}
                style={{
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: 'white',
                  border: 'none',
                  padding: '15px 25px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '1rem'
                }}
              >
                ✏️ Editar Registros
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};