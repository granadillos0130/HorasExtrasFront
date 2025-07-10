import React from "react";
import TrabajadorCard from "./TrabajadorCard";
import type { Trabajador } from "../../types/trabajadores";

interface Props {
  trabajadores: Trabajador[];
  onDeleted: () => void;
}

export const TrabajadorList: React.FC<Props> = ({ trabajadores, onDeleted }) => {
  if (trabajadores.length === 0) {
    return <p>No hay trabajadores registrados.</p>;
  }

  return (
    <div className="trabajadores-list">
      {trabajadores.map((trabajador) => (
        <TrabajadorCard
          key={trabajador.id}
          trabajador={trabajador}
          onDeleted={onDeleted}
        />
      ))}
    </div>
  );
};
