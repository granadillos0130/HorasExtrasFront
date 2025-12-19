// components/registros/TablaRegistros/FiltrosRegistros.tsx
import React from "react";

interface FiltrosRegistrosProps {
  añoSeleccionado: number;
  mesSeleccionado: number | null;
  diaSeleccionado: number | null;
  trabajadorSeleccionado: number | null;
  trabajadores: Array<{ id: number; nombreCompleto: string }>;
  onChangeAño: (año: number) => void;
  onChangeMes: (mes: number | null) => void;
  onChangeDia: (dia: number | null) => void;
  onChangeTrabajador: (trabajadorId: number | null) => void;
  onNuevoRegistro: () => void;
  onRegistroLote: () => void;
  onExportarExcel: () => void;
  exportandoExcel: boolean;
}

export const FiltrosRegistros: React.FC<FiltrosRegistrosProps> = ({
  añoSeleccionado,
  mesSeleccionado,
  diaSeleccionado,
  trabajadorSeleccionado,
  trabajadores,
  onChangeAño,
  onChangeMes,
  onChangeDia,
  onChangeTrabajador,
  onNuevoRegistro,
  onRegistroLote,
  onExportarExcel,
  exportandoExcel
}) => {
  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const obtenerDiasDelMes = () => {
    if (mesSeleccionado === null) return [];
    const diasEnMes = new Date(añoSeleccionado, mesSeleccionado, 0).getDate();
    return Array.from({ length: diasEnMes }, (_, i) => i + 1);
  };

  const estiloSelect = {
    padding: '10px 14px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '0.95rem',
    background: 'white',
    cursor: 'pointer',
    color: '#374151',
    fontWeight: '500' as const,
    transition: 'all 0.2s ease',
    outline: 'none'
  };

  const estiloBoton = (color: string, disabled = false) => ({
    background: disabled 
      ? 'linear-gradient(135deg, #94a3b8, #64748b)' 
      : `linear-gradient(135deg, ${color})`,
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: '600' as const,
    fontSize: '0.95rem',
    opacity: disabled ? 0.7 : 1,
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  });

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '24px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    }}>
      {/* Título */}
      <h2 style={{
        margin: '0 0 20px 0',
        fontSize: '1.5rem',
        fontWeight: '700',
        color: '#1f2937'
      }}>
        📊 Gestión de Registros
      </h2>

      {/* Filtros */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '20px'
      }}>
        {/* Año */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: '6px',
            fontSize: '0.85rem',
            fontWeight: '600',
            color: '#6b7280',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Año
          </label>
          <select
            value={añoSeleccionado}
            onChange={(e) => onChangeAño(Number(e.target.value))}
            style={estiloSelect}
          >
            {[2023, 2024, 2025, 2026, 2027, 2028].map(año => (
              <option key={año} value={año}>{año}</option>
            ))}
          </select>
        </div>

        {/* Mes */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: '6px',
            fontSize: '0.85rem',
            fontWeight: '600',
            color: '#6b7280',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Mes
          </label>
          <select
            value={mesSeleccionado || ''}
            onChange={(e) => onChangeMes(e.target.value ? Number(e.target.value) : null)}
            style={estiloSelect}
          >
            <option value="">Todos los meses</option>
            {meses.map((mes, index) => (
              <option key={index} value={index + 1}>{mes}</option>
            ))}
          </select>
        </div>

        {/* Día */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: '6px',
            fontSize: '0.85rem',
            fontWeight: '600',
            color: '#6b7280',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Día
          </label>
          <select
            value={diaSeleccionado || ''}
            onChange={(e) => onChangeDia(e.target.value ? Number(e.target.value) : null)}
            style={estiloSelect}
            disabled={mesSeleccionado === null}
          >
            <option value="">Todos los días</option>
            {obtenerDiasDelMes().map(dia => (
              <option key={dia} value={dia}>{dia}</option>
            ))}
          </select>
        </div>

        {/* Trabajador */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: '6px',
            fontSize: '0.85rem',
            fontWeight: '600',
            color: '#6b7280',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Trabajador
          </label>
          <select
            value={trabajadorSeleccionado || ''}
            onChange={(e) => onChangeTrabajador(e.target.value ? Number(e.target.value) : null)}
            style={estiloSelect}
          >
            <option value="">Todos los trabajadores</option>
            {trabajadores.map(trabajador => (
              <option key={trabajador.id} value={trabajador.id}>
                {trabajador.nombreCompleto}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Botones de Acción */}
      <div style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        paddingTop: '16px',
        borderTop: '1px solid #e5e7eb'
      }}>
        <button
          onClick={onNuevoRegistro}
          style={estiloBoton('#22c55e, #15803d')}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.3)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <span>➕</span>
          <span>Nuevo Registro</span>
        </button>

        <button
          onClick={onRegistroLote}
          style={estiloBoton('#3b82f6, #1d4ed8')}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <span>📊</span>
          <span>Registro Lote</span>
        </button>

        <button
          onClick={onExportarExcel}
          disabled={exportandoExcel}
          style={estiloBoton('#8b5cf6, #7c3aed', exportandoExcel)}
          onMouseOver={(e) => {
            if (!exportandoExcel) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
            }
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <span>{exportandoExcel ? '⏳' : '📤'}</span>
          <span>{exportandoExcel ? 'Exportando...' : 'Exportar Excel'}</span>
        </button>
      </div>
    </div>
  );
};