// src/components/clientes/CentrosClienteModal.tsx
import React from "react";
import type { Centro } from "../../types/centros";
import "../../styles/components/clientes/ClientesModal.css";

interface Props {
  visible: boolean;
  onClose: () => void;
  centros: Centro[];
  nombreCliente: string;
}

const CentrosClienteModal: React.FC<Props> = ({ visible, onClose, centros, nombreCliente }) => {
  if (!visible) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Centros de {nombreCliente}</h2>
        <button className="cerrar-btn" onClick={onClose}>X</button>

        {centros.length === 0 ? (
          <p>Este cliente no tiene centros registrados.</p>
        ) : (
          <ul>
            {centros.map((centro) => (
              <li key={centro.id}>
                <strong>{centro.nombreCentro}</strong> - {centro.fechaInicio} - {centro.id}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CentrosClienteModal;
