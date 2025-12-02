/* eslint-disable @typescript-eslint/no-explicit-any */
// CentroModalUniversal.tsx - Versión Refactorizada
import React from 'react';
import CentroInfoView from './CentroInfoView';
import CentroCargosView from './CentrosCargosView';
import CentroCompensadosView from './CentroCompensadosView';
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

  // Determinar el subtítulo según el tipo de modal
  const getSubtitle = () => {
    switch (modalType) {
      case 'info':
        return 'Información Completa';
      case 'cargos':
        return 'Cargos de Trabajadores';
      case 'compensados':
        return 'Mano de Obra Compensada';
      default:
        return 'Información Completa';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '0',
        maxWidth: '900px',
        width: '100%',
        maxHeight: '85vh',
        overflowY: 'auto',
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
      }}>
        {/* Header del modal */}
        <div style={{
          position: 'sticky',
          top: 0,
          background: 'white',
          padding: '25px 30px',
          borderBottom: '2px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 1001,
          borderRadius: '12px 12px 0 0'
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{
              margin: '0 0 5px 0',
              fontSize: '1.4rem',
              fontWeight: '700',
              color: '#1e293b',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {centro.centroNombre}
            </h3>
            <p style={{
              margin: 0,
              fontSize: '0.9rem',
              color: '#64748b',
              fontWeight: '500'
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
              color: '#64748b',
              padding: '0',
              marginLeft: '20px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px',
              transition: 'all 0.2s ease',
              flexShrink: 0
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#f1f5f9';
              e.currentTarget.style.color = '#1e293b';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'none';
              e.currentTarget.style.color = '#64748b';
            }}
            title="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Contenido del modal */}
        <div style={{ padding: '30px' }}>
          {modalType === 'info' && (
            <CentroInfoView
              centro={centro}
              datosCompletos={datosCompletos}
              centroEncontrado={centroEncontrado}
              onToggleModal={onToggleModal}
              onToggleCompensados={onToggleCompensados}
            />
          )}

          {modalType === 'cargos' && (
            <CentroCargosView
              datosCompletos={datosCompletos}
              onToggleModal={onToggleModal}
              onToggleCompensados={onToggleCompensados}
            />
          )}

          {modalType === 'compensados' && (
            <CentroCompensadosView
              centro={centro}
              datosCompletos={datosCompletos}
              onToggleModal={onToggleModal}
              onToggleCompensados={onToggleCompensados}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CentroModalUniversal;