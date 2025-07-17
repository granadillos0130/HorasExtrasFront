import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { registrosService } from "../../api/registrosService";
import type { Registro } from "../../types/registros";
import "../../styles/components/TrabajadorIntensidad.css";

const getCurrentMonth = () => new Date().getMonth() + 1;
const getCurrentWeek = () => {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const dayOfMonth = today.getDate();
  const week = Math.ceil((dayOfMonth + firstDay.getDay()) / 7);
  return week;
};

const TrabajadorIntensidad: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const mesActual = getCurrentMonth();
  const semanaActual = getCurrentWeek();

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const data = await registrosService.buscarPorTrabajadorMesSemana(
          Number(id),
          mesActual,
          semanaActual
        );
        setRegistros(data);
      } catch (err) {
        setError("Error cargando la intensidad horaria.");
      } finally {
        setLoading(false);
      }
    };

    if (id) cargarDatos();
  }, [id]);

  if (loading) return <p>Cargando registros...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="trabajador-intensidad">
      <h2>Intensidad Horaria - Semana {semanaActual}, Mes {mesActual}</h2>
      {registros.length === 0 ? (
        <p>No hay registros para esta semana.</p>
      ) : (
        <table className="tabla-intensidad">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Día</th>
              <th>Centro</th>
              <th>OC</th>
              <th>Ingreso</th>
              <th>Salida</th>
              <th>Almuerzo</th>
              <th>Normales</th>
              <th>Extras D</th>
              <th>Extras N</th>
              <th>Dom D</th>
              <th>Dom N</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {registros.map((r) => (
              <tr key={r.id}>
                <td>{r.fecha}</td>
                <td>{r.diaSemana}</td>
                <td>{r.nombreCentro}</td>
                <td>{r.centroId}</td>
                <td>{r.horaIngreso}</td>
                <td>{r.horaSalida}</td>
                <td>{r.tiempoAlmuerzo}</td>
                <td>{r.horasNormales}</td>
                <td>{r.horasExtrasDiurnas}</td>
                <td>{r.horasExtrasNocturnas}</td>
                <td>{r.extrasDominicalesDiurnas}</td>
                <td>{r.extrasDominicalesNocturnas}</td>
                <td>{r.totalHoras}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TrabajadorIntensidad;
