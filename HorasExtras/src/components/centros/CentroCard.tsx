interface CentroCardProps {
  centro: {
    centroId: string;
    centroNombre: string;
    fechaInicio: string;
    fechaFinal?: string;
    trabajadores?: { totalHoras: number }[];
    manoObraTotal?: number;
    // Campos opcionales para diferentes tipos de vista
    estado?: string;
    clienteNombre?: string;
  };
  onVerInfo: () => void;
  onVerCargos: () => void;
  onVerEjecucion: () => void;
  onEditar?: () => void;
  onCambiarEstado?: () => void;
  // Props opcionales para personalización
  showEditButton?: boolean;
  showStateButton?: boolean;
  showClientInfo?: boolean;
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

const CentroCard: React.FC<CentroCardProps> = ({
  centro,
  onVerInfo,
  onVerCargos,
  onVerEjecucion,
  onEditar,
  onCambiarEstado,
  showEditButton = true,
  showStateButton = false,
  showClientInfo = false
}) => {
  const totalHoras = centro.trabajadores?.reduce((sum, t) => sum + t.totalHoras, 0) || 0;
  const totalTrabajadores = centro.trabajadores?.length || 0;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #f8fafb, #ffffff)',
      padding: '25px',
      borderRadius: '15px',
      border: '2px solid #e1e8ed',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      transition: 'all 0.3s ease'
    }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
      }}
    >
      {/* Header del centro */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        marginBottom: '20px'
      }}>
        <div style={{
          background: centro.estado === 'Abierto' ? 
            'linear-gradient(135deg, #22c55e, #15803d)' :
            centro.estado === 'Cerrado' ?
            'linear-gradient(135deg, #ef4444, #dc2626)' :
            'linear-gradient(135deg, #3b82f6, #1e40af)',
          color: 'white',
          width: '60px',
          height: '60px',
          borderRadius: '15px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.8rem'
        }}>
          {centro.estado === 'Abierto' ? '🟢' : centro.estado === 'Cerrado' ? '🔴' : '🏢'}
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{
            margin: '0 0 5px 0',
            fontSize: '1.3rem',
            fontWeight: '700',
            color: '#333'
          }}>
            {centro.centroNombre}
          </h3>
          <p style={{
            margin: '0 0 5px 0',
            color: '#666',
            fontSize: '0.9rem'
          }}>
            ID: {centro.centroId}
          </p>
          {showClientInfo && centro.clienteNombre && (
            <p style={{
              margin: 0,
              color: '#059669',
              fontSize: '0.85rem',
              fontWeight: '600'
            }}>
              Cliente: {centro.clienteNombre}
            </p>
          )}
          {centro.estado && (
            <span style={{
              background: centro.estado === 'Abierto' ? '#dcfce7' : '#fee2e2',
              color: centro.estado === 'Abierto' ? '#15803d' : '#dc2626',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: '600'
            }}>
              {centro.estado}
            </span>
          )}
        </div>
      </div>

      {/* Información básica */}
      <div style={{
        background: '#f0f9ff',
        padding: '15px',
        borderRadius: '10px',
        marginBottom: '20px',
        border: '1px solid #bfdbfe'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
          fontSize: '0.9rem'
        }}>
          <div>
            <strong style={{ color: '#1d4ed8' }}>📅 Inicio:</strong><br />
            {formatearFecha(centro.fechaInicio)}
          </div>
          <div>
            <strong style={{ color: '#1d4ed8' }}>📅 Final:</strong><br />
            {centro.fechaFinal ? formatearFecha(centro.fechaFinal) : 'Vigente'}
          </div>
          <div>
            <strong style={{ color: '#1d4ed8' }}>👥 Trabajadores:</strong><br />
            {totalTrabajadores}
          </div>
          <div>
            <strong style={{ color: '#1d4ed8' }}>⏰ Total Horas:</strong><br />
            {formatearHoras(totalHoras)}
          </div>
        </div>

        {/* Mano de obra total */}
        {centro.manoObraTotal !== undefined && (
          <div style={{
            marginTop: '15px',
            paddingTop: '15px',
            borderTop: '1px solid #bfdbfe',
            textAlign: 'center'
          }}>
            <strong style={{ color: '#1d4ed8' }}>💰 Mano de Obra Total:</strong><br />
            <span style={{
              fontSize: '1.1rem',
              fontWeight: '600',
              color: '#059669',
              background: '#f0fdf4',
              padding: '4px 8px',
              borderRadius: '6px',
              display: 'inline-block',
              marginTop: '5px'
            }}>
              {formatearMoneda(centro.manoObraTotal || 0)}
            </span>
          </div>
        )}
      </div>

      {/* Botones de acción */}
      <div style={{
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={onVerInfo}
          style={{
            flex: 1,
            minWidth: '120px',
            background: 'linear-gradient(135deg, #22c55e, #15803d)',
            color: 'white',
            border: 'none',
            padding: '10px 12px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.85rem',
            transition: 'all 0.3s ease'
          }}
        >
          📊 Ver Info
        </button>

        <button
          onClick={onVerCargos}
          style={{
            flex: 1,
            minWidth: '120px',
            background: totalTrabajadores > 0 ?
              'linear-gradient(135deg, #f59e0b, #d97706)' :
              'linear-gradient(135deg, #9ca3af, #6b7280)',
            color: 'white',
            border: 'none',
            padding: '10px 12px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.85rem',
            transition: 'all 0.3s ease'
          }}
        >
          👷 Ver Cargos
        </button>

        <button
          onClick={onVerEjecucion}
          style={{
            flex: 1,
            minWidth: '140px',
            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            color: 'white',
            border: 'none',
            padding: '10px 12px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.85rem',
            transition: 'all 0.3s ease'
          }}
        >
          📈 Ejecución
        </button>

        {showEditButton && onEditar && (
          <button
            onClick={onEditar}
            style={{
              flex: 1,
              minWidth: '120px',
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              color: 'white',
              border: 'none',
              padding: '10px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.85rem',
              transition: 'all 0.3s ease'
            }}
          >
            ✏️ Editar
          </button>
        )}

        {showStateButton && onCambiarEstado && (
          <button
            onClick={onCambiarEstado}
            style={{
              flex: 1,
              minWidth: '140px',
              background: centro.estado === 'Abierto' ?
                'linear-gradient(135deg, #ef4444, #dc2626)' :
                'linear-gradient(135deg, #22c55e, #15803d)',
              color: 'white',
              border: 'none',
              padding: '10px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.85rem',
              transition: 'all 0.3s ease'
            }}
          >
            {centro.estado === 'Abierto' ? '🔴 Cerrar' : '🟢 Abrir'}
          </button>
        )}
      </div>
    </div>
  );
};

export { CentroCard };