import React from "react";
import { DiaCalendario } from "./DiaCalendario";
import { LeyendaCalendario } from "./LeyendaCalendario";
import { fechaUtils } from "../../../utils/registros/fechaUtils";

interface EstadisticaDia {
  fecha: string;
  totalTrabajadores: number;
  trabajadoresConRegistro: number;
  porcentaje: number;
}

interface CalendarioMensualProps {
  año: number;
  mes: number;
  estadisticasMes: Map<string, EstadisticaDia>;
  cargandoEstadisticas: boolean;
  trabajadoresActivos: number;
  exportandoExcel: boolean;
  creandoFestivos: boolean;
  onSeleccionarDia: (dia: number) => void;
  onExportarExcel: () => void;
  onCrearFestivos: () => void;
  onEditarMes: () => void;
  onVolverMeses: () => void;
}

export const CalendarioMensual: React.FC<CalendarioMensualProps> = ({
  año,
  mes,
  estadisticasMes,
  cargandoEstadisticas,
  trabajadoresActivos,
  exportandoExcel,
  creandoFestivos,
  onSeleccionarDia,
  onExportarExcel,
  onCrearFestivos,
  onEditarMes,
  onVolverMeses
}) => {
  const obtenerColorDia = (dia: number) => {
    const fechaString = `${año}-${mes.toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;
    const estadistica = estadisticasMes.get(fechaString);

    if (!estadistica) {
      return {
        background: 'linear-gradient(135deg, #f8fafb, #ffffff)',
        color: '#333',
        border: '#e1e8ed'
      };
    }

    const { porcentaje } = estadistica;

    if (porcentaje === 0) {
      return {
        background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
        color: '#dc2626',
        border: '#fca5a5'
      };
    } else if (porcentaje < 100) {
      return {
        background: 'linear-gradient(135deg, #fed7aa, #fdba74)',
        color: '#ea580c',
        border: '#fb923c'
      };
    } else {
      return {
        background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
        color: '#16a34a',
        border: '#86efac'
      };
    }
  };

  const obtenerTooltipDia = (dia: number): string => {
    const fechaString = `${año}-${mes.toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;
    const estadistica = estadisticasMes.get(fechaString);

    if (!estadistica) return '';

    const { totalTrabajadores, trabajadoresConRegistro, porcentaje } = estadistica;
    return `${trabajadoresConRegistro}/${totalTrabajadores} trabajadores (${porcentaje.toFixed(1)}%)`;
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '20px',
      padding: '30px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '30px',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <h2 style={{
          margin: 0,
          color: '#333',
          fontSize: '1.8rem',
          fontWeight: '600'
        }}>
          📅 {fechaUtils.meses[mes - 1]} {año}
          {cargandoEstadisticas && (
            <span style={{ 
              fontSize: '1rem', 
              color: '#666', 
              marginLeft: '10px' 
            }}>
              🔄 Cargando...
            </span>
          )}
        </h2>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <button
            onClick={onExportarExcel}
            disabled={exportandoExcel}
            style={{
              background: exportandoExcel 
                ? 'linear-gradient(135deg, #94a3b8, #64748b)' 
                : 'linear-gradient(135deg, #22c55e, #15803d)',
              color: 'white',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '10px',
              cursor: exportandoExcel ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '0.95rem',
              opacity: exportandoExcel ? 0.7 : 1,
              transition: 'all 0.3s ease'
            }}
          >
            {exportandoExcel ? '⏳ Exportando...' : '📤 Exportar Excel'}
          </button>
          
          <button
            onClick={onCrearFestivos}
            disabled={creandoFestivos}
            style={{
              background: creandoFestivos 
                ? 'linear-gradient(135deg, #94a3b8, #64748b)' 
                : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              color: 'white',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '10px',
              cursor: creandoFestivos ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '0.95rem',
              opacity: creandoFestivos ? 0.7 : 1,
              transition: 'all 0.3s ease'
            }}
            title="Crear registros automáticos para días festivos del mes"
          >
            {creandoFestivos ? '⏳ Creando...' : '🎉 Crear Festivos'}
          </button>
          
          <button
            onClick={onEditarMes}
            style={{
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: 'white',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.95rem'
            }}
          >
            ✏️ Editar Mes
          </button>
          
          <button
            onClick={onVolverMeses}
            style={{
              background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
              color: 'white',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.95rem'
            }}
          >
            ← Volver a Meses
          </button>
        </div>
      </div>

      <LeyendaCalendario trabajadoresActivos={trabajadoresActivos} />

      {/* Días de la semana */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '10px',
        marginBottom: '15px'
      }}>
        {fechaUtils.diasSemana.map(dia => (
          <div key={dia} style={{
            background: 'linear-gradient(135deg, #43e97b, #38f9d7)',
            color: 'white',
            padding: '10px',
            borderRadius: '8px',
            textAlign: 'center',
            fontWeight: '600',
            fontSize: '0.9rem',
            textTransform: 'uppercase'
          }}>
            {dia}
          </div>
        ))}
      </div>

      {/* Calendario */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '10px'
      }}>
        {fechaUtils.obtenerDiasDelMes(año, mes).map((dia, index) => (
          <DiaCalendario
            key={index}
            dia={dia}
            colores={dia ? obtenerColorDia(dia) : undefined}
            tooltip={dia ? obtenerTooltipDia(dia) : ''}
            estadisticaInfo={dia ? (() => {
              const fechaString = `${año}-${mes.toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;
              const est = estadisticasMes.get(fechaString);
              if (!est) return null;
              return `${est.trabajadoresConRegistro}/${est.totalTrabajadores}`;
            })() : null}
            onClick={() => dia && onSeleccionarDia(dia)}
          />
        ))}
      </div>
    </div>
  );
};