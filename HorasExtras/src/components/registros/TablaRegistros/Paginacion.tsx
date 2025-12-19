// components/registros/TablaRegistros/Paginacion.tsx
import React from "react";

interface PaginacionProps {
  paginaActual: number;
  totalPaginas: number;
  registrosPorPagina: number;
  totalRegistros: number;
  onCambioPagina: (pagina: number) => void;
}

export const Paginacion: React.FC<PaginacionProps> = ({
  paginaActual,
  totalPaginas,
  registrosPorPagina,
  totalRegistros,
  onCambioPagina
}) => {
  if (totalPaginas <= 1) return null;

  const registroInicio = (paginaActual - 1) * registrosPorPagina + 1;
  const registroFin = Math.min(paginaActual * registrosPorPagina, totalRegistros);

  // Generar números de página a mostrar
  const generarNumerosPagina = () => {
    const paginas: (number | string)[] = [];
    const maxPaginasVisibles = 5;

    if (totalPaginas <= maxPaginasVisibles) {
      // Mostrar todas las páginas si son pocas
      for (let i = 1; i <= totalPaginas; i++) {
        paginas.push(i);
      }
    } else {
      // Lógica para mostrar páginas con "..."
      if (paginaActual <= 3) {
        // Inicio: 1 2 3 4 ... última
        for (let i = 1; i <= 4; i++) {
          paginas.push(i);
        }
        paginas.push('...');
        paginas.push(totalPaginas);
      } else if (paginaActual >= totalPaginas - 2) {
        // Final: 1 ... antepenúltima penúltima última
        paginas.push(1);
        paginas.push('...');
        for (let i = totalPaginas - 3; i <= totalPaginas; i++) {
          paginas.push(i);
        }
      } else {
        // Medio: 1 ... actual-1 actual actual+1 ... última
        paginas.push(1);
        paginas.push('...');
        paginas.push(paginaActual - 1);
        paginas.push(paginaActual);
        paginas.push(paginaActual + 1);
        paginas.push('...');
        paginas.push(totalPaginas);
      }
    }

    return paginas;
  };

  const estiloBoton = (activo = false, deshabilitado = false) => ({
    padding: '8px 14px',
    border: activo ? '2px solid #3b82f6' : '1px solid #e5e7eb',
    borderRadius: '6px',
    background: activo ? '#3b82f6' : 'white',
    color: activo ? 'white' : deshabilitado ? '#d1d5db' : '#374151',
    cursor: deshabilitado ? 'not-allowed' : 'pointer',
    fontSize: '0.9rem',
    fontWeight: activo ? '600' : '500',
    transition: 'all 0.2s ease',
    minWidth: '40px',
    textAlign: 'center' as const,
    opacity: deshabilitado ? 0.5 : 1
  });

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      marginTop: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Información de registros */}
        <div style={{
          fontSize: '0.9rem',
          color: '#6b7280',
          fontWeight: '500'
        }}>
          Mostrando <span style={{ fontWeight: '700', color: '#374151' }}>{registroInicio}-{registroFin}</span> de <span style={{ fontWeight: '700', color: '#374151' }}>{totalRegistros}</span> registros
        </div>

        {/* Controles de paginación */}
        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center'
        }}>
          {/* Botón Anterior */}
          <button
            onClick={() => onCambioPagina(paginaActual - 1)}
            disabled={paginaActual === 1}
            style={estiloBoton(false, paginaActual === 1)}
            onMouseOver={(e) => {
              if (paginaActual !== 1) {
                e.currentTarget.style.background = '#f3f4f6';
                e.currentTarget.style.borderColor = '#d1d5db';
              }
            }}
            onMouseOut={(e) => {
              if (paginaActual !== 1) {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.borderColor = '#e5e7eb';
              }
            }}
          >
            ◄ Anterior
          </button>

          {/* Números de página */}
          {generarNumerosPagina().map((pagina, index) => {
            if (pagina === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  style={{
                    padding: '8px 4px',
                    color: '#9ca3af',
                    fontSize: '0.9rem'
                  }}
                >
                  ...
                </span>
              );
            }

            const numeroPagina = pagina as number;
            const esActiva = numeroPagina === paginaActual;

            return (
              <button
                key={numeroPagina}
                onClick={() => onCambioPagina(numeroPagina)}
                style={estiloBoton(esActiva)}
                onMouseOver={(e) => {
                  if (!esActiva) {
                    e.currentTarget.style.background = '#f3f4f6';
                    e.currentTarget.style.borderColor = '#d1d5db';
                  }
                }}
                onMouseOut={(e) => {
                  if (!esActiva) {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }
                }}
              >
                {numeroPagina}
              </button>
            );
          })}

          {/* Botón Siguiente */}
          <button
            onClick={() => onCambioPagina(paginaActual + 1)}
            disabled={paginaActual === totalPaginas}
            style={estiloBoton(false, paginaActual === totalPaginas)}
            onMouseOver={(e) => {
              if (paginaActual !== totalPaginas) {
                e.currentTarget.style.background = '#f3f4f6';
                e.currentTarget.style.borderColor = '#d1d5db';
              }
            }}
            onMouseOut={(e) => {
              if (paginaActual !== totalPaginas) {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.borderColor = '#e5e7eb';
              }
            }}
          >
            Siguiente ►
          </button>
        </div>
      </div>
    </div>
  );
};