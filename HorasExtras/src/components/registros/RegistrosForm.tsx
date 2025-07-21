// ...importaciones
import React, { useState, useEffect } from "react";
import { trabajadoresService } from "../../api/trabajadoresService";
import { centrosService } from "../../api/centrosService";
import { registrosService } from "../../api/registrosService";
import CentroBuscador from "../shared/CentroBuscador";
import type { Trabajador } from "../../types/trabajadores";
import type { Centro } from "../../types/centros";
import type { RegistroInputDto } from "../../types/registros";
import "../../styles/components/registros/RegistroForm.css";

interface Props {
  onSuccess: () => void;
}

const RegistrosForm: React.FC<Props> = ({ onSuccess }) => {
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [centros, setCentros] = useState<Centro[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<RegistroInputDto>({
    Trabajador_ID: 0,
    Centro_ID: "",
    Nombr_Centro: "",
    Fecha: new Date().toISOString().split("T")[0],
    Hora_Ingreso: "08:00",
    Hora_Salida: "17:00",
    Tiempo_Almuerzo: "01:00",
  });

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [trabajadoresData, centrosData] = await Promise.all([
          trabajadoresService.getAll(),
          centrosService.getAll(),
        ]);
        setTrabajadores(trabajadoresData);
        setCentros(centrosData);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      }
    };

    cargarDatos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.Trabajador_ID || !formData.Centro_ID || !formData.Nombr_Centro) {
      alert("Por favor complete todos los campos");
      return;
    }

    setLoading(true);

    try {
      const normalizarHora = (hora: string) =>
        hora.length === 5 ? `${hora}:00` : hora;

      const payload = {
        ...formData,
        Tiempo_Almuerzo: normalizarHora(formData.Tiempo_Almuerzo),
      };

      await registrosService.crear(payload);
      alert("Registro creado correctamente");
      onSuccess();
    } catch (error: any) {
      console.error("Error al crear registro:", error);
      if (error.response?.data) {
        alert("Error del servidor:\n" + JSON.stringify(error.response.data, null, 2));
      } else {
        alert("Error al crear el registro");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof RegistroInputDto, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCentroChange = (centroId: string) => {
    const centroSeleccionado = centros.find(c => c.id === centroId);
    setFormData((prev) => ({
      ...prev,
      Centro_ID: centroId,
      Nombr_Centro: centroSeleccionado?.nombreCentro || "", // auto llena pero editable
    }));
  };

  return (
    <div className="registros-form-container">
      <h3>Crear Nuevo Registro</h3>
      <form onSubmit={handleSubmit} className="registros-form">
        <div className="form-row">
          <div className="form-group">
            <label>Trabajador</label>
            <select
              value={formData.Trabajador_ID}
              onChange={(e) => handleInputChange("Trabajador_ID", Number(e.target.value))}
              required
            >
              <option value={0}>Seleccione trabajador</option>
              {trabajadores.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Centro</label>
            <CentroBuscador
              centros={centros}
              value={formData.Centro_ID}
              onChange={handleCentroChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Nombre del Centro</label>
            <input
              type="text"
              value={formData.Nombr_Centro}
              onChange={(e) => handleInputChange("Nombr_Centro", e.target.value)}
              placeholder="Escriba el nombre del centro"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Fecha</label>
            <input
              type="date"
              value={formData.Fecha}
              onChange={(e) => handleInputChange("Fecha", e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Hora Ingreso</label>
            <input
              type="time"
              value={formData.Hora_Ingreso}
              onChange={(e) => handleInputChange("Hora_Ingreso", e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Hora Salida</label>
            <input
              type="time"
              value={formData.Hora_Salida}
              onChange={(e) => handleInputChange("Hora_Salida", e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Tiempo Almuerzo</label>
            <select
              value={formData.Tiempo_Almuerzo}
              onChange={(e) => handleInputChange("Tiempo_Almuerzo", e.target.value)}
              required
            >
              <option value="00:00:00">Sin almuerzo</option>
              <option value="00:30:00">30 minutos</option>
              <option value="01:00:00">1 hora</option>
              <option value="01:30:00">1 hora 30 minutos</option>
              <option value="02:00:00">2 horas</option>
            </select>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-submit">
          {loading ? "Guardando..." : "Crear Registro"}
        </button>
      </form>
    </div>
  );
};

export default RegistrosForm;
