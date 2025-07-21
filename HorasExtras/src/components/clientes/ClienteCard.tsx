// src/components/clientes/ClienteCard.tsx
import React, { useState } from "react";
import type { Cliente } from "../../types/cliente";
import type { Centro } from "../../types/centros";
import { centrosService } from "../../api/centrosService";
import CentrosClienteModal from "./ClientesModal";

interface Props {
  cliente: Cliente;
  onEditar: (cliente: Cliente) => void;
  onEliminar: (id: string) => void;
}

const ClienteCard: React.FC<Props> = ({ cliente, onEditar, onEliminar }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [centros, setCentros] = useState<Centro[]>([]);

  const abrirModal = async () => {
    const data = await centrosService.(cliente.id);
    setCentros(data);
    setModalVisible(true);
  };

  return (
    <div className="cliente-card">
      <h3>{cliente.nombreCliente}</h3>
      <p><strong>ID:</strong> {cliente.id}</p>
      <div className="botones">
        <button onClick={() => onEditar(cliente)}>Editar</button>
        <button onClick={() => onEliminar(cliente.id)}>Eliminar</button>
        <button onClick={abrirModal}>Ver Centros</button>
      </div>

      <CentrosClienteModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        centros={centros}
        nombreCliente={cliente.nombreCliente}
      />
    </div>
  );
};

export default ClienteCard;
