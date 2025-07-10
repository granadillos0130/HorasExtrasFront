import React, { useEffect, useState } from "react";
import { useRegistros } from "../hooks/useRegistros";
import { useResumenSemana } from "../hooks/useResumenSemana";
import RegistrosTable from "../components/registros/RegistrosTable";
import ResumenSemanaTable from "../components/registros/ResumenSemanaTable";
import "../styles/pages/registroPage.css";
import { api } from "../api/api";
import type { Trabajador } from "../types/trabajadores";

const RegistrosPage: React.FC = () => {
  const {
    registros,
    loading: loadingRegistros,
    error: errorRegistros,
    buscarRegistros
  } = useRegistros();

  const {
    resumen,
    loading: loadingResumen,
    error: errorResumen,
    buscarResumen
  } = useResumenSemana();

  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [trabajadorId, setTrabajadorId] = useState<number>(0);
  const [mes, setMes] = useState<number>(new Date().getMonth() + 1);
  const [semana, setSemana] = useState<number>(1);

  // Cargar trabajadores cuando carga la página
  useEffect(() => {
    const cargarTrabajadores = async () => {
      try {
        const res = await api.get<Trabajador[]>("/trabajadores");
        setTrabajadores(res.data);
      } catch (error) {
        console.error("Error al cargar trabajadores:", error);
      }
    };

    cargarTrabajadores();
  }, []);

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
        <select
          value={trabajadorId}
          onChange={(e) => setTrabajadorId(Number(e.target.value))}
        >
          <option value={0}>Seleccione trabajador</option>
          {trabajadores.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nombre}
            </option>
          ))}
        </select>

        <select value={mes} onChange={(e) => setMes(Number(e.target.value))}>
          {[...Array(12)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              Mes {i + 1}
            </option>
          ))}
        </select>

        <select value={semana} onChange={(e) => setSemana(Number(e.target.value))}>
          {[1, 2, 3, 4, 5].map((s) => (
            <option key={s} value={s}>
              Semana {s}
            </option>
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
