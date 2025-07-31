import React from "react";
import TrabajadorCard from "./TrabajadorCard";
import type { Trabajador } from "../../types/trabajadores";

interface Props {
  trabajadores: Trabajador[];
  onDelete: (id: number) => void;  // ✅ Fixed signature to match TrabajadorCard
  onView: (id: number) => void;    // ✅ Added required onView prop
  onEstadoChange?: () => void;     // ✅ Added optional onEstadoChange
  selectedTrabajadorId?: number;   // ✅ Added for selection state
  onSelect?: (id: number) => void; // ✅ Added for selection handling
}

export const TrabajadorList: React.FC<Props> = ({ 
  trabajadores, 
  onDelete, 
  onView,
  onEstadoChange,
  selectedTrabajadorId,
  onSelect
}) => {
  if (trabajadores.length === 0) {
    return <p>No hay trabajadores registrados.</p>;
  }

  return (
    <div className="trabajadores-list">
      {trabajadores.map((trabajador) => (
        <TrabajadorCard
          key={trabajador.id}
          trabajador={trabajador}
          onDelete={onDelete}
          onView={onView}
          onEstadoChange={onEstadoChange}
          isSelected={selectedTrabajadorId === trabajador.id}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
};