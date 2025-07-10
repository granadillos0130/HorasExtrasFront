import React from "react";
import RegistroCard from "./RegistroCard";
import type { Registro } from "../../types/registros";

interface Props {
  registros: Registro[];
  onDelete: (id: number) => void;
}

export const RegistroList: React.FC<Props> = ({ registros, onDelete }) => {
  if (registros.length === 0) {
    return <p>No hay registros creados.</p>;
  }

  return (
    <div className="registro-list">
      {registros.map((registro) => (
        <RegistroCard key={registro.id} registro={registro} onDelete={onDelete} />
      ))}
    </div>
  );
};
