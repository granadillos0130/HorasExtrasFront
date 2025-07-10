// src/pages/RegistrosPage.tsx
import React, { useState } from "react";
import { useRegistros } from "../hooks/useRegistros";
import { useResumenSemana } from "../hooks/useResumenSemana";
import RegistrosTable from "../components/registros/RegistrosTable";
import ResumenSemanaTable from "../components/registros/ResumenSemanaTable";
import "../styles/pages/registroPage.css";

const RegistrosPage: React.FC = () => {
  const { registros, loading: loadingRegistros, error: errorRegistros, buscarRegistros } = useRegistros();
  const { resumen, loading: loadingResumen, error: errorResumen, buscarResumen } = useResumenSemana();

  const [trabajadorId, setTrabajadorId] = useState<number>(0);
  const [mes, setMes] = useState<number>(new Date().getMonth() + 1);
  const [semana, setSemana] = useState<number>(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trabajadorId > 0) {
      buscarRegistros(trabajadorId, mes, semana);
      buscarResumen(trabajadorId, mes, semana);
    } else {
      alert("Por favor selecciona un trabajador.");
    }
  };

  return (
    <div className="registros-page">
      <h1>Buscar Registros</h1>
      <form onSubmit={handleSubmit} className="filtros-form">
        <select value={trabajadorId} onChange={(e) => setTrabajadorId(Number(e.target.value))}>
          <option value={0}>Seleccione trabajador</option>
          <option value={1}>Trabajador 1</option>
          <option value={2}>Trabajador 2</option>
          <option value={3}>Trabajador 3</option>
          {/* Aquí pones tus trabajadores dinámicamente si quieres */}
        </select>
        <select value={mes} onChange={(e) => setMes(Number(e.target.value))}>
          {[...Array(12)].map((_, i) => (
            <option key={i + 1} value={i + 1}>Mes {i + 1}</option>
          ))}
        </select>
        <select value={semana} onChange={(e) => setSemana(Number(e.target.value))}>
          {[1, 2, 3, 4, 5].map((s) => (
            <option key={s} value={s}>Semana {s}</option>
          ))}
        </select>
        <button type="submit">Buscar</button>
      </form>

      {loadingRegistros && <p>Cargando registros detallados...</p>}
      {errorRegistros && <p>{errorRegistros}</p>}
      <RegistrosTable registros={registros} />

      {loadingResumen && <p>Cargando resumen semanal...</p>}
      {errorResumen && <p>{errorResumen}</p>}
      {resumen && <ResumenSemanaTable resumen={resumen} />}
    </div>
  );
};

export default RegistrosPage;
