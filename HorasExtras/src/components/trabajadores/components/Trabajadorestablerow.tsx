// TrabajadoresTableRow.tsx - Fila individual con menú desplegable
import React, { useState, useRef, useEffect } from 'react';
import type { Trabajador } from '../../../types/trabajadores';

interface TrabajadoresTableRowProps {
  trabajador: Trabajador;
  onVerDetalle: (id: number) => void;
  onVerAusencias: (id: number) => void;
  onVerIntensidad: (id: number) => void;
  onEditar: (id: number) => void;
  onCambiarEstado: (id: number, estadoActual: string) => void;
  onEliminar: (id: number, nombre: string) => void;
}

const TrabajadoresTableRow: React.FC<TrabajadoresTableRowProps> = ({
  trabajador,
  onVerDetalle,
  onVerAusencias,
  onVerIntensidad,
  onEditar,
  onCambiarEstado,
  onEliminar
}) => {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickFuera = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuAbierto(false);
      }
    };

    if (menuAbierto) {
      document.addEventListener('mousedown', handleClickFuera);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickFuera);
    };
  }, [menuAbierto]);

  const handleAccion = (accion: () => void) => {
    accion();
    setMenuAbierto(false);
  };

  return (
    <tr
      style={{
        borderBottom: '1px solid #e2e8f0',
        transition: 'background 0.2s ease'
      }}
      onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
      onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
    >
      {/* ID */}
      <td style={{
        padding: '15px 20px',
        fontSize: '0.9rem',
        color: '#64748b',
        fontFamily: 'monospace',
        fontWeight: '600'
      }}>
        {trabajador.id}
      </td>

      {/* Nombre */}
      <td style={{
        padding: '15px 20px',
        fontSize: '0.9rem',
        color: '#1e293b',
        fontWeight: '600'
      }}>
        {trabajador.nombre}
      </td>

      {/* Cédula */}
      <td style={{
        padding: '15px 20px',
        fontSize: '0.9rem',
        color: '#334155',
        fontFamily: 'monospace'
      }}>
        {trabajador.cedula}
      </td>

      {/* Estado */}
      <td style={{
        padding: '15px 20px',
        fontSize: '0.9rem',
        textAlign: 'center'
      }}>
        <span style={{
          background: trabajador.estado === 'Vigente' ? '#dcfce7' : '#fee2e2',
          color: trabajador.estado === 'Vigente' ? '#15803d' : '#991b1b',
          padding: '4px 12px',
          borderRadius: '6px',
          fontSize: '0.85rem',
          fontWeight: '600',
          display: 'inline-block'
        }}>
          {trabajador.estado}
        </span>
      </td>

      {/* Acciones (menú desplegable) */}
      <td style={{
        padding: '15px 20px',
        fontSize: '0.9rem',
        textAlign: 'center',
        position: 'relative'
      }}>
        <div ref={menuRef} style={{ position: 'relative', display: 'inline-block' }}>
          <button
            onClick={() => setMenuAbierto(!menuAbierto)}
            style={{
              background: menuAbierto ? '#f1f5f9' : '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: '1.2rem',
              fontWeight: '600',
              color: '#475569',
              transition: 'all 0.2s ease',
              minWidth: '40px'
            }}
            onMouseOver={(e) => {
              if (!menuAbierto) e.currentTarget.style.background = '#f1f5f9';
            }}
            onMouseOut={(e) => {
              if (!menuAbierto) e.currentTarget.style.background = '#f8fafc';
            }}
          >
            ⋮
          </button>

          {/* Menú desplegable */}
          {menuAbierto && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '5px',
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              zIndex: 1000,
              minWidth: '200px',
              overflow: 'hidden'
            }}>
              {/* Ver Detalles */}
              <button
                onClick={() => handleAccion(() => onVerDetalle(trabajador.id))}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: 'none',
                  background: 'transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  color: '#334155',
                  fontWeight: '500',
                  transition: 'background 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ fontSize: '1rem' }}>👁️</span>
                Ver Detalles
              </button>

              {/* Ver Ausencias */}
              <button
                onClick={() => handleAccion(() => onVerAusencias(trabajador.id))}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: 'none',
                  background: 'transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  color: '#334155',
                  fontWeight: '500',
                  transition: 'background 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ fontSize: '1rem' }}>📊</span>
                Ver Ausencias
              </button>

              {/* Ver Intensidad */}
              <button
                onClick={() => handleAccion(() => onVerIntensidad(trabajador.id))}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: 'none',
                  background: 'transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  color: '#334155',
                  fontWeight: '500',
                  transition: 'background 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ fontSize: '1rem' }}>📈</span>
                Ver Intensidad
              </button>

              {/* Divisor */}
              <div style={{
                height: '1px',
                background: '#e2e8f0',
                margin: '4px 0'
              }} />

              {/* Editar */}
              <button
                onClick={() => handleAccion(() => onEditar(trabajador.id))}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: 'none',
                  background: 'transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  color: '#334155',
                  fontWeight: '500',
                  transition: 'background 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ fontSize: '1rem' }}>✏️</span>
                Editar
              </button>

              {/* Cambiar Estado */}
              <button
                onClick={() => handleAccion(() => onCambiarEstado(trabajador.id, trabajador.estado))}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: 'none',
                  background: 'transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  color: '#334155',
                  fontWeight: '500',
                  transition: 'background 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ fontSize: '1rem' }}>
                  {trabajador.estado === 'Vigente' ? '🔴' : '🟢'}
                </span>
                {trabajador.estado === 'Vigente' ? 'Desactivar' : 'Activar'}
              </button>

              {/* Eliminar */}
              <button
                onClick={() => handleAccion(() => onEliminar(trabajador.id, trabajador.nombre))}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: 'none',
                  background: 'transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  color: '#dc2626',
                  fontWeight: '500',
                  transition: 'background 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#fee2e2'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ fontSize: '1rem' }}>🗑️</span>
                Eliminar
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

export default TrabajadoresTableRow;