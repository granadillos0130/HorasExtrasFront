// src/components/trabajadores/TrabajadorDetail.tsx
import React, { useEffect, useState } from "react";
import type  { Trabajador } from "../../types/trabajadores";
import { trabajadoresService } from "../../api/trabajadoresService";
import "../../styles/components/TrabajadorDetail.css";

interface Props {
  trabajadorId: number;
  onClose: () => void;
}

const TrabajadorDetail: React.FC<Props> = ({ trabajadorId, onClose }) => {
  const [trabajador, setTrabajador] = useState<Trabajador | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await trabajadoresService.getById(trabajadorId);
      setTrabajador(data);
    };
    fetchData();
  }, [trabajadorId]);

  if (!trabajador) return <div className="detalle">🔄 Cargando...</div>;

  return (
    <div className="detalle-modal">
      <div className="detalle-content">
        <h2>Información del Trabajador</h2>
        <p><strong>Nombre:</strong> {trabajador.nombre}</p>
        <p><strong>Cédula:</strong> {trabajador.cedula}</p>
        <p><strong>Salario:</strong> {trabajador.salario}</p>
        <p><strong>Contratación:</strong> {trabajador.tipoContratacion}</p>
        <p><strong>EPS:</strong> {trabajador.eps?.nombre ?? "No asignada"}</p>
        <p><strong>ARL:</strong> {trabajador.arl?.nombre ?? "No asignada"}</p>
        <p><strong>Pensión:</strong> {trabajador.pension?.nombre ?? "No asignada"}</p>
        <p><strong>Clínica:</strong> {trabajador.clinica?.nombre ?? "No asignada"}</p>
        <p><strong>Banco:</strong> {trabajador.banco?.nombre ?? "No asignado"} - {trabajador.banco?.numeroCuenta}</p>
        <button onClick={onClose}>❌ Cerrar</button>
      </div>
    </div>
  );
};

export default TrabajadorDetail;
