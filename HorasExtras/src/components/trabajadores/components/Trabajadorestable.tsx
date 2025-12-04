// TrabajadoresTable.tsx - Tabla principal de trabajadores
import React from 'react';
import type { Trabajador } from '../../../types/trabajadores';
import TrabajadoresTableRow from '../components/Trabajadorestablerow';

interface TrabajadoresTableProps {
  trabajadores: Trabajador[];
  loading: boolean;
  onVerDetalle: (id: number) => void;
  onVerAusencias: (id: number) => void;
  onVerIntensidad: (id: number) => void;
  onEditar: (id: number) => void;
  onCambiarEstado: (id: number, estadoActual: string) => void;
  onEliminar: (id: number, nombre: string) => void;
}

const TrabajadoresTable: React.FC<TrabajadoresTableProps> = ({
  trabajadores,
  loading,
  onVerDetalle,
  onVerAusencias,
  onVerIntensidad,
  onEditar,
  onCambiarEstado,
  onEliminar
}) => {
  if (loading) {
    return (
      <div style={{
        background: 'white',
        borderRadius: '8px',
        padding: '60px',
        textAlign: 'center',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{
          fontSize: '1.1rem',
          color: '#64748b',
          fontWeight: '500'
        }}>
          Cargando trabajadores...
        </div>
      </div>
    );
  }

  if (trabajadores.length === 0) {
    return (
      <div style={{
        background: 'white',
        borderRadius: '8px',
        padding: '60px',
        textAlign: 'center',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          margin: '0 auto 20px',
          background: '#f1f5f9',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: '#cbd5e1',
            borderRadius: '8px'
          }} />
        </div>
        <h3 style={{
          fontSize: '1.2rem',
          marginBottom: '10px',
          color: '#475569',
          fontWeight: '600'
        }}>
          No se encontraron trabajadores
        </h3>
        <p style={{
          fontSize: '0.95rem',
          margin: 0,
          color: '#64748b'
        }}>
          Intenta ajustar los filtros o agrega un nuevo trabajador.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e2e8f0',
      overflow: 'hidden'
    }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.9rem'
        }}>
          <thead>
            <tr style={{
              background: '#f8fafc',
              borderBottom: '2px solid #e2e8f0'
            }}>
              <th style={headerCellStyle}>ID</th>
              <th style={{ ...headerCellStyle, minWidth: '200px' }}>NOMBRE</th>
              <th style={headerCellStyle}>CÉDULA</th>
              <th style={headerCellStyle}>ESTADO</th>
              <th style={{ ...headerCellStyle, width: '100px' }}>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {trabajadores.map((trabajador) => (
              <TrabajadoresTableRow
                key={trabajador.id}
                trabajador={trabajador}
                onVerDetalle={onVerDetalle}
                onVerAusencias={onVerAusencias}
                onVerIntensidad={onVerIntensidad}
                onEditar={onEditar}
                onCambiarEstado={onCambiarEstado}
                onEliminar={onEliminar}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Estilos reutilizables
const headerCellStyle: React.CSSProperties = {
  padding: '15px 20px',
  textAlign: 'left',
  fontSize: '0.8rem',
  fontWeight: '700',
  color: '#475569',
  letterSpacing: '0.05em',
  textTransform: 'uppercase'
};

export default TrabajadoresTable;