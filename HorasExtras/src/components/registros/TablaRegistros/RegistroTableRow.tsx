// components/registros/TablaRegistros/RegistroTableRow.tsx
import React from "react";
import { MenuAcciones } from "./MenuAcciones";
import type { RegistroConTipo } from "../../../types/registros";

interface RegistroTableRowProps {
  registro: RegistroConTipo;
  onEditar: () => void;
  onEliminar: () => void;
}

export const RegistroTableRow: React.FC<RegistroTableRowProps> = ({
  registro,
  onEditar,
  onEliminar
}) => {
  const formatearHora = (timeString: string) => {
    return timeString?.substring(0, 5) || "--:--";
  };

  const formatearHoras = (hours: number) => {
    if (hours === 0) return "0:00";
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}:${m.toString().padStart(2, "0")}`;
  };

  // 🆕 Formatear fecha para mostrar
  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha + 'T00:00:00');
    const opciones: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      day: '2-digit',
      month: 'short'
    };
    return date.toLocaleDateString('es-ES', opciones);
  };

  const esAusencia = registro.tipoRegistro === 'AUSENCIA';

  const getTipoCentro = () => {
    if (esAusencia) {
      return registro.ausenciaInfo?.tipoAusencia || 'Ausencia';
    }
    return registro.nombreCentro || 'N/A';
  };

  const getBadgeTipo = () => {
    if (esAusencia) {
      return (
        <span style={{
          background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
          color: '#92400e',
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '0.75rem',
          fontWeight: '600',
          textTransform: 'uppercase',
          border: '1px solid #fbbf24'
        }}>
          📅 Ausencia
        </span>
      );
    }
    return (
      <span style={{
        background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
        color: '#1e40af',
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: '600',
        textTransform: 'uppercase',
        border: '1px solid #60a5fa'
      }}>
        👤 Trabajo
      </span>
    );
  };

  const estiloColumna = {
    padding: '16px 12px',
    borderBottom: '1px solid #f3f4f6',
    fontSize: '0.9rem',
    color: '#374151'
  };

  return (
    <tr
      style={{
        background: 'white',
        transition: 'background 0.2s ease'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.background = '#f9fafb';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.background = 'white';
      }}
    >
      {/* Trabajador */}
      <td style={{
        ...estiloColumna,
        fontWeight: '600',
        color: '#1f2937'
      }}>
        {registro.trabajadorNombre || `Trabajador ${registro.trabajadorId}`}
      </td>

      {/* 🆕 FECHA */}
      <td style={{
        ...estiloColumna,
        fontWeight: '600',
        color: '#6b7280',
        fontFamily: 'monospace'
      }}>
        {formatearFecha(registro.fecha)}
      </td>

      {/* Tipo */}
      <td style={estiloColumna}>
        {getBadgeTipo()}
      </td>

      {/* Centro/Ausencia */}
      <td style={estiloColumna}>
        {getTipoCentro()}
      </td>

      {/* Hora Ingreso */}
      <td style={{
        ...estiloColumna,
        textAlign: 'center',
        fontWeight: '500',
        fontFamily: 'monospace'
      }}>
        {formatearHora(registro.horaIngreso)}
      </td>

      {/* Hora Salida */}
      <td style={{
        ...estiloColumna,
        textAlign: 'center',
        fontWeight: '500',
        fontFamily: 'monospace'
      }}>
        {formatearHora(registro.horaSalida)}
      </td>

      {/* Horas Normales */}
      <td style={{
        ...estiloColumna,
        textAlign: 'center',
        fontWeight: '600',
        color: '#059669',
        fontFamily: 'monospace'
      }}>
        {formatearHoras(registro.horasNormales)}
      </td>

      {/* Horas Extras Diurnas */}
      <td style={{
        ...estiloColumna,
        textAlign: 'center',
        fontWeight: '600',
        color: registro.horasExtrasDiurnas > 0 ? '#ea580c' : '#9ca3af',
        fontFamily: 'monospace'
      }}>
        {formatearHoras(registro.horasExtrasDiurnas)}
      </td>

      {/* Horas Extras Nocturnas */}
      <td style={{
        ...estiloColumna,
        textAlign: 'center',
        fontWeight: '600',
        color: registro.horasExtrasNocturnas > 0 ? '#7c2d12' : '#9ca3af',
        fontFamily: 'monospace'
      }}>
        {formatearHoras(registro.horasExtrasNocturnas)}
      </td>

      {/* Horas Desplazamiento */}
      <td style={{
        ...estiloColumna,
        textAlign: 'center',
        fontWeight: '600',
        color: registro.horasDesplazamiento > 0 ? '#8b5cf6' : '#9ca3af',
        fontFamily: 'monospace'
      }}>
        {formatearHoras(registro.horasDesplazamiento)}
      </td>

      {/* Total */}
      <td style={{
        ...estiloColumna,
        textAlign: 'center',
        fontWeight: '700',
        fontSize: '1rem',
        color: '#1f2937',
        background: '#f9fafb',
        fontFamily: 'monospace'
      }}>
        {formatearHoras(registro.totalHoras)}
      </td>

      {/* Acciones */}
      <td style={{
        ...estiloColumna,
        textAlign: 'center'
      }}>
        <MenuAcciones
          onEditar={onEditar}
          onEliminar={onEliminar}
        />
      </td>
    </tr>
  );
};