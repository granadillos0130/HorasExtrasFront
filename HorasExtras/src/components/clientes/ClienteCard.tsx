import React from "react";
import type { Cliente } from "../../types/cliente";
import "../../styles/clientes/components/ClienteCard.css";

interface Props {
  cliente: Cliente;
  onEditar: (cliente: Cliente) => void;
  onEliminar: (id: string) => void;
}

const ClienteCard: React.FC<Props> = ({ cliente, onEditar, onEliminar }) => {
  return (
    <div className="cliente-card">
      <h3>{cliente.nombreCliente}</h3>
      <p><strong>ID:</strong> {cliente.id}</p>
      <div className="botones">
        <button onClick={() => onEditar(cliente)}>Editar</button>
        <button onClick={() => onEliminar(cliente.id)}>Eliminar</button>
      </div>
    </div>
  );
};

export default ClienteCard;
