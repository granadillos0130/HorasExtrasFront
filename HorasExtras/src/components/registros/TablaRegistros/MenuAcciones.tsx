import React, { useState, useRef, useEffect } from "react";

interface MenuAccionesProps {
  onEditar: () => void;
  onEliminar: () => void;
}

export const MenuAcciones: React.FC<MenuAccionesProps> = ({ onEditar, onEliminar }) => {
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

  return (
    <div ref={menuRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setMenuAbierto(!menuAbierto)}
        style={{
          background: 'none',
          border: 'none',
          fontSize: '1.5rem',
          cursor: 'pointer',
          padding: '4px 8px',
          color: '#6b7280',
          borderRadius: '4px',
          transition: 'all 0.2s ease'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = '#f3f4f6';
          e.currentTarget.style.color = '#374151';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = 'none';
          e.currentTarget.style.color = '#6b7280';
        }}
      >
        ⋮
      </button>

      {menuAbierto && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '100%',
            marginTop: '4px',
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 1000,
            minWidth: '140px',
            overflow: 'hidden'
          }}
        >
          <button
            onClick={() => {
              onEditar();
              setMenuAbierto(false);
            }}
            style={{
              width: '100%',
              padding: '10px 16px',
              border: 'none',
              background: 'white',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '0.9rem',
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'background 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#f3f4f6';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'white';
            }}
          >
            <span>✏️</span>
            <span style={{ fontWeight: '500' }}>Editar</span>
          </button>

          <div style={{ height: '1px', background: '#e5e7eb' }} />

          <button
            onClick={() => {
              onEliminar();
              setMenuAbierto(false);
            }}
            style={{
              width: '100%',
              padding: '10px 16px',
              border: 'none',
              background: 'white',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '0.9rem',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'background 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#fef2f2';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'white';
            }}
          >
            <span>🗑️</span>
            <span style={{ fontWeight: '500' }}>Eliminar</span>
          </button>
        </div>
      )}
    </div>
  );
};