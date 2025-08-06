import React from "react";
import RegistroCard from "./RegistroCard";
import type { Registro, RegistroConTipo } from "../../types/registros";

interface Props {
  registros: Registro[];
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  compact?: boolean;
}

export const RegistroList: React.FC<Props> = ({ 
  registros, 
  onEdit, 
  onDelete, 
  compact = false 
}) => {
  // Function to convert Registro to RegistroConTipo
  const convertToRegistroConTipo = (registro: Registro): RegistroConTipo => {
    // Check if it's an absence based on negative ID or other indicators
    const esAusencia = registro.id < 0 || (registro as any).tipoRegistro === 'AUSENCIA';
    
    return {
      ...registro,
      tipoRegistro: esAusencia ? 'AUSENCIA' : 'TRABAJO',
      // If it's an absence, extract ausenciaInfo from the registro
      ...(esAusencia && {
        ausenciaInfo: {
          tipoAusencia: (registro as any).tipoAusencia || 'Tipo no especificado',
          descripcion: (registro as any).descripcion || '',
          remunerado: (registro as any).remunerado || false
        }
      })
    } as RegistroConTipo;
  };

  if (registros.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px',
        color: '#6b7280',
        fontSize: '1.1rem'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📋</div>
        <p style={{ margin: 0 }}>No hay registros para mostrar</p>
      </div>
    );
  }

  return (
    <div className="registro-list" style={{ 
      display: 'flex', 
      flexDirection: 'column',
      gap: compact ? '8px' : '12px'
    }}>
      {registros.map((registro) => (
        <RegistroCard 
          key={registro.id} 
          registro={convertToRegistroConTipo(registro)} 
          onEdit={onEdit}
          onDelete={onDelete}
          compact={compact}
        />
      ))}
    </div>
  );
};