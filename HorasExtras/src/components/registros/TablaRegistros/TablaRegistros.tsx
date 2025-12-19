// components/registros/TablaRegistros/TablaRegistros.tsx
import React from "react";
import { RegistroTableRow } from "./RegistroTableRow";
import type { RegistroConTipo } from "../../../types/registros";

interface TablaRegistrosProps {
  registros: RegistroConTipo[];
  loading: boolean;
  onEditarRegistro: (id: number) => void;
  onEliminarRegistro: (id: number) => void;
}

export const TablaRegistros: React.FC<TablaRegistrosProps> = ({
  registros,
  loading,
  onEditarRegistro,
  onEliminarRegistro
}) => {
  const estiloEncabezado = {
    padding: '16px 12px',
    textAlign: 'left' as const,
    fontSize: '0.8rem',
    fontWeight: '700' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    color: '#6b7280',
    borderBottom: '2px solid #e5e7eb',
    background: '#f9fafb'
  };

  if (loading) {
    return (
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '60px 20px',
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <div style={{
          fontSize: '3rem',
          marginBottom: '16px',
          animation: 'spin 2s linear infinite'
        }}>
          ⏳
        </div>
        <p style={{
          fontSize: '1.1rem',
          color: '#6b7280',
          fontWeight: '500'
        }}>
          Cargando registros...
        </p>
        <style>
          {`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  if (registros.length === 0) {
    return (
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '60px 20px',
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <div style={{
          fontSize: '4rem',
          marginBottom: '16px'
        }}>
          📋
        </div>
        <h3 style={{
          margin: '0 0 8px 0',
          fontSize: '1.3rem',
          fontWeight: '600',
          color: '#1f2937'
        }}>
          No hay registros
        </h3>
        <p style={{
          margin: 0,
          fontSize: '1rem',
          color: '#6b7280'
        }}>
          No se encontraron registros para los filtros seleccionados
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      overflow: 'hidden'
    }}>
      {/* Contador de registros */}
      <div style={{
        padding: '16px 20px',
        background: '#f9fafb',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{
          fontSize: '0.95rem',
          fontWeight: '600',
          color: '#374151'
        }}>
          📊 {registros.length} registro{registros.length !== 1 ? 's' : ''} encontrado{registros.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Tabla con scroll horizontal en pantallas pequeñas */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          minWidth: '1200px'
        }}>
          <thead>
            <tr>
              <th style={estiloEncabezado}>
                Trabajador
              </th>
              <th style={estiloEncabezado}>
                Fecha
              </th>
              <th style={estiloEncabezado}>
                Tipo
              </th>
              <th style={estiloEncabezado}>
                Centro/Ausencia
              </th>
              <th style={{
                ...estiloEncabezado,
                textAlign: 'center'
              }}>
                Ingreso
              </th>
              <th style={{
                ...estiloEncabezado,
                textAlign: 'center'
              }}>
                Salida
              </th>
              <th style={{
                ...estiloEncabezado,
                textAlign: 'center'
              }}>
                Normales
              </th>
              <th style={{
                ...estiloEncabezado,
                textAlign: 'center'
              }}>
                Ext. Diurnas
              </th>
              <th style={{
                ...estiloEncabezado,
                textAlign: 'center'
              }}>
                Ext. Nocturnas
              </th>
              <th style={{
                ...estiloEncabezado,
                textAlign: 'center'
              }}>
                Desplazamiento
              </th>
              <th style={{
                ...estiloEncabezado,
                textAlign: 'center',
                background: '#f3f4f6'
              }}>
                Total
              </th>
              <th style={{
                ...estiloEncabezado,
                textAlign: 'center',
                width: '80px'
              }}>
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {registros.map((registro) => (
              <RegistroTableRow
                key={`${registro.tipoRegistro}-${registro.id}`}
                registro={registro}
                onEditar={() => onEditarRegistro(registro.id)}
                onEliminar={() => onEliminarRegistro(registro.id)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};